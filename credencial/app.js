const firebaseConfig = {
  apiKey: "AIzaSyCrFy_AkTxJ8E1n2-R-WNO5z0vdv_oyl6o",
  authDomain: "checkin-89467.firebaseapp.com",
  projectId: "checkin-89467",
  storageBucket: "checkin-89467.firebasestorage.app",
  messagingSenderId: "397513842284",
  appId: "1:397513842284:web:13b7aab224a83ebd2c4249",
  measurementId: "G-VPW5KKYS1D",
};

const publicAppUrl = "https://primusdf.com.br/credencial/";
const systemAdminEmail = "primusdf@gmail.com";
const localKey = "nexo-credencial-multievent-v1";
const legacyLocalKey = "nexo-checkin-multievent-v1";
const formFieldDefinitions = [
  { key: "name", label: "Nome", base: "required" },
  { key: "phone", label: "Telefone", base: "required" },
  { key: "workplace", label: "Local que trabalha", base: "optional" },
  { key: "email", label: "E-mail", base: "optional" },
  { key: "rg", label: "RG", base: "hidden" },
  { key: "cpf", label: "CPF", base: "hidden" },
  { key: "address", label: "Endereço", base: "hidden" },
  { key: "enrollment", label: "Matrícula", base: "hidden" },
  { key: "location", label: "Localização no mapa", base: "hidden" },
  { key: "workMode", label: "Trabalho no evento", base: "optional" },
];

const state = {
  events: [],
  memberEvents: [],
  adminEvents: [],
  moderatorEvents: [],
  publicEvents: [],
  guests: [],
  query: "",
  listMode: "active",
  user: null,
  currentEventId: localStorage.getItem("nexo-current-event") || "",
  publicInviteEventId: new URLSearchParams(location.search).get("evento") || "",
  publicMode: new URLSearchParams(location.search).get("convite") === "1",
  publicEvent: null,
  publicFormLocation: null,
  pendingDeleteId: "",
  firebaseReady: false,
  services: null,
  unsubEvents: null,
  unsubAdminEvents: null,
  unsubModeratorEvents: null,
  unsubPublicEvents: null,
  unsubGuests: null,
  publicLocationWatchId: null,
};

const els = {
  menuButton: document.querySelector("#menuButton"),
  loginGate: document.querySelector("#loginGate"),
  gateLoginButton: document.querySelector("#gateLoginButton"),
  publicInvite: document.querySelector("#publicInvite"),
  inviteLogo: document.querySelector("#inviteLogo"),
  inviteEventName: document.querySelector("#inviteEventName"),
  inviteEventDate: document.querySelector("#inviteEventDate"),
  inviteEventDescription: document.querySelector("#inviteEventDescription"),
  inviteEventRoute: document.querySelector("#inviteEventRoute"),
  openPublicSignupButton: document.querySelector("#openPublicSignupButton"),
  publicSignupForm: document.querySelector("#publicSignupForm"),
  publicPhoneInput: document.querySelector("#publicPhoneInput"),
  publicPhonePreview: document.querySelector("#publicPhonePreview"),
  publicWorkInput: document.querySelector("#publicWorkInput"),
  publicWorkFields: document.querySelector("#publicWorkFields"),
  publicLocationButton: document.querySelector("#publicLocationButton"),
  publicLocationStatus: document.querySelector("#publicLocationStatus"),
  publicInviteMessage: document.querySelector("#publicInviteMessage"),
  closeMenuButton: document.querySelector("#closeMenuButton"),
  menuPanel: document.querySelector("#menuPanel"),
  currentEventButton: document.querySelector("#currentEventButton"),
  eventWatermark: document.querySelector("#eventWatermark"),
  sessionLabel: document.querySelector("#sessionLabel"),
  userBadge: document.querySelector("#userBadge"),
  userPhoto: document.querySelector("#userPhoto"),
  userInitial: document.querySelector("#userInitial"),
  userName: document.querySelector("#userName"),
  restrictedButton: document.querySelector("#restrictedButton"),
  menuLoginButton: document.querySelector("#menuLoginButton"),
  restrictedDialog: document.querySelector("#restrictedDialog"),
  closeRestrictedButton: document.querySelector("#closeRestrictedButton"),
  googleLoginButton: document.querySelector("#googleLoginButton"),
  loginError: document.querySelector("#loginError"),
  logoutButton: document.querySelector("#logoutButton"),
  openEventsButton: document.querySelector("#openEventsButton"),
  eventsDialog: document.querySelector("#eventsDialog"),
  closeEventsButton: document.querySelector("#closeEventsButton"),
  eventList: document.querySelector("#eventList"),
  openCreateEventButton: document.querySelector("#openCreateEventButton"),
  createFromEventsButton: document.querySelector("#createFromEventsButton"),
  createEventDialog: document.querySelector("#createEventDialog"),
  createEventForm: document.querySelector("#createEventForm"),
  createFormFieldSettings: document.querySelector("#createFormFieldSettings"),
  eventAudienceInput: document.querySelector("#eventAudienceInput"),
  eventPlanSuggestion: document.querySelector("#eventPlanSuggestion"),
  adminOnly: document.querySelectorAll(".admin-only"),
  openRegisterButton: document.querySelector("#openRegisterButton"),
  registerDialog: document.querySelector("#registerDialog"),
  registerForm: document.querySelector("#registerForm"),
  registerWorkInput: document.querySelector("#registerWorkInput"),
  registerWorkFields: document.querySelector("#registerWorkFields"),
  listOneButton: document.querySelector("#listOneButton"),
  listTwoButton: document.querySelector("#listTwoButton"),
  searchInput: document.querySelector("#searchInput"),
  guestList: document.querySelector("#guestList"),
  emptyState: document.querySelector("#emptyState"),
  guestTemplate: document.querySelector("#guestTemplate"),
  workerDialog: document.querySelector("#workerDialog"),
  closeWorkerButton: document.querySelector("#closeWorkerButton"),
  workerDialogTitle: document.querySelector("#workerDialogTitle"),
  workerName: document.querySelector("#workerName"),
  workerMeta: document.querySelector("#workerMeta"),
  workerSelfiePreview: document.querySelector("#workerSelfiePreview"),
  workerCheckinButton: document.querySelector("#workerCheckinButton"),
  workerLocationButton: document.querySelector("#workerLocationButton"),
  workerSelfieButton: document.querySelector("#workerSelfieButton"),
  workerSelfieInput: document.querySelector("#workerSelfieInput"),
  workerProofStatus: document.querySelector("#workerProofStatus"),
  workerLocationHistory: document.querySelector("#workerLocationHistory"),
  toast: document.querySelector("#toast"),
  toastText: document.querySelector("#toastText"),
  undoButton: document.querySelector("#undoButton"),
  reportButton: document.querySelector("#reportButton"),
  reportDialog: document.querySelector("#reportDialog"),
  closeReportButton: document.querySelector("#closeReportButton"),
  totalCount: document.querySelector("#totalCount"),
  checkedCount: document.querySelector("#checkedCount"),
  pendingCount: document.querySelector("#pendingCount"),
  walkinCount: document.querySelector("#walkinCount"),
  workerCount: document.querySelector("#workerCount"),
  deletedCount: document.querySelector("#deletedCount"),
  moderatorStats: document.querySelector("#moderatorStats"),
  eventLogoInput: document.querySelector("#eventLogoInput"),
  eventLogoFileInput: document.querySelector("#eventLogoFileInput"),
  eventDescriptionInput: document.querySelector("#eventDescriptionInput"),
  eventRouteInput: document.querySelector("#eventRouteInput"),
  saveEventLogoButton: document.querySelector("#saveEventLogoButton"),
  exportButton: document.querySelector("#exportButton"),
  openImportButton: document.querySelector("#openImportButton"),
  openInviteButton: document.querySelector("#openInviteButton"),
  inviteDialog: document.querySelector("#inviteDialog"),
  closeInviteButton: document.querySelector("#closeInviteButton"),
  publicRegistrationInput: document.querySelector("#publicRegistrationInput"),
  publicLinkInput: document.querySelector("#publicLinkInput"),
  formFieldSettings: document.querySelector("#formFieldSettings"),
  savePublicInviteButton: document.querySelector("#savePublicInviteButton"),
  copyPublicLinkButton: document.querySelector("#copyPublicLinkButton"),
  importDialog: document.querySelector("#importDialog"),
  closeImportButton: document.querySelector("#closeImportButton"),
  pasteImportInput: document.querySelector("#pasteImportInput"),
  pasteImportButton: document.querySelector("#pasteImportButton"),
  csvFileInput: document.querySelector("#csvFileInput"),
  csvUrlInput: document.querySelector("#csvUrlInput"),
  loadUrlButton: document.querySelector("#loadUrlButton"),
  resetButton: document.querySelector("#resetButton"),
  openModeratorsButton: document.querySelector("#openModeratorsButton"),
  planStatus: document.querySelector("#planStatus"),
  openPlansButton: document.querySelector("#openPlansButton"),
  plansDialog: document.querySelector("#plansDialog"),
  closePlansButton: document.querySelector("#closePlansButton"),
  moderatorsDialog: document.querySelector("#moderatorsDialog"),
  moderatorForm: document.querySelector("#moderatorForm"),
  moderatorList: document.querySelector("#moderatorList"),
  confirmDialog: document.querySelector("#confirmDialog"),
  confirmText: document.querySelector("#confirmText"),
  cancelDeleteButton: document.querySelector("#cancelDeleteButton"),
  confirmDeleteButton: document.querySelector("#confirmDeleteButton"),
  voiceCheckinButton: document.querySelector("#voiceCheckinButton"),
  voiceCheckinHelper: document.querySelector("#voiceCheckinHelper"),
  voiceCheckinTitle: document.querySelector("#voiceCheckinTitle"),
  voiceCheckinText: document.querySelector("#voiceCheckinText"),
};

