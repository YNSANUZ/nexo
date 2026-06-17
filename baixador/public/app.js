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

const apiBasePath = (() => {
  const path = window.location.pathname;
  if (path.includes("/baixador/")) return "/baixador/api";
  if (path.includes("/baixar/")) return "/baixar/api";
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
          <a class="mini-link primary" href="${escapeHtml(routeApiUrl(format.downloadUrl))}" download>Baixar</a>
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

  sourcePill.textContent = item.kind || activePayload.kind || "Midia";
  kindLabel.textContent = item.kind || "Midia";
  kindLabel.style.background = item.accent || activePayload.accent || "var(--mint)";
  sourceLabel.textContent = item.source || activePayload.source || "Fonte";
  mediaTitle.textContent = item.title || activePayload.title || "Midia encontrada";
  mediaMeta.textContent = [item.uploader, item.durationLabel].filter(Boolean).join(" / ") || "Opcoes prontas para download";
  bestVideo.hidden = !item.bestVideoDownloadUrl;
  bestVideo.href = routeApiUrl(item.bestVideoDownloadUrl);
  primaryDownloadLabel.textContent = item.primaryDownloadLabel || "MP4 melhor";
  mp3Download.href = routeApiUrl(item.mp3DownloadUrl);
  mp3Download.hidden = !item.mp3DownloadUrl || (item.preview?.type === "image" && !(item.formats || []).some((format) => format.hasAudio));
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

renderSupportedTypes();

const initialUrl = new URLSearchParams(window.location.search).get("url");
if (initialUrl) {
  input.value = initialUrl;
  analyzeUrl(initialUrl, true);
}
