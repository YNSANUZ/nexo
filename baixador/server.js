const crypto = require("crypto");
const dns = require("dns").promises;
const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");
const tempRoot = path.join(os.tmpdir(), "baixanexo");
const port = Number(process.env.PORT || 3100);
const maxFileSize = process.env.BAIXANEXO_MAX_FILESIZE || "1024M";
const infoTimeout = Number(process.env.BAIXANEXO_YTDLP_TIMEOUT_MS || 60000);
const downloadTimeout = Number(process.env.BAIXANEXO_DOWNLOAD_TIMEOUT_MS || 240000);
const youtubeExtractorArgs = "youtube:player_client=web,mweb,android,web_safari,web_embedded";
const vidSaveApiBase = "https://api.vidssave.com/api/contentsite_api";
const vidSaveSseBase = "https://api.vidssave.com/sse/contentsite_api";
const vidSaveAuth = "20250901majwlqo";
const vidSaveDomain = "api-ak.vidssave.com";

fs.mkdirSync(tempRoot, { recursive: true });

function localBinary(name) {
  const fileName = process.platform === "win32" ? `${name}.exe` : name;
  return path.join(rootDir, "bin", fileName);
}

function findInPath(binary) {
  const pathValue = process.env.Path || process.env.PATH || "";
  const extensions = process.platform === "win32" ? ["", ".exe", ".cmd", ".bat"] : [""];
  return pathValue.split(path.delimiter).some((dir) => {
    return extensions.some((ext) => fs.existsSync(path.join(dir, `${binary}${ext}`)));
  });
}

function getYtdlpPath() {
  if (process.env.YTDLP_PATH) return process.env.YTDLP_PATH;
  const localPath = localBinary("yt-dlp");
  if (fs.existsSync(localPath)) return localPath;
  return "yt-dlp";
}

function getFfmpegPath() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  const localPath = localBinary("ffmpeg");
  if (fs.existsSync(localPath)) return localPath;
  return null;
}

function hasFfmpeg() {
  return Boolean(getFfmpegPath() || findInPath("ffmpeg"));
}

function getFfmpegArgs() {
  const ffmpeg = getFfmpegPath();
  return ffmpeg ? ["--ffmpeg-location", ffmpeg] : [];
}