let lastUndo = null;
let activeWorkerId = "";

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slug(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizePhone(value) {
  return onlyDigits(value).slice(0, 11);
}

function normalizeGmail(value) {
  const clean = normalize(value).replace(/\s+/g, "");
  if (!clean) return "";
  return clean.includes("@") ? clean : `${clean}@gmail.com`;
}

function randomToken() {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}${Math.random().toString(16).slice(2)}`;
}

function workerDetailsFromForm(data) {
  const workMode = data.get("workMode") === "1";
  return {
    workMode,
    workRole: workMode ? String(data.get("workRole") || "").trim() : "",
    workTeam: workMode ? String(data.get("workTeam") || "").trim() : "",
  };
}

function locationFromPosition(position, reason = "app") {
  return {
    lat: Number(position.coords.latitude.toFixed(6)),
    lng: Number(position.coords.longitude.toFixed(6)),
    accuracy: Math.round(position.coords.accuracy || 0),
    reason,
    at: new Date().toISOString(),
  };
}

function requestLocation(reason = "app") {
  if (!navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(locationFromPosition(position, reason)),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
    );
  });
}

function rememberGuestLocation(guest, location) {
  if (!guest || !location) return;
  const history = Array.isArray(guest.locationHistory) ? guest.locationHistory : [];
  guest.latestLocation = location;
  guest.locationHistory = [...history.slice(-9), location];
}

function email() {
  return normalize(state.user?.email);
}

function isSystemAdmin() {
  return email() === systemAdminEmail;
}

function currentEvent() {
  return state.events.find((event) => event.id === state.currentEventId) || null;
}

function isEventAdmin() {
  const event = currentEvent();
  return Boolean(event && (isSystemAdmin() || (event.admins || []).map(normalize).includes(email())));
}

function isEventModerator() {
  const event = currentEvent();
  return Boolean(event && (event.moderators || []).map(normalize).includes(email()));
}

function canOperate() {
  return Boolean(currentEvent() && (isEventAdmin() || isEventModerator()));
}

function canManage() {
  return isEventAdmin();
}

function showToast(message, undoAction = null) {
  els.toastText.textContent = message;
  lastUndo = undoAction;
  els.undoButton.hidden = !undoAction;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.remove("show");
    lastUndo = null;
    els.undoButton.hidden = true;
  }, undoAction ? 6000 : 2400);
}

function showLoginError(message) {
  els.loginError.textContent = message;
  els.loginError.hidden = false;
}

function clearLoginError() {
  els.loginError.textContent = "";
  els.loginError.hidden = true;
}

function loadLocal() {
  try {
    const data = JSON.parse(localStorage.getItem(localKey) || localStorage.getItem(legacyLocalKey)) || {};
    state.events = data.events || [];
    state.guests = data.guestsByEvent?.[state.currentEventId] || [];
  } catch (error) {
    state.events = [];
    state.guests = [];
  }
}

function saveLocal() {
  const data = JSON.parse(localStorage.getItem(localKey) || "{}");
  data.events = state.events;
  data.guestsByEvent = data.guestsByEvent || {};
  if (state.currentEventId) data.guestsByEvent[state.currentEventId] = state.guests;
  localStorage.setItem(localKey, JSON.stringify(data));
}

function stopEventSync() {
  if (state.unsubEvents) state.unsubEvents();
  if (state.unsubAdminEvents) state.unsubAdminEvents();
  if (state.unsubModeratorEvents) state.unsubModeratorEvents();
  if (state.unsubPublicEvents) state.unsubPublicEvents();
  state.unsubEvents = null;
  state.unsubAdminEvents = null;
  state.unsubModeratorEvents = null;
  state.unsubPublicEvents = null;
}

function stopGuestSync() {
  if (state.unsubGuests) state.unsubGuests();
  state.unsubGuests = null;
}

async function initFirebase() {
  if (!firebaseConfig.apiKey) return;

  const [{ initializeApp }, authLib, firestoreLib, storageLib] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js"),
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = authLib.getAuth(app);
  const db = firestoreLib.getFirestore(app);
  const storage = storageLib.getStorage(app);
  state.services = { authLib, firestoreLib, storageLib, auth, db, storage };
  state.firebaseReady = true;

  authLib.onAuthStateChanged(auth, (user) => {
    state.user = user;
    stopEventSync();
    stopGuestSync();

    if (state.publicMode) {
      loadPublicEvent();
      return;
    }

    if (!user) {
      state.events = [];
      state.memberEvents = [];
      state.adminEvents = [];
      state.moderatorEvents = [];
      state.publicEvents = [];
      state.guests = [];
      render();
      return;
    }

    startEventSync();
  });
}

async function loadPublicEvent() {
  if (!state.publicInviteEventId) {
    renderPublicInvite("Link de convite incompleto.");
    return;
  }
  if (!state.firebaseReady) {
    renderPublicInvite("Abra este convite online para concluir o pré-cadastro.");
    return;
  }
  const { firestoreLib, db } = state.services;
  try {
    const snap = await firestoreLib.getDoc(firestoreLib.doc(db, "eventos", state.publicInviteEventId));
    if (!snap.exists()) {
      renderPublicInvite("Evento não encontrado.");
      return;
    }
    state.publicEvent = { id: snap.id, ...snap.data() };
    renderPublicInvite();
  } catch (error) {
    renderPublicInvite("Não consegui carregar este convite.");
  }
}

function startEventSync() {
  const { firestoreLib, db } = state.services;
  const eventsRef = firestoreLib.collection(db, "eventos");
  const memberQuery = isSystemAdmin()
    ? eventsRef
    : firestoreLib.query(eventsRef, firestoreLib.where("members", "array-contains", email()));
  const publicQuery = firestoreLib.query(eventsRef, firestoreLib.where("publicRegistration", "==", true));

  state.unsubEvents = firestoreLib.onSnapshot(
    memberQuery,
    (snap) => {
      state.memberEvents = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      syncEventLists();
    },
    () => showToast("Não consegui carregar eventos")
  );

  if (!isSystemAdmin()) {
    state.unsubAdminEvents = firestoreLib.onSnapshot(
      firestoreLib.query(eventsRef, firestoreLib.where("admins", "array-contains", email())),
      (snap) => {
        state.adminEvents = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        syncEventLists();
      },
      () => showToast("Não consegui carregar eventos ADM")
    );

    state.unsubModeratorEvents = firestoreLib.onSnapshot(
      firestoreLib.query(eventsRef, firestoreLib.where("moderators", "array-contains", email())),
      (snap) => {
        state.moderatorEvents = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        syncEventLists();
      },
      () => showToast("Não consegui carregar eventos de moderador")
    );
  } else {
    state.adminEvents = [];
    state.moderatorEvents = [];
  }

  state.unsubPublicEvents = firestoreLib.onSnapshot(
    publicQuery,
    (snap) => {
      state.publicEvents = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      syncEventLists();
    },
    () => showToast("Não consegui carregar eventos publicos")
  );
}

function syncEventLists() {
  const map = new Map();
  [...state.publicEvents, ...state.memberEvents, ...state.adminEvents, ...state.moderatorEvents].forEach((event) => {
    map.set(event.id, { ...map.get(event.id), ...event });
  });
  state.events = Array.from(map.values()).sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  if (state.currentEventId && !currentEvent()) {
    state.currentEventId = "";
    localStorage.removeItem("nexo-current-event");
    state.guests = [];
    stopGuestSync();
  }
  const operable = state.events.filter((event) => canOperateFor(event));
  if (state.currentEventId && currentEvent() && !canOperate() && operable.length) {
    selectEvent(operable[0].id);
    return;
  }
  if (!state.currentEventId && operable.length === 1) {
    selectEvent(operable[0].id);
    return;
  }
  if (!state.currentEventId && operable.length && !state.events.some((event) => !canOperateFor(event) && event.publicRegistration)) {
    selectEvent(operable[0].id);
    return;
  }
  if (state.currentEventId && currentEvent() && canOperate() && !state.unsubGuests) {
    startGuestSync();
    return;
  }
  render();
}

function startGuestSync() {
  if (!state.firebaseReady || !state.currentEventId || !canOperate()) return;
  stopGuestSync();
  const { firestoreLib, db } = state.services;
  state.unsubGuests = firestoreLib.onSnapshot(
    firestoreLib.collection(db, "eventos", state.currentEventId, "convidados"),
    (snap) => {
      state.guests = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      saveLocal();
      render();
    },
    () => showToast("Não consegui sincronizar convidados")
  );
}

function selectEvent(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  if (event && !canOperateFor(event) && event.publicRegistration) {
    state.publicMode = true;
    state.publicEvent = event;
    state.publicInviteEventId = event.id;
    renderPublicInvite();
    return;
  }
  state.currentEventId = eventId;
  localStorage.setItem("nexo-current-event", eventId);
  state.query = "";
  state.listMode = "active";
  els.searchInput.value = "";
  state.guests = [];
  loadLocal();
  if (state.firebaseReady) startGuestSync();
  render();
}

async function createEvent(name, date, logoUrl, description = "", route = "", forcedId = "", options = {}) {
  if (!state.user && state.firebaseReady) {
    signInWithGoogle();
    return;
  }

  const id = forcedId || `${slug(name)}-${Date.now().toString(36)}`;
  const ownerEmail = email() || "local";
  const event = {
    id,
    name: String(name || "").trim(),
    date: date || "",
    logoUrl: String(logoUrl || "").trim(),
    description: String(description || "").trim(),
    route: String(route || "").trim(),
    admins: [ownerEmail],
    moderators: [],
    members: [ownerEmail],
    createdBy: ownerEmail,
    createdAt: new Date().toISOString(),
    expectedAudience: Number(options.expectedAudience || 0),
    suggestedPlan: planForAudience(options.expectedAudience).name,
    publicRegistration: false,
    publicFormFields: options.publicFormFields || defaultPublicFormFields(),
    checkinProof: {
      selfie: Boolean(options.proofSelfie),
      location: options.proofLocation !== false,
      frequency: options.proofFrequency || "entry",
      retentionDays: Number(options.proofRetentionDays || 30),
    },
  };

  state.events.push(event);
  saveLocal();

  if (state.firebaseReady) {
    const { firestoreLib, db } = state.services;
    await firestoreLib.setDoc(firestoreLib.doc(db, "eventos", id), event);
  }

  selectEvent(id);
  showToast("Evento criado");
}

async function persistEvent(event) {
  saveLocal();
  if (!state.firebaseReady || !event?.id) return;
  const { firestoreLib, db } = state.services;
  await firestoreLib.setDoc(firestoreLib.doc(db, "eventos", event.id), event, { merge: true });
}

function publicLinkFor(eventId = state.currentEventId) {
  const url = new URL(publicAppUrl);
  const event = state.events.find((item) => item.id === eventId) || currentEvent();
  url.searchParams.set("evento", eventId);
  url.searchParams.set("convite", "1");
  if (event?.name) url.searchParams.set("nome", event.name);
  if (event?.date) url.searchParams.set("data", formatEventDate(event.date));
  if (event?.description) url.searchParams.set("descricao", event.description);
  if (event?.logoUrl) url.searchParams.set("logo", event.logoUrl);
  return url.toString();
}

function updateShareMeta(event) {
  if (!event) return;
  const title = event.date ? `${event.name} - ${formatEventDate(event.date)}` : event.name;
  const description = event.description || [event.name, formatEventDate(event.date)].filter(Boolean).join(" - ");
  const logo = event.logoUrl || "";
  const setMeta = (selector, attr, value) => {
    const tag = document.querySelector(selector);
    if (tag && value) tag.setAttribute(attr, value);
  };
  document.title = title || "Convite NEXO Credencial";
  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[property="og:title"]', "content", document.title);
  setMeta('meta[property="og:description"]', "content", description);
  if (logo) {
    setMeta('meta[property="og:image"]', "content", logo);
    document.querySelector('link[rel="icon"]')?.setAttribute("href", logo);
    document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute("href", logo);
  }
}

function updatePhonePreview() {
  if (!els.publicPhoneInput || !els.publicPhonePreview) return;
  const phone = normalizePhone(els.publicPhoneInput.value);
  if (els.publicPhoneInput.value !== phone) {
    els.publicPhoneInput.value = phone;
  }
  els.publicPhoneInput.setCustomValidity(phone.length === 0 || phone.length === 11
    ? ""
    : "Digite 11 numeros, sem ponto, traco ou espaco.");
  els.publicPhonePreview.querySelector("span").textContent = phone.slice(0, 3);
  els.publicPhonePreview.querySelector("strong").textContent = phone.slice(3);
}

function setWorkFields(scope, enabled) {
  const input = scope === "register" ? els.registerWorkInput : els.publicWorkInput;
  const fields = scope === "register" ? els.registerWorkFields : els.publicWorkFields;
  if (input) input.checked = Boolean(enabled);
  if (fields) fields.hidden = !enabled;
}

function defaultPublicFormFields() {
  return formFieldDefinitions.reduce((fields, field) => {
    fields[field.key] = field.base;
    return fields;
  }, {});
}

function planForAudience(value) {
  const audience = Number(value || 0);
  if (!audience) {
    return {
      name: "",
      text: "Informe o público estimado para ver a faixa sugerida.",
    };
  }
  if (audience <= 100) return { name: "Gratuito", text: "Faixa sugerida: Gratuito. Até 100 pessoas, ideal para testar e validar eventos pequenos." };
  if (audience <= 500) return { name: "Básico", text: "Faixa sugerida: Básico. De 101 a 500 pessoas, com campos personalizados e exportação simples." };
  if (audience <= 2000) return { name: "Pro", text: "Faixa sugerida: Pro. De 501 a 2.000 pessoas, com geolocalização, selfie de entrada e relatórios." };
  if (audience <= 5000) return { name: "Premium", text: "Faixa sugerida: Premium. De 2.001 a 5.000 pessoas, com prova recorrente e relatórios avançados." };
  return { name: "Master", text: "Faixa sugerida: Master. Público ilimitado, acesso total e operação empresarial." };
}

function renderPlanSuggestion() {
  if (!els.eventPlanSuggestion) return;
  els.eventPlanSuggestion.textContent = planForAudience(els.eventAudienceInput?.value).text;
}

function publicFormFieldsFor(event = state.publicEvent || currentEvent()) {
  return { ...defaultPublicFormFields(), ...(event?.publicFormFields || {}) };
}

function isFieldVisible(mode) {
  return mode === "required" || mode === "optional";
}

function updateRequiredMark(container, required) {
  const span = container?.querySelector("span");
  if (!span) return;
  span.querySelector(".required-mark")?.remove();
  span.querySelector(".optional-mark")?.remove();
  const mark = document.createElement(required ? "b" : "em");
  mark.className = required ? "required-mark" : "optional-mark";
  mark.textContent = required ? "*" : "(opcional)";
  span.append(" ", mark);
}

function applyPublicFormFields(event = state.publicEvent) {
  if (!els.publicSignupForm) return;
  const fields = publicFormFieldsFor(event);
  formFieldDefinitions.forEach((field) => {
    const container = els.publicSignupForm.querySelector(`[data-public-field="${field.key}"]`);
    if (!container) return;
    const mode = fields[field.key] || field.base;
    const visible = isFieldVisible(mode);
    container.hidden = !visible;
    const input = container.querySelector("input, select, textarea");
    if (input && input.type !== "checkbox") input.required = mode === "required";
    if (field.key === "workMode" && els.publicWorkFields) {
      els.publicWorkFields.hidden = !visible || !els.publicWorkInput.checked;
    }
    updateRequiredMark(container, mode === "required");
  });
}

function renderFormFieldSettings(container = els.formFieldSettings, fields = publicFormFieldsFor(currentEvent())) {
  if (!container) return;
  container.replaceChildren(
    ...formFieldDefinitions.map((field) => {
      const row = document.createElement("label");
      row.className = "form-field-row";
      const title = document.createElement("strong");
      title.textContent = field.label;
      const select = document.createElement("select");
      select.dataset.formField = field.key;
      [
        ["hidden", "Não aparece"],
        ["optional", "Opcional"],
        ["required", "Obrigatório"],
      ].forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        select.append(option);
      });
      select.value = fields[field.key] || field.base;
      row.append(title, select);
      return row;
    })
  );
}

function readFormFieldSettings(container = els.formFieldSettings) {
  const fields = defaultPublicFormFields();
  container?.querySelectorAll("[data-form-field]").forEach((select) => {
    const key = select.dataset.formField;
    fields[key] = ["hidden", "optional", "required"].includes(select.value) ? select.value : fields[key];
  });
  fields.name = "required";
  fields.phone = "required";
  return fields;
}

function publicExtraFieldsFromForm(data) {
  const fields = publicFormFieldsFor();
  const extras = {};
  ["rg", "cpf", "address", "enrollment"].forEach((key) => {
    if (isFieldVisible(fields[key])) extras[key] = String(data.get(key) || "").trim();
  });
  return extras;
}

async function uploadEventLogoFile(file, eventId = state.currentEventId || "novo-evento") {
  if (!file) return "";
  if (!state.firebaseReady || !state.services?.storageLib) {
    showToast("Upload indisponível neste ambiente.");
    return "";
  }
  if (!file.type.startsWith("image/")) {
    showToast("Escolha uma imagem.");
    return "";
  }
  const { storageLib, storage } = state.services;
  const safeName = `${Date.now()}-${slug(file.name || "logo")}`;
  const ref = storageLib.ref(storage, `eventos/${eventId}/logos/${safeName}`);
  try {
    await storageLib.uploadBytes(ref, file, { contentType: file.type });
    return storageLib.getDownloadURL(ref);
  } catch (error) {
    showToast("Não consegui subir a imagem. Use o link da logo por enquanto.");
    return "";
  }
}

function renderInviteSettings() {
  const event = currentEvent();
  if (!event) return;
  els.publicRegistrationInput.checked = Boolean(event.publicRegistration);
  els.publicLinkInput.value = publicLinkFor(event.id);
  renderFormFieldSettings();
}

async function saveInviteSettings() {
  if (!canManage()) return showToast("Somente ADM do evento");
  const event = currentEvent();
  if (!event) return;
  event.publicRegistration = els.publicRegistrationInput.checked;
  event.publicFormFields = readFormFieldSettings();
  await persistEvent(event);
  render();
  showToast("Convite público atualizado");
}

async function createPublicGuest(form) {
  if (!state.publicEvent?.publicRegistration) {
    renderPublicInvite("Pré-cadastro fechado para este evento.");
    return;
  }
  const data = new FormData(form);
  const work = workerDetailsFromForm(data);
  const fields = publicFormFieldsFor();
  if (fields.location === "required" && !state.publicFormLocation) {
    state.publicFormLocation = await requestLocation("pre-cadastro-obrigatorio");
    if (!state.publicFormLocation) {
      renderPublicInvite("Marque a localização para concluir o pré-cadastro.");
      return;
    }
  }
  const publicAccessToken = randomToken();
  const guest = {
    id: "",
    name: String(data.get("name") || "").trim(),
    phone: normalizePhone(data.get("phone")),
    workplace: String(data.get("workplace") || "").trim(),
    email: String(data.get("email") || "").trim(),
    role: work.workRole,
    workMode: work.workMode,
    workRole: work.workRole,
    workTeam: work.workTeam,
    extras: publicExtraFieldsFromForm(data),
    raw: {},
    source: "link publico",
    publicAccessToken,
    registeredByEmail: "",
    registeredByName: "",
    preRegistered: true,
    checkedIn: false,
    checkedAt: "",
    checkedByEmail: "",
    checkedByName: "",
    deleted: false,
    deletedAt: "",
    createdAt: new Date().toISOString(),
  };
  if (!guest.name) return;
  if (guest.phone.length !== 11) {
    els.publicPhoneInput?.setCustomValidity("Digite 11 numeros, sem ponto, traco ou espaco.");
    els.publicPhoneInput?.reportValidity();
    return;
  }
  els.publicPhoneInput?.setCustomValidity("");
  if (guest.workMode) {
    rememberGuestLocation(guest, await requestLocation("pre-cadastro"));
  }
  if (state.publicFormLocation) {
    rememberGuestLocation(guest, state.publicFormLocation);
  }
  guest.id = makeGuestId(guest);

  const { firestoreLib, db } = state.services;
  await firestoreLib.setDoc(
    firestoreLib.doc(db, "eventos", state.publicEvent.id, "convidados", guest.id),
    guest,
    { merge: true }
  );
  if (guest.workMode) {
    localStorage.setItem("nexo-worker-location-session", JSON.stringify({
      eventId: state.publicEvent.id,
      guestId: guest.id,
      token: publicAccessToken,
    }));
    startPublicWorkerLocationWatch();
  }
  form.reset();
  state.publicFormLocation = null;
  setWorkFields("public", false);
  updatePhonePreview();
  renderPublicInvite("Pré-cadastro recebido.");
}

async function updatePublicWorkerLocation(location) {
  if (!location || !state.firebaseReady) return;
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("nexo-worker-location-session") || "null");
  } catch (error) {
    session = null;
  }
  if (!session?.eventId || !session?.guestId || !session?.token) return;
  const { firestoreLib, db } = state.services;
  await firestoreLib.setDoc(
    firestoreLib.doc(db, "eventos", session.eventId, "convidados", session.guestId),
    {
      publicAccessToken: session.token,
      latestLocation: location,
      locationPingAt: location.at,
    },
    { merge: true }
  ).catch(() => {});
}

function startPublicWorkerLocationWatch() {
  if (!state.publicMode || !navigator.geolocation || state.publicLocationWatchId) return;
  state.publicLocationWatchId = navigator.geolocation.watchPosition(
    (position) => updatePublicWorkerLocation(locationFromPosition(position, "app-aberto")),
    () => {},
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 45000 }
  );
}

async function addModerator(emailValue) {
  if (!canManage()) return showToast("Somente ADM do evento");
  const moderator = normalizeGmail(emailValue);
  if (!moderator.endsWith("@gmail.com")) return showToast("Use um Gmail válido");
  const event = currentEvent();
  event.moderators = Array.from(new Set([...(event.moderators || []), moderator]));
  event.admins = (event.admins || []).map(normalizeGmail);
  event.members = Array.from(new Set([...(event.members || []), ...event.admins, ...event.moderators].map(normalizeGmail)));
  await persistEvent(event);
  renderModerators();
  render();
  showToast("Moderador adicionado");
}

async function removeModerator(emailValue) {
  if (!canManage()) return;
  const event = currentEvent();
  const target = normalizeGmail(emailValue);
  event.moderators = (event.moderators || []).filter((item) => normalize(item) !== target);
  event.members = Array.from(new Set([...(event.admins || []), ...event.moderators].map(normalizeGmail)));
  await persistEvent(event);
  renderModerators();
  render();
}

function makeGuestId(guest) {
  const base = `${slug(guest.name)}-${onlyDigits(guest.phone)}-${slug(guest.workplace)}`;
  return base || `convidado-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
}

