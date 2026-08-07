const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhMmiCVF9GtVTLQUSmgdPkT1W5RR6ykkU",
  authDomain: "nexo-contas.firebaseapp.com",
  projectId: "nexo-contas",
  storageBucket: "nexo-contas.firebasestorage.app",
  messagingSenderId: "927169325649",
  appId: "1:927169325649:web:1f3430758ac281ee01a670"
};

const NEWS_ENDPOINT = "../portal-news.php";
const STATUS_LABELS = {
  submitted: "Recebida",
  draft: "Rascunho",
  awaiting_validation: "Aguardando validação",
  in_review: "Em revisão",
  approved: "Aprovada",
  scheduled: "Agendada",
  published: "Publicada",
  rejected: "Rejeitada",
  archived: "Arquivada"
};
const ROLE_STATUS = {
  contributor: ["submitted", "draft"],
  editor: ["submitted", "draft", "awaiting_validation", "in_review", "rejected"],
  reviewer: ["submitted", "draft", "awaiting_validation", "in_review", "approved", "rejected", "archived"],
  administrator: Object.keys(STATUS_LABELS),
  super_admin: Object.keys(STATUS_LABELS)
};

const state = {
  auth: null,
  provider: null,
  user: null,
  session: null,
  articles: [],
  selectedId: "",
  dirty: false,
  toastTimer: 0
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function refreshIcons() {
  window.lucide?.createIcons?.({ attrs: { "stroke-width": 1.8 } });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function resolveImage(value) {
  const image = String(value || "").trim();
  if (!image) return "../assets/atividade-corrida-lite.jpg";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `../${image.replace(/^\.\//, "")}`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function setLoginStatus(message) {
  $("#loginStatus").textContent = message;
}

function setConnection(label, mode = "") {
  const status = $("#connectionStatus");
  status.className = `connection${mode ? ` is-${mode}` : ""}`;
  status.innerHTML = `<i data-lucide="${mode === "online" ? "cloud-check" : mode === "error" ? "cloud-off" : "cloud"}"></i> ${escapeHtml(label)}`;
  refreshIcons();
}

async function tokenHeaders(extra = {}) {
  const token = await state.auth?.currentUser?.getIdToken();
  if (!token) throw new Error("auth_required");
  return { ...extra, Authorization: `Bearer ${token}` };
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    const error = new Error(payload.error || `http_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function authErrorMessage(error) {
  const code = String(error?.message || error?.code || "");
  if (code.includes("unauthorized")) return "Esta conta não está autorizada no painel editorial.";
  if (code.includes("popup-closed")) return "A janela de acesso foi fechada antes da conclusão.";
  if (code.includes("status_not_allowed")) return "Seu perfil não pode atribuir esse status editorial.";
  if (code.includes("delete_not_allowed")) return "Seu perfil não pode excluir notícias.";
  if (code.includes("item_not_owned")) return "Colaboradores só podem alterar notícias próprias.";
  return "Não foi possível conectar ao servidor editorial.";
}

function initializeAuth() {
  if (!window.firebase?.initializeApp || !window.firebase?.auth) {
    setLoginStatus("Os componentes de autenticação não foram carregados.");
    $("#loginButton").disabled = true;
    return;
  }
  const app = window.firebase.apps?.length ? window.firebase.app() : window.firebase.initializeApp(FIREBASE_CONFIG);
  state.auth = window.firebase.auth(app);
  state.provider = new window.firebase.auth.GoogleAuthProvider();
  state.provider.setCustomParameters({ prompt: "select_account" });
  state.auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
  state.auth.onAuthStateChanged(handleAuthState);
}

async function signIn() {
  if (!state.auth || !state.provider) return;
  const button = $("#loginButton");
  button.disabled = true;
  setLoginStatus("Abrindo autenticação do Google...");
  try {
    await state.auth.signInWithPopup(state.provider);
  } catch (error) {
    setLoginStatus(authErrorMessage(error));
  } finally {
    button.disabled = false;
  }
}

async function handleAuthState(user) {
  if (!user) {
    state.user = null;
    state.session = null;
    $("#adminShell").hidden = true;
    $("#loginGate").hidden = false;
    setLoginStatus("Aguardando autenticação segura.");
    return;
  }

  setLoginStatus("Validando permissão no servidor...");
  try {
    const headers = await tokenHeaders();
    const payload = await apiRequest(`${NEWS_ENDPOINT}?action=session&t=${Date.now()}`, { headers });
    state.user = user;
    state.session = payload.user;
    openPanel();
    await loadArticles();
  } catch (error) {
    setLoginStatus(authErrorMessage(error));
    await state.auth.signOut().catch(() => {});
  }
}

function openPanel() {
  const email = state.session?.email || state.user?.email || "Equipe NEXO";
  $("#userName").textContent = email;
  $("#userRole").textContent = state.session?.roleLabel || "Equipe editorial";
  $("#userAvatar").textContent = email.slice(0, 1).toUpperCase();
  $("#refreshAgencyButton").disabled = !state.session?.permissions?.refresh;
  $("#deleteArticleButton").disabled = !state.session?.permissions?.delete;
  $("#loginGate").hidden = true;
  $("#adminShell").hidden = false;
  setConnection("Servidor editorial", "online");
  buildStatusOptions();
  refreshIcons();
}

function buildStatusOptions(current = "draft") {
  const role = state.session?.role || "contributor";
  const allowed = ROLE_STATUS[role] || ROLE_STATUS.contributor;
  const select = $("#articleStatus");
  select.innerHTML = allowed.map((status) => `<option value="${status}">${STATUS_LABELS[status]}</option>`).join("");
  select.value = allowed.includes(current) ? current : allowed[0];
}

function normalizeArticles(items) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({
    id: String(item.id || `news-${Date.now()}-${index}`),
    title: String(item.title || "Nova notícia"),
    summary: String(item.summary || ""),
    body: String(item.body || ""),
    category: String(item.category || "Geral"),
    status: STATUS_LABELS[item.status] ? item.status : "draft",
    featured: Boolean(item.featured),
    sourceType: ["manual", "agencia", "ai"].includes(item.sourceType) ? item.sourceType : "manual",
    sourceName: String(item.sourceName || "NEXO Notícias"),
    sourceUrl: String(item.sourceUrl || ""),
    author: String(item.author || "Redação NEXO"),
    image: String(item.image || "assets/atividade-corrida-lite.jpg"),
    imageCredit: String(item.imageCredit || ""),
    publishedAt: item.publishedAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    editedByAdmin: Boolean(item.editedByAdmin),
    ownerEmail: String(item.ownerEmail || ""),
    lastEditedBy: String(item.lastEditedBy || ""),
    riskLevel: ["low", "medium", "high", "critical"].includes(item.riskLevel) ? item.riskLevel : "unclassified",
    riskReasons: Array.isArray(item.riskReasons) ? item.riskReasons.map(String) : [],
    automationEligible: Boolean(item.automationEligible),
    automationDecision: String(item.automationDecision || "unclassified"),
    classificationVersion: String(item.classificationVersion || ""),
    classifiedAt: String(item.classifiedAt || ""),
    validatedBy: String(item.validatedBy || ""),
    validatedAt: String(item.validatedAt || "")
  })).sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function loadArticles(options = {}) {
  try {
    setConnection("Sincronizando", "");
    const headers = await tokenHeaders();
    const payload = await apiRequest(`${NEWS_ENDPOINT}?t=${Date.now()}`, { headers });
    state.articles = normalizeArticles(payload.items);
    if (!state.articles.some((item) => item.id === state.selectedId)) state.selectedId = state.articles[0]?.id || "";
    state.dirty = false;
    renderAll();
    setConnection("Sincronizado", "online");
  } catch (error) {
    setConnection("Servidor indisponível", "error");
    if (!options.silent) showToast("Não foi possível carregar as notícias.");
  }
}

function renderAll() {
  renderMetrics();
  renderList();
  fillForm();
  refreshIcons();
}

function renderMetrics() {
  const count = (status) => state.articles.filter((item) => item.status === status).length;
  $("#draftCount").textContent = count("draft") + count("submitted");
  $("#reviewCount").textContent = count("awaiting_validation") + count("in_review");
  $("#scheduledCount").textContent = count("scheduled");
  $("#publishedCount").textContent = count("published");
}

function renderList() {
  const search = normalizeText($("#articleSearch").value);
  const status = $("#statusFilter").value;
  const visible = state.articles.filter((article) => {
    const haystack = normalizeText([article.title, article.category, article.sourceName, article.author].join(" "));
    return (!search || haystack.includes(search)) && (!status || article.status === status);
  });
  $("#articleCount").textContent = `${visible.length} notícia${visible.length === 1 ? "" : "s"}`;
  $("#newsList").innerHTML = visible.length ? visible.map((article) => `
    <button class="news-item${article.id === state.selectedId ? " is-active" : ""}" type="button" data-article-id="${escapeHtml(article.id)}">
      <img src="${escapeHtml(resolveImage(article.image))}" alt="" onerror="this.src='../assets/atividade-corrida-lite.jpg'">
      <span class="news-item__body">
        <strong>${escapeHtml(article.title)}</strong>
        <small><i class="status-dot status-dot--${escapeHtml(article.status)}"></i>${escapeHtml(STATUS_LABELS[article.status])} · ${escapeHtml(article.category)} · ${escapeHtml(article.riskLevel === "unclassified" ? "sem análise" : `risco ${article.riskLevel}`)}</small>
      </span>
    </button>`).join("") : '<div class="empty-state">Nenhuma notícia corresponde aos filtros atuais.</div>';
  $$('[data-article-id]').forEach((button) => button.addEventListener("click", () => selectArticle(button.dataset.articleId)));
}

function selectedArticle() {
  return state.articles.find((article) => article.id === state.selectedId) || null;
}

function selectArticle(id) {
  state.selectedId = id;
  state.dirty = false;
  renderList();
  fillForm();
}

function toDateInput(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fillForm() {
  const article = selectedArticle();
  const form = $("#articleForm");
  [...form.elements].forEach((element) => { element.disabled = !article; });
  $("#deleteArticleButton").disabled = !article || !state.session?.permissions?.delete;
  if (!article) {
    form.reset();
    $("#editorTitle").textContent = "Selecione uma notícia";
    $("#editorStatusChip").textContent = "Sem seleção";
    $("#imagePreview").innerHTML = "<span>Prévia da imagem</span>";
    $("#riskBadge").className = "risk-badge";
    $("#riskBadge").textContent = "Não classificada";
    $("#automationDecision").textContent = "Aguardando análise editorial";
    $("#riskReasons").innerHTML = "<li>Selecione ou crie uma notícia para ver a classificação.</li>";
    return;
  }
  $("#articleId").value = article.id;
  $("#articleTitle").value = article.title;
  $("#articleSummary").value = article.summary;
  $("#articleBody").value = article.body;
  $("#articleCategory").value = article.category;
  if (!$("#articleCategory").value) $("#articleCategory").value = "Geral";
  buildStatusOptions(article.status);
  $("#articleAuthor").value = article.author;
  $("#articlePublishedAt").value = toDateInput(article.publishedAt);
  $("#articleSourceType").value = article.sourceType;
  $("#articleSourceName").value = article.sourceName;
  $("#articleSourceUrl").value = article.sourceUrl;
  $("#articleImage").value = article.image;
  $("#articleImageCredit").value = article.imageCredit;
  $("#articleFeatured").checked = article.featured;
  $("#editorTitle").textContent = article.title;
  $("#editorStatusChip").textContent = STATUS_LABELS[article.status];
  $("#saveStatus").textContent = state.dirty ? "Alterações ainda não salvas" : "Nenhuma alteração pendente";
  renderAutomationReview(article);
  renderImagePreview();
}

function renderAutomationReview(article) {
  const labels = { unclassified: "Não classificada", low: "Risco baixo", medium: "Risco médio", high: "Risco alto", critical: "Risco crítico" };
  const decisions = {
    unclassified: "A classificação aparece após o primeiro salvamento",
    auto_publish: "Elegível para publicação automática",
    ready_but_disabled: "Elegível, mas a publicação automática está desligada",
    awaiting_validation: "Requer validação humana antes da publicação",
    manual_approval: "Validada manualmente pela equipe editorial"
  };
  const badge = $("#riskBadge");
  badge.className = `risk-badge${article.riskLevel !== "unclassified" ? ` risk-badge--${article.riskLevel}` : ""}`;
  badge.textContent = labels[article.riskLevel] || labels.unclassified;
  $("#automationDecision").textContent = decisions[article.automationDecision] || decisions.unclassified;
  const reasons = article.riskReasons.length ? article.riskReasons : ["Nenhum impedimento registrado nesta versão."];
  $("#riskReasons").innerHTML = reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("");
}

function renderImagePreview() {
  const image = $("#articleImage").value.trim();
  $("#imagePreview").innerHTML = image
    ? `<img src="${escapeHtml(resolveImage(image))}" alt="Prévia da imagem" onerror="this.parentElement.innerHTML='<span>Imagem indisponível</span>'">`
    : "<span>Prévia da imagem</span>";
}

function markDirty() {
  if (!selectedArticle()) return;
  state.dirty = true;
  $("#saveStatus").textContent = "Alterações ainda não salvas";
}

function newArticle() {
  const id = `manual-${Date.now()}`;
  state.articles.unshift({
    id,
    title: "Nova notícia",
    summary: "",
    body: "",
    category: "Geral",
    status: "draft",
    featured: false,
    sourceType: "manual",
    sourceName: "NEXO Notícias",
    sourceUrl: "",
    author: "Redação NEXO",
    image: "assets/atividade-corrida-lite.jpg",
    imageCredit: "",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editedByAdmin: true,
    ownerEmail: state.session?.email || "",
    lastEditedBy: state.session?.email || "",
    riskLevel: "unclassified",
    riskReasons: [],
    automationEligible: false,
    automationDecision: "unclassified",
    classificationVersion: "",
    classifiedAt: "",
    validatedBy: "",
    validatedAt: ""
  });
  state.selectedId = id;
  state.dirty = true;
  renderAll();
  $("#articleTitle").focus();
  showToast("Rascunho criado. Salve para enviá-lo ao servidor.");
}

function readForm() {
  const current = selectedArticle();
  if (!current) return null;
  const dateValue = $("#articlePublishedAt").value;
  return {
    ...current,
    title: $("#articleTitle").value.trim(),
    summary: $("#articleSummary").value.trim(),
    body: $("#articleBody").value.trim(),
    category: $("#articleCategory").value,
    status: $("#articleStatus").value,
    author: $("#articleAuthor").value.trim() || "Redação NEXO",
    publishedAt: dateValue ? new Date(dateValue).toISOString() : new Date().toISOString(),
    sourceType: $("#articleSourceType").value,
    sourceName: $("#articleSourceName").value.trim() || "NEXO Notícias",
    sourceUrl: $("#articleSourceUrl").value.trim(),
    image: $("#articleImage").value.trim() || "assets/atividade-corrida-lite.jpg",
    imageCredit: $("#articleImageCredit").value.trim(),
    featured: $("#articleFeatured").checked,
    updatedAt: new Date().toISOString(),
    editedByAdmin: true
  };
}

async function saveArticle(event) {
  event.preventDefault();
  const article = readForm();
  if (!article || !article.title) {
    showToast("Informe o título da notícia.");
    return;
  }
  if (article.featured) state.articles.forEach((item) => { if (item.id !== article.id) item.featured = false; });
  const index = state.articles.findIndex((item) => item.id === article.id);
  state.articles[index] = article;
  const submit = event.submitter;
  if (submit) submit.disabled = true;
  $("#saveStatus").textContent = "Salvando no servidor...";
  try {
    const headers = await tokenHeaders({ "Content-Type": "application/json" });
    const payload = await apiRequest(NEWS_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        items: state.articles,
        audit: {
          area: "noticias",
          action: article.id.startsWith("manual-") ? "news_created" : "news_updated",
          targetType: "noticia",
          targetId: article.id,
          targetLabel: article.title
        }
      })
    });
    state.articles = normalizeArticles(payload.items);
    state.selectedId = article.id;
    state.dirty = false;
    renderAll();
    setConnection("Sincronizado", "online");
    showToast("Notícia salva no servidor editorial.");
  } catch (error) {
    $("#saveStatus").textContent = "Falha ao salvar; suas alterações seguem nesta tela";
    setConnection("Falha de sincronização", "error");
    showToast(authErrorMessage(error));
  } finally {
    if (submit) submit.disabled = false;
  }
}

async function deleteArticle() {
  const article = selectedArticle();
  if (!article || !state.session?.permissions?.delete) return;
  if (!window.confirm(`Excluir definitivamente “${article.title}”?`)) return;
  const previous = [...state.articles];
  state.articles = state.articles.filter((item) => item.id !== article.id);
  state.selectedId = state.articles[0]?.id || "";
  try {
    const headers = await tokenHeaders({ "Content-Type": "application/json" });
    const payload = await apiRequest(NEWS_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ items: state.articles, audit: { area: "noticias", action: "news_deleted", targetType: "noticia", targetId: article.id, targetLabel: article.title } })
    });
    state.articles = normalizeArticles(payload.items);
    renderAll();
    showToast("Notícia excluída.");
  } catch (error) {
    state.articles = previous;
    state.selectedId = article.id;
    renderAll();
    showToast(authErrorMessage(error));
  }
}

async function refreshAgency() {
  if (!state.session?.permissions?.refresh) return;
  const button = $("#refreshAgencyButton");
  button.disabled = true;
  button.textContent = "Importando e preparando rascunhos...";
  try {
    const headers = await tokenHeaders({ "Content-Type": "application/json" });
    const payload = await apiRequest(`${NEWS_ENDPOINT}?action=refresh&t=${Date.now()}`, { method: "POST", headers, body: "{}" });
    state.articles = normalizeArticles(payload.items);
    state.selectedId = state.articles[0]?.id || "";
    renderAll();
    showToast("Agência Brasília atualizada. Novas matérias entram como rascunho.");
  } catch (error) {
    showToast(authErrorMessage(error));
  } finally {
    button.disabled = !state.session?.permissions?.refresh;
    button.innerHTML = '<i data-lucide="refresh-cw"></i> Importar da Agência Brasília';
    refreshIcons();
  }
}

async function loadAudit() {
  const list = $("#auditList");
  list.innerHTML = '<div class="empty-state">Carregando histórico editorial...</div>';
  try {
    const headers = await tokenHeaders();
    const payload = await apiRequest(`${NEWS_ENDPOINT}?action=audit&t=${Date.now()}`, { headers });
    list.innerHTML = payload.items?.length ? payload.items.map((entry) => `
      <article class="audit-item">
        <span class="audit-icon"><i data-lucide="file-clock"></i></span>
        <span><strong>${escapeHtml(entry.summary || "Atualização editorial")}</strong><small>${escapeHtml(entry.adminEmail || "Sistema")} · ${escapeHtml(entry.area || "noticias")}</small></span>
        <time datetime="${escapeHtml(entry.timestamp)}">${escapeHtml(formatDate(entry.timestamp))}</time>
      </article>`).join("") : '<div class="empty-state">O histórico ainda não possui alterações registradas.</div>';
    refreshIcons();
  } catch (error) {
    list.innerHTML = '<div class="empty-state">Não foi possível carregar o histórico agora.</div>';
  }
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function switchView(view) {
  $$('[data-view]').forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
  $$('[data-panel]').forEach((panel) => {
    const active = panel.dataset.panel === view;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  $("#viewTitle").textContent = view === "audit" ? "Histórico editorial" : "Redação";
  $("#newArticleButton").hidden = view === "audit";
  if (view === "audit") loadAudit();
}

function bindEvents() {
  $("#loginButton").addEventListener("click", signIn);
  $("#logoutButton").addEventListener("click", () => state.auth?.signOut());
  $("#newArticleButton").addEventListener("click", newArticle);
  $("#articleSearch").addEventListener("input", renderList);
  $("#statusFilter").addEventListener("change", renderList);
  $("#articleForm").addEventListener("submit", saveArticle);
  $("#deleteArticleButton").addEventListener("click", deleteArticle);
  $("#refreshAgencyButton").addEventListener("click", refreshAgency);
  $("#reloadAuditButton").addEventListener("click", loadAudit);
  $("#articleImage").addEventListener("input", () => { markDirty(); renderImagePreview(); });
  $("#articleSourceType").addEventListener("change", () => {
    const names = { manual: "NEXO Notícias", agencia: "Agência Brasília", ai: "IA com revisão editorial" };
    if (!$("#articleSourceName").value.trim()) $("#articleSourceName").value = names[$("#articleSourceType").value];
    markDirty();
  });
  $$("#articleForm input, #articleForm textarea, #articleForm select").forEach((field) => {
    if (field.id !== "articleImage" && field.id !== "articleSourceType") field.addEventListener("input", markDirty);
  });
  $$('[data-view]').filter((button) => button.tagName === "BUTTON").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  refreshIcons();
  initializeAuth();
});