function runYtdlp(args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(getYtdlpPath(), args, {
      cwd: rootDir,
      windowsHide: true,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8"
      }
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > 30 * 1024 * 1024) child.kill("SIGKILL");
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (code !== 0) {
        const cleanMessage = String(stderr || stdout || "yt-dlp_failed")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 900);
        reject(new Error(cleanMessage || `yt-dlp_failed_${code}`));
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

function isPrivateIp(address) {
  if (!address) return true;
  const ipType = net.isIP(address);

  if (ipType === 4) {
    const parts = address.split(".").map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
    const [a, b] = parts;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  if (ipType === 6) {
    const lower = address.toLowerCase();
    return (
      lower === "::1" ||
      lower === "::" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe80") ||
      lower.startsWith("::ffff:127.") ||
      lower.startsWith("::ffff:10.") ||
      lower.startsWith("::ffff:192.168.")
    );
  }

  return false;
}

function isBlockedHostname(hostname) {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "0.0.0.0" ||
    isPrivateIp(host)
  );
}

async function validatePublicUrl(rawValue) {
  const value = String(rawValue || "").trim();
  if (value.length < 8 || value.length > 4096) {
    throw new Error("Cole um link valido.");
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Cole um link completo, com http ou https.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Use apenas links http ou https.");
  }

  if (parsed.username || parsed.password || isBlockedHostname(parsed.hostname)) {
    throw new Error("Este host nao pode ser analisado.");
  }

  const records = await dns.lookup(parsed.hostname, { all: true }).catch(() => []);
  if (records.some((record) => isPrivateIp(record.address))) {
    throw new Error("Este host resolve para uma rede privada.");
  }

  return parsed;
}

function cleanHostname(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function detectSource(parsed) {
  const host = cleanHostname(parsed.hostname);
  const pathName = parsed.pathname.toLowerCase();

  if (host === "youtu.be" || host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    if (pathName.startsWith("/shorts/")) return { source: "YouTube", kind: "Shorts", accent: "#ff3158" };
    if (pathName.startsWith("/live/")) return { source: "YouTube", kind: "Live", accent: "#ff3158" };
    return { source: "YouTube", kind: "Video YouTube", accent: "#ff3158" };
  }

  if (host.endsWith("instagram.com")) {
    if (pathName.includes("/reel/") || pathName.includes("/reels/")) return { source: "Instagram", kind: "Reels", accent: "#ff3d8f" };
    if (pathName.includes("/stories/highlights/")) return { source: "Instagram", kind: "Destaque", accent: "#ff3d8f" };
    if (pathName.includes("/stories/")) return { source: "Instagram", kind: "Story", accent: "#ff3d8f" };
    if (pathName.includes("/p/")) return { source: "Instagram", kind: "Foto ou video", accent: "#ff3d8f" };
    return { source: "Instagram", kind: "Instagram", accent: "#ff3d8f" };
  }

  if (host.endsWith("tiktok.com") || host.endsWith("tiktokv.com")) {
    return { source: "TikTok", kind: "TikTok", accent: "#10e0d7" };
  }

  if (host.endsWith("x.com") || host.endsWith("twitter.com")) {
    return { source: "X/Twitter", kind: "Video social", accent: "#ffffff" };
  }

  if (host.endsWith("facebook.com") || host.endsWith("fb.watch")) {
    return { source: "Facebook", kind: "Video social", accent: "#78a8ff" };
  }

  if (host.endsWith("vimeo.com")) {
    return { source: "Vimeo", kind: "Video externo", accent: "#55c6ff" };
  }

  if (host.endsWith("dailymotion.com") || host.endsWith("dai.ly")) {
    return { source: "Dailymotion", kind: "Video externo", accent: "#7bd1ff" };
  }

  return { source: host, kind: "Site externo", accent: "#54f2c7" };
}

function isYoutubeUrl(value) {
  try {
    const host = cleanHostname(new URL(value).hostname);
    return host === "youtu.be" || host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com");
  } catch {
    return false;
  }
}

function isInstagramUrl(value) {
  try {
    return cleanHostname(new URL(value).hostname).endsWith("instagram.com");
  } catch {
    return false;
  }
}

function isTiktokUrl(value) {
  try {
    const host = cleanHostname(new URL(value).hostname);
    return host.endsWith("tiktok.com") || host.endsWith("tiktokv.com");
  } catch {
    return false;
  }
}

function cookiePath(name) {
  return path.join(rootDir, "cookies", `${name}.txt`);
}

function cookieFileExists(name) {
  const filePath = cookiePath(name);
  try {
    return fs.statSync(filePath).isFile() && fs.statSync(filePath).size > 0;
  } catch {
    return false;
  }
}

function cookieStatus() {
  return {
    youtube: cookieFileExists("youtube"),
    instagram: cookieFileExists("instagram"),
    tiktok: cookieFileExists("tiktok"),
    generic: cookieFileExists("cookies")
  };
}

function cookieArgsForUrl(url) {
  const names = [];
  if (isYoutubeUrl(url)) names.push("youtube");
  if (isInstagramUrl(url)) names.push("instagram");
  if (isTiktokUrl(url)) names.push("tiktok");
  names.push("cookies");

  const match = names.find((name) => cookieFileExists(name));
  return match ? ["--cookies", cookiePath(match)] : [];
}

function impersonateTarget() {
  const value = String(process.env.BAIXANEXO_IMPERSONATE || "chrome").trim();
  if (!value || ["0", "false", "off", "none"].includes(value.toLowerCase())) return null;
  return value.replace(/[^a-zA-Z0-9_:.-]+/g, "") || null;
}

function impersonateArgsForUrl(url, enabled = true) {
  if (!enabled || (!isYoutubeUrl(url) && !isTiktokUrl(url))) return [];
  const target = impersonateTarget();
  return target ? ["--impersonate", target] : [];
}

function isImpersonateError(error) {
  return /impersonat|curl_cffi|curl-?cffi/i.test(String(error?.message || ""));
}

function secondsToLabel(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const value = Math.round(seconds);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = value % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function bytesToLabel(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`;
}

function safeText(value, fallback = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function pickThumbnail(item) {
  const thumbnails = Array.isArray(item.thumbnails) ? item.thumbnails : [];
  const sorted = thumbnails
    .filter((thumb) => thumb && thumb.url)
    .sort((a, b) => (Number(b.width || 0) * Number(b.height || 0)) - (Number(a.width || 0) * Number(a.height || 0)));
  return sorted[0]?.url || item.thumbnail || null;
}

function isHttpUrl(value) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function extFromUrl(value) {
  try {
    const parsed = new URL(value);
    return path.extname(parsed.pathname).replace(".", "").toLowerCase();
  } catch {
    return "";
  }
}

function isKnownMediaExt(ext) {
  return new Set([
    "mp4", "webm", "mov", "mkv", "m4v",
    "mp3", "m4a", "aac", "opus", "ogg", "wav", "flac",
    "jpg", "jpeg", "png", "webp", "gif"
  ]).has(ext);
}

function formatQuality(format) {
  if (format.format_note && !/storyboard/i.test(format.format_note)) return safeText(format.format_note);
  if (format.resolution && format.resolution !== "audio only") return safeText(format.resolution);
  if (format.height) return `${format.height}p${format.fps ? ` ${format.fps}fps` : ""}`;
  if (format.abr) return `${Math.round(format.abr)} kbps`;
  if (format.tbr) return `${Math.round(format.tbr)} kbps`;
  return "Original";
}

function mediaFlags(format, ext) {
  const videoExts = new Set(["mp4", "webm", "mov", "mkv", "m4v"]);
  const audioExts = new Set(["mp3", "m4a", "aac", "opus", "ogg", "wav", "flac"]);
  const imageExts = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
  let hasVideo = format.vcodec && format.vcodec !== "none";
  let hasAudio = format.acodec && format.acodec !== "none";
  let hasImage = imageExts.has(ext);

  if (!hasVideo && !hasAudio && !hasImage) {
    if (videoExts.has(ext)) {
      hasVideo = true;
      hasAudio = true;
    } else if (audioExts.has(ext)) {
      hasAudio = true;
    }
  }

  return { hasVideo: Boolean(hasVideo), hasAudio: Boolean(hasAudio), hasImage: Boolean(hasImage) };
}

function formatType(format, ext) {
  const { hasVideo, hasAudio, hasImage } = mediaFlags(format, ext);
  if (hasVideo && hasAudio) return "video";
  if (hasVideo) return "video_only";
  if (hasAudio) return "audio";
  if (hasImage) return "image";
  return "file";
}

function choosePreview(formats) {
  const playable = formats.filter((format) => {
    return format.directUrl && format.type === "video" && ["mp4", "webm", "mov"].includes(format.ext);
  });

  const mp4 = playable
    .filter((format) => format.ext === "mp4")
    .sort((a, b) => Number(b.height || 0) - Number(a.height || 0))[0];

  const image = formats.find((format) => format.directUrl && format.type === "image");

  return mp4 || playable.sort((a, b) => Number(b.height || 0) - Number(a.height || 0))[0] || image || null;
}

function emptyMediaReason(inputUrl, classifier, formats) {
  if (formats.length > 0) return null;

  try {
    const pathName = new URL(inputUrl).pathname.toLowerCase();
    if (classifier.source === "Instagram" && pathName.includes("/p/")) {
      return cookieFileExists("instagram")
        ? "O Instagram nao liberou as fotos ou videos desse post para o extrator."
        : "Esse post ou carrossel precisa de cookies do Instagram no servidor para liberar fotos e videos.";
    }
  } catch {
    return null;
  }

  return "Nenhum arquivo direto foi liberado pelo extrator para este link.";
}

function encodedUrl(value) {
  return Buffer.from(value).toString("base64url");
}

function vidSaveBody(data) {
  return new URLSearchParams({
    auth: vidSaveAuth,
    domain: vidSaveDomain,
    ...data
  });
}

async function postVidSave(pathname, data, timeoutMs = 35000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${vidSaveApiBase}/${pathname}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        "Accept": "application/json, text/plain, */*"
      },
      body: vidSaveBody(data),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || Number(payload.status || 0) !== 1) {
      throw new Error(payload.message || payload.status_code || "Fallback de YouTube indisponivel agora.");
    }
    return payload.data || {};
  } finally {
    clearTimeout(timer);
  }
}

async function waitVidSaveTask(taskId, timeoutMs = 90000) {
  const params = new URLSearchParams({
    auth: vidSaveAuth,
    domain: vidSaveDomain,
    task_id: taskId,
    download_domain: "vidssave.com",
    origin: "content_site"
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${vidSaveSseBase}/media/download_query?${params}`, {
      headers: {
        "Accept": "text/event-stream",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
      },
      signal: controller.signal
    });
    if (!response.ok || !response.body) throw new Error("Nao foi possivel preparar esse download agora.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      if (/event:\s*failed/i.test(buffer)) {
        throw new Error("Nao foi possivel preparar esse download agora.");
      }
      const match = buffer.match(/data:\s*(\{[^\n]+\})/i);
      if (match) {
        const data = JSON.parse(match[1]);
        if (data.download_link) return data.download_link;
      }
    }
  } finally {
    clearTimeout(timer);
  }
  throw new Error("Tempo esgotado ao preparar esse download.");
}