async function persistGuest(guest) {
  saveLocal();
  if (!state.firebaseReady || !state.currentEventId || !canOperate()) return;
  const { firestoreLib, db } = state.services;
  await firestoreLib.setDoc(
    firestoreLib.doc(db, "eventos", state.currentEventId, "convidados", guest.id),
    guest,
    { merge: true }
  );
}

async function upsertGuest(guest) {
  const existing = state.guests.find((item) => item.id === guest.id);
  if (existing) {
    Object.assign(existing, guest, {
      checkedIn: existing.checkedIn || guest.checkedIn,
      checkedAt: existing.checkedAt || guest.checkedAt,
      checkedByEmail: existing.checkedByEmail || guest.checkedByEmail || "",
      checkedByName: existing.checkedByName || guest.checkedByName || "",
    });
    guest = existing;
  } else {
    state.guests.push(guest);
  }
  render();
  await persistGuest(guest);
}

async function checkInGuest(id) {
  if (!canOperate()) return showToast("Escolha um evento permitido");
  const guest = state.guests.find((item) => item.id === id);
  if (!guest) return;
  const before = { ...guest };
  guest.checkedIn = true;
  guest.deleted = false;
  guest.deletedAt = "";
  guest.checkedAt = new Date().toISOString();
  guest.checkedByEmail = email();
  guest.checkedByName = firstName(state.user);
  if (guest.workMode) {
    rememberGuestLocation(guest, await requestLocation("check-in"));
  }
  render();
  await persistGuest(guest);
  showToast("Convidado confirmado", async () => restoreGuest(before));
}

