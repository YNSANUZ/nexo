const form = document.querySelector("[data-download-form]");
const input = document.querySelector("[data-url-input]");
const sourcePill = document.querySelector("[data-source-pill]");
const resultsPanel = document.querySelector("[data-results-panel]");
const loadingRow = document.querySelector("[data-loading]");
const errorRow = document.querySelector("[data-error]");
const errorTitle = document.querySelector("[data-error-title]");
const errorMessage = document.querySelector("[data-error-message]");
const resultsContent = document.querySelector("[data-results-content]");
const previewShell = document.querySelector("[data-preview-shell]");
const kindLabel = document.querySelector("[data-kind-label]");
const sourceLabel = document.querySelector("[data-source-label]");
const mediaTitle = document.querySelector("[data-media-title]");
const mediaMeta = document.querySelector("[data-media-meta]");
const bestVideo = document.querySelector("[data-best-video]");
const primaryDownloadLabel = document.querySelector("[data-primary-download-label]");
const mp3Download = document.querySelector("[data-mp3-download]");
const sourceOpen = document.querySelector("[data-source-open]");
const itemsStrip = document.querySelector("[data-items-strip]");
const formatsList = document.querySelector("[data-formats-list]");
const formatCount = document.querySelector("[data-format-count]");
const supportedTypes = document.querySelector("[data-supported-types]");
const vidSaveApiBase = "https://api.vidssave.com/api/contentsite_api";
const vidSaveSseBase = "https://api.vidssave.com/sse/contentsite_api";
const vidSaveAuth = "20250901majwlqo";
const vidSaveDomain = "api-ak.vidssave.com";

const apiBasePath = (() => {
  const path = window.location.pathname;
  if (path.includes("/baixador/")) return "/baixador/api";
  return "/api";
})();

function apiPath(path) {
  return `${apiBasePath}${path.startsWith("/") ? path : `/${path}`}`;
}

function routeApiUrl(value) {
  if (!value) return "#";
  if (String(value).startsWith("/api/")) {
    return `${apiBasePath}${String(value).slice(4)}`;
  }
  return value;
}

let debounceTimer = null;
let activeRequest = 0;
let activePayload = null;
let activeItemIndex = 0;
let vidSaveTokenCounter = 0;
const vidSaveTasks = new Map();

const supportedTypeList = [
  { id: "youtube-video", label: "YouTube Video" },
  { id: "youtube-shorts", label: "YouTube Shorts" },
  { id: "youtube-mp3", label: "YouTube MP3" },
  { id: "tiktok", label: "TikTok Video" },
  { id: "instagram-reels", label: "Instagram Reels" },
  { id: "instagram-video", label: "Video Instagram" },
  { id: "instagram-post", label: "Post Instagram" },
  { id: "instagram-photo", label: "Foto Instagram" },
  { id: "instagram-carousel", label: "Carrossel Instagram" },
  { id: "instagram-story", label: "Story Instagram" },
  { id: "instagram-highlight", label: "Destaque Instagram" },
  { id: "vimeo", label: "Vimeo" },
  { id: "dailymotion", label: "Dailymotion" },
  { id: "twitter", label: "X/Twitter" },
  { id: "facebook", label: "Facebook" },
  { id: "external", label: "Site externo" }
];