async function prepareVidSaveDownload(request) {
  if (!request || request.length < 20 || request.length > 20000) {
    throw new Error("Pedido de download invalido.");
  }
  const data = await postVidSave("media/download", {
    request,
    no_encrypt: "1"
  });
  if (!data.task_id) throw new Error("Download nao retornou tarefa.");
  const targetUrl = await waitVidSaveTask(data.task_id);
  if (!isHttpUrl(targetUrl)) throw new Error("Link preparado invalido.");
  return targetUrl;
}

function vidSaveQualityNumber(value) {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function vidSaveDownloadUrl(directUrl, request) {
  if (isHttpUrl(directUrl)) return directUrl;
  if (!request) return null;
  return `/api/download?vidsave=${encodedUrl(request)}`;
}

function vidSaveFormat(resource, index) {
  const rawType = safeText(resource?.type || "file").toLowerCase();
  if (!["video", "audio", "picture"].includes(rawType)) return null;
  const directUrl = isHttpUrl(resource.download_url) ? resource.download_url : null;
  const request = !directUrl && resource.resource_content ? String(resource.resource_content) : null;
  const downloadUrl = vidSaveDownloadUrl(directUrl, request);
  if (!downloadUrl) return null;
  const type = rawType === "audio" ? "audio" : rawType === "picture" ? "image" : "video";
  const label = safeText(resource.quality || "Original").toUpperCase();
  const ext = safeText(resource.format || (type === "audio" ? "mp3" : "mp4")).toLowerCase();
  const size = Number(resource.size || 0);

  return {
    id: safeText(resource.resource_id, `vidsave-${index}`),
    label,
    ext,
    type,
    height: type === "video" ? vidSaveQualityNumber(label) : null,
    fps: null,
    hasAudio: type === "audio" || type === "video",
    hasVideo: type === "video",
    size: size || null,
    sizeLabel: bytesToLabel(size),
    directUrl,
    downloadUrl
  };
}

async function analyzeWithVidSave(inputUrl, classifier) {
  const data = await postVidSave("media/parse", {
    origin: "source",
    link: inputUrl
  });
  const formats = (Array.isArray(data.resources) ? data.resources : [])
    .map(vidSaveFormat)
    .filter(Boolean)
    .sort((a, b) => {
      const rank = { video: 0, image: 1, audio: 2, file: 3 };
      const rankDiff = (rank[a.type] ?? 9) - (rank[b.type] ?? 9);
      if (rankDiff) return rankDiff;
      return vidSaveQualityNumber(b.label) - vidSaveQualityNumber(a.label) || Number(b.size || 0) - Number(a.size || 0);
    });
  if (!formats.length) {
    throw new Error("Fallback encontrou o video, mas nao liberou links de download.");
  }

  const bestVideo = formats.find((format) => format.type === "video");
  const bestDirectVideo = formats.find((format) => format.type === "video" && format.directUrl);
  const bestAudio = formats.find((format) => format.type === "audio");
  const title = safeText(data.title, classifier.kind);
  const uploader = safeText(data.user_item?.nickname || data.author, "");
  const duration = Number(data.duration || 0) || null;
  const durationLabel = secondsToLabel(duration);
  const thumbnail = isHttpUrl(data.thumbnail) ? data.thumbnail : null;
  const preview = bestDirectVideo?.directUrl
    ? { type: "video", url: bestDirectVideo.directUrl, label: bestDirectVideo.label, ext: bestDirectVideo.ext }
    : thumbnail
      ? { type: "image", url: thumbnail, label: "Imagem", ext: "jpg" }
      : null;
  const item = {
    index: 0,
    playlistIndex: 1,
    id: safeText(data.id, "youtube"),
    title,
    source: classifier.source,
    kind: classifier.kind,
    accent: classifier.accent,
    uploader,
    duration,
    durationLabel,
    webpageUrl: inputUrl,
    thumbnail,
    preview,
    formats: formats.slice(0, 18),
    hasDownloads: true,
    emptyReason: null,
    primaryDownloadLabel: "MP4 melhor",
    bestVideoDownloadUrl: bestVideo?.downloadUrl || null,
    mp3DownloadUrl: bestAudio?.downloadUrl || null
  };

  return {
    ok: true,
    source: classifier.source,
    kind: classifier.kind,
    accent: classifier.accent,
    title,
    uploader,
    duration,
    durationLabel,
    thumbnail,
    webpageUrl: inputUrl,
    items: [item]
  };
}

function normalizeFormats(item, inputUrl, playlistIndex) {
  const seen = new Set();
  let rawFormats = Array.isArray(item.formats) ? item.formats : [];
  const directCandidate = item.url || item.webpage_url || inputUrl;
  const directExt = extFromUrl(directCandidate);

  if (rawFormats.length === 0 && isHttpUrl(directCandidate) && isKnownMediaExt(directExt)) {
    rawFormats = [{
      format_id: directExt,
      ext: directExt,
      url: directCandidate,
      isDirectFallback: true
    }];
  }

  const formats = rawFormats
    .filter((format) => format && format.format_id)
    .filter((format) => !/storyboard|images/i.test(`${format.format_note || ""} ${format.format || ""}`))
    .map((format) => {
      const size = Number(format.filesize || format.filesize_approx || 0);
      const ext = safeText(format.ext || "file").toLowerCase();
      const type = formatType(format, ext);
      const flags = mediaFlags(format, ext);
      const directUrl = isHttpUrl(format.url) ? format.url : null;
      const label = formatQuality(format);
      const key = [
        type,
        ext,
        label,
        format.height || "",
        format.width || "",
        format.abr || "",
        size || ""
      ].join("|");

      if (seen.has(key)) return null;
      seen.add(key);

      const downloadInputUrl = format.isDirectFallback ? directUrl : inputUrl;
      const params = new URLSearchParams({
        u: encodedUrl(downloadInputUrl),
        formatId: String(format.isDirectFallback ? "" : format.format_id),
        mode: format.isDirectFallback ? "direct" : type === "audio" ? "audio-original" : "video",
        playlistIndex: String(format.isDirectFallback ? 0 : playlistIndex || 0)
      });

      return {
        id: String(format.format_id),
        label,
        ext,
        type,
        height: Number(format.height || 0) || null,
        fps: Number(format.fps || 0) || null,
        hasAudio: flags.hasAudio,
        hasVideo: flags.hasVideo,
        size: size || null,
        sizeLabel: bytesToLabel(size),
        directUrl,
        downloadUrl: `/api/download?${params.toString()}`
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const rank = { video: 0, image: 1, video_only: 2, audio: 3, file: 4 };
      if (rank[a.type] !== rank[b.type]) return rank[a.type] - rank[b.type];
      return Number(b.height || 0) - Number(a.height || 0) || Number(b.size || 0) - Number(a.size || 0);
    });

  return formats.slice(0, 18);
}

function normalizeItem(item, inputUrl, classifier, index) {
  const playlistIndex = Number(item.playlist_index || index + 1);
  const formats = normalizeFormats(item, inputUrl, playlistIndex);
  const previewFormat = choosePreview(formats);
  const thumbnail = pickThumbnail(item);
  const title = safeText(item.title || item.fulltitle || item.alt_title, classifier.kind);
  const isImagePrimary = previewFormat?.type === "image";
  const primaryDownloadInput = isImagePrimary ? previewFormat.directUrl : inputUrl;
  const primaryDownloadMode = isImagePrimary ? "direct" : "video";
  const primaryPlaylistIndex = isImagePrimary ? 0 : playlistIndex;
  const hasDownloads = formats.length > 0;
  const emptyReason = emptyMediaReason(inputUrl, classifier, formats);

  return {
    index,
    playlistIndex,
    id: safeText(item.id, String(index + 1)),
    title,
    source: classifier.source,
    kind: classifier.kind,
    accent: classifier.accent,
    uploader: safeText(item.uploader || item.channel || item.creator, ""),
    duration: Number(item.duration || 0) || null,
    durationLabel: secondsToLabel(Number(item.duration || 0)),
    webpageUrl: item.webpage_url || inputUrl,
    thumbnail,
    preview: previewFormat ? {
      type: previewFormat.type === "image" ? "image" : "video",
      url: previewFormat.directUrl,
      label: previewFormat.label,
      ext: previewFormat.ext
    } : thumbnail ? {
      type: "image",
      url: thumbnail,
      label: "Imagem",
      ext: "jpg"
    } : null,
    formats,
    hasDownloads,
    emptyReason,
    primaryDownloadLabel: isImagePrimary ? "Imagem" : "MP4 melhor",
    bestVideoDownloadUrl: hasDownloads ? `/api/download?${new URLSearchParams({
      u: encodedUrl(primaryDownloadInput),
      mode: primaryDownloadMode,
      playlistIndex: String(primaryPlaylistIndex)
    }).toString()}` : null,
    mp3DownloadUrl: hasDownloads ? `/api/download?${new URLSearchParams({
      u: encodedUrl(inputUrl),
      mode: "audio",
      playlistIndex: String(playlistIndex)
    }).toString()}` : null
  };
}

function normalizeInfo(info, inputUrl, classifier) {
  const rawEntries = Array.isArray(info.entries) && info.entries.length > 0 ? info.entries : [info];
  const items = rawEntries
    .filter(Boolean)
    .slice(0, 20)
    .map((item, index) => normalizeItem(item, inputUrl, classifier, index));

  const first = items[0] || normalizeItem(info, inputUrl, classifier, 0);

  return {
    ok: true,
    source: classifier.source,
    kind: classifier.kind,
    accent: classifier.accent,
    title: first.title,
    uploader: first.uploader,
    duration: first.duration,
    durationLabel: first.durationLabel,
    thumbnail: first.thumbnail,
    webpageUrl: info.webpage_url || inputUrl,
    items
  };
}

function baseAnalyzeArgs(url, useImpersonate = true) {
  return [
    "--dump-single-json",
    "--no-warnings",
    "--no-playlist",
    "--skip-download",
    "--socket-timeout", "20",
    "--no-check-certificates",
    ...impersonateArgsForUrl(url, useImpersonate),
    ...cookieArgsForUrl(url),
    "-4",
    "--extractor-args", youtubeExtractorArgs,
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
    ...getFfmpegArgs(),
    url
  ];
}

function baseDownloadArgs(url, outputTemplate, playlistIndex, useImpersonate = true) {
  const args = [
    "--no-warnings",
    "--no-check-certificates",
    "--restrict-filenames",
    "--windows-filenames",
    "--no-mtime",
    "--max-filesize", maxFileSize,
    "--socket-timeout", "20",
    ...impersonateArgsForUrl(url, useImpersonate),
    ...cookieArgsForUrl(url),
    "-4",
    "--extractor-args", youtubeExtractorArgs,
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
    ...getFfmpegArgs(),
    "-o", outputTemplate
  ];

  if (playlistIndex && Number(playlistIndex) > 0) {
    args.push("--playlist-items", String(playlistIndex));
  } else {
    args.push("--no-playlist");
  }

  args.push(url);
  return args;
}

function decodeUrlParam(value) {
  try {
    return Buffer.from(String(value || ""), "base64url").toString("utf8");
  } catch {
    return "";
  }
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".aac": "audio/aac",
    ".opus": "audio/opus",
    ".ogg": "audio/ogg",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
  };
  return types[ext] || "application/octet-stream";
}

function safeFileName(name, fallback) {
  const clean = safeText(name, fallback)
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 120);
  return clean || fallback;
}