async function markGuestPending(id) {
  if (!canOperate()) return showToast("Escolha um evento permitido");
  const guest = state.guests.find((item) => item.id === id);
  if (!guest) return;
  if (!guest.checkedIn && !guest.deleted) return showToast("Convidado ja esta pendente");
  const before = { ...guest };
  guest.checkedIn = false;
  guest.checkedAt = "";
  guest.checkedByEmail = "";
  guest.checkedByName = "";
  guest.deleted = false;
  guest.deletedAt = "";
  render();
  await persistGuest(guest);
  showToast("Convidado voltou para pendentes", async () => restoreGuest(before));
}

async function markGuestDeleted(id) {
  if (!canManage()) return showToast("Somente ADM do evento");
  const guest = state.guests.find((item) => item.id === id);
  if (!guest) return;
  const before = { ...guest };
  guest.deleted = true;
  guest.deletedAt = new Date().toISOString();
  render();
  await persistGuest(guest);
  showToast("Convidado arquivado", async () => restoreGuest(before));
}

async function restoreGuest(snapshot) {
  const index = state.guests.findIndex((guest) => guest.id === snapshot.id);
  if (index >= 0) {
    state.guests[index] = snapshot;
  } else {
    state.guests.push(snapshot);
  }
  render();
  await persistGuest(snapshot);
  showToast("Ação desfeita");
}

function parseDelimited(text) {
  const clean = String(text || "").trim();
  if (!clean) return [];
  return clean.includes("\t") ? parseTsv(clean) : parseCsv(clean);
}

function parseTsv(text) {
  const rows = text.split(/\r?\n/).filter(Boolean).map((line) => line.split("\t"));
  return rowsToObjects(rows);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quote = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quote && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quote = !quote;
    } else if (char === "," && !quote) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quote) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rowsToObjects(rows);
}

function rowsToObjects(rows) {
  const cleanRows = rows.filter((row) => row.some((cell) => String(cell).trim()));
  const headers = (cleanRows.shift() || []).map((header) => String(header).trim());
  return cleanRows.map((values) => {
    const row = {};
    headers.forEach((header, index) => {
      row[header || `campo_${index + 1}`] = values[index] || "";
    });
    return row;
  });
}

function findEntry(row, options) {
  const entries = Object.entries(row);
  for (const wanted of options) {
    const match = entries.find(([key]) => normalize(key).includes(wanted));
    if (match) return { key: match[0], value: match[1] };
  }
  return { key: "", value: "" };
}

