const portalArticle = document.querySelector("#portalArticle");
const articleMetaDescription = document.querySelector("#articleMetaDescription");
const portalNewsEndpoint = "portal-news.php";
const portalNewsFallback = "portal-news.json";
const defaultPortalNewsImage = "assets/atividade-corrida-lite.jpg";

function escapeArticleText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeArticleUrl(value, fallback = "#") {
  try {
    const url = new URL(String(value || ""), window.location.href);
    return ["https:", "http:"].includes(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
}

function isArticleLocalAsset(value) {
  return /^(?:\.{0,2}\/)?assets\//i.test(String(value || "").trim());
}

function normalizeArticleSlug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getArticleSlugFromSourceUrl(value) {
  try {
    const url = new URL(String(value || ""), window.location.href);
    const lastPart = url.pathname.split("/").filter(Boolean).pop() || "";
    return normalizeArticleSlug(lastPart);
  } catch {
    return "";
  }
}

function buildArticleSlug(item) {
  return getArticleSlugFromSourceUrl(item.sourceUrl) || normalizeArticleSlug(item.id) || normalizeArticleSlug(item.title) || "noticia";
}

function resolveArticleImageSources(item) {
  const rawImage = String(item.image || item.imageUrl || "").trim();
  const slug = getArticleSlugFromSourceUrl(item.sourceUrl) || normalizeArticleSlug(item.id) || normalizeArticleSlug(item.title);
  const localImage = isArticleLocalAsset(rawImage)
    ? rawImage
    : slug
      ? `assets/noticias/${slug}.jpg`
      : defaultPortalNewsImage;
  const remoteImage = isArticleLocalAsset(rawImage) ? "" : safeArticleUrl(rawImage, "");
  return {
    image: localImage || defaultPortalNewsImage,
    imageRemote: remoteImage,
    imageDefault: defaultPortalNewsImage
  };
}

function formatArticleDate(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "Atualizado agora";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}


async function fetchPortalNews() {
  const sources = [
    `${portalNewsEndpoint}?t=${Date.now()}`,
    `${portalNewsFallback}?t=${Date.now()}`
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) throw new Error("Notícias indisponíveis");
      const payload = await response.json();
      const items = normalizePortalNewsItems(payload.items || payload.news || []);
      if (items.length) return items;
    } catch {
      continue;
    }
  }

  return [];
}

function getCurrentArticleKey() {
  const params = new URLSearchParams(window.location.search);
  return {
    slug: normalizeArticleSlug(params.get("slug") || ""),
    id: String(params.get("id") || "")
  };
}

function findArticle(items) {
  const current = getCurrentArticleKey();
  if (!current.slug && !current.id) return items[0] || null;
  return items.find((item) => item.slug === current.slug || item.id === current.id) || null;
}

function isHeadingBlock(block) {
  const wordCount = block.split(/\s+/).filter(Boolean).length;
  return wordCount <= 6 && !/[.!?]/.test(block) && !block.startsWith("*");
}

function buildArticleSourceNote(text, sourceUrl) {
  return `
    <p class="article-story__note">
      <a class="article-story__note-link" href="${escapeArticleText(sourceUrl)}" target="_blank" rel="noreferrer">
        ${escapeArticleText(text)}
      </a>
    </p>
  `;
}