function cleanupDir(dir) {
  fs.rm(dir, { recursive: true, force: true }, () => {});
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
      if (body.length > 80 * 1024) {
        reject(new Error("body_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

async function handleAnalyze(req, res) {
  try {
    const body = await readJsonBody(req);
    const parsed = await validatePublicUrl(body.url);
    const classifier = detectSource(parsed);
    let result;
    try {
      result = await runYtdlp(baseAnalyzeArgs(parsed.toString()), infoTimeout);
    } catch (error) {
      try {
        if (!isImpersonateError(error)) throw error;
        result = await runYtdlp(baseAnalyzeArgs(parsed.toString(), false), infoTimeout);
      } catch (extractError) {
        if (isYoutubeUrl(parsed.toString())) {
          try {
            sendJson(res, 200, await analyzeWithVidSave(parsed.toString(), classifier));
            return;
          } catch {
            // Preserve the original extractor message when the external fallback is unavailable.
          }
        }
        throw extractError;
      }
    }
    const { stdout } = result;
    const info = JSON.parse(stdout);
    sendJson(res, 200, normalizeInfo(info, parsed.toString(), classifier));
  } catch (error) {
    const message = String(error.message || "Nao foi possivel analisar este link.");
    let errorMessage = message;
    if (message.includes("Sign in to confirm") || message.includes("--cookies")) {
      errorMessage = "YouTube bloqueou o IP do servidor. O suporte a cookies ja esta pronto; coloque cookies/youtube.txt no servidor para liberar esses links.";
    } else if (message.includes("[TikTok]") && message.includes("Unexpected response")) {
      errorMessage = "TikTok bloqueou a resposta para este IP. O suporte a cookies ja esta pronto; coloque cookies/tiktok.txt no servidor ou tente novamente mais tarde.";
    } else if (message.includes("Unsupported URL")) {
      errorMessage = "Ainda nao consegui extrair midia desse link.";
    }
    sendJson(res, 400, {
      ok: false,
      error: errorMessage
    });
  }
}

async function handleDownload(requestUrl, res) {
  if (requestUrl.searchParams.has("vidsave")) {
    try {
      const targetUrl = await prepareVidSaveDownload(decodeUrlParam(requestUrl.searchParams.get("vidsave")));
      res.writeHead(302, {
        "Location": targetUrl,
        "Cache-Control": "no-store"
      });
      res.end();
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: String(error.message || "Nao foi possivel preparar esse download.")
      });
    }
    return;
  }

  const jobDir = path.join(tempRoot, crypto.randomUUID());
  fs.mkdirSync(jobDir, { recursive: true });

  try {
    const parsed = await validatePublicUrl(decodeUrlParam(requestUrl.searchParams.get("u")));
    const mode = String(requestUrl.searchParams.get("mode") || "video");
    const formatId = String(requestUrl.searchParams.get("formatId") || "").trim();
    const playlistIndex = Number(requestUrl.searchParams.get("playlistIndex") || 0) || 0;
    const outputTemplate = path.join(jobDir, "%(title).120s-%(id)s.%(ext)s");
    let baseArgs = baseDownloadArgs(parsed.toString(), outputTemplate, playlistIndex);
    let formatArgs;

    if (mode === "direct") {
      formatArgs = [];
    } else if (mode === "audio") {
      if (!hasFfmpeg()) throw new Error("FFmpeg nao esta disponivel para gerar MP3.");
      formatArgs = ["-f", "bestaudio/best", "--extract-audio", "--audio-format", "mp3", "--audio-quality", "0"];
    } else if (mode === "audio-original") {
      formatArgs = ["-f", formatId || "bestaudio/best"];
    } else if (formatId) {
      formatArgs = hasFfmpeg()
        ? ["-f", formatId, "--merge-output-format", "mp4"]
        : ["-f", formatId];
    } else {
      formatArgs = hasFfmpeg()
        ? ["-f", "bv*+ba/best", "--merge-output-format", "mp4"]
        : ["-f", "best[ext=mp4]/best"];
    }

    try {
      await runYtdlp([...formatArgs, ...baseArgs], downloadTimeout);
    } catch (error) {
      if (!isImpersonateError(error)) throw error;
      baseArgs = baseDownloadArgs(parsed.toString(), outputTemplate, playlistIndex, false);
      await runYtdlp([...formatArgs, ...baseArgs], downloadTimeout);
    }

    const files = fs.readdirSync(jobDir)
      .map((file) => path.join(jobDir, file))
      .filter((file) => fs.statSync(file).isFile() && !file.endsWith(".part"))
      .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);

    if (!files.length) throw new Error("Nenhum arquivo foi gerado.");

    const filePath = files[0];
    const fallbackExt = mode === "audio" ? ".mp3" : path.extname(filePath);
    const fileName = safeFileName(path.basename(filePath, path.extname(filePath)), "baixanexo") + fallbackExt;
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      "Content-Type": contentTypeFor(filePath),
      "Content-Length": stat.size,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on("close", () => cleanupDir(jobDir));
    stream.on("error", () => cleanupDir(jobDir));
  } catch (error) {
    cleanupDir(jobDir);
    sendJson(res, 400, {
      ok: false,
      error: String(error.message || "Nao foi possivel baixar este arquivo.")
    });
  }
}

const staticTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendFile(res, filePath) {
  res.writeHead(200, {
    "Content-Type": staticTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
  });
  fs.createReadStream(filePath).pipe(res);
}

function safeJoin(baseDir, pathname) {
  const safePath = path.normalize(pathname).replace(/^([/\\])+/, "").replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(baseDir, safePath);
  return filePath.startsWith(baseDir) ? filePath : null;
}

function serveStatic(requestUrl, res) {
  let pathname = decodeURIComponent(requestUrl.pathname);
  pathname = pathname.replace(/^\/baixador(?=\/|$)/, "");
  if (pathname === "" || pathname === "/") pathname = "/index.html";

  const rootFile = safeJoin(rootDir, pathname);
  if (rootFile && fs.existsSync(rootFile) && fs.statSync(rootFile).isFile()) {
    sendFile(res, rootFile);
    return;
  }

  const publicFile = safeJoin(publicDir, pathname);
  if (publicFile && fs.existsSync(publicFile) && fs.statSync(publicFile).isFile()) {
    sendFile(res, publicFile);
    return;
  }

  const indexPath = path.join(rootDir, "index.html");
  if (fs.existsSync(indexPath)) {
    sendFile(res, indexPath);
    return;
  }

  const publicIndexPath = path.join(publicDir, "index.html");
  if (fs.existsSync(publicIndexPath)) {
    sendFile(res, publicIndexPath);
    return;
  }

  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
  };

  res.writeHead(404, {
    "Content-Type": types[".html"]
  });
  res.end("Not found");
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const apiPathname = requestUrl.pathname.replace(/^\/baixador(?=\/api\/)/, "");

  try {
    if (req.method === "POST" && apiPathname === "/api/analyze") {
      await handleAnalyze(req, res);
      return;
    }

    if (req.method === "GET" && apiPathname === "/api/download") {
      await handleDownload(requestUrl, res);
      return;
    }

    if (req.method === "GET" && apiPathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        ytdlp: getYtdlpPath(),
        ffmpeg: hasFfmpeg(),
        impersonate: impersonateTarget(),
        cookies: cookieStatus()
      });
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(requestUrl, res);
      return;
    }

    sendJson(res, 405, { ok: false, error: "Metodo nao permitido." });
  } catch (error) {
    if (!res.headersSent) {
      sendJson(res, 500, { ok: false, error: String(error.message || "Erro interno.") });
    } else {
      res.end();
    }
  }
});

server.listen(port, () => {
  console.log(`BaixaNEXO rodando em http://localhost:${port}`);
});