function guestFromRow(row, source) {
  const name = findEntry(row, ["nome completo", "nome", "name", "participante", "convidado"]);
  const phone = findEntry(row, ["telefone", "celular", "whatsapp", "fone", "phone"]);
  const workplace = findEntry(row, ["local que trabalha", "trabalho", "local", "orgao", "empresa", "unidade", "setor"]);
  const emailField = findEntry(row, ["e-mail", "email"]);
  const role = findEntry(row, ["cargo", "funcao", "função"]);
  const workModeField = findEntry(row, ["a trabalho", "trabalho no evento", "staff", "servico"]);
  const teamField = findEntry(row, ["equipe", "time"]);
  const timestamp = findEntry(row, ["carimbo", "timestamp", "data", "hora"]);
  if (!String(name.value || phone.value).trim()) return null;

  const used = new Set([name.key, phone.key, workplace.key, emailField.key, role.key, workModeField.key, teamField.key, timestamp.key].filter(Boolean));
  const extras = {};
  Object.entries(row).forEach(([key, value]) => {
    if (!used.has(key) && String(value || "").trim()) extras[key] = value;
  });

  const guest = {
    id: "",
    name: String(name.value || "Sem nome").trim(),
    phone: String(phone.value || "").trim(),
    workplace: String(workplace.value || "").trim(),
    email: String(emailField.value || "").trim(),
    role: String(role.value || "").trim(),
    workMode: ["sim", "s", "yes", "staff", "trabalho", "servico"].includes(normalize(workModeField.value)),
    workRole: String(role.value || "").trim(),
    workTeam: String(teamField.value || "").trim(),
    extras,
    raw: row,
    source,
    registeredByEmail: source === "forms" ? email() : "",
    registeredByName: source === "forms" ? firstName(state.user) : "",
    checkedIn: false,
    checkedAt: "",
    checkedByEmail: "",
    checkedByName: "",
    deleted: false,
    deletedAt: "",
    createdAt: timestamp.value ? String(timestamp.value).trim() : new Date().toISOString(),
  };
  guest.id = makeGuestId(guest);
  return guest;
}

async function importText(text, source) {
  if (!canManage()) return showToast("Importar é exclusivo do ADM do evento");
  const guests = parseDelimited(text).map((row) => guestFromRow(row, source)).filter(Boolean);
  if (!guests.length) return showToast("Não encontrei nome ou telefone");
  await Promise.all(guests.map(upsertGuest));
  showToast(`${guests.length} cadastro(s) importado(s)`);
}

function toCsvUrl(value) {
  const url = value.trim();
  const match = url.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/);
  if (!match) return url;
  const gidMatch = url.match(/[?&#]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

function filteredGuests() {
  if (!canOperate()) return [];
  const query = normalize(state.query);
  const digits = onlyDigits(state.query);
  const hasSearch = Boolean(query || digits);
  const showHistory = state.listMode === "history";
  const moderatorSearchReady = Math.max(query.length, digits.length) >= 3;
  if (!canManage() && !showHistory && !moderatorSearchReady) return [];
  const guestsByList = state.guests.filter((guest) => {
    const isHistory = Boolean(guest.checkedIn || guest.deleted);
    return showHistory ? isHistory : !isHistory;
  });
  if (!hasSearch) return guestsByList;
  return guestsByList
    .filter((guest) => {
      const haystack = normalize([guest.name, guest.phone, guest.workplace, guest.email, guest.role].join(" "));
      const phone = onlyDigits(guest.phone);
      return normalize(guest.name).startsWith(query) || haystack.includes(query) || (digits && phone.includes(digits));
    })
    .sort((a, b) => {
      const aStarts = normalize(a.name).startsWith(query);
      const bStarts = normalize(b.name).startsWith(query);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return Number(a.deleted) - Number(b.deleted)
        || Number(a.checkedIn) - Number(b.checkedIn)
        || a.name.localeCompare(b.name, "pt-BR");
    });
}

function guestMeta(guest) {
  const work = guest.workMode
    ? ["Trabalho", guest.workRole, guest.workTeam].filter(Boolean).join(" | ")
    : "";
  const location = guest.latestLocation
    ? `Loc: ${formatDateTime(guest.latestLocation.at)}`
    : "";
  const dates = [
    guest.createdAt ? `Cad: ${formatDateTime(guest.createdAt)}` : "",
    guest.checkedAt ? `Check-in: ${formatDateTime(guest.checkedAt)}` : "",
    location,
    guest.deletedAt ? `Arquivado: ${formatDateTime(guest.deletedAt)}` : "",
  ].filter(Boolean);
  return [
    [guest.phone, guest.workplace, guest.role].filter(Boolean).join(" | ") || "Sem telefone",
    work,
    ...dates,
  ].filter(Boolean).join(" | ");
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventDate(value) {
  if (!value) return "";
  const isoMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("pt-BR").replace(/\//g, ".");
}

function bindSwipe(card, guest) {
  const content = card.querySelector(".guest-content");
  let startX = 0;
  let currentX = 0;
  let dragging = false;
  let moved = false;
  const actionThreshold = 118;
  const tapTolerance = 10;
  card.addEventListener("pointerdown", (event) => {
    dragging = true;
    moved = false;
    startX = event.clientX;
    currentX = 0;
    content.style.transition = "none";
    card.setPointerCapture(event.pointerId);
  });
  card.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    currentX = Math.max(-130, Math.min(130, event.clientX - startX));
    if (Math.abs(currentX) > tapTolerance) moved = true;
    content.style.transform = `translateX(${currentX}px)`;
  });
  card.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    content.style.transition = "";
    content.style.transform = "";
    card.dataset.dragged = moved ? "true" : "false";
    window.setTimeout(() => {
      card.dataset.dragged = "false";
    }, 0);

    if (currentX < -actionThreshold) return checkInGuest(guest.id);
    if (currentX > actionThreshold) return markGuestPending(guest.id);
  });
}

function renderGuest(guest) {
  const node = els.guestTemplate.content.firstElementChild.cloneNode(true);
  node.classList.toggle("present", guest.checkedIn);
  node.classList.toggle("deleted", Boolean(guest.deleted));
  node.classList.toggle("worker", Boolean(guest.workMode));
  node.querySelector("h3").textContent = guest.name;
  node.querySelector("p").textContent = guestMeta(guest);
  const statusLabel = node.querySelector("span");
  if (guest.deleted) {
    statusLabel.textContent = "Arquivado";
  } else if (guest.checkedIn) {
    statusLabel.textContent = guest.workMode ? "Trabalho" : "Presente";
  } else {
    statusLabel.textContent = guest.workMode ? "A trabalho" : "Pendente";
  }
  node.querySelector("span").textContent = guest.deleted ? "❌ Arquivado" : guest.checkedIn ? "✅ Presente" : "⚠️ Pendente";
  if (guest.deleted) {
    statusLabel.textContent = "Arquivado";
  } else if (guest.checkedIn) {
    statusLabel.textContent = guest.workMode ? "Trabalho" : "Presente";
  } else {
    statusLabel.textContent = guest.workMode ? "A trabalho" : "Pendente";
  }
  const deleteButton = node.querySelector(".guest-delete-button");
  deleteButton.hidden = !canManage();
  deleteButton.addEventListener("pointerdown", (event) => event.stopPropagation());
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    markGuestDeleted(guest.id);
  });
  node.addEventListener("click", () => {
    if (node.dataset.dragged === "true") return;
    openWorkerDialog(guest.id);
  });
  bindSwipe(node, guest);
  return node;
}

function proofSettingsForCurrentEvent() {
  return {
    selfie: false,
    location: true,
    frequency: "entry",
    retentionDays: 30,
    ...(currentEvent()?.checkinProof || {}),
  };
}

function activeWorker() {
  return state.guests.find((guest) => guest.id === activeWorkerId) || null;
}

function renderWorkerDialog() {
  const guest = activeWorker();
  if (!guest || !els.workerDialog) return;
  const proof = proofSettingsForCurrentEvent();
  els.workerDialogTitle.textContent = guest.workMode ? "CHECK-IN de trabalho" : "Detalhes do CHECK-IN";
  els.workerName.textContent = guest.name;
  els.workerMeta.textContent = guestMeta(guest);
  els.workerCheckinButton.textContent = guest.checkedIn ? "Atualizar check-in" : "Fazer check-in";
  els.workerSelfieButton.disabled = !proof.selfie;
  els.workerSelfieButton.textContent = proof.selfie ? "Enviar selfie compactada" : "Selfie desativada neste evento";
  els.workerProofStatus.textContent = [
    guest.checkedAt ? `Último check-in: ${formatDateTime(guest.checkedAt)}` : "Ainda sem check-in confirmado.",
    proof.location ? "Localização ativada." : "Localização desativada.",
    proof.selfie ? `Selfie compactada ativa. Retenção sugerida: ${proof.retentionDays} dias.` : "Selfie não será solicitada.",
  ].join(" ");
  const selfie = guest.proofs?.selfieThumb || "";
  els.workerSelfiePreview.textContent = selfie ? "" : "SELFIE";
  els.workerSelfiePreview.style.backgroundImage = selfie ? `url("${selfie}")` : "";
  const history = Array.isArray(guest.locationHistory) ? [...guest.locationHistory].reverse() : [];
  els.workerLocationHistory.replaceChildren(
    ...(history.length ? history.map((location) => {
      const link = document.createElement("a");
      link.href = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `${formatDateTime(location.at)} | ${location.lat}, ${location.lng} | precisão ${location.accuracy || 0}m`;
      return link;
    }) : [Object.assign(document.createElement("span"), { textContent: "Sem localização registrada ainda." })])
  );
}