function renderSupportedTypes(activeIds = []) {
  if (!supportedTypes) return;
  const active = new Set(activeIds);
  supportedTypes.innerHTML = supportedTypeList.map((type) => `
    <span class="type-chip ${active.has(type.id) ? "active" : ""}" data-type-chip="${escapeHtml(type.id)}">${escapeHtml(type.label)}</span>
  `).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function looksLikeUrl(value) {
  try {
    const parsed = new URL(normalizeInputUrl(value));
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function extractUrls(value) {
  return String(value || "")
    .replace(/(https?:\/\/)/gi, "\n$1")
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[),.;]+$/g, ""))
    .filter((part) => /^https?:\/\//i.test(part));
}

function normalizeInputUrl(value) {
  return extractUrls(value)[0] || String(value || "").trim();
}

function localDetect(value) {
  try {
    const parsed = new URL(normalizeInputUrl(value));
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const path = parsed.pathname.toLowerCase();

    if (host === "youtu.be" || host.endsWith("youtube.com")) {
      return path.startsWith("/shorts/") ? "Shorts" : "YouTube";
    }
    if (host.endsWith("instagram.com")) {
      if (path.includes("/reel/")) return "Reels";
      if (path.includes("/stories/highlights/")) return "Destaque";
      if (path.includes("/stories/")) return "Story";
      if (path.includes("/p/")) return "Foto ou video";
      return "Instagram";
    }
    if (host.endsWith("tiktok.com") || host.endsWith("tiktokv.com")) return "TikTok";
    if (host.endsWith("vimeo.com")) return "Vimeo";
    if (host.endsWith("dailymotion.com") || host.endsWith("dai.ly")) return "Dailymotion";
    if (host.endsWith("x.com") || host.endsWith("twitter.com")) return "X/Twitter";
    if (host.endsWith("facebook.com") || host.endsWith("fb.watch")) return "Facebook";
    return "Site externo";
  } catch {
    return "Link publico";
  }
}

function detectTypeIds(value) {
  try {
    const parsed = new URL(normalizeInputUrl(value));
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const path = parsed.pathname.toLowerCase();

    if (host === "youtu.be" || host.endsWith("youtube.com")) {
      return path.startsWith("/shorts/") ? ["youtube-shorts", "youtube-mp3"] : ["youtube-video", "youtube-mp3"];
    }
    if (host.endsWith("instagram.com")) {
      if (path.includes("/reel/") || path.includes("/reels/")) return ["instagram-reels"];
      if (path.includes("/stories/highlights/")) return ["instagram-highlight"];
      if (path.includes("/stories/")) return ["instagram-story"];
      if (path.includes("/p/")) return ["instagram-post", "instagram-photo", "instagram-video", "instagram-carousel"];
      return ["instagram-post", "instagram-reels", "instagram-photo", "instagram-video"];
    }
    if (host.endsWith("tiktok.com") || host.endsWith("tiktokv.com")) return ["tiktok"];
    if (host.endsWith("vimeo.com")) return ["vimeo"];
    if (host.endsWith("dailymotion.com") || host.endsWith("dai.ly")) return ["dailymotion"];
    if (host.endsWith("x.com") || host.endsWith("twitter.com")) return ["twitter"];
    if (host.endsWith("facebook.com") || host.endsWith("fb.watch")) return ["facebook"];
    return ["external"];
  } catch {
    return [];
  }
}

function isYouTubeUrl(value) {
  try {
    const parsed = new URL(normalizeInputUrl(value));
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return host === "youtu.be" || host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com");
  } catch {
    return false;
  }
}

function secondsToLabel(value) {
  const total = Math.max(0, Math.round(Number(value) || 0));
  if (!total) return null;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function bytesToLabel(value) {
  let bytes = Number(value) || 0;
  if (bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let index = 0;
  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index += 1;
  }
  return `${bytes >= 10 || index === 0 ? bytes.toFixed(0) : bytes.toFixed(1)} ${units[index]}`;
}

function qualityNumber(value) {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function vidSaveBody(data) {
  return new URLSearchParams({
    auth: vidSaveAuth,
    domain: vidSaveDomain,
    ...data
  });
}

async function postVidSave(path, data) {
  const response = await fetch(`${vidSaveApiBase}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: vidSaveBody(data)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status !== 1) {
    throw new Error(payload.message || payload.status_code || "Fallback de YouTube indisponivel agora.");
  }
  return payload.data || {};
}

function mapVidSaveFormat(resource, index) {
  const type = String(resource.type || "file").toLowerCase();
  const ext = String(resource.format || (type === "audio" ? "mp3" : "mp4")).toLowerCase();
  const quality = String(resource.quality || "Original").toUpperCase();
  const directUrl = resource.download_url || null;
  const request = !directUrl && resource.resource_content ? resource.resource_content : null;
  const height = type === "video" ? qualityNumber(quality) : null;
  const size = Number(resource.size) || null;

  return {
    id: resource.resource_id || `vidsave-${index}`,
    label: quality,
    ext,
    type: type === "audio" ? "audio" : type === "picture" ? "image" : "video",
    height,
    fps: null,
    hasAudio: type === "audio" || type === "video",
    hasVideo: type === "video",
    size,
    sizeLabel: bytesToLabel(size),
    directUrl,
    downloadUrl: directUrl,
    vidSaveRequest: request
  };
}

function mapVidSavePayload(data, inputUrl) {
  const classifier = localDetect(inputUrl) === "Shorts"
    ? { kind: "Shorts", source: "YouTube", accent: "#ff3158" }
    : { kind: "Video YouTube", source: "YouTube", accent: "#ff3158" };
  const resources = Array.isArray(data.resources) ? data.resources : [];
  const formats = resources
    .filter((resource) => ["video", "audio", "picture"].includes(String(resource.type || "").toLowerCase()))
    .map(mapVidSaveFormat)
    .filter((format) => format.downloadUrl || format.vidSaveRequest)
    .sort((a, b) => {
      const rank = { video: 0, image: 1, audio: 2, file: 3 };
      const rankDiff = (rank[a.type] ?? 9) - (rank[b.type] ?? 9);
      if (rankDiff) return rankDiff;
      return (Number(b.height) || qualityNumber(b.label)) - (Number(a.height) || qualityNumber(a.label));
    });

  if (!formats.length) {
    throw new Error("Fallback encontrou o video, mas nao liberou links de download.");
  }

  const bestVideo = formats.find((format) => format.type === "video");
  const bestDirectVideo = formats.find((format) => format.type === "video" && format.directUrl);
  const bestAudio = formats.find((format) => format.type === "audio");
  const durationLabel = secondsToLabel(data.duration);
  const title = data.title || classifier.kind;
  const uploader = data.user_item?.nickname || data.author || "";
  const item = {
    index: 0,
    playlistIndex: 1,
    id: data.id || "youtube",
    title,
    source: classifier.source,
    kind: classifier.kind,
    accent: classifier.accent,
    uploader,
    duration: data.duration || null,
    durationLabel,
    webpageUrl: inputUrl,
    thumbnail: data.thumbnail || null,
    preview: bestDirectVideo?.directUrl
      ? { type: "video", url: bestDirectVideo.directUrl, label: bestDirectVideo.label, ext: bestDirectVideo.ext }
      : data.thumbnail
        ? { type: "image", url: data.thumbnail, label: "Imagem", ext: "jpg" }
        : null,
    formats,
    hasDownloads: true,
    emptyReason: null,
    primaryDownloadLabel: bestVideo?.ext === "mp3" ? "MP3 melhor" : "MP4 melhor",
    bestVideoDownloadUrl: bestVideo?.downloadUrl || null,
    bestVideoVidSaveRequest: bestVideo?.vidSaveRequest || null,
    mp3DownloadUrl: bestAudio?.downloadUrl || null,
    mp3VidSaveRequest: bestAudio?.vidSaveRequest || null
  };

  return {
    ok: true,
    source: classifier.source,
    kind: classifier.kind,
    accent: classifier.accent,
    title,
    uploader,
    duration: data.duration || null,
    durationLabel,
    thumbnail: data.thumbnail || null,
    webpageUrl: inputUrl,
    items: [item]
  };
}

async function analyzeWithVidSave(inputUrl) {
  const data = await postVidSave("media/parse", {
    origin: "source",
    link: inputUrl
  });
  return mapVidSavePayload(data, inputUrl);
}

function storeVidSaveTask(task) {
  if (!task?.request) return "";
  const token = `vidsave-${++vidSaveTokenCounter}`;
  vidSaveTasks.set(token, task);
  return token;
}

function setVidSaveAnchor(anchor, request, title) {
  const token = storeVidSaveTask({ request, title });
  anchor.href = "#";
  anchor.dataset.vidsaveToken = token;
  anchor.removeAttribute("download");
}

function setRegularAnchor(anchor, href) {
  anchor.href = routeApiUrl(href);
  anchor.setAttribute("download", "");
  delete anchor.dataset.vidsaveToken;
}

function openDownloadLink(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = "";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function waitVidSaveTask(taskId) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      auth: vidSaveAuth,
      domain: vidSaveDomain,
      task_id: taskId,
      download_domain: "vidssave.com",
      origin: "content_site"
    });
    const source = new EventSource(`${vidSaveSseBase}/media/download_query?${params}`);
    const timer = setTimeout(() => {
      source.close();
      reject(new Error("Tempo esgotado ao preparar esse download."));
    }, 90000);

    source.addEventListener("success", (event) => {
      try {
        const data = JSON.parse(event.data || "{}");
        if (data.download_link) {
          clearTimeout(timer);
          source.close();
          resolve(data.download_link);
        }
      } catch (error) {
        clearTimeout(timer);
        source.close();
        reject(error);
      }
    });

    source.addEventListener("failed", () => {
      clearTimeout(timer);
      source.close();
      reject(new Error("Nao foi possivel preparar esse download agora."));
    });

    source.onerror = () => {
      clearTimeout(timer);
      source.close();
      reject(new Error("Conexao interrompida ao preparar esse download."));
    };
  });
}

async function startVidSaveDownload(task, anchor) {
  const originalText = anchor.textContent;
  const popup = window.open("about:blank", "_blank");
  anchor.textContent = "Preparando...";
  anchor.setAttribute("aria-busy", "true");

  try {
    const data = await postVidSave("media/download", {
      request: task.request,
      no_encrypt: "1"
    });
    if (!data.task_id) throw new Error("Download nao retornou tarefa.");
    const url = await waitVidSaveTask(data.task_id);
    if (popup) {
      popup.location.href = url;
    } else {
      openDownloadLink(url);
    }
  } catch (error) {
    if (popup) popup.close();
    setState("error", error.message || "Nao foi possivel preparar esse download.");
  } finally {
    anchor.textContent = originalText;
    anchor.removeAttribute("aria-busy");
  }
}

function setState(state, message = "") {
  resultsPanel.hidden = state === "idle";
  loadingRow.hidden = state !== "loading";
  errorRow.hidden = state !== "error";
  resultsContent.hidden = state !== "ready";

  if (state === "error") {
    errorTitle.textContent = "Nao foi possivel analisar.";
    errorMessage.textContent = message || "Tente outro link publico.";
  }
}

function clearResults() {
  activePayload = null;
  activeItemIndex = 0;
  setState("idle");
  previewShell.innerHTML = "";
  formatsList.innerHTML = "";
}

async function analyzeUrl(url, immediate = false) {
  clearTimeout(debounceTimer);
  const normalizedUrl = normalizeInputUrl(url);

  if (!looksLikeUrl(normalizedUrl)) {
    sourcePill.textContent = localDetect(url);
    renderSupportedTypes(detectTypeIds(url));
    clearResults();
    return;
  }

  if (input.value.trim() !== normalizedUrl) {
    input.value = normalizedUrl;
  }

  sourcePill.textContent = localDetect(normalizedUrl);
  renderSupportedTypes(detectTypeIds(normalizedUrl));

  const run = async () => {
    const requestId = activeRequest + 1;
    activeRequest = requestId;
    setState("loading");

    try {
      const response = await fetch(apiPath("/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl })
      });
      const payload = await response.json().catch(() => ({}));

      if (requestId !== activeRequest) return;

      if (response.status === 404) {
        throw new Error("Backend de download nao esta ativo neste endereco.");
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Link nao suportado.");
      }

      activePayload = payload;
      activeItemIndex = 0;
      renderPayload();
    } catch (error) {
      if (requestId !== activeRequest) return;
      if (isYouTubeUrl(normalizedUrl)) {
        try {
          activePayload = await analyzeWithVidSave(normalizedUrl);
          activeItemIndex = 0;
          renderPayload();
          return;
        } catch (fallbackError) {
          setState("error", fallbackError.message || error.message);
          return;
        }
      }
      setState("error", error.message);
    }
  };

  if (immediate) {
    run();
  } else {
    debounceTimer = setTimeout(run, 650);
  }
}

function renderPreview(item) {
  if (!item.preview) {
    previewShell.innerHTML = '<div class="preview-empty">Preview indisponivel</div>';
    return;
  }

  if (item.preview.type === "video") {
    previewShell.innerHTML = `
      <video controls preload="metadata" poster="${escapeHtml(item.thumbnail || "")}" src="${escapeHtml(item.preview.url)}"></video>
    `;
    return;
  }

  previewShell.innerHTML = `
    <img src="${escapeHtml(item.preview.url)}" alt="${escapeHtml(item.title)}" loading="lazy" />
  `;
}

function describeFormat(format) {
  const parts = [];
  if (format.hasVideo && format.hasAudio) parts.push("video + audio");
  else if (format.hasVideo) parts.push("video");
  else if (format.hasAudio) parts.push("audio");
  else if (format.type === "image") parts.push("imagem");
  else parts.push("arquivo");

  if (format.fps) parts.push(`${format.fps}fps`);
  if (format.sizeLabel) parts.push(format.sizeLabel);
  return parts.join(" / ");
}

function renderFormats(item) {
  const formats = item.formats || [];
  formatCount.textContent = formats.length === 1 ? "1 opcao" : `${formats.length} opcoes`;

  if (!formats.length) {
    formatsList.innerHTML = `
      <div class="format-row">
        <div class="format-main">
          <strong>Midia nao liberada</strong>
          <em>${escapeHtml(item.emptyReason || "Nenhum arquivo direto foi encontrado para este link.")}</em>
        </div>
        <span>-</span>
        <span>-</span>
        <div class="format-actions"></div>
      </div>
    `;
    return;
  }

  formatsList.innerHTML = formats.map((format) => {
    const direct = format.directUrl
      ? `<a class="mini-link" href="${escapeHtml(format.directUrl)}" target="_blank" rel="noopener noreferrer">Abrir</a>`
      : "";
    const downloadLink = format.vidSaveRequest
      ? (() => {
          const token = storeVidSaveTask({ request: format.vidSaveRequest, title: `${item.title} ${format.label}` });
          return `<a class="mini-link primary" href="#" data-vidsave-token="${escapeHtml(token)}">Baixar</a>`;
        })()
      : `<a class="mini-link primary" href="${escapeHtml(routeApiUrl(format.downloadUrl))}" download>Baixar</a>`;

    return `
      <div class="format-row">
        <div class="format-main">
          <strong>${escapeHtml(format.label)}</strong>
          <em>${escapeHtml(describeFormat(format))}</em>
        </div>
        <span>${escapeHtml(format.ext.toUpperCase())}</span>
        <span>${escapeHtml(format.sizeLabel || "direto")}</span>
        <div class="format-actions">
          ${direct}
          ${downloadLink}
        </div>
      </div>
    `;
  }).join("");
}

function renderItemChips(items) {
  if (!items || items.length <= 1) {
    itemsStrip.hidden = true;
    itemsStrip.innerHTML = "";
    return;
  }

  itemsStrip.hidden = false;
  itemsStrip.innerHTML = items.map((item, index) => `
    <button class="item-chip ${index === activeItemIndex ? "active" : ""}" type="button" data-item-index="${index}">
      ${escapeHtml(index + 1)}. ${escapeHtml(item.kind)}
    </button>
  `).join("");
}

function renderPayload() {
  if (!activePayload) return;
  const items = activePayload.items || [];
  const item = items[activeItemIndex] || items[0];
  if (!item) {
    setState("error", "Nenhuma midia foi encontrada nesse link.");
    return;
  }
  vidSaveTasks.clear();

  sourcePill.textContent = item.kind || activePayload.kind || "Midia";
  kindLabel.textContent = item.kind || "Midia";
  kindLabel.style.background = item.accent || activePayload.accent || "var(--mint)";
  sourceLabel.textContent = item.source || activePayload.source || "Fonte";
  mediaTitle.textContent = item.title || activePayload.title || "Midia encontrada";
  mediaMeta.textContent = [item.uploader, item.durationLabel].filter(Boolean).join(" / ") || "Opcoes prontas para download";
  bestVideo.hidden = !item.bestVideoDownloadUrl && !item.bestVideoVidSaveRequest;
  if (item.bestVideoVidSaveRequest) {
    setVidSaveAnchor(bestVideo, item.bestVideoVidSaveRequest, item.title);
  } else if (item.bestVideoDownloadUrl) {
    setRegularAnchor(bestVideo, item.bestVideoDownloadUrl);
  }
  primaryDownloadLabel.textContent = item.primaryDownloadLabel || "MP4 melhor";
  if (item.mp3VidSaveRequest) {
    setVidSaveAnchor(mp3Download, item.mp3VidSaveRequest, item.title);
  } else if (item.mp3DownloadUrl) {
    setRegularAnchor(mp3Download, item.mp3DownloadUrl);
  }
  mp3Download.hidden = (!item.mp3DownloadUrl && !item.mp3VidSaveRequest) || (item.preview?.type === "image" && !(item.formats || []).some((format) => format.hasAudio));
  sourceOpen.href = item.webpageUrl || activePayload.webpageUrl || input.value.trim();

  renderPreview(item);
  renderItemChips(items);
  renderFormats(item);
  setState("ready");
}

input.addEventListener("input", () => {
  analyzeUrl(input.value.trim(), false);
});

input.addEventListener("paste", () => {
  requestAnimationFrame(() => analyzeUrl(input.value.trim(), false));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  analyzeUrl(input.value.trim(), true);
});

itemsStrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-item-index]");
  if (!button) return;
  activeItemIndex = Number(button.dataset.itemIndex) || 0;
  renderPayload();
});

document.addEventListener("click", (event) => {
  const anchor = event.target.closest("[data-vidsave-token]");
  if (!anchor) return;
  event.preventDefault();
  const task = vidSaveTasks.get(anchor.dataset.vidsaveToken);
  if (!task) return;
  startVidSaveDownload(task, anchor);
});

renderSupportedTypes();

const initialUrl = new URLSearchParams(window.location.search).get("url");
if (initialUrl) {
  input.value = initialUrl;
  analyzeUrl(initialUrl, true);
}