function renderArticleBody(body, sourceUrl, sourceName) {
  const blocks = String(body || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  let hasSourceNote = false;
  const html = blocks
    .map((block) => {
      if (isHeadingBlock(block)) {
        return `<h2>${escapeArticleText(block)}</h2>`;
      }
      if (block.startsWith("*")) {
        hasSourceNote = true;
        return buildArticleSourceNote(block.replace(/^\*\s*/, ""), sourceUrl);
      }
      return `<p>${escapeArticleText(block)}</p>`;
    })
    .join("");

  if (hasSourceNote) return html;
  return `${html}${buildArticleSourceNote(`Fonte original: ${sourceName}`, sourceUrl)}`;
}

function renderArticleShare(item) {
  const url = window.location.href;
  const shareText = item.summary || item.title;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${item.title}\n${url}`)}`;

  return `
    <aside class="article-share" aria-label="Compartilhar mat&eacute;ria">
      <strong class="article-share__title">Compartilhe esta mat&eacute;ria</strong>
      <a class="article-share__button article-share__button--whatsapp" href="${escapeArticleText(whatsappUrl)}" target="_blank" rel="noreferrer" aria-label="Compartilhar no WhatsApp">
        <svg class="article-share__icon article-share__icon--whatsapp" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 3C9.4 3 4 8.1 4 14.5c0 2.5.8 4.9 2.3 6.9L5 29l7.8-2.1c1 .3 2.1.5 3.2.5 6.6 0 12-5.1 12-11.5S22.6 3 16 3Zm0 22c-.9 0-1.8-.1-2.7-.4l-.5-.2-4.7 1.2.9-4.5-.4-.6c-1.3-1.7-2-3.8-2-6C6.6 9.5 10.8 5.4 16 5.4s9.4 4.1 9.4 9.1S21.2 25 16 25Zm5.3-6.8c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.3-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.3 3.4 1.5 3.6c.2.3 2.5 3.8 6.1 5.3.9.4 1.6.6 2.1.7.9.3 1.7.2 2.3.1.7-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" /></svg>
        <span>WhatsApp</span>
      </a>
      <button class="article-share__button article-share__button--native" type="button" data-article-share data-share-title="${escapeArticleText(item.title)}" data-share-text="${escapeArticleText(shareText)}" data-share-url="${escapeArticleText(url)}" data-share-label="Compartilhar">
        <span class="article-share__button-icon" aria-hidden="true">&#8599;</span>
        <span class="article-share__button-label">Compartilhar</span>
      </button>
    </aside>
  `;
}

function renderArticleNotFound() {
  document.title = "Notícia não encontrada | NEXO Notícias";
  portalArticle.classList.remove("article-story--loading");
  portalArticle.innerHTML = `
    <div class="article-empty">
      <span>Não encontramos essa matéria.</span>
      <a class="article-back-link article-back-link--inline" href="index.html#noticias">Voltar às notícias</a>
    </div>
  `;
}

async function initArticlePage() {
  if (!portalArticle) return;
  const items = await fetchPortalNews();
  const article = findArticle(items);
  if (!article) {
    renderArticleNotFound();
    return;
  }
  renderArticle(article);
}

function normalizePortalNewsItems(items = []) {
  return items
    .map((item, index) => {
      const normalized = {
        id: String(item.id || `news-${index}`),
        title: String(item.title || "Notícia do NEXO"),
        summary: String(item.summary || item.description || ""),
        body: String(item.body || ""),
        category: String(item.category || "Esportes"),
        author: String(item.author || "Redação NEXO"),
        sourceName: String(item.sourceName || (item.sourceType === "manual" ? "NEXO Notícias" : "Agência Brasília")),
        sourceType: String(item.sourceType || "agencia"),
        sourceUrl: String(item.sourceUrl || item.url || ""),
        imageCredit: String(item.imageCredit || ""),
        publishedAt: item.publishedAt || item.createdAt || new Date().toISOString(),
        status: item.status || "published"
      };
      return {
        ...normalized,
        ...resolveArticleImageSources({ ...item, ...normalized }),
        slug: buildArticleSlug({ ...item, ...normalized })
      };
    })
    .filter((item) => item.status === "published");
}

function renderArticle(item) {
  const sourceUrl = safeArticleUrl(item.sourceUrl, "#");
  const sourceName = item.sourceName || "Agência Brasília";
  const meta = [
    item.category,
    item.author || item.sourceName,
    formatArticleDate(item.publishedAt)
  ].filter(Boolean).join(" • ");
  const bodyHtml = renderArticleBody(item.body || item.summary, sourceUrl, sourceName);
  const imageCredit = item.imageCredit
    ? `<figcaption class="article-story__caption">${escapeArticleText(item.imageCredit)}</figcaption>`
    : "";

  document.title = `${item.title} | NEXO Notícias`;
  if (articleMetaDescription) {
    articleMetaDescription.setAttribute("content", item.summary || item.title);
  }

  portalArticle.classList.remove("article-story--loading");
  portalArticle.innerHTML = `
    <nav class="article-breadcrumb" aria-label="Caminho da notícia">
      <a href="index.html">Início</a>
      <span>/</span>
      <a href="index.html#noticias">Notícias</a>
      <span>/</span>
      <strong>${escapeArticleText(item.category)}</strong>
    </nav>

    <header class="article-story__hero">
      <div class="article-story__eyebrow">${escapeArticleText(item.category)}</div>
      <h1>${escapeArticleText(item.title)}</h1>
      <p class="article-story__summary">${escapeArticleText(item.summary)}</p>
      <div class="article-story__meta">${escapeArticleText(meta)}</div>
    </header>

    <figure class="article-story__media">
      <img src="${escapeArticleText(item.image)}" alt="${escapeArticleText(item.title)}" loading="eager" data-article-image data-remote-src="${escapeArticleText(item.imageRemote || "")}" data-default-src="${escapeArticleText(item.imageDefault || defaultPortalNewsImage)}" />
      ${imageCredit}
    </figure>

    <div class="article-story__content">
      ${bodyHtml}
    </div>
    <section class="article-sources" aria-labelledby="articleSourcesTitle">
      <h2 id="articleSourcesTitle">Fontes consultadas</h2>
      <ul>
        <li>
          <a href="${escapeArticleText(sourceUrl)}" target="_blank" rel="noreferrer">
            <strong>${escapeArticleText(sourceName)}</strong>
            <span>${escapeArticleText(sourceUrl)}</span>
          </a>
        </li>
      </ul>
    </section>
    ${renderArticleShare(item)}
  `;
  bindArticleImageFallback();
}

function bindArticleImageFallback() {
  const img = portalArticle?.querySelector?.("img[data-article-image]");
  if (!img) return;
  img.onerror = () => {
    const remoteSrc = img.dataset.remoteSrc || "";
    const defaultSrc = img.dataset.defaultSrc || defaultPortalNewsImage;
    const currentSrc = img.getAttribute("src") || "";

    if (remoteSrc && currentSrc !== remoteSrc && img.dataset.fallbackState !== "remote") {
      img.dataset.fallbackState = "remote";
      img.src = remoteSrc;
      return;
    }

    if (currentSrc !== defaultSrc && img.dataset.fallbackState !== "default") {
      img.dataset.fallbackState = "default";
      img.src = defaultSrc;
      return;
    }

    img.onerror = null;
  };
}

initArticlePage();