function openWorkerDialog(guestId) {
  activeWorkerId = guestId;
  renderWorkerDialog();
  els.workerDialog?.showModal();
}

async function markActiveWorkerLocation(reason = "check-in-manual") {
  const guest = activeWorker();
  if (!guest) return;
  const location = await requestLocation(reason);
  if (!location) return showToast("Não consegui acessar a localização.");
  rememberGuestLocation(guest, location);
  await upsertGuest(guest);
  renderWorkerDialog();
  render();
  showToast("Localização registrada");
}

function compactSelfie(file) {
  return new Promise((resolve) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      image.onload = () => {
        const size = 420;
        const canvas = document.createElement("canvas");
        const scale = Math.min(size / image.width, size / image.height, 1);
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.68));
      };
      image.onerror = () => resolve("");
      image.src = reader.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

async function saveActiveWorkerSelfie(file) {
  const guest = activeWorker();
  if (!guest || !file) return;
  const proof = proofSettingsForCurrentEvent();
  if (!proof.selfie) return showToast("Selfie está desativada neste evento.");
  const selfieThumb = await compactSelfie(file);
  if (!selfieThumb) return showToast("Não consegui preparar a selfie.");
  guest.proofs = {
    ...(guest.proofs || {}),
    selfieThumb,
    selfieAt: new Date().toISOString(),
    selfieByEmail: email(),
  };
  await upsertGuest(guest);
  renderWorkerDialog();
  render();
  showToast("Selfie compactada registrada");
}

function updateReport() {
  const total = state.guests.length;
  const deleted = state.guests.filter((guest) => guest.deleted).length;
  els.totalCount.textContent = total;
  els.checkedCount.textContent = state.guests.filter((guest) => guest.checkedIn && !guest.deleted).length;
  els.pendingCount.textContent = state.guests.filter((guest) => !guest.checkedIn && !guest.deleted).length;
  els.walkinCount.textContent = state.guests.filter((guest) => guest.source === "portaria").length;
  if (els.workerCount) {
    els.workerCount.textContent = state.guests.filter((guest) => guest.workMode && !guest.deleted).length;
  }
  els.deletedCount.textContent = deleted;
  const counts = state.guests
    .filter((guest) => guest.source === "portaria" && guest.registeredByEmail)
    .reduce((acc, guest) => {
      acc[guest.registeredByEmail] = (acc[guest.registeredByEmail] || 0) + 1;
      return acc;
    }, {});
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  els.moderatorStats.hidden = rows.length === 0;
  const title = document.createElement("h3");
  title.textContent = "Cadastros por operador";
  els.moderatorStats.replaceChildren(
    title,
    ...rows.map(([mail, count]) => {
      const row = document.createElement("div");
      row.className = "moderator-stat-row";
      row.innerHTML = `<span>${mail}</span><strong>${count}</strong>`;
      return row;
    })
  );
}

function firstName(user) {
  const source = user?.displayName || user?.email || "";
  return source.split(" ")[0].split("@")[0] || "Perfil";
}

function renderUserBadge() {
  if (!state.user) {
    els.userBadge.hidden = false;
    els.userName.textContent = "Entrar";
    els.userInitial.textContent = "G";
    els.userBadge.classList.add("no-photo");
    els.userPhoto.removeAttribute("src");
    return;
  }
  const name = firstName(state.user);
  els.userBadge.hidden = false;
  els.userName.textContent = name;
  els.userInitial.textContent = name.charAt(0).toUpperCase();
  if (state.user.photoURL) {
    els.userBadge.classList.remove("no-photo");
    els.userPhoto.src = state.user.photoURL;
  } else {
    els.userBadge.classList.add("no-photo");
    els.userPhoto.removeAttribute("src");
  }
}

function renderEvents() {
  els.eventList.replaceChildren(
    ...state.events.map((event) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "event-row";
      const role = isEventAdminFor(event)
        ? "ADM"
        : isEventModeratorFor(event)
          ? "Moderador"
          : "Evento próximo";
      button.innerHTML = `<strong>${event.name}</strong><span>${event.date || "sem data"} | ${role}</span>`;
      button.addEventListener("click", () => {
        selectEvent(event.id);
        els.eventsDialog.close();
      });
      return button;
    })
  );
}

function isEventAdminFor(event) {
  return isSystemAdmin() || (event.admins || []).map(normalize).includes(email());
}

function isEventModeratorFor(event) {
  return (event.moderators || []).map(normalize).includes(email());
}

function canOperateFor(event) {
  return Boolean(event && (isEventAdminFor(event) || isEventModeratorFor(event)));
}

function renderModerators() {
  const event = currentEvent();
  const moderators = event?.moderators || [];
  els.moderatorList.replaceChildren(
    ...moderators.map((moderator) => {
      const row = document.createElement("div");
      row.className = "moderator-row";
      const span = document.createElement("span");
      span.textContent = moderator;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Remover";
      button.addEventListener("click", () => removeModerator(moderator));
      row.append(span, button);
      return row;
    })
  );
}

function renderAuth() {
  const loggedIn = Boolean(state.user);
  document.body.classList.toggle("auth-gate-open", !loggedIn && !state.publicMode);
  els.adminOnly.forEach((element) => {
    element.hidden = !loggedIn || !canManage();
  });
  els.reportButton.hidden = !loggedIn || !canManage();
  els.menuLoginButton.textContent = state.user ? "Trocar conta Google" : "Entrar com Google";
  els.logoutButton.hidden = !state.user;
  els.openEventsButton.hidden = !loggedIn;
  els.openCreateEventButton.hidden = !loggedIn;
  els.restrictedButton.hidden = !loggedIn || !canManage();
  els.sessionLabel.textContent = state.user ? state.user.email : "Acesso de portaria";
  if (els.planStatus) {
    const plan = currentEvent()?.suggestedPlan || "Gratuito";
    els.planStatus.textContent = `Plano ${plan}`;
  }
  els.menuButton.hidden = true;
  els.loginGate.hidden = loggedIn;
  els.openRegisterButton.hidden = !loggedIn;
  renderUserBadge();
}

function renderEventName() {
  const event = currentEvent();
  els.currentEventButton.hidden = !event;
  els.currentEventButton.textContent = event ? event.name : "";
  els.eventWatermark.classList.toggle("visible", Boolean(event?.logoUrl));
  els.eventWatermark.style.backgroundImage = event?.logoUrl ? `url("${event.logoUrl}")` : "";
  if (els.eventLogoInput) {
    els.eventLogoInput.value = event?.logoUrl || "";
  }
  if (els.eventDescriptionInput) {
    els.eventDescriptionInput.value = event?.description || "";
  }
  if (els.eventRouteInput) {
    els.eventRouteInput.value = event?.route || "";
  }
}

function render() {
  if (state.publicMode) {
    renderPublicInvite();
    return;
  }
  updateReport();
  renderAuth();
  renderEventName();
  renderEvents();
  els.listOneButton.classList.toggle("active", state.listMode === "active");
  els.listTwoButton.classList.toggle("active", state.listMode === "history");
  const guests = filteredGuests();
  els.guestList.replaceChildren(...guests.map(renderGuest));
  els.emptyState.hidden = guests.length > 0;
  els.emptyState.textContent = !state.user && state.firebaseReady
    ? "Faça login Google para começar"
    : !currentEvent()
      ? "Escolha um evento"
      : !canOperate()
        ? "Abra um evento permitido"
        : state.listMode === "history" && !state.guests.some((guest) => guest.checkedIn || guest.deleted)
          ? "CHECK-IN sem confirmados"
          : !canManage() && state.listMode !== "history" && Math.max(normalize(state.query).length, onlyDigits(state.query).length) < 3
            ? "Digite ao menos 3 caracteres para buscar"
            : state.query.trim()
              ? "Nenhum nome encontrado"
              : state.listMode === "history"
                ? "Confirmados aparecem aqui. Arraste para direita para voltar"
                : "Digite um nome para começar";
}

function renderPublicInvite(message = "") {
  document.body.classList.toggle("public-mode", state.publicMode);
  document.body.classList.remove("auth-gate-open");
  if (!state.publicMode) return;

  els.publicInvite.hidden = false;
  const event = state.publicEvent;
  updateShareMeta(event);
  els.inviteEventName.textContent = event?.name || "Convite";
  els.inviteEventDate.textContent = formatEventDate(event?.date);
  els.inviteEventDescription.textContent = event?.description || "";
  const route = String(event?.route || "").trim();
  els.inviteEventRoute.hidden = !route;
  els.inviteEventRoute.href = route.startsWith("http")
    ? route
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(route)}`;
  const registrationOpen = Boolean(event?.publicRegistration);
  els.openPublicSignupButton.hidden = !event;
  els.openPublicSignupButton.disabled = !registrationOpen;
  if (!registrationOpen) els.publicSignupForm.hidden = true;
  els.publicInviteMessage.textContent = message || (event?.publicRegistration ? "" : "Pré-cadastro fechado para este evento.");
  applyPublicFormFields(event);
  if (els.publicLocationStatus) {
    els.publicLocationStatus.textContent = state.publicFormLocation
      ? "Localização marcada."
      : "Use quando o evento exigir posição no mapa.";
  }

  const logoUrl = event?.logoUrl || "";
  els.inviteLogo.hidden = !logoUrl;
  els.inviteLogo.style.backgroundImage = logoUrl ? `url("${logoUrl}")` : "";
  els.eventWatermark.classList.toggle("visible", Boolean(logoUrl));
  els.eventWatermark.style.backgroundImage = logoUrl ? `url("${logoUrl}")` : "";
}

function exportCsv() {
  if (!canManage()) return showToast("Exportar é exclusivo do ADM do evento");
  const extraKeys = Array.from(new Set(state.guests.flatMap((guest) => Object.keys(guest.extras || {}))));
  const headers = [
    "nome", "telefone", "local_que_trabalha", "email", "cargo", "origem", "registrado_por",
    "pre_cadastro", "presente", "fez_checkin", "checkin_por_email", "checkin_por_nome", "checkin_horario_data",
    "a_trabalho", "funcao_trabalho", "equipe_trabalho", "ultima_latitude", "ultima_longitude", "ultima_localização_horario",
    "arquivado", "horario_cadastro", "horario_presenca", "horario_arquivado", ...extraKeys,
  ];
  const lines = [
    headers.join(","),
    ...state.guests.map((guest) => [
      guest.name,
      guest.phone,
      guest.workplace,
      guest.email,
      guest.role,
      guest.source,
      guest.registeredByEmail,
      guest.preRegistered ? "sim" : "não",
      guest.checkedIn ? "sim" : "não",
      guest.checkedIn ? "sim" : "não",
      guest.checkedByEmail,
      guest.checkedByName,
      guest.checkedAt,
      guest.workMode ? "sim" : "não",
      guest.workRole,
      guest.workTeam,
      guest.latestLocation?.lat,
      guest.latestLocation?.lng,
      guest.latestLocation?.at,
      guest.deleted ? "sim" : "não",
      guest.createdAt,
      guest.checkedAt,
      guest.deletedAt,
      ...extraKeys.map((key) => guest.extras?.[key] || ""),
    ].map(csvEscape).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug(currentEvent()?.name || "nexo-credencial")}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value || "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function openLogin() {
  clearLoginError();
  els.restrictedDialog.showModal();
}

async function signInWithGoogle() {
  clearLoginError();
  if (!state.firebaseReady) {
    showToast("Firebase não iniciou. Abra por http://localhost ou online.");
    return;
  }
  const { authLib, auth } = state.services;
  const provider = new authLib.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await authLib.signInWithPopup(auth, provider);
    if (els.restrictedDialog.open) els.restrictedDialog.close();
  } catch (error) {
    showToast("Login Google cancelado ou bloqueado");
  }
}

els.menuButton.addEventListener("click", () => {
  els.menuPanel.hidden = false;
});

els.userBadge.addEventListener("click", () => {
  els.menuPanel.hidden = false;
});

els.menuPanel.addEventListener("click", (event) => {
  if (event.target === els.menuPanel) {
    els.menuPanel.hidden = true;
  }
});

els.closeMenuButton.addEventListener("click", () => {
  els.menuPanel.hidden = true;
});

els.gateLoginButton.addEventListener("click", () => {
  signInWithGoogle();
});

els.currentEventButton.addEventListener("click", () => {
  renderEvents();
  els.eventsDialog.showModal();
});

els.restrictedButton.addEventListener("click", () => {
  if (!state.user && state.firebaseReady) return signInWithGoogle();
  if (canManage()) {
    updateReport();
    els.reportDialog.showModal();
    return;
  }
  renderEvents();
  els.eventsDialog.showModal();
});

els.menuLoginButton.addEventListener("click", () => {
  signInWithGoogle();
});

els.closeRestrictedButton.addEventListener("click", () => els.restrictedDialog.close());

els.googleLoginButton.addEventListener("click", async () => {
  await signInWithGoogle();
});

els.logoutButton.addEventListener("click", async () => {
  if (state.firebaseReady && state.services.auth.currentUser) {
    await state.services.authLib.signOut(state.services.auth);
  }
  state.user = null;
  state.currentEventId = "";
  state.events = [];
  state.memberEvents = [];
  state.adminEvents = [];
  state.moderatorEvents = [];
  state.publicEvents = [];
  state.guests = [];
  localStorage.removeItem("nexo-current-event");
  els.menuPanel.hidden = true;
  render();
});

els.openEventsButton.addEventListener("click", () => {
  if (!state.user && state.firebaseReady) return signInWithGoogle();
  renderEvents();
  els.eventsDialog.showModal();
});

els.closeEventsButton.addEventListener("click", () => els.eventsDialog.close());
els.createFromEventsButton.addEventListener("click", () => {
  renderFormFieldSettings(els.createFormFieldSettings, defaultPublicFormFields());
  renderPlanSuggestion();
  els.createEventDialog.showModal();
});
els.openCreateEventButton.addEventListener("click", () => {
  if (!state.user && state.firebaseReady) return signInWithGoogle();
  renderFormFieldSettings(els.createFormFieldSettings, defaultPublicFormFields());
  renderPlanSuggestion();
  els.createEventDialog.showModal();
});

els.createEventForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value !== "create") return;
  event.preventDefault();
  const data = new FormData(els.createEventForm);
  const name = String(data.get("name") || "").trim();
  if (!name) return;
  const logoFile = data.get("logoFile");
  const eventId = `${slug(name)}-${Date.now().toString(36)}`;
  const uploadedLogo = logoFile?.size ? await uploadEventLogoFile(logoFile, eventId) : "";
  await createEvent(name, data.get("date"), uploadedLogo || data.get("logoUrl"), data.get("description"), data.get("route"), eventId, {
    expectedAudience: data.get("expectedAudience"),
    publicFormFields: readFormFieldSettings(els.createFormFieldSettings),
    proofSelfie: data.get("proofSelfie") === "1",
    proofLocation: data.get("proofLocation") === "1",
    proofFrequency: data.get("proofFrequency"),
    proofRetentionDays: data.get("proofRetentionDays"),
  });
  els.createEventForm.reset();
  els.createEventDialog.close();
  els.eventsDialog.close();
});

els.eventAudienceInput?.addEventListener("input", renderPlanSuggestion);

els.openRegisterButton.addEventListener("click", () => {
  if (!state.user && state.firebaseReady) return signInWithGoogle();
  if (!currentEvent()) return showToast("Crie ou escolha um evento");
  if (!canOperate()) return showToast("Sem permissão neste evento");
  els.registerDialog.showModal();
});

let checkinVoiceRecognition = null;

function setCheckinVoiceUi(active) {
  els.voiceCheckinButton?.classList.toggle("listening", active);
  els.voiceCheckinHelper?.classList.toggle("active", active);
  if (els.voiceCheckinTitle) els.voiceCheckinTitle.textContent = active ? "Estou ouvindo..." : "Cadastro por voz";
  if (els.voiceCheckinText) els.voiceCheckinText.textContent = "Diga nome, celular e local de trabalho se tiver.";
}

function listenForCheckinVoice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    showToast("Seu navegador não liberou voz aqui. Use Chrome ou Edge.");
    return Promise.resolve("");
  }
  if (checkinVoiceRecognition) {
    checkinVoiceRecognition.abort();
    checkinVoiceRecognition = null;
  }
  return new Promise((resolve) => {
    let transcript = "";
    const recognition = new Recognition();
    checkinVoiceRecognition = recognition;
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setCheckinVoiceUi(true);
    recognition.onresult = (event) => {
      transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
    };
    recognition.onerror = () => {
      transcript = "";
    };
    recognition.onend = () => {
      setCheckinVoiceUi(false);
      checkinVoiceRecognition = null;
      resolve(transcript);
    };
    recognition.start();
  });
}

function parseCheckinVoice(transcript) {
  const text = String(transcript || "").trim();
  const phoneMatch = text.match(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\s?\d{4}[-\s]?\d{4}/);
  const phone = normalizePhone(phoneMatch ? phoneMatch[0] : "");
  const workplaceMatch = text.match(/\b(?:empresa|trabalha no|trabalha na|local)\s+([^,.;]+)$/i);
  const workplace = workplaceMatch ? workplaceMatch[1].trim() : "";
  let name = text
    .replace(phoneMatch?.[0] || "", " ")
    .replace(workplaceMatch?.[0] || "", " ")
    .replace(/\b(cadastrar|cadastre|convidado|convidada|nome|telefone|celular|whatsapp|zap|empresa|local)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  name = name.replace(/\b\w/g, (letter) => letter.toUpperCase());
  return { transcript: text, name, phone, workplace };
}

async function createVoiceGuest(parsed) {
  const guest = {
    id: "",
    name: parsed.name,
    phone: parsed.phone,
    workplace: parsed.workplace,
    email: "",
    role: "",
    workMode: false,
    workRole: "",
    workTeam: "",
    extras: {},
    raw: { voiceTranscript: parsed.transcript },
    source: "portaria",
    registeredByEmail: email(),
    registeredByName: firstName(state.user),
    checkedIn: !work.workMode,
    checkedAt: work.workMode ? "" : new Date().toISOString(),
    checkedByEmail: work.workMode ? "" : email(),
    checkedByName: work.workMode ? "" : firstName(state.user),
    deleted: false,
    deletedAt: "",
    createdAt: new Date().toISOString(),
  };
  guest.id = makeGuestId(guest);
  await upsertGuest(guest);
  state.query = guest.name;
  els.searchInput.value = guest.name;
  render();
}

function fillRegisterFormFromVoice(parsed) {
  els.registerForm.elements.name.value = parsed.name || "";
  els.registerForm.elements.phone.value = parsed.phone || "";
  els.registerForm.elements.workplace.value = parsed.workplace || "";
  els.registerDialog.showModal();
}

async function startCheckinVoiceCommand() {
  if (!state.user && state.firebaseReady) return signInWithGoogle();
  if (!currentEvent()) return showToast("Crie ou escolha um evento");
  if (!canOperate()) return showToast("Sem permissão neste evento");
  const transcript = await listenForCheckinVoice();
  if (!transcript) return showToast("Não consegui ouvir. Tente novamente.");
  const parsed = parseCheckinVoice(transcript);
  const complete = parsed.name && parsed.phone.length === 11;
  if (!complete) {
    fillRegisterFormFromVoice(parsed);
    showToast("Complete os dados que faltaram.");
    return;
  }
  const confirmed = window.confirm(`Ouvi: "${parsed.transcript}". Cadastrar ${parsed.name} e confirmar presença?`);
  if (!confirmed) {
    fillRegisterFormFromVoice(parsed);
    showToast("Revise antes de salvar.");
    return;
  }
  await createVoiceGuest(parsed);
  showToast("Convidado cadastrado por voz.");
}

els.registerForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value !== "save") return;
  event.preventDefault();
  const data = new FormData(els.registerForm);
  const work = workerDetailsFromForm(data);
  const guest = {
    id: "",
    name: String(data.get("name") || "").trim(),
    phone: normalizePhone(data.get("phone")),
    workplace: String(data.get("workplace") || "").trim(),
    email: "",
    role: work.workRole,
    workMode: work.workMode,
    workRole: work.workRole,
    workTeam: work.workTeam,
    extras: {},
    raw: {},
    source: "portaria",
    registeredByEmail: email(),
    registeredByName: firstName(state.user),
    checkedIn: true,
    checkedAt: new Date().toISOString(),
    checkedByEmail: email(),
    checkedByName: firstName(state.user),
    deleted: false,
    deletedAt: "",
    createdAt: new Date().toISOString(),
  };
  if (!guest.name) return;
  const phoneInput = els.registerForm.elements.phone;
  if (guest.phone.length !== 11) {
    phoneInput?.setCustomValidity("Digite 11 numeros, sem ponto, traco ou espaco.");
    phoneInput?.reportValidity();
    return;
  }
  phoneInput?.setCustomValidity("");
  if (guest.workMode) {
    rememberGuestLocation(guest, await requestLocation("portaria"));
  }
  guest.id = makeGuestId(guest);
  await upsertGuest(guest);
  state.query = guest.name;
  els.searchInput.value = guest.name;
  els.registerForm.reset();
  setWorkFields("register", false);
  els.registerDialog.close();
  render();
});

els.registerForm.elements.phone?.addEventListener("input", (event) => {
  const phone = normalizePhone(event.target.value);
  if (event.target.value !== phone) event.target.value = phone;
  event.target.setCustomValidity(phone.length === 0 || phone.length === 11
    ? ""
    : "Digite 11 numeros, sem ponto, traco ou espaco.");
});

els.voiceCheckinButton?.addEventListener("click", startCheckinVoiceCommand);

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

els.listOneButton.addEventListener("click", () => {
  state.listMode = "active";
  render();
});

els.listTwoButton.addEventListener("click", () => {
  state.listMode = "history";
  render();
});

els.reportButton.addEventListener("click", () => {
  if (!canManage()) return showToast("Relatório é exclusivo do ADM");
  updateReport();
  els.reportDialog.showModal();
});
els.closeReportButton.addEventListener("click", () => els.reportDialog.close());
els.exportButton.addEventListener("click", exportCsv);

els.openPlansButton?.addEventListener("click", () => {
  els.menuPanel.hidden = true;
  els.plansDialog?.showModal();
});
els.closePlansButton?.addEventListener("click", () => els.plansDialog.close());
els.plansDialog?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-plan]");
  if (!card) return;
  const url = new URL("pagamento.html", location.href);
  url.searchParams.set("plano", card.dataset.plan);
  const selectedEvent = currentEvent();
  if (selectedEvent?.id) url.searchParams.set("evento", selectedEvent.id);
  location.href = url.toString();
});
els.plansDialog?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-plan]");
  if (!card) return;
  event.preventDefault();
  card.click();
});

els.closeWorkerButton?.addEventListener("click", () => els.workerDialog.close());
els.workerCheckinButton?.addEventListener("click", async () => {
  const guest = activeWorker();
  if (!guest) return;
  await checkInGuest(guest.id);
  renderWorkerDialog();
});
els.workerLocationButton?.addEventListener("click", () => markActiveWorkerLocation("check-in-localizacao"));
els.workerSelfieButton?.addEventListener("click", () => els.workerSelfieInput?.click());
els.workerSelfieInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  await saveActiveWorkerSelfie(file);
});

els.openInviteButton.addEventListener("click", () => {
  if (!canManage()) return showToast("Somente ADM do evento");
  renderInviteSettings();
  els.inviteDialog.showModal();
});

els.closeInviteButton.addEventListener("click", () => els.inviteDialog.close());
els.savePublicInviteButton.addEventListener("click", saveInviteSettings);
els.copyPublicLinkButton.addEventListener("click", async () => {
  renderInviteSettings();
  await navigator.clipboard.writeText(els.publicLinkInput.value);
  showToast("Link copiado");
});

els.saveEventLogoButton.addEventListener("click", async () => {
  if (!canManage()) return showToast("Somente ADM do evento");
  const event = currentEvent();
  if (!event) return;
  const uploadedLogo = els.eventLogoFileInput?.files?.[0]
    ? await uploadEventLogoFile(els.eventLogoFileInput.files[0], event.id)
    : "";
  event.logoUrl = uploadedLogo || els.eventLogoInput.value.trim();
  event.description = els.eventDescriptionInput.value.trim();
  event.route = els.eventRouteInput.value.trim();
  if (els.eventLogoFileInput) els.eventLogoFileInput.value = "";
  await persistEvent(event);
  render();
  showToast("Dados do evento salvos");
});

els.openImportButton.addEventListener("click", () => {
  if (!canManage()) return showToast("Importar é exclusivo do ADM");
  els.importDialog.showModal();
});
els.closeImportButton.addEventListener("click", () => els.importDialog.close());

els.pasteImportButton.addEventListener("click", () => importText(els.pasteImportInput.value, "forms"));
els.csvFileInput.addEventListener("change", async (event) => {
  if (!canManage()) return;
  const file = event.target.files[0];
  if (!file) return;
  await importText(await file.text(), "forms");
  event.target.value = "";
});
els.loadUrlButton.addEventListener("click", async () => {
  if (!canManage()) return;
  const url = toCsvUrl(els.csvUrlInput.value);
  if (!url) return showToast("Cole a URL CSV");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha");
    await importText(await response.text(), "forms");
  } catch (error) {
    showToast("Não consegui carregar a URL");
  }
});

els.resetButton.addEventListener("click", () => {
  if (!canManage()) return;
  if (!window.confirm("Limpar convidados deste evento neste aparelho?")) return;
  state.guests = [];
  saveLocal();
  render();
});

els.openModeratorsButton.addEventListener("click", () => {
  if (!canManage()) return showToast("Somente ADM do evento");
  renderModerators();
  els.moderatorsDialog.showModal();
});
els.moderatorForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value !== "add") return;
  event.preventDefault();
  await addModerator(new FormData(els.moderatorForm).get("email"));
  els.moderatorForm.reset();
});

els.cancelDeleteButton.addEventListener("click", () => {
  state.pendingDeleteId = "";
  els.confirmDialog.close();
});
els.confirmDeleteButton.addEventListener("click", () => {
  if (state.pendingDeleteId) markGuestDeleted(state.pendingDeleteId);
  state.pendingDeleteId = "";
  els.confirmDialog.close();
});

els.undoButton.addEventListener("click", async () => {
  if (!lastUndo) return;
  const action = lastUndo;
  lastUndo = null;
  els.undoButton.hidden = true;
  await action();
});

els.publicSignupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  updatePhonePreview();
  try {
    await createPublicGuest(els.publicSignupForm);
  } catch (error) {
    renderPublicInvite("Não consegui enviar. Tente novamente.");
  }
});

els.publicPhoneInput?.addEventListener("input", updatePhonePreview);
els.publicLocationButton?.addEventListener("click", async () => {
  els.publicLocationStatus.textContent = "Buscando localização...";
  state.publicFormLocation = await requestLocation("pre-cadastro");
  els.publicLocationStatus.textContent = state.publicFormLocation
    ? "Localização marcada."
    : "Não consegui marcar. Confira a permissão de GPS.";
});
els.publicWorkInput?.addEventListener("change", (event) => {
  setWorkFields("public", event.target.checked);
  applyPublicFormFields(state.publicEvent);
});
els.registerWorkInput?.addEventListener("change", (event) => {
  setWorkFields("register", event.target.checked);
});

els.openPublicSignupButton.addEventListener("click", () => {
  els.publicSignupForm.hidden = false;
  els.openPublicSignupButton.hidden = true;
  els.publicInviteMessage.textContent = "";
});

loadLocal();
initFirebase().catch(() => showToast("Firebase não iniciou"));
updatePhonePreview();
startPublicWorkerLocationWatch();
render();
