(function () {
  "use strict";

  const STORAGE_KEY = "albumCopa2026WebLocal";
  const LOCAL_UPDATED_KEY = "albumCopa2026WebUpdatedAt";
  const CARD_UPDATED_KEY = "albumCopa2026WebCardUpdatedAt";
  const PROFILE_KEY = "albumCopa2026WebProfile";
  const LOCATION_STORAGE_KEY = "albumCopa2026WebApproxLocation";
  const THEME_KEY = "albumCopa2026WebMapTheme";
  const PWA_INSTALL_LAST_PROMPT_KEY = "albumCopa2026PwaInstallLastPrompt";
  const PWA_INSTALL_DONE_KEY = "albumCopa2026PwaInstalled";
  const PROFILE_VIEW_LOCAL_PREFIX = "albumCopa2026ProfileView";
  const PUBLIC_SITE_URL = "https://primusdf.com.br/card/";
  const GEO_SYNC_INTERVAL_MS = 10 * 60 * 1000;
  const ONLINE_NOW_WINDOW_MS = 15 * 60 * 1000;
  const PWA_INSTALL_REMINDER_INTERVAL_MS = 60 * 60 * 1000;
  const MESSAGE_COOLDOWN_MS = 10 * 60 * 1000;
  const MESSAGE_INBOX_LIMIT = 40;
  const POINT_PLAYER_LIMIT = 8;
  const POINT_PLAYER_RADIUS_M = 200;
  const APPROX_LOCATION_GRID = 0.002;
  const GUEST_ADD_LOGIN_THRESHOLD = 5;
  const COMMUNITY_MEETING_STORAGE_KEY = "albumCopa2026CommunityMeetingPoint10";
  const COMMUNITY_MEETING_DOC_ID = "cardCommunityMeetingPoint10";
  const COMMUNITY_MEETING_DURATION_MS = 9 * 60 * 60 * 1000;
  const OFFICIAL_BADGES_STORAGE_KEY = "albumCopa2026OfficialBadges";
  const CHEGUEI_BRASIL_BADGE_ID = "cheguei-brasil";
  const EVENT_JUNE_6_BADGE_ID = "evento-6-junho";
  const CHEGUEI_BRASIL_BADGE_IMAGE_URL = "https://i.ibb.co/HTdqKBr4/11-layout-primus-2.png";
  const EVENT_JUNE_6_BADGE_IMAGE_URL = "https://i.ibb.co/ccnXTMpT/madsfasfd-2.png";
  const CHEGUEI_BRASIL_END_AT = new Date("2026-07-31T23:59:59-03:00").getTime();
  const EVENT_JUNE_6_START_AT = new Date("2026-06-06T08:00:00-03:00").getTime();
  const EVENT_JUNE_6_END_AT = new Date("2026-06-06T17:00:00-03:00").getTime();
  const DEFAULT_COMMUNITY_MEETING_EVENT = {
    pointId: "ponto-10",
    title: "Proximo evento",
    place: "Estacionamento 10 do Parque da Cidade",
    schedule: "Sabado 06/06, das 08:00 as 17:00",
    startAt: EVENT_JUNE_6_START_AT,
    endAt: EVENT_JUNE_6_END_AT,
    enabled: true,
    updatedAt: 0
  };
  const STICKER_EVENT = {
    pointId: "ponto-10",
    title: DEFAULT_COMMUNITY_MEETING_EVENT.title,
    place: DEFAULT_COMMUNITY_MEETING_EVENT.place,
    schedule: DEFAULT_COMMUNITY_MEETING_EVENT.schedule,
    startAt: DEFAULT_COMMUNITY_MEETING_EVENT.startAt,
    endAt: DEFAULT_COMMUNITY_MEETING_EVENT.endAt,
    enabled: true,
    updatedAt: 0
  };
  const TIER_EMBLEM_IMAGES = {
    glass: "https://i.ibb.co/VYCm5HZ4/vidro.png",
    silver: "https://i.ibb.co/DDtKYfm1/prata.png",
    gold: "https://i.ibb.co/qLksz4Q1/ouro.png",
    platinum: "https://i.ibb.co/RkjTvKGK/platina.png",
    diamond: "https://i.ibb.co/mVxp90ZX/Diamante.png"
  };
  const TRADE_RANK_STEPS = [
    { id: "glass", label: "Vidro", min: 0, text: "0 a 9 pessoas com troca" },
    { id: "silver", label: "Prata", min: 10, text: "10 pessoas com troca" },
    { id: "gold", label: "Ouro", min: 50, text: "50 pessoas com troca" },
    { id: "platinum", label: "Platina", min: 100, text: "100 pessoas com troca" },
    { id: "diamond", label: "Diamante", min: 200, text: "200 pessoas com troca" }
  ];
  const OFFICIAL_BADGES = [
    {
      id: CHEGUEI_BRASIL_BADGE_ID,
      title: "Cheguei Brasil",
      shortTitle: "Cheguei",
      image: CHEGUEI_BRASIL_BADGE_IMAGE_URL,
      xp: 100,
      availability: "Valido para novos jogadores ate 31/07/2026.",
      description: "Emblema de boas-vindas para quem entrou na jornada NEXO Card rumo ao Brasil.",
      revealText: "Esse emblema marca a chegada do jogador ao NEXO Card. Quem pegar durante a campanha fica com ele para sempre."
    },
    {
      id: EVENT_JUNE_6_BADGE_ID,
      title: "Eu fui - 6 de junho",
      shortTitle: "6 Jun",
      image: EVENT_JUNE_6_BADGE_IMAGE_URL,
      xp: 150,
      availability: "Disponivel somente em 06/06/2026, das 08:00 as 17:00.",
      description: "Emblema unico para quem comparecer ao encontro no Parque da Cidade.",
      revealText: "Esse emblema e exclusivo do encontro no Estacionamento 10. Quem garantir no horario do evento guarda para sempre."
    }
  ];
  const RESET_ALBUM_USER_IDS = new Set(["qSX1blk7tpbFxQe1naVJiyFKj5J3"]);
  const ADMIN_EMAIL = "ynsanuz@gmail.com";
  const ANALYTICS_SESSION_KEY = "albumCopa2026AnalyticsSession";
  const ALBUM_SAVE_METRIC_INTERVAL_MS = 5 * 60 * 1000;
  const FIREBASE_CONFIG = window.ALBUM_FIREBASE_CONFIG || {
    apiKey: "AIzaSyBhMmiCVF9GtVTLQUSmgdPkT1W5RR6ykkU",
    authDomain: "nexo-contas.firebaseapp.com",
    projectId: "nexo-contas",
    storageBucket: "nexo-contas.firebasestorage.app",
    messagingSenderId: "927169325649",
    appId: "1:927169325649:web:1f3430758ac281ee01a670"
  };
  const FIREBASE_COLLECTIONS = {
    users: "albumWebUsers",
    albums: "albumWebAlbums",
    publicUsers: "albumWebPublicUsers",
    notifications: "albumWebNotifications",
    analytics: "analyticsVisits",
    settings: "albumWebSettings",
    usernames: "usernames",
    profileViews: "albumWebProfileViews"
  };
  const PRESET_MESSAGES = {
    hello: { label: "Ola", type: "hello", text: "Ola, como vai?" },
    trade_interest: { label: "Interesse", type: "trade_interest", text: "Tenho interesse em trocar figurinhas." },
    congrats: { label: "Parabens", type: "preset_message", text: "Parabens pelo album!" },
    encouragement: { label: "Incentivo", type: "preset_message", text: "Esta indo bem, nao desista." },
    like: { label: "Curtir", type: "like", text: "Curti seu album." },
    dislike: { label: "Descurtir", type: "dislike", text: "Nao curti este album." },
    thanks: { label: "Obrigado", type: "preset_message", text: "Obrigado pela troca." }
  };
  const SAFE_MESSAGE_KEYS = ["hello", "trade_interest", "congrats", "encouragement", "like", "dislike", "thanks"];
  const MAP_BOUNDS = [
    [-15.8170, -47.9280],
    [-15.7865, -47.8945]
  ];
  const MAP_CENTER = [-15.8030, -47.9150];
  const MAP_OVERLAY_URL = "https://i.ibb.co/B2VRh5b1/Design-sem-nome-pdf-9.png";
  const OFFICIAL_POINT_ICON_URL = "https://i.ibb.co/KczGYz6v/11-layout-primus-1.png";
  const STICKERS_PER_TEAM = 20;
  const MAP_NEAR_ZOOM = 15.35;
  const MAP_DETAIL_ZOOM = 16.85;
  const FLAG_ALPHA2_BY_CODE = {
    ALG: "DZ", ARG: "AR", AUS: "AU", AUT: "AT", BEL: "BE", BIH: "BA",
    BRA: "BR", CAN: "CA", CIV: "CI", COD: "CD", COL: "CO", CPV: "CV",
    CRO: "HR", CUW: "CW", CZE: "CZ", ECU: "EC", EGY: "EG", ENG: "GB",
    ESP: "ES", FRA: "FR", GER: "DE", GHA: "GH", HAI: "HT", IRQ: "IQ",
    IRN: "IR", JOR: "JO", JPN: "JP", KOR: "KR", KSA: "SA", MAR: "MA",
    MEX: "MX", NED: "NL", NOR: "NO", NZL: "NZ", PAN: "PA", PAR: "PY",
    POR: "PT", QAT: "QA", RSA: "ZA", SCO: "GB", SEN: "SN", SUI: "CH",
    SWE: "SE", TUN: "TN", TUR: "TR", URU: "UY", USA: "US", UZB: "UZ"
  };

  const playerTeams = Array.isArray(window.ALBUM_PLAYER_TEAMS) && window.ALBUM_PLAYER_TEAMS.length
    ? window.ALBUM_PLAYER_TEAMS
    : fallbackPlayerTeams();
  const playerAudit = window.ALBUM_PLAYER_AUDIT || null;
  const teamPalette = [
    ["#14814d", "#d44848"], ["#f1c84b", "#13735d"], ["#e9ecef", "#d73c4b"],
    ["#214f9a", "#e64f52"], ["#d23131", "#f4f4f4"], ["#2655a6", "#c83b46"],
    ["#bb2f32", "#14814d"], ["#57a9e8", "#f6f6f6"], ["#222222", "#e5bd37"],
    ["#1c8b56", "#cf3d3d"], ["#40b8c8", "#0b5f6e"], ["#7c3aed", "#f59e0b"]
  ];

  const cards = buildCards();
  let collectorUsers = buildCollectorUsers();
  const exchangePointReference = [
    { id: "ponto-1", name: "Estacionamento 01", px: 441, py: 132 },
    { id: "ponto-2", name: "Estacionamento 02", px: 365, py: 236 },
    { id: "ponto-3", name: "Estacionamento 03", px: 272, py: 281 },
    { id: "ponto-4", name: "Estacionamento 04", px: 212, py: 325 },
    { id: "ponto-5", name: "Estacionamento 05", px: 96, py: 385 },
    { id: "ponto-6", name: "Estacionamento 06", px: 82, py: 476 },
    { id: "ponto-7", name: "Estacionamento 07", px: 226, py: 440 },
    { id: "ponto-8", name: "Estacionamento 08", px: 272, py: 438 },
    { id: "ponto-9", name: "Estacionamento 09", px: 342, py: 354 },
    { id: "ponto-10", name: "Estacionamento 10", px: 490, py: 286, lat: -15.802708026419785, lng: -47.905079257571984 },
    { id: "ponto-11", name: "Estacionamento 11", px: 571, py: 191 },
    { id: "ponto-12", name: "Estacionamento 12", px: 649, py: 101 },
    { id: "ponto-13", name: "Estacionamento 13", px: 615, py: 80 }
  ];
  const tradePoints = exchangePointReference.map(toExchangeLocation);
  const leafletMarkers = {
    points: [],
    collectors: [],
    analytics: [],
    me: null,
    accuracy: null
  };
  let leafletMap = null;
  let leafletFitDemoDone = false;
  let firebaseApp = null;
  let auth = null;
  let db = null;
  let firebaseReady = false;
  let currentUser = readProfile();
  let syncTimer = null;
  let albumSyncInFlight = null;
  let albumSyncQueued = false;
  let albumUnsubscribe = null;
  let albumStorageTimer = null;
  let publicProfileTimer = null;
  let publicUsersUnsubscribe = null;
  let messageUnsubscribes = [];
  let meetingEventUnsubscribe = null;
  let locationSyncTimer = null;
  let eventCountdownTimer = null;
  let lastLocationWriteAt = 0;
  let guestAddClicks = 0;
  let loginInProgress = false;
  let analyticsStarted = false;
  let lastAlbumSaveMetricAt = 0;
  let deferredPwaInstallPrompt = null;
  let pwaInstallReminderTimer = null;
  let pwaInstallReminderHideTimer = null;
  const state = {
    view: "map",
    filter: "all",
    group: "ALL",
    query: "",
    stickerEditMode: "add",
    album: readAlbum(),
    albumUpdatedAt: readAlbumUpdatedAt(),
    albumCardUpdatedAt: readAlbumCardUpdatedAt(),
    officialBadges: readOfficialBadges(),
    myLocation: readApproxLocation(),
    tradeCode: "",
    friend: null,
    selectedUserId: "me",
    profileSwipe: null,
    analyticsSessionId: readAnalyticsSessionId(),
    sessionStartedAtMs: Date.now(),
    lastSessionMetricMs: 0,
    metricsVisitRecorded: false,
    adminAnalyticsEvents: [],
    adminMetricsMode: "hour",
    nearbyFilter: "trade",
    messageTargetUserId: "",
    messageReplyToId: "",
    messageTargetFallback: null,
    profileMessages: [],
    sentProfileMessages: []
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    applyTheme(localStorage.getItem(THEME_KEY) || "light");
    initFirebase();
    initLeafletMap();
    bindEvents();
    applyCommunityMeetingEvent(readCommunityMeetingEvent() || DEFAULT_COMMUNITY_MEETING_EVENT, { render: false, persist: false });
    syncOfficialRewardState({ render: false });
    renderGroups();
    renderQr("Album Copa 2026");
    renderRosterAudit();
    updateAccountUi();
    startEventCountdown();
    setView(state.view);
    render();
    showStickerEventOnEntry();
    initPwaInstallReminder();
    startAnalyticsTracking();
  }

  function cacheElements() {
    [
      "side-progress", "side-progress-line", "progress-percent", "progress-ring",
      "summary-title", "summary-subtitle", "stat-owned", "stat-missing",
      "stat-duplicates", "stat-total", "album-grid", "missing-list",
      "duplicate-list", "group-strip", "search-input", "toast", "view-title",
      "user-search-results",
      "view-eyebrow", "qr-matrix", "trade-code-label", "friend-code",
      "match-panel", "sticker-dialog", "dialog-content", "trade-points",
      "collector-pins", "map-summary-grid", "profile-dialog", "profile-content",
      "collector-map", "map-fallback", "account-status", "players-audit",
      "account-summary", "account-photo-shell", "account-photo-img", "account-name-label", "account-dialog",
      "profile-photo-preview", "profile-name-input", "profile-username-input", "profile-nickname-input",
      "profile-instagram-input", "admin-metrics-open", "admin-metrics-account-open",
      "admin-event-open", "admin-event-account-open", "admin-event-dialog",
      "admin-event-date", "admin-event-time", "admin-event-preview",
      "admin-event-save", "admin-event-clear",
      "nearby-collectors-open", "nearby-dialog", "nearby-list", "nearby-summary",
      "message-dialog", "message-options", "message-target-name", "message-send-status",
      "profile-message-list", "profile-message-status", "nav-message-count", "account-message-count",
      "admin-metrics-dialog", "admin-metrics-grid", "admin-metrics-chart",
      "admin-metrics-note", "admin-metrics-sections", "event-countdown",
      "event-status", "event-timer", "event-detail", "event-reward-status",
      "event-summary-open", "event-detail-dialog", "event-detail-title",
      "event-detail-timer", "event-detail-place", "event-detail-schedule",
      "event-detail-reward-status", "badge-reveal-dialog", "badge-reveal-content",
      "challenge-gift-open", "challenge-dialog"
    ].forEach(id => { els[id] = document.getElementById(id); });
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach(button => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });

    document.querySelectorAll("[data-view-shortcut]").forEach(button => {
      button.addEventListener("click", () => setView(button.dataset.viewShortcut));
    });

    document.querySelectorAll("[data-filter]").forEach(button => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
        state.filter = button.dataset.filter || "all";
        render();
      });
    });

    document.querySelectorAll("[data-sticker-mode]").forEach(button => {
      button.addEventListener("click", () => setStickerEditMode(button.dataset.stickerMode || "add"));
    });

    els["search-input"].addEventListener("input", event => {
      state.query = normalize(event.target.value);
      renderAlbumGrid();
    });

    els["album-grid"].addEventListener("click", onCardGridClick);
    if (els["user-search-results"]) els["user-search-results"].addEventListener("click", onUserSearchResultsClick);
    els["missing-list"].addEventListener("click", onListClick);
    els["duplicate-list"].addEventListener("click", onListClick);
    if (els["collector-pins"]) els["collector-pins"].addEventListener("click", onCollectorClick);
    if (els["collector-map"]) els["collector-map"].addEventListener("click", onPointPlayerListClick);

    bindClick("nav-my-card", () => openProfile("me"));
    bindClick("map-center-location", centerOnDevice);
    bindClick("map-target-location", centerOnDevice);
    bindClick("event-focus-point", focusEventDetailPoint);
    bindClick("event-summary-open", openEventDetails);
    bindClick("challenge-gift-open", openChallengeDialog);
    if (els["event-countdown"]) els["event-countdown"].addEventListener("click", onOfficialBadgeClick);
    bindClick("nearby-collectors-open", openNearbyCollectors);
    bindClick("admin-metrics-open", () => openAdminMetrics("hour"));
    bindClick("admin-metrics-account-open", () => openAdminMetrics("hour"));
    bindClick("admin-event-open", openAdminEventDialog);
    bindClick("admin-event-account-open", openAdminEventDialog);
    bindClick("admin-event-save", saveAdminCommunityMeeting);
    bindClick("admin-event-clear", clearAdminCommunityMeeting);
    bindClick("nav-profile", openAccountSettings);
    bindClick("google-login", loginGoogle);
    bindClick("settings-google-login", loginGoogle);
    bindClick("settings-google-logout", logoutGoogle);
    bindClick("account-summary", openAccountSettings);
    bindClick("profile-save-settings", saveProfileSettings);
    bindClick("copy-roster-warning", copyRosterWarning);
    bindClick("share-summary", shareSummary);
    bindClick("copy-duplicates", copyDuplicates);
    bindClick("make-trade-code", makeTradeCode);
    bindClick("copy-trade-code", copyTradeCode);
    bindClick("use-sample-friend", useSampleFriend);
    bindClick("compare-friend", compareFriend);
    bindClick("export-json", exportJson);
    bindChange("import-json", importJson);
    bindClick("reset-progress", resetProgress);

    document.querySelectorAll("[data-theme-choice]").forEach(button => {
      button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
    });

    document.querySelectorAll("[data-close-dialog]").forEach(button => {
      button.addEventListener("click", () => els["sticker-dialog"].close());
    });

    document.querySelectorAll("[data-close-account]").forEach(button => {
      button.addEventListener("click", () => els["account-dialog"] && els["account-dialog"].close());
    });

    document.querySelectorAll("[data-close-nearby]").forEach(button => {
      button.addEventListener("click", () => els["nearby-dialog"] && els["nearby-dialog"].close());
    });

    document.querySelectorAll("[data-close-message]").forEach(button => {
      button.addEventListener("click", () => closeMessageDialog());
    });

    document.querySelectorAll("[data-close-badge-reveal]").forEach(button => {
      button.addEventListener("click", () => els["badge-reveal-dialog"] && els["badge-reveal-dialog"].close());
    });

    document.querySelectorAll("[data-close-event-detail]").forEach(button => {
      button.addEventListener("click", () => els["event-detail-dialog"] && els["event-detail-dialog"].close());
    });

    document.querySelectorAll("[data-close-challenge]").forEach(button => {
      button.addEventListener("click", () => els["challenge-dialog"] && els["challenge-dialog"].close());
    });

    document.querySelectorAll("[data-close-admin-metrics]").forEach(button => {
      button.addEventListener("click", () => els["admin-metrics-dialog"] && els["admin-metrics-dialog"].close());
    });

    document.querySelectorAll("[data-close-admin-event]").forEach(button => {
      button.addEventListener("click", () => els["admin-event-dialog"] && els["admin-event-dialog"].close());
    });

    document.querySelectorAll("[data-admin-metrics-mode]").forEach(button => {
      button.addEventListener("click", () => openAdminMetrics(button.dataset.adminMetricsMode || "hour"));
    });

    document.querySelectorAll("[data-nearby-filter]").forEach(button => {
      button.addEventListener("click", () => {
        state.nearbyFilter = button.dataset.nearbyFilter || "trade";
        renderNearbyCollectors();
      });
    });

    document.querySelectorAll("[data-challenge-tab]").forEach(button => {
      button.addEventListener("click", () => setChallengeTab(button.dataset.challengeTab || "daily"));
    });

    if (els["nearby-list"]) {
      els["nearby-list"].addEventListener("click", onNearbyListClick);
    }

    if (els["message-options"]) {
      els["message-options"].addEventListener("click", onMessageOptionClick);
    }
    if (els["profile-message-list"]) {
      els["profile-message-list"].addEventListener("click", onProfileMessageClick);
    }

    ["admin-event-date", "admin-event-time"].forEach(id => {
      if (els[id]) els[id].addEventListener("input", updateAdminEventPreview);
    });

    if (els["profile-username-input"]) {
      els["profile-username-input"].addEventListener("input", () => {
        const clean = normalizeUsername(els["profile-username-input"].value);
        if (els["profile-username-input"].value !== clean) els["profile-username-input"].value = clean;
      });
    }

    document.querySelectorAll("[data-close-profile]").forEach(button => {
      button.addEventListener("click", () => els["profile-dialog"].close());
    });

    els["profile-dialog"].addEventListener("click", event => {
      if (event.target === els["profile-dialog"]) els["profile-dialog"].close();
    });

    if (els["badge-reveal-dialog"]) {
      els["badge-reveal-dialog"].addEventListener("click", event => {
        if (event.target === els["badge-reveal-dialog"]) els["badge-reveal-dialog"].close();
        else onOfficialBadgeClick(event);
      });
    }

    if (els["event-detail-dialog"]) {
      els["event-detail-dialog"].addEventListener("click", event => {
        if (event.target === els["event-detail-dialog"]) els["event-detail-dialog"].close();
        else onOfficialBadgeClick(event);
      });
    }

    if (els["challenge-dialog"]) {
      els["challenge-dialog"].addEventListener("click", event => {
        if (event.target === els["challenge-dialog"]) els["challenge-dialog"].close();
        else onOfficialBadgeClick(event);
      });
    }

    document.addEventListener("pointerdown", event => {
      if (!els["profile-dialog"].open) return;
      if (event.target.closest("#profile-dialog")) return;
      els["profile-dialog"].close();
    });

    els["profile-content"].addEventListener("click", onProfileClick);
    els["profile-content"].addEventListener("pointerdown", onProfilePointerDown);
    els["profile-content"].addEventListener("pointerup", onProfilePointerUp);
    els["profile-content"].addEventListener("pointercancel", onProfilePointerCancel);

    window.addEventListener("online", () => syncAlbumToFirebase());
    window.addEventListener("storage", onAlbumStorageChanged);
    window.addEventListener("pagehide", () => {
      flushAlbumSync();
      recordSessionDurationMetric("close");
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flushAlbumSync();
        recordSessionDurationMetric("hidden");
      }
    });
  }

  function bindClick(id, handler) {
    const node = document.getElementById(id);
    if (node) node.addEventListener("click", handler);
  }

  function bindChange(id, handler) {
    const node = document.getElementById(id);
    if (node) node.addEventListener("change", handler);
  }

  function initPwaInstallReminder() {
    registerPwaServiceWorker();
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredPwaInstallPrompt = event;
      schedulePwaInstallReminder(1200);
    });
    window.addEventListener("appinstalled", () => {
      deferredPwaInstallPrompt = null;
      localStorage.setItem(PWA_INSTALL_DONE_KEY, "1");
      hidePwaInstallReminder();
      toast("App ativado na area de trabalho.");
    });
    ensurePwaInstallReminder();
    schedulePwaInstallReminder(1800);
  }

  function registerPwaServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(error => {
        console.warn("PWA indisponivel.", error);
      });
    });
  }

  function ensurePwaInstallReminder() {
    if (document.getElementById("pwa-install-reminder")) return;
    const reminder = document.createElement("div");
    reminder.id = "pwa-install-reminder";
    reminder.className = "pwa-install-reminder";
    reminder.hidden = true;
    reminder.innerHTML = (
      '<div><strong>Salve na area de trabalho</strong><span>Acesse facilmente quando quiser.</span></div>' +
      '<button class="pwa-install-activate" type="button" id="pwa-install-activate">Ativar</button>' +
      '<button class="pwa-install-close" type="button" id="pwa-install-close">OK</button>'
    );
    document.body.appendChild(reminder);
    document.getElementById("pwa-install-activate").addEventListener("click", activatePwaInstall);
    document.getElementById("pwa-install-close").addEventListener("click", () => {
      hidePwaInstallReminder();
      schedulePwaInstallReminder();
    });
  }

  function schedulePwaInstallReminder(delay) {
    clearTimeout(pwaInstallReminderTimer);
    if (isPwaInstalled()) return;
    const lastPromptAt = Math.max(0, Number(localStorage.getItem(PWA_INSTALL_LAST_PROMPT_KEY) || 0));
    const nextDelay = Number.isFinite(Number(delay))
      ? Math.max(0, Number(delay))
      : Math.max(30000, PWA_INSTALL_REMINDER_INTERVAL_MS - (Date.now() - lastPromptAt));
    pwaInstallReminderTimer = setTimeout(showPwaInstallReminder, nextDelay);
  }

  function showPwaInstallReminder() {
    if (isPwaInstalled()) return;
    const lastPromptAt = Math.max(0, Number(localStorage.getItem(PWA_INSTALL_LAST_PROMPT_KEY) || 0));
    if (Date.now() - lastPromptAt < PWA_INSTALL_REMINDER_INTERVAL_MS) {
      schedulePwaInstallReminder();
      return;
    }
    const reminder = ensurePwaInstallReminderNode();
    if (!reminder) return;
    localStorage.setItem(PWA_INSTALL_LAST_PROMPT_KEY, String(Date.now()));
    reminder.hidden = false;
    requestAnimationFrame(() => reminder.classList.add("active"));
    clearTimeout(pwaInstallReminderHideTimer);
    pwaInstallReminderHideTimer = setTimeout(hidePwaInstallReminder, 7000);
    schedulePwaInstallReminder();
  }

  function ensurePwaInstallReminderNode() {
    ensurePwaInstallReminder();
    return document.getElementById("pwa-install-reminder");
  }

  function hidePwaInstallReminder() {
    const reminder = document.getElementById("pwa-install-reminder");
    if (!reminder) return;
    clearTimeout(pwaInstallReminderHideTimer);
    reminder.classList.remove("active");
    setTimeout(() => {
      if (!reminder.classList.contains("active")) reminder.hidden = true;
    }, 220);
  }

  async function activatePwaInstall() {
    hidePwaInstallReminder();
    localStorage.setItem(PWA_INSTALL_LAST_PROMPT_KEY, String(Date.now()));
    if (!deferredPwaInstallPrompt) {
      toast("Use o menu do navegador para instalar o app.");
      schedulePwaInstallReminder();
      return;
    }
    const promptEvent = deferredPwaInstallPrompt;
    deferredPwaInstallPrompt = null;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === "accepted") {
        localStorage.setItem(PWA_INSTALL_DONE_KEY, "1");
        toast("App ativado na area de trabalho.");
      } else {
        schedulePwaInstallReminder();
      }
    } catch (error) {
      console.warn("Instalacao PWA falhou.", error);
      toast("Nao consegui abrir a instalacao agora.");
      schedulePwaInstallReminder();
    }
  }

  function isPwaInstalled() {
    return localStorage.getItem(PWA_INSTALL_DONE_KEY) === "1"
      || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
      || Boolean(window.navigator && window.navigator.standalone);
  }

  function setStickerEditMode(mode) {
    state.stickerEditMode = mode === "remove" ? "remove" : "add";
    document.querySelectorAll("[data-sticker-mode]").forEach(button => {
      button.classList.toggle("active", button.dataset.stickerMode === state.stickerEditMode);
    });
    document.body.classList.toggle("sticker-mode-remove", state.stickerEditMode === "remove");
  }

  function buildCards() {
    return playerTeams.flatMap((team, teamIndex) => {
      const colors = teamColor(teamIndex);
      return Array.from({ length: STICKERS_PER_TEAM }, (_, index) => {
        const number = index + 1;
        const player = (team.players || [])[index] || fallbackStickerLabel(team, number);
        return {
          id: team.code + "-" + number,
          group: team.group,
          code: team.code,
          country: team.country,
          label: player,
          player,
          flag: flagForCode(team.code),
          generatedLabel: index >= (team.players || []).length,
          number,
          a: colors[0],
          b: colors[1],
          special: false
        };
      });
    });
  }

  function teamColor(index) {
    return teamPalette[index % teamPalette.length];
  }

  function fallbackStickerLabel(team, number) {
    if (number === STICKERS_PER_TEAM - 1) return "Especial " + team.code;
    if (number === STICKERS_PER_TEAM) return "Escudo " + team.code;
    return "Figurinha " + number;
  }

  function flagForCode(code) {
    const alpha2 = FLAG_ALPHA2_BY_CODE[code] || "";
    if (!/^[A-Z]{2}$/.test(alpha2)) return "";
    return "https://flagcdn.com/w40/" + alpha2.toLowerCase() + ".png";
  }

  function fallbackPlayerTeams() {
    return [
      {
        group: "A",
        code: "BRA",
        country: "Brasil",
        players: ["Alisson", "Bento", "Marquinhos", "Éder Militão", "Gabriel Magalhães", "Danilo"]
      }
    ];
  }

  function toExchangeLocation(point) {
    const fallbackX = (point.px / 788) * 100;
    const fallbackY = ((572 - point.py) / 572) * 80;
    const hasGps = Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng));
    const latlng = hasGps ? [Number(point.lat), Number(point.lng)] : xyToLatLng(fallbackX, fallbackY);
    const percent = hasGps ? latLngToPercent(latlng[0], latlng[1]) : { x: fallbackX, y: fallbackY };
    return {
      id: point.id,
      name: point.name,
      x: percent.x,
      y: percent.y,
      lat: latlng[0],
      lng: latlng[1]
    };
  }

  function xyToLatLng(x, y) {
    const lat = MAP_BOUNDS[0][0] + (y / 80) * (MAP_BOUNDS[1][0] - MAP_BOUNDS[0][0]);
    const lng = MAP_BOUNDS[0][1] + (x / 100) * (MAP_BOUNDS[1][1] - MAP_BOUNDS[0][1]);
    return [lat, lng];
  }

  function percentToLatLng(x, y) {
    const lat = MAP_BOUNDS[1][0] - (y / 100) * (MAP_BOUNDS[1][0] - MAP_BOUNDS[0][0]);
    const lng = MAP_BOUNDS[0][1] + (x / 100) * (MAP_BOUNDS[1][1] - MAP_BOUNDS[0][1]);
    return [lat, lng];
  }

  function latLngToPercent(lat, lng) {
    const x = ((lng - MAP_BOUNDS[0][1]) / (MAP_BOUNDS[1][1] - MAP_BOUNDS[0][1])) * 100;
    const y = ((MAP_BOUNDS[1][0] - lat) / (MAP_BOUNDS[1][0] - MAP_BOUNDS[0][0])) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }

  function buildCollectorUsers() {
    return [
      {
        id: "demo-ana",
        name: "Ana Luiza",
        instagram: "ana.luiza",
        x: 42,
        y: 54,
        lat: -15.7954,
        lng: -47.9062,
        initials: "AL",
        colors: ["#45c0d0", "#0f766e"],
        album: albumFromProgress(11, 2, 7),
        tradeReputation: reputationPreset(4.6, 18, 7, 32, 17, 1),
        demo: true,
        lastOnlineMs: Date.now() - 4 * 60000
      },
      {
        id: "demo-leo",
        name: "Leo Matos",
        instagram: "leo.matos",
        x: 49,
        y: 48,
        lat: -15.8004,
        lng: -47.9116,
        initials: "LM",
        colors: ["#f0c84b", "#0ea5e9"],
        album: albumFromProgress(24, 11, 6),
        tradeReputation: reputationPreset(4.8, 41, 15, 76, 40, 1),
        demo: true,
        lastOnlineMs: Date.now() - 7 * 60000
      },
      {
        id: "demo-bia",
        name: "Bia Costa",
        instagram: "bia.costa",
        x: 56,
        y: 43,
        lat: -15.8066,
        lng: -47.9182,
        initials: "BC",
        colors: ["#ff7a59", "#7c3aed"],
        album: albumFromProgress(39, 23, 5),
        tradeReputation: reputationPreset(4.4, 63, 21, 118, 58, 5),
        demo: true,
        lastOnlineMs: Date.now() - 11 * 60000
      },
      {
        id: "demo-nina",
        name: "Nina Rocha",
        instagram: "nina.rocha",
        x: 6,
        y: 84,
        lat: -15.9023,
        lng: -48.0632,
        initials: "NR",
        colors: ["#40b8c8", "#0b5f6e"],
        album: albumFromProgress(52, 37, 8),
        tradeReputation: reputationPreset(4.7, 126, 44, 205, 121, 5),
        demo: true,
        lastOnlineMs: Date.now() - 14 * 60000
      },
      {
        id: "demo-sofia",
        name: "Sofia Lima",
        instagram: "sofia.lima",
        x: 88,
        y: 96,
        lat: -23.5614,
        lng: -46.6559,
        initials: "SL",
        colors: ["#2563eb", "#13c8a3"],
        album: albumFromProgress(66, 49, 9),
        tradeReputation: reputationPreset(4.9, 238, 83, 416, 235, 3),
        demo: true,
        lastOnlineMs: Date.now() - 18 * 60000
      },
      {
        id: "demo-rafa",
        name: "Rafa Torres",
        instagram: "rafa.torres",
        x: 92,
        y: 94,
        lat: -22.9711,
        lng: -43.1822,
        initials: "RT",
        colors: ["#ef5a5a", "#f0c84b"],
        album: albumFromProgress(78, 61, 10),
        tradeReputation: reputationPreset(4.5, 356, 121, 680, 332, 24),
        demo: true,
        lastOnlineMs: Date.now() - 22 * 60000
      },
      {
        id: "demo-mila",
        name: "Mila Rocha",
        instagram: "mila.rocha",
        x: 94,
        y: 91,
        lat: -22.9122,
        lng: -43.2302,
        initials: "MR",
        colors: ["#7c3aed", "#40b8c8"],
        album: albumFromProgress(84, 73, 6),
        tradeReputation: reputationPreset(4.8, 742, 216, 1190, 725, 17),
        demo: true,
        lastOnlineMs: Date.now() - 26 * 60000
      },
      {
        id: "demo-gui",
        name: "Gui Prado",
        instagram: "gui.prado",
        x: 4,
        y: 8,
        lat: -9.9745,
        lng: -67.8243,
        initials: "GP",
        colors: ["#0f766e", "#ff7a59"],
        album: albumFromProgress(92, 89, 7),
        tradeReputation: reputationPreset(4.7, 3044, 908, 5216, 2950, 94),
        demo: true,
        lastOnlineMs: Date.now() - 31 * 60000
      },
      {
        id: "demo-joao",
        name: "Joao Vitor",
        instagram: "joao.vitor",
        x: 84,
        y: 88,
        lat: -19.9227,
        lng: -43.9451,
        initials: "JV",
        colors: ["#14814d", "#f0c84b"],
        album: albumFromProgress(98, 101, 11),
        tradeReputation: reputationPreset(5, 986, 301, 1888, 982, 4),
        demo: true,
        lastOnlineMs: Date.now() - 36 * 60000
      },
      {
        id: "demo-luiza",
        name: "Luiza Mendes",
        instagram: "luiza.mendes",
        x: 83,
        y: 89,
        lat: -20.3856,
        lng: -43.5035,
        initials: "LM",
        colors: ["#45c0d0", "#7c3aed"],
        album: albumFromProgress(88, 113, 8),
        tradeReputation: reputationPreset(4.6, 512, 171, 920, 492, 20),
        demo: true,
        lastOnlineMs: Date.now() - 42 * 60000
      },
      {
        id: "demo-breno",
        name: "Breno Alves",
        instagram: "breno.alves",
        x: 78,
        y: 82,
        lat: -18.9146,
        lng: -48.2754,
        initials: "BA",
        colors: ["#f0c84b", "#14814d"],
        album: albumFromProgress(71, 127, 9),
        tradeReputation: reputationPreset(4.3, 284, 98, 540, 260, 24),
        demo: true,
        lastOnlineMs: Date.now() - 49 * 60000
      },
      {
        id: "demo-carla",
        name: "Carla Reis",
        instagram: "carla.reis",
        x: 86,
        y: 91,
        lat: -21.7622,
        lng: -43.3434,
        initials: "CR",
        colors: ["#ef5a5a", "#0ea5e9"],
        album: albumFromProgress(59, 139, 7),
        tradeReputation: reputationPreset(4.7, 377, 133, 701, 363, 14),
        demo: true,
        lastOnlineMs: Date.now() - 57 * 60000
      }
    ];
  }

  function collectorsWithDemo(realUsers) {
    const live = Array.isArray(realUsers) ? realUsers : [];
    const liveIds = new Set(live.map(user => user.id));
    const demoUsers = buildCollectorUsers().filter(user => !liveIds.has(user.id));
    return live.concat(demoUsers);
  }

  function albumFromProgress(progress, offset, duplicateEvery) {
    const album = {};
    const total = cards.length;
    const ownedTarget = Math.max(0, Math.min(total, Math.round(total * progress / 100)));
    cards.forEach((card, index) => {
      const shifted = (index + offset) % total;
      if (shifted >= ownedTarget) return;
      album[card.id] = shifted % duplicateEvery === 0 ? 3 : (shifted % (duplicateEvery + 4) === 0 ? 2 : 1);
    });
    return album;
  }

  function albumFromPattern(offset, ownedMod, duplicateMod) {
    const album = {};
    cards.forEach((card, index) => {
      const seed = index + offset;
      if (seed % ownedMod !== 0) album[card.id] = seed % duplicateMod === 0 ? 3 : 1;
      if (seed % (duplicateMod + 3) === 0) album[card.id] = 2;
    });
    return album;
  }

  function readAlbum() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? sanitizeAlbumMap(parsed) : {};
    } catch (error) {
      return {};
    }
  }

  function readAlbumUpdatedAt() {
    return Math.max(0, Number(localStorage.getItem(LOCAL_UPDATED_KEY) || 0));
  }

  function readAlbumCardUpdatedAt() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CARD_UPDATED_KEY) || "{}");
      return sanitizeAlbumUpdatedMap(parsed);
    } catch (error) {
      return {};
    }
  }

  function writeLocalAlbum(album, updatedAt, cardUpdatedAt) {
    const timestamp = Math.max(0, Number(updatedAt || Date.now()));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeAlbumMap(album)));
    localStorage.setItem(LOCAL_UPDATED_KEY, String(timestamp));
    localStorage.setItem(CARD_UPDATED_KEY, JSON.stringify(sanitizeAlbumUpdatedMap(cardUpdatedAt || {})));
    state.albumUpdatedAt = timestamp;
    return timestamp;
  }

  function saveAlbum(updatedAt) {
    const previousUpdatedAt = state.albumUpdatedAt || readAlbumUpdatedAt();
    const timestamp = Math.max(0, Number(updatedAt || Date.now()));
    state.album = sanitizeAlbumMap(state.album);
    state.albumCardUpdatedAt = normalizeAlbumCardUpdatedAt(state.album, previousUpdatedAt || timestamp, state.albumCardUpdatedAt);
    writeLocalAlbum(state.album, timestamp, state.albumCardUpdatedAt);
    recordAlbumSaveMetric();
    scheduleFirebaseAlbumSync();
  }

  function sanitizeAlbumMap(album) {
    const source = album && typeof album === "object" ? album : {};
    return cards.reduce((clean, card) => {
      const value = Math.max(0, Math.min(9, Number(source[card.id] || 0)));
      if (value > 0) clean[card.id] = value;
      return clean;
    }, {});
  }

  function sanitizeAlbumUpdatedMap(updatedAtByCard) {
    const source = updatedAtByCard && typeof updatedAtByCard === "object" ? updatedAtByCard : {};
    return cards.reduce((clean, card) => {
      const timestamp = Math.max(0, Number(source[card.id] || 0));
      if (timestamp > 0) clean[card.id] = timestamp;
      return clean;
    }, {});
  }

  function normalizeAlbumCardUpdatedAt(album, fallbackUpdatedAt, updatedAtByCard) {
    const cleanAlbum = sanitizeAlbumMap(album);
    const cleanUpdatedAt = sanitizeAlbumUpdatedMap(updatedAtByCard);
    const fallback = Math.max(0, Number(fallbackUpdatedAt || 0));
    return cards.reduce((clean, card) => {
      const timestamp = Math.max(0, Number(cleanUpdatedAt[card.id] || 0));
      if (timestamp > 0) clean[card.id] = timestamp;
      else if (fallback && qtyFrom(cleanAlbum, card.id) > 0) clean[card.id] = fallback;
      return clean;
    }, {});
  }

  function markAllAlbumCardsUpdated(updatedAt) {
    const timestamp = Math.max(0, Number(updatedAt || Date.now()));
    return cards.reduce((clean, card) => {
      clean[card.id] = timestamp;
      return clean;
    }, {});
  }

  function touchAlbumCard(cardId, updatedAt) {
    if (!cards.some(card => card.id === cardId)) return 0;
    const timestamp = Math.max(0, Number(updatedAt || Date.now()));
    state.albumCardUpdatedAt[cardId] = timestamp;
    return timestamp;
  }

  function applyAlbumSnapshot(album, cardUpdatedAt, updatedAt, options = {}) {
    const incomingAlbum = sanitizeAlbumMap(album);
    const incomingUpdatedAt = Math.max(0, Number(updatedAt || 0));
    const incomingCardUpdatedAt = normalizeAlbumCardUpdatedAt(incomingAlbum, incomingUpdatedAt, cardUpdatedAt);
    const localUpdatedAt = Math.max(0, Number(state.albumUpdatedAt || readAlbumUpdatedAt() || 0));
    const localCardUpdatedAt = normalizeAlbumCardUpdatedAt(state.album, localUpdatedAt, state.albumCardUpdatedAt);
    const merged = mergeAlbumSnapshots(
      incomingAlbum,
      incomingCardUpdatedAt,
      incomingUpdatedAt,
      state.album,
      localCardUpdatedAt,
      localUpdatedAt
    );
    state.album = merged.album;
    state.albumCardUpdatedAt = merged.cardUpdatedAt;
    if (options.persist !== false) writeLocalAlbum(state.album, merged.updatedAt || Date.now(), state.albumCardUpdatedAt);
    else state.albumUpdatedAt = merged.updatedAt || state.albumUpdatedAt || Date.now();
    render();
    if (options.resyncIfLocalNewer && localUpdatedAt > incomingUpdatedAt) scheduleFirebaseAlbumSync();
    return merged;
  }

  function onAlbumStorageChanged(event) {
    if (!event || ![STORAGE_KEY, LOCAL_UPDATED_KEY, CARD_UPDATED_KEY].includes(event.key)) return;
    clearTimeout(albumStorageTimer);
    albumStorageTimer = setTimeout(() => {
      const storageAlbum = readAlbum();
      const storageUpdatedAt = readAlbumUpdatedAt();
      const storageCardUpdatedAt = normalizeAlbumCardUpdatedAt(storageAlbum, storageUpdatedAt, readAlbumCardUpdatedAt());
      applyAlbumSnapshot(storageAlbum, storageCardUpdatedAt, storageUpdatedAt);
    }, 40);
  }

  function readProfile() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      return parsed && parsed.uid ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function saveProfile(profile) {
    if (profile && profile.uid) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PROFILE_KEY);
  }

  function readOfficialBadges() {
    try {
      const parsed = JSON.parse(localStorage.getItem(OFFICIAL_BADGES_STORAGE_KEY) || "[]");
      return officialBadgeMapFromValue(parsed);
    } catch (error) {
      return {};
    }
  }

  function saveOfficialBadges(map) {
    const entries = Object.keys(map || {}).map(id => ({
      id,
      acquiredAt: Math.max(0, Number(map[id] && map[id].acquiredAt || 0))
    }));
    localStorage.setItem(OFFICIAL_BADGES_STORAGE_KEY, JSON.stringify(entries));
  }

  function officialBadgeMapFromValue(value) {
    const map = {};
    const list = Array.isArray(value)
      ? value
      : value && typeof value === "object"
        ? Object.keys(value).map(id => Object.assign({ id }, value[id] && typeof value[id] === "object" ? value[id] : {}))
        : [];
    list.forEach(item => {
      const id = typeof item === "string" ? item : item && item.id;
      if (!officialBadgeById(id)) return;
      map[id] = {
        id,
        acquiredAt: Math.max(0, Number(item && item.acquiredAt || Date.now()))
      };
    });
    return map;
  }

  function normalizeOfficialBadgeIds(value) {
    return Object.keys(officialBadgeMapFromValue(value));
  }

  function officialBadgeById(id) {
    return OFFICIAL_BADGES.find(badge => badge.id === id) || null;
  }

  function officialBadgeIdsForCurrentUser() {
    return Object.keys(state.officialBadges || {}).filter(id => officialBadgeById(id));
  }

  function mergeOfficialBadges(ids) {
    const incoming = normalizeOfficialBadgeIds(ids);
    if (!incoming.length) return false;
    let changed = false;
    const next = Object.assign({}, state.officialBadges || {});
    incoming.forEach(id => {
      if (next[id]) return;
      next[id] = { id, acquiredAt: Date.now() };
      changed = true;
    });
    if (!changed) return false;
    state.officialBadges = next;
    saveOfficialBadges(next);
    return true;
  }

  function claimOfficialBadge(id, options = {}) {
    const badge = officialBadgeById(id);
    if (!badge) return false;
    const next = Object.assign({}, state.officialBadges || {});
    if (next[id]) return false;
    next[id] = { id, acquiredAt: Date.now() };
    state.officialBadges = next;
    saveOfficialBadges(next);
    if (currentUser && currentUser.uid) {
      currentUser.officialBadges = officialBadgeIdsForCurrentUser();
      saveProfile(currentUser);
      schedulePublicProfileSync();
    }
    if (!options.silent) showOfficialBadgeReveal(id, "me");
    return true;
  }

  function syncOfficialRewardState(options = {}) {
    let changed = false;
    const now = Date.now();
    if (now <= CHEGUEI_BRASIL_END_AT) {
      changed = claimOfficialBadge(CHEGUEI_BRASIL_BADGE_ID, { silent: true }) || changed;
    }
    if (canClaimEventBadge(now)) {
      changed = claimOfficialBadge(EVENT_JUNE_6_BADGE_ID, { silent: true }) || changed;
    }
    if (changed && options.render !== false) render();
    return changed;
  }

  function canClaimEventBadge(now = Date.now()) {
    if (now < EVENT_JUNE_6_START_AT || now > EVENT_JUNE_6_END_AT) return false;
    if (!validLocation(state.myLocation)) return false;
    const point = tradePoints.find(item => item.id === STICKER_EVENT.pointId);
    if (!point) return false;
    return distanceMeters(point.lat, point.lng, state.myLocation.lat, state.myLocation.lng) <= POINT_PLAYER_RADIUS_M;
  }

  function readCommunityMeetingEvent() {
    try {
      return normalizeCommunityMeetingEvent(JSON.parse(localStorage.getItem(COMMUNITY_MEETING_STORAGE_KEY) || "null"));
    } catch (error) {
      return null;
    }
  }

  function saveCommunityMeetingEvent(event) {
    const normalized = normalizeCommunityMeetingEvent(event);
    if (normalized) localStorage.setItem(COMMUNITY_MEETING_STORAGE_KEY, JSON.stringify(normalized));
    else localStorage.removeItem(COMMUNITY_MEETING_STORAGE_KEY);
  }

  function normalizeCommunityMeetingEvent(data) {
    if (!data || data.enabled === false) return null;
    let startAt = Math.max(0, Number(timestampToMillis(data.startAt) || data.startAt || 0));
    if (!startAt) return null;
    let endAt = Math.max(startAt + COMMUNITY_MEETING_DURATION_MS, Number(timestampToMillis(data.endAt) || data.endAt || 0));
    const pointId = data.pointId || STICKER_EVENT.pointId;
    const isJune6Event = pointId === STICKER_EVENT.pointId && sameLocalDate(startAt, EVENT_JUNE_6_START_AT);
    if (isJune6Event) {
      startAt = EVENT_JUNE_6_START_AT;
      endAt = EVENT_JUNE_6_END_AT;
    }
    return {
      pointId,
      title: data.title || STICKER_EVENT.title,
      place: data.place || STICKER_EVENT.place,
      schedule: isJune6Event ? DEFAULT_COMMUNITY_MEETING_EVENT.schedule : data.schedule || formatMeetingSchedule(startAt),
      startAt,
      endAt,
      enabled: true,
      updatedAt: Math.max(0, Number(timestampToMillis(data.updatedAt) || data.updatedAt || 0))
    };
  }

  function applyCommunityMeetingEvent(event, options = {}) {
    const normalized = normalizeCommunityMeetingEvent(event);
    const meeting = normalized || { ...DEFAULT_COMMUNITY_MEETING_EVENT, enabled: false };
    STICKER_EVENT.title = meeting.title;
    STICKER_EVENT.place = meeting.place;
    STICKER_EVENT.schedule = meeting.schedule;
    STICKER_EVENT.startAt = meeting.startAt;
    STICKER_EVENT.endAt = meeting.endAt;
    STICKER_EVENT.enabled = Boolean(normalized);
    STICKER_EVENT.updatedAt = meeting.updatedAt || 0;
    if (options.persist !== false) saveCommunityMeetingEvent(normalized);
    updateEventCountdown();
    updateAdminEventPreview();
    if (options.render !== false && leafletMap) renderMap();
  }

  function readAnalyticsSessionId() {
    try {
      const current = sessionStorage.getItem(ANALYTICS_SESSION_KEY);
      if (current) return current;
      const next = "card_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(ANALYTICS_SESSION_KEY, next);
      return next;
    } catch (error) {
      return "card_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    }
  }

  function readApproxLocation() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY) || "null");
      return validLocation(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function saveApproxLocation(location) {
    if (!validLocation(location)) {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      return;
    }
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    state.myLocation = location;
    if (currentUser && currentUser.uid) {
      currentUser.location = location;
      saveProfile(currentUser);
    }
    syncOfficialRewardState();
  }

  function validLocation(location) {
    return location
      && Number.isFinite(Number(location.lat))
      && Number.isFinite(Number(location.lng));
  }

  function hasFirebaseConfig() {
    return FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && !String(FIREBASE_CONFIG.apiKey).includes("...");
  }

  function initFirebase() {
    if (!window.firebase || !hasFirebaseConfig()) {
      firebaseReady = false;
      return;
    }
    try {
      firebaseApp = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
      auth = firebase.auth(firebaseApp);
      db = firebase.firestore(firebaseApp);
      firebaseReady = true;
      auth.onAuthStateChanged(onFirebaseUserChanged);
      watchPublicCollectors();
      watchCommunityMeetingEvent();
    } catch (error) {
      firebaseReady = false;
      console.warn("Servico de conta nao inicializou.", error);
    }
  }

  async function onFirebaseUserChanged(user) {
    stopAlbumRealtimeSync();
    stopMessageRealtimeSync();
    if (!user) {
      currentUser = null;
      saveProfile(null);
      stopLocationSync();
      state.profileMessages = [];
      state.sentProfileMessages = [];
      updateAccountUi();
      renderProfileMessages();
      clearAdminAnalyticsMarkers();
      return;
    }
    const savedProfile = readProfile() || {};
    currentUser = {
      uid: user.uid,
      name: savedProfile.name || user.displayName || "Colecionador",
      nickname: savedProfile.nickname || savedProfile.apelido || "",
      username: usernameFromProfile(savedProfile),
      usernameLower: usernameFromProfile(savedProfile),
      instagram: savedProfile.instagram || "",
      email: user.email || "",
      photo: user.photoURL || savedProfile.photo || "",
      location: validLocation(savedProfile.location) ? savedProfile.location : state.myLocation,
      tradeReputation: normalizeReputation(savedProfile.tradeReputation || savedProfile.reputation),
      officialBadges: normalizeOfficialBadgeIds(savedProfile.officialBadges || officialBadgeIdsForCurrentUser())
    };
    guestAddClicks = 0;
    mergeOfficialBadges(currentUser.officialBadges);
    currentUser.officialBadges = officialBadgeIdsForCurrentUser();
    syncOfficialRewardState({ render: false });
    saveProfile(currentUser);
    updateAccountUi();
    recordAnalyticsEvent("google_login");
    await loadPublicProfileForCurrentUser();
    await saveUserDoc();
    await loadAlbumFromFirebase();
    await syncAlbumToFirebase();
    startAlbumRealtimeSync();
    startMessageRealtimeSync();
    startLocationSync();
    loadAdminMapAnalytics();
  }

  async function saveUserDoc() {
    if (!db || !currentUser || !currentUser.uid) return;
    try {
      const username = usernameFromProfile(currentUser);
      await db.collection(FIREBASE_COLLECTIONS.users).doc(currentUser.uid).set({
        uid: currentUser.uid,
        nome: currentUser.name,
        apelido: currentUser.nickname || "",
        username,
        usernameLower: username,
        instagram: profileInstagram(currentUser),
        email: currentUser.email,
        foto: currentUser.photo,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.warn("Nao foi possivel salvar usuario.", error);
      toast("Login feito, mas nao consegui concluir seu cadastro.");
    }
  }

  async function reserveUsername(username) {
    const clean = normalizeUsername(username);
    if (!clean || clean.length < 2) throw new Error("username_curto");
    if (!firebaseReady || !db || !currentUser || !currentUser.uid) throw new Error("firebase_indisponivel");
    const ref = db.collection(FIREBASE_COLLECTIONS.usernames).doc(clean);
    await db.runTransaction(async transaction => {
      const snap = await transaction.get(ref);
      if (snap.exists) {
        const data = snap.data() || {};
        if (data.uid !== currentUser.uid) throw new Error("username_indisponivel");
        return;
      }
      transaction.set(ref, {
        uid: currentUser.uid,
        username: clean,
        usernameLower: clean,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    return clean;
  }

  async function loadAlbumFromFirebase() {
    if (!db || !currentUser || !currentUser.uid) return;
    try {
      const doc = await db.collection(FIREBASE_COLLECTIONS.albums).doc(currentUser.uid).get();
      if (!doc.exists) return;
      const data = doc.data() || {};
      const resetRemoteAlbum = shouldResetAlbumForUserId(currentUser.uid);
      if (resetRemoteAlbum) {
        const updatedAt = Date.now();
        state.album = {};
        state.albumCardUpdatedAt = markAllAlbumCardsUpdated(updatedAt);
        writeLocalAlbum(state.album, updatedAt, state.albumCardUpdatedAt);
        render();
        return;
      }
      const remoteSnapshot = albumSnapshotFromFirebaseData(data);
      applyAlbumSnapshot(remoteSnapshot.album, remoteSnapshot.cardUpdatedAt, remoteSnapshot.updatedAt);
    } catch (error) {
      console.warn("Nao foi possivel carregar album salvo.", error);
      toast("Login feito, mas nao consegui ler o album salvo.");
    }
  }

  function startAlbumRealtimeSync() {
    if (!firebaseReady || !db || !currentUser || !currentUser.uid) return;
    stopAlbumRealtimeSync();
    const watchedUid = currentUser.uid;
    try {
      albumUnsubscribe = db.collection(FIREBASE_COLLECTIONS.albums).doc(watchedUid)
        .onSnapshot(doc => {
          if (!currentUser || currentUser.uid !== watchedUid || !doc.exists) return;
          if (shouldResetAlbumForUserId(watchedUid)) return;
          const remoteSnapshot = albumSnapshotFromFirebaseData(doc.data() || {});
          applyAlbumSnapshot(remoteSnapshot.album, remoteSnapshot.cardUpdatedAt, remoteSnapshot.updatedAt, {
            resyncIfLocalNewer: true
          });
        }, error => {
          console.warn("Nao foi possivel acompanhar album em tempo real.", error);
        });
    } catch (error) {
      console.warn("Album em tempo real indisponivel.", error);
    }
  }

  function stopAlbumRealtimeSync() {
    if (!albumUnsubscribe) return;
    try {
      albumUnsubscribe();
    } catch (error) {
      console.warn("Nao foi possivel parar sync em tempo real.", error);
    }
    albumUnsubscribe = null;
  }

  function startMessageRealtimeSync() {
    if (!firebaseReady || !db || !currentUser || !currentUser.uid) return;
    stopMessageRealtimeSync();
    const watchedUid = currentUser.uid;
    const applyIncoming = snapshot => {
      if (!currentUser || currentUser.uid !== watchedUid) return;
      state.profileMessages = sortProfileMessages(snapshot.docs.map(normalizeNotificationDoc).filter(Boolean));
      updateMessageBadges();
      renderProfileMessages();
    };
    const applySent = snapshot => {
      if (!currentUser || currentUser.uid !== watchedUid) return;
      state.sentProfileMessages = sortProfileMessages(snapshot.docs.map(normalizeNotificationDoc).filter(Boolean));
      renderProfileMessages();
    };
    try {
      messageUnsubscribes.push(
        db.collection(FIREBASE_COLLECTIONS.notifications)
          .where("targetUserId", "==", watchedUid)
          .onSnapshot(applyIncoming, error => {
            console.warn("Nao foi possivel acompanhar mensagens recebidas.", error);
          })
      );
      messageUnsubscribes.push(
        db.collection(FIREBASE_COLLECTIONS.notifications)
          .where("fromUid", "==", watchedUid)
          .onSnapshot(applySent, error => {
            console.warn("Nao foi possivel acompanhar mensagens enviadas.", error);
          })
      );
    } catch (error) {
      console.warn("Mensagens em tempo real indisponiveis.", error);
    }
  }

  function stopMessageRealtimeSync() {
    messageUnsubscribes.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn("Nao foi possivel parar sync de mensagens.", error);
      }
    });
    messageUnsubscribes = [];
  }

  function normalizeNotificationDoc(doc) {
    if (!doc || !doc.exists) return null;
    const data = doc.data() || {};
    const targetUserId = String(data.targetUserId || "").trim();
    const fromUid = String(data.fromUid || "").trim();
    if (!targetUserId || !fromUid) return null;
    return {
      id: doc.id,
      fromUid,
      fromName: data.fromName || "Colecionador",
      fromPhoto: data.fromPhoto || "",
      targetUserId,
      targetName: data.targetName || "Colecionador",
      type: data.type || "preset_message",
      messageKey: data.messageKey || "",
      messageText: data.messageText || data.message || "",
      status: data.status || "pending",
      responseKey: data.responseKey || "",
      responseText: data.responseText || data.response || "",
      replyToId: data.replyToId || "",
      createdAtMs: timestampToMillis(data.createdAt) || Number(data.createdAtClient || 0),
      respondedAtMs: timestampToMillis(data.respondedAt),
      updatedAtMs: timestampToMillis(data.updatedAt) || Number(data.createdAtClient || 0)
    };
  }

  function sortProfileMessages(messages) {
    return (messages || [])
      .slice()
      .sort((a, b) => Math.max(b.createdAtMs, b.updatedAtMs) - Math.max(a.createdAtMs, a.updatedAtMs))
      .slice(0, MESSAGE_INBOX_LIMIT);
  }

  function albumSnapshotFromFirebaseData(data) {
    const source = data && typeof data === "object" ? data : {};
    const album = source.album && typeof source.album === "object" ? sanitizeAlbumMap(source.album) : {};
    const updatedAt = Math.max(0, Number(source.clientUpdatedAt || source.albumUpdatedAt || timestampToMillis(source.atualizadoEm) || 0));
    return {
      album,
      updatedAt,
      cardUpdatedAt: normalizeAlbumCardUpdatedAt(album, updatedAt, source.albumCardUpdatedAt || source.cardUpdatedAt || {})
    };
  }

  function mergeAlbumSnapshots(remoteAlbum, remoteCardUpdatedAt, remoteUpdatedAt, localAlbum, localCardUpdatedAt, localUpdatedAt) {
    const cleanRemoteAlbum = sanitizeAlbumMap(remoteAlbum);
    const cleanLocalAlbum = sanitizeAlbumMap(localAlbum);
    const remoteTouches = normalizeAlbumCardUpdatedAt(cleanRemoteAlbum, remoteUpdatedAt, remoteCardUpdatedAt);
    const localTouches = normalizeAlbumCardUpdatedAt(cleanLocalAlbum, localUpdatedAt, localCardUpdatedAt);
    const mergedAlbum = {};
    const mergedCardUpdatedAt = {};
    let updatedAt = Math.max(0, Number(remoteUpdatedAt || 0), Number(localUpdatedAt || 0));
    cards.forEach(card => {
      const remoteQty = qtyFrom(cleanRemoteAlbum, card.id);
      const localQty = qtyFrom(cleanLocalAlbum, card.id);
      const remoteTouchedAt = Math.max(0, Number(remoteTouches[card.id] || 0));
      const localTouchedAt = Math.max(0, Number(localTouches[card.id] || 0));
      const nextTouchedAt = Math.max(remoteTouchedAt, localTouchedAt);
      let nextQty = Math.max(remoteQty, localQty);
      if (remoteTouchedAt > localTouchedAt) nextQty = remoteQty;
      else if (localTouchedAt > remoteTouchedAt) nextQty = localQty;
      if (nextQty > 0) mergedAlbum[card.id] = nextQty;
      if (nextTouchedAt > 0) mergedCardUpdatedAt[card.id] = nextTouchedAt;
      updatedAt = Math.max(updatedAt, nextTouchedAt);
    });
    return { album: mergedAlbum, cardUpdatedAt: mergedCardUpdatedAt, updatedAt };
  }

  function scheduleFirebaseAlbumSync() {
    if (!firebaseReady || !db || !currentUser || !currentUser.uid) return;
    if (albumSyncInFlight) albumSyncQueued = true;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      syncTimer = null;
      syncAlbumToFirebase();
    }, 80);
    schedulePublicProfileSync();
  }

  function flushAlbumSync() {
    clearTimeout(syncTimer);
    syncTimer = null;
    syncAlbumToFirebase();
  }

  async function syncAlbumToFirebase() {
    if (!firebaseReady || !db || !currentUser || !currentUser.uid) return;
    if (albumSyncInFlight) {
      albumSyncQueued = true;
      return albumSyncInFlight;
    }
    clearTimeout(syncTimer);
    syncTimer = null;
    const localUpdatedAt = readAlbumUpdatedAt() || Date.now();
    const resetAlbum = shouldResetAlbumForUserId(currentUser.uid);
    const localAlbum = resetAlbum ? {} : sanitizeAlbumMap(state.album);
    const localCardUpdatedAt = resetAlbum
      ? markAllAlbumCardsUpdated(localUpdatedAt)
      : normalizeAlbumCardUpdatedAt(localAlbum, localUpdatedAt, state.albumCardUpdatedAt);
    const albumRef = db.collection(FIREBASE_COLLECTIONS.albums).doc(currentUser.uid);
    albumSyncQueued = false;
    albumSyncInFlight = (async () => {
      let mergedSnapshot = { album: localAlbum, cardUpdatedAt: localCardUpdatedAt, updatedAt: localUpdatedAt };
      const saveSnapshot = snapshot => {
        const summary = albumStats(snapshot.album);
        return {
          uid: currentUser.uid,
          album: snapshot.album,
          albumCardUpdatedAt: snapshot.cardUpdatedAt,
          total: summary.total,
          owned: summary.owned,
          duplicates: summary.duplicates,
          progress: summary.progress,
          clientUpdatedAt: snapshot.updatedAt || Date.now(),
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        };
      };
      try {
        mergedSnapshot = await db.runTransaction(async transaction => {
          let snapshot = { album: localAlbum, cardUpdatedAt: localCardUpdatedAt, updatedAt: localUpdatedAt };
          const remoteDoc = await transaction.get(albumRef);
          if (remoteDoc.exists) {
            const remoteSnapshot = albumSnapshotFromFirebaseData(remoteDoc.data() || {});
            snapshot = mergeAlbumSnapshots(
              remoteSnapshot.album,
              remoteSnapshot.cardUpdatedAt,
              remoteSnapshot.updatedAt,
              localAlbum,
              localCardUpdatedAt,
              localUpdatedAt
            );
          }
          transaction.set(albumRef, saveSnapshot(snapshot));
          return snapshot;
        });
        const latestLocalUpdatedAt = readAlbumUpdatedAt();
        if (latestLocalUpdatedAt > localUpdatedAt) {
          albumSyncQueued = true;
          mergedSnapshot = mergeAlbumSnapshots(
            mergedSnapshot.album,
            mergedSnapshot.cardUpdatedAt,
            mergedSnapshot.updatedAt,
            state.album,
            normalizeAlbumCardUpdatedAt(state.album, latestLocalUpdatedAt, state.albumCardUpdatedAt),
            latestLocalUpdatedAt
          );
        }
        state.album = mergedSnapshot.album;
        state.albumCardUpdatedAt = mergedSnapshot.cardUpdatedAt;
        writeLocalAlbum(state.album, mergedSnapshot.updatedAt || Date.now(), state.albumCardUpdatedAt);
        render();
        await savePublicUserDoc();
      } catch (error) {
        console.warn("Nao foi possivel sincronizar album.", error);
        toast("Nao consegui salvar agora.");
      } finally {
        albumSyncInFlight = null;
        if (albumSyncQueued) {
          albumSyncQueued = false;
          syncAlbumToFirebase();
        }
      }
      return mergedSnapshot;
    })();
    return albumSyncInFlight;
  }

  async function loginGoogle() {
    if (!firebaseReady || !auth || !firebase.auth.GoogleAuthProvider) {
      toast("Login indisponivel agora.");
      return;
    }
    if (loginInProgress) return;
    loginInProgress = true;
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await auth.signInWithPopup(provider);
      toast("Google conectado.");
    } catch (error) {
      console.warn("Login Google falhou.", error);
      toast("Nao consegui conectar ao Google agora.");
    } finally {
      loginInProgress = false;
    }
  }

  async function logoutGoogle() {
    try {
      stopAlbumRealtimeSync();
      stopMessageRealtimeSync();
      if (auth) await auth.signOut();
      currentUser = null;
      guestAddClicks = 0;
      saveProfile(null);
      state.profileMessages = [];
      state.sentProfileMessages = [];
      updateAccountUi();
      renderProfileMessages();
      clearAdminAnalyticsMarkers();
      toast("Conta desconectada.");
    } catch (error) {
      console.warn("Logout falhou.", error);
      toast("Nao consegui desconectar agora.");
    }
  }

  function updateAccountUi() {
    const connected = Boolean(currentUser && currentUser.uid);
    const displayName = connected ? profileDisplayName(currentUser) : "";
    const userText = connected ? "Conectado: " + displayName : "Entre com Google para salvar seu perfil.";
    if (els["account-status"]) els["account-status"].textContent = userText;
    if (els["account-name-label"]) els["account-name-label"].textContent = displayName;
    if (els["account-photo-shell"]) els["account-photo-shell"].dataset.initials = initialsFromName(displayName || "N");
    if (els["account-summary"]) {
      els["account-summary"].hidden = !connected;
      els["account-summary"].classList.toggle("connected", connected);
    }
    if (els["account-photo-img"]) {
      els["account-photo-img"].onerror = () => {
        els["account-photo-img"].hidden = true;
        els["account-photo-img"].removeAttribute("src");
      };
      els["account-photo-img"].referrerPolicy = "no-referrer";
      if (connected && currentUser.photo) {
        els["account-photo-img"].src = currentUser.photo;
        els["account-photo-img"].alt = displayName;
        els["account-photo-img"].hidden = false;
      } else {
        els["account-photo-img"].removeAttribute("src");
        els["account-photo-img"].alt = "";
        els["account-photo-img"].hidden = true;
      }
    }
    const topLoginButton = document.getElementById("google-login");
    if (topLoginButton) topLoginButton.classList.toggle("connected", connected);
    const settingsLoginButton = document.getElementById("settings-google-login");
    if (settingsLoginButton) {
      settingsLoginButton.hidden = connected;
      settingsLoginButton.textContent = "Entrar com Google";
      settingsLoginButton.classList.toggle("connected", connected);
    }
    updateMessageBadges();
    updateAdminUi();
  }

  function isAdminUser() {
    return String(currentUser && currentUser.email || "").trim().toLowerCase() === ADMIN_EMAIL;
  }

  function updateAdminUi() {
    const admin = isAdminUser();
    ["admin-metrics-open", "admin-metrics-account-open", "admin-event-open", "admin-event-account-open"].forEach(id => {
      if (els[id]) els[id].hidden = !admin;
    });
    document.body.classList.toggle("admin-user", admin);
    if (!admin && els["admin-metrics-dialog"] && els["admin-metrics-dialog"].open) {
      els["admin-metrics-dialog"].close();
    }
    if (!admin && els["admin-event-dialog"] && els["admin-event-dialog"].open) {
      els["admin-event-dialog"].close();
    }
  }

  function startAnalyticsTracking() {
    if (analyticsStarted) return;
    analyticsStarted = true;
    state.sessionStartedAtMs = Date.now();
    setTimeout(recordVisitMetric, 700);
    setInterval(() => recordSessionDurationMetric("heartbeat"), 30000);
  }

  function recordVisitMetric() {
    if (state.metricsVisitRecorded) return;
    state.metricsVisitRecorded = true;
    const summary = stats();
    recordAnalyticsEvent("visit", {
      albumOwned: summary.owned,
      albumDuplicates: summary.duplicates
    });
  }

  function recordAlbumSaveMetric() {
    const now = Date.now();
    if (now - lastAlbumSaveMetricAt < ALBUM_SAVE_METRIC_INTERVAL_MS) return;
    lastAlbumSaveMetricAt = now;
    const summary = stats();
    recordAnalyticsEvent("album_save", {
      albumOwned: summary.owned,
      albumDuplicates: summary.duplicates
    });
  }

  function recordSessionDurationMetric(reason) {
    if (!analyticsStarted) return;
    const now = Date.now();
    if (now - state.lastSessionMetricMs < 25000 && reason !== "close") return;
    if (document.visibilityState === "hidden" && reason === "heartbeat") return;
    state.lastSessionMetricMs = now;
    recordAnalyticsEvent("session_duration", {
      action: String(reason || "heartbeat").slice(0, 40),
      durationSeconds: Math.max(1, Math.round((now - state.sessionStartedAtMs) / 1000)),
      pageVisible: document.visibilityState !== "hidden"
    });
  }

  async function recordAnalyticsEvent(type, extra = {}) {
    if (!firebaseReady || !db || !firebase.firestore || !FIREBASE_COLLECTIONS.analytics) return;
    try {
      const now = Date.now();
      const date = new Date(now);
      const payload = {
        app: "nexo-card",
        type: String(type || "event").slice(0, 48),
        authState: currentUser && currentUser.uid ? "google" : "guest",
        sessionId: state.analyticsSessionId,
        day: date.toISOString().slice(0, 10),
        hourKey: date.toISOString().slice(0, 13),
        weekKey: weekKey(date),
        monthKey: date.toISOString().slice(0, 7),
        yearKey: String(date.getFullYear()),
        userId: currentUser && currentUser.uid ? currentUser.uid : "",
        userEmail: currentUser && currentUser.email ? String(currentUser.email).toLowerCase() : "",
        language: String(navigator.language || "").slice(0, 40),
        browser: detectBrowser(),
        os: detectOs(),
        referrer: String(document.referrer || "").slice(0, 180),
        clientCreatedAt: now,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      Object.entries(extra || {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (typeof value === "number") payload[key] = Number.isFinite(value) ? value : 0;
        else if (typeof value === "boolean") payload[key] = value;
        else payload[key] = String(value).slice(0, 180);
      });
      await db.collection(FIREBASE_COLLECTIONS.analytics).add(payload);
    } catch (error) {}
  }

  function detectBrowser() {
    const ua = navigator.userAgent || "";
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\//.test(ua)) return "Opera";
    if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
    if (/Firefox\//.test(ua)) return "Firefox";
    return "Outro";
  }

  function detectOs() {
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac OS X/i.test(ua)) return "Mac";
    if (/Linux/i.test(ua)) return "Linux";
    return "Outro";
  }

  function weekKey(date) {
    const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = copy.getUTCDay() || 7;
    copy.setUTCDate(copy.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((copy - yearStart) / 86400000) + 1) / 7);
    return copy.getUTCFullYear() + "-S" + String(week).padStart(2, "0");
  }

  async function loadAdminMapAnalytics() {
    if (!isAdminUser() || !firebaseReady || !db) {
      clearAdminAnalyticsMarkers();
      return;
    }
    try {
      const snapshot = await db.collection(FIREBASE_COLLECTIONS.analytics)
        .orderBy("createdAt", "desc")
        .limit(500)
        .get();
      state.adminAnalyticsEvents = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }))
        .filter(item => item.app === "nexo-card" || !item.app);
      renderAdminAnalyticsMarkers();
    } catch (error) {
      console.warn("Nao foi possivel carregar metricas do mapa.", error);
    }
  }

  function renderAdminAnalyticsMarkers(events = state.adminAnalyticsEvents) {
    clearAdminAnalyticsMarkers();
    if (!isAdminUser() || !leafletMap || !window.L) return;
    events
      .filter(item => item.type === "gps_location" && Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng)))
      .slice(0, 300)
      .forEach(item => {
        const point = jitterLatLng(Number(item.lat), Number(item.lng), item.id || item.sessionId || "", 0.018);
        const marker = L.circleMarker(point, {
          radius: 7,
          color: "#ffffff",
          weight: 2,
          fillColor: "#2563eb",
          fillOpacity: 0.82
        }).addTo(leafletMap);
        marker.bindTooltip(adminLocationLabel(item), { direction: "top" });
        leafletMarkers.analytics.push(marker);
      });
  }

  function clearAdminAnalyticsMarkers() {
    if (leafletMarkers.analytics && leafletMarkers.analytics.length) clearLeafletMarkers(leafletMarkers.analytics);
  }

  function jitterLatLng(lat, lng, seed, amount) {
    const hash = hashText(seed || String(lat) + "," + String(lng));
    const angle = (hash % 360) * Math.PI / 180;
    const distance = ((hash % 100) / 100) * amount;
    return [lat + Math.sin(angle) * distance, lng + Math.cos(angle) * distance];
  }

  function adminLocationLabel(item) {
    const when = formatMetricDate(getEventMs(item));
    const source = item.locationKind === "manual" ? "GPS manual" : "GPS";
    return source + (when ? " - " + when : "");
  }

  async function openAdminMetrics(mode = "hour") {
    if (!isAdminUser()) {
      toast("Apenas o dono pode ver metricas.");
      return;
    }
    state.adminMetricsMode = mode;
    if (els["admin-metrics-dialog"] && !els["admin-metrics-dialog"].open) els["admin-metrics-dialog"].showModal();
    document.querySelectorAll("[data-admin-metrics-mode]").forEach(button => {
      button.classList.toggle("active", button.dataset.adminMetricsMode === mode);
    });
    if (els["admin-metrics-grid"]) els["admin-metrics-grid"].innerHTML = "";
    if (els["admin-metrics-chart"]) els["admin-metrics-chart"].innerHTML = "";
    if (els["admin-metrics-sections"]) els["admin-metrics-sections"].innerHTML = "";
    if (els["admin-metrics-note"]) els["admin-metrics-note"].textContent = "Carregando metricas...";
    try {
      const range = metricRangeForMode(mode);
      const events = await loadAnalyticsEventsSince(range.startMs);
      const publicEvents = publicMetricEvents(events);
      state.adminAnalyticsEvents = events;
      renderAdminMetrics(publicEvents, mode, range);
      renderAdminAnalyticsMarkers(events);
    } catch (error) {
      console.warn("Nao foi possivel carregar metricas.", error);
      if (els["admin-metrics-note"]) els["admin-metrics-note"].textContent = "Nao consegui carregar as metricas agora.";
    }
  }

  async function loadAnalyticsEventsSince(startMs) {
    const events = [];
    let lastDoc = null;
    while (true) {
      let query = db.collection(FIREBASE_COLLECTIONS.analytics)
        .where("createdAt", ">=", firebase.firestore.Timestamp.fromMillis(startMs))
        .orderBy("createdAt", "desc")
        .limit(1200);
      if (lastDoc) query = query.startAfter(lastDoc);
      const snapshot = await query.get();
      snapshot.docs.forEach(doc => {
        const data = doc.data() || {};
        if (data.app === "nexo-card" || !data.app) events.push({ id: doc.id, ...data });
      });
      if (snapshot.docs.length < 1200) break;
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
    }
    return events;
  }

  function publicMetricEvents(events) {
    const adminSessions = new Set(events
      .filter(item => String(item.userEmail || "").toLowerCase() === ADMIN_EMAIL)
      .map(item => item.sessionId)
      .filter(Boolean));
    return events.filter(item => {
      if (String(item.userEmail || "").toLowerCase() === ADMIN_EMAIL) return false;
      if (item.sessionId && adminSessions.has(item.sessionId)) return false;
      return true;
    });
  }

  function renderAdminMetrics(events, mode, range) {
    const visits = events.filter(item => item.type === "visit");
    const saves = events.filter(item => item.type === "album_save");
    const gps = events.filter(item => item.type === "gps_location");
    const logins = events.filter(item => item.type === "google_login");
    const trades = events.filter(item => item.type === "trade_confirmed");
    const sessionSummary = sessionDurationSummary(events);
    const uniqueSessions = new Set(events.map(item => item.sessionId).filter(Boolean)).size;
    const savedSessions = new Set(saves.map(item => item.userId || item.sessionId).filter(Boolean)).size;
    const cards = [
      ["Acessos", visits.length],
      ["Pessoas", uniqueSessions],
      ["Salvaram", savedSessions],
      ["Eventos de salvar", saves.length],
      ["GPS aceitos", gps.length],
      ["Logins Google", logins.length],
      ["Tempo medio", formatDuration(sessionSummary.averageSeconds)],
      ["Trocas confirmadas", trades.length]
    ];
    if (els["admin-metrics-grid"]) {
      els["admin-metrics-grid"].innerHTML = cards.map(item =>
        '<div><strong>' + escapeHtml(item[1]) + '</strong><span>' + escapeHtml(item[0]) + '</span></div>'
      ).join("");
    }
    renderAdminMetricsChart(visits, mode, range);
    renderAdminMetricsSections(events, visits, gps, sessionSummary);
    if (els["admin-metrics-note"]) {
      els["admin-metrics-note"].textContent = "Periodo: " + range.label + ". Eventos lidos: " + events.length + ". O dono nao entra nas metricas publicas.";
    }
  }

  function metricRangeForMode(mode) {
    const now = Date.now();
    if (mode === "day") return { startMs: now - 14 * 86400000, bucketCount: 14, label: "ultimos 14 dias" };
    if (mode === "week") return { startMs: now - 12 * 7 * 86400000, bucketCount: 12, label: "ultimas 12 semanas" };
    if (mode === "month") return { startMs: now - 366 * 86400000, bucketCount: 12, label: "ultimos 12 meses" };
    if (mode === "year") return { startMs: now - 5 * 366 * 86400000, bucketCount: 5, label: "ultimos 5 anos" };
    return { startMs: now - 24 * 3600000, bucketCount: 24, label: "ultimas 24 horas" };
  }

  function renderAdminMetricsChart(visits, mode, range) {
    if (!els["admin-metrics-chart"]) return;
    const buckets = metricBuckets(mode, range.bucketCount);
    const counts = buckets.map(bucket => visits.filter(item => {
      const ms = getEventMs(item);
      return ms >= bucket.start && ms < bucket.end;
    }).length);
    const max = Math.max(1, ...counts);
    els["admin-metrics-chart"].classList.toggle("compact", mode === "hour" || mode === "day");
    els["admin-metrics-chart"].innerHTML = buckets.map((bucket, index) => {
      const count = counts[index];
      const height = Math.max(18, Math.round((count / max) * 134));
      const tooltip = bucket.tooltip + " - " + count + " acesso" + (count === 1 ? "" : "s");
      return '<span class="admin-chart-bar" title="' + escapeHtml(tooltip) + '" style="height:' + height + 'px">' +
        '<b class="admin-bar-value">' + escapeHtml(count) + '</b>' +
        '<small>' + escapeHtml(bucket.label) + '</small>' +
      '</span>';
    }).join("");
  }

  function metricBuckets(mode, count) {
    const now = new Date();
    if (mode === "hour") {
      return Array.from({ length: count }, (_, rawIndex) => {
        const index = count - rawIndex - 1;
        const start = new Date(now);
        start.setMinutes(0, 0, 0);
        start.setHours(now.getHours() - index);
        const end = new Date(start.getTime() + 3600000);
        return {
          start: start.getTime(),
          end: end.getTime(),
          label: String(start.getHours()).padStart(2, "0") + "h",
          tooltip: start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + String(start.getHours()).padStart(2, "0") + "h"
        };
      });
    }
    if (mode === "week") {
      return Array.from({ length: count }, (_, rawIndex) => {
        const index = count - rawIndex - 1;
        const end = new Date(now.getTime() - index * 7 * 86400000);
        const start = new Date(end.getTime() - 7 * 86400000);
        return {
          start: start.getTime(),
          end: rawIndex === count - 1 ? Date.now() + 1 : end.getTime(),
          label: start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          tooltip: start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " a " + end.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
        };
      });
    }
    if (mode === "month") {
      return Array.from({ length: count }, (_, rawIndex) => {
        const start = new Date(now.getFullYear(), now.getMonth() - count + rawIndex + 1, 1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        return {
          start: start.getTime(),
          end: rawIndex === count - 1 ? Date.now() + 1 : end.getTime(),
          label: start.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
          tooltip: start.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        };
      });
    }
    if (mode === "year") {
      return Array.from({ length: count }, (_, rawIndex) => {
        const year = now.getFullYear() - count + rawIndex + 1;
        return {
          start: new Date(year, 0, 1).getTime(),
          end: rawIndex === count - 1 ? Date.now() + 1 : new Date(year + 1, 0, 1).getTime(),
          label: String(year),
          tooltip: String(year)
        };
      });
    }
    return Array.from({ length: count }, (_, rawIndex) => {
      const index = count - rawIndex - 1;
      const end = new Date(now.getTime() - index * 86400000);
      const start = new Date(end);
      start.setHours(0, 0, 0, 0);
      const next = new Date(start.getTime() + 86400000);
      return {
        start: start.getTime(),
        end: rawIndex === count - 1 ? Date.now() + 1 : next.getTime(),
        label: start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        tooltip: start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      };
    });
  }

  function renderAdminMetricsSections(events, visits, gps, sessionSummary) {
    if (!els["admin-metrics-sections"]) return;
    const byOs = topCounts(visits, item => item.os || "Outro", 5);
    const byBrowser = topCounts(visits, item => item.browser || "Outro", 5);
    const gpsRows = gps.slice(0, 8).map(item => [adminLocationLabel(item), formatMetricCoord(item)]);
    els["admin-metrics-sections"].innerHTML =
      adminMetricTable("Acessos por sistema", byOs) +
      adminMetricTable("Acessos por navegador", byBrowser) +
      adminMetricTable("Bolinhas de GPS recentes", gpsRows.length ? gpsRows : [["Nenhum GPS salvo ainda", ""]]) +
      '<div class="admin-metrics-detail"><strong>Tempo total estimado</strong><span>' + escapeHtml(formatDuration(sessionSummary.totalSeconds)) + '</span></div>';
  }

  function adminMetricTable(title, rows) {
    return '<section class="admin-metrics-section"><h3>' + escapeHtml(title) + '</h3>' +
      '<table><tbody>' + rows.map(row => '<tr><td>' + escapeHtml(row[0]) + '</td><td>' + escapeHtml(row[1]) + '</td></tr>').join("") + '</tbody></table>' +
    '</section>';
  }

  function topCounts(items, getLabel, limit) {
    const counts = new Map();
    items.forEach(item => {
      const label = String(getLabel(item) || "Nao identificado");
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
  }

  function sessionDurationSummary(events) {
    const bySession = new Map();
    events.filter(item => item.type === "session_duration" && item.sessionId).forEach(item => {
      const seconds = Math.max(0, Number(item.durationSeconds) || 0);
      const current = bySession.get(item.sessionId) || 0;
      if (seconds > current) bySession.set(item.sessionId, seconds);
    });
    const durations = Array.from(bySession.values());
    const totalSeconds = durations.reduce((sum, value) => sum + value, 0);
    return {
      totalSeconds,
      averageSeconds: durations.length ? Math.round(totalSeconds / durations.length) : 0
    };
  }

  function getEventMs(item) {
    const createdAt = item && item.createdAt;
    if (createdAt && typeof createdAt.toMillis === "function") return createdAt.toMillis();
    if (createdAt && typeof createdAt.seconds === "number") return createdAt.seconds * 1000;
    return Math.max(0, Number(item && item.clientCreatedAt || 0));
  }

  function formatDuration(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    if (total < 60) return total + "s";
    const minutes = Math.floor(total / 60);
    if (minutes < 60) return minutes + "min";
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours + "h" + (rest ? " " + rest + "min" : "");
  }

  function formatMetricDate(ms) {
    if (!ms) return "";
    return new Date(ms).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function formatMetricCoord(item) {
    const lat = Number(item && item.lat);
    const lng = Number(item && item.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
    return lat.toFixed(3) + ", " + lng.toFixed(3);
  }

  function normalizeUsername(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^@+/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_{2,}/g, "_")
      .slice(0, 20);
  }

  function usernameFromProfile(profile) {
    return normalizeUsername(profile && (profile.usernameLower || profile.username || profile.usuario || ""));
  }

  function usernameLabel(profile) {
    const username = usernameFromProfile(profile);
    return username ? "@" + username : "";
  }

  function usernameCandidateFromProfile(profile) {
    const source = [
      profile && profile.nickname,
      profile && profile.apelido,
      profile && profile.name,
      profile && profile.nome,
      profile && profile.email ? String(profile.email).split("@")[0] : ""
    ].find(Boolean);
    const base = normalizeUsername(source || "colecionador");
    return base.length >= 2 ? base : "colecionador";
  }

  function profileDisplayName(profile) {
    return usernameLabel(profile) || (profile && (profile.nickname || profile.apelido || profile.name || profile.nome || profile.email)) || "Colecionador";
  }

  function firstName(name) {
    return String(name || "Google").trim().split(/\s+/)[0] || "Google";
  }

  function openAccountSettings() {
    if (!currentUser || !currentUser.uid) {
      loginGoogle();
      return;
    }
    if (els["profile-name-input"]) els["profile-name-input"].value = currentUser && currentUser.name ? currentUser.name : "";
    if (els["profile-username-input"]) els["profile-username-input"].value = usernameFromProfile(currentUser) || usernameCandidateFromProfile(currentUser);
    if (els["profile-nickname-input"]) els["profile-nickname-input"].value = currentUser && currentUser.nickname ? currentUser.nickname : "";
    if (els["profile-instagram-input"]) els["profile-instagram-input"].value = currentUser && currentUser.instagram ? instagramUsername(currentUser) : "";
    if (els["profile-photo-preview"]) {
      if (currentUser && currentUser.photo) {
        els["profile-photo-preview"].src = currentUser.photo;
        els["profile-photo-preview"].alt = profileDisplayName(currentUser);
        els["profile-photo-preview"].hidden = false;
      } else {
        els["profile-photo-preview"].hidden = true;
        els["profile-photo-preview"].removeAttribute("src");
      }
    }
    renderProfileMessages();
    if (els["account-dialog"] && !els["account-dialog"].open) els["account-dialog"].showModal();
  }

  async function saveProfileSettings() {
    if (!currentUser || !currentUser.uid) {
      toast("Entre com Google para salvar seu perfil.");
      return;
    }
    const name = (els["profile-name-input"] && els["profile-name-input"].value.trim()) || currentUser.name || "Colecionador";
    const nickname = (els["profile-nickname-input"] && els["profile-nickname-input"].value.trim()) || "";
    const typedUsername = els["profile-username-input"] && els["profile-username-input"].value.trim();
    const username = normalizeUsername(typedUsername) || usernameCandidateFromProfile({ name, nickname, email: currentUser.email });
    const instagram = (els["profile-instagram-input"] && els["profile-instagram-input"].value.trim().replace(/^@+/, "")) || "";
    if (username.length < 2) {
      toast("Use um usuario com pelo menos 2 caracteres.");
      return;
    }
    try {
      await reserveUsername(username);
    } catch (error) {
      if (error && error.message === "username_indisponivel") {
        toast("Este usuario ja esta em uso.");
      } else if (error && error.message === "firebase_indisponivel") {
        toast("Conta indisponivel para reservar usuario.");
      } else {
        toast("Nao consegui reservar este usuario.");
      }
      return;
    }
    currentUser.name = name;
    currentUser.nickname = nickname;
    currentUser.username = username;
    currentUser.usernameLower = username;
    currentUser.instagram = instagram;
    saveProfile(currentUser);
    updateAccountUi();
    renderMap();
    await saveUserDoc();
    await savePublicUserDoc();
    if (els["account-dialog"]) els["account-dialog"].close();
    toast("Perfil salvo.");
  }

  async function loadPublicProfileForCurrentUser() {
    if (!db || !currentUser || !currentUser.uid) return;
    try {
      const doc = await db.collection(FIREBASE_COLLECTIONS.publicUsers).doc(currentUser.uid).get();
      if (!doc.exists) return;
      const data = doc.data() || {};
      currentUser.name = data.nome || currentUser.name || "Colecionador";
      currentUser.nickname = data.apelido || currentUser.nickname || "";
      currentUser.username = usernameFromProfile(data) || currentUser.username || "";
      currentUser.usernameLower = usernameFromProfile(data) || currentUser.usernameLower || "";
      currentUser.instagram = data.instagram || currentUser.instagram || "";
      currentUser.tradeReputation = normalizeReputation(data.reputacaoTroca || data.tradeReputation || data.reputation || currentUser.tradeReputation);
      currentUser.officialBadges = normalizeOfficialBadgeIds(data.officialBadges || data.badges || currentUser.officialBadges);
      mergeOfficialBadges(currentUser.officialBadges);
      currentUser.officialBadges = officialBadgeIdsForCurrentUser();
      if (validLocation(data.location) && !state.myLocation) {
        saveApproxLocation(locationFromData(data.location));
      }
      saveProfile(currentUser);
      updateAccountUi();
    } catch (error) {
      console.warn("Nao foi possivel carregar perfil publico.", error);
    }
  }

  function schedulePublicProfileSync() {
    if (!firebaseReady || !db || !currentUser || !currentUser.uid) return;
    clearTimeout(publicProfileTimer);
    publicProfileTimer = setTimeout(() => savePublicUserDoc(), 1200);
  }

  async function savePublicUserDoc(options = {}) {
    if (!firebaseReady || !db || !currentUser || !currentUser.uid) return;
    const albumUpdatedAt = readAlbumUpdatedAt() || Date.now();
    const publishAlbum = shouldResetAlbumForUserId(currentUser.uid)
      ? {}
      : sanitizeAlbumMap(state.album);
    const publishAlbumCardUpdatedAt = shouldResetAlbumForUserId(currentUser.uid)
      ? markAllAlbumCardsUpdated(albumUpdatedAt)
      : normalizeAlbumCardUpdatedAt(publishAlbum, albumUpdatedAt, state.albumCardUpdatedAt);
    const summary = albumStats(publishAlbum);
    const location = validLocation(state.myLocation) ? locationFromData(state.myLocation) : null;
    const reputation = normalizeReputation(currentUser.tradeReputation || currentUser.reputation);
    const officialBadgeIds = officialBadgeIdsForCurrentUser();
    const reward = profileXpSummary({
      id: "me",
      album: publishAlbum,
      tradeReputation: reputation,
      officialBadges: officialBadgeIds
    }, summary);
    const payload = {
      uid: currentUser.uid,
      nome: currentUser.name || "Colecionador",
      apelido: currentUser.nickname || "",
      username: usernameFromProfile(currentUser),
      usernameLower: usernameFromProfile(currentUser),
      instagram: profileInstagram(currentUser),
      foto: currentUser.photo || "",
      officialBadges: officialBadgeIds,
      badges: officialBadgeIds,
      xp: reward.totalXp,
      level: reward.level,
      lastOnlineAt: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (location) {
      payload.location = location;
      payload.locationUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    const albumPayload = options.locationOnly ? null : {
      album: publishAlbum,
      albumCardUpdatedAt: publishAlbumCardUpdatedAt,
      total: summary.total,
      owned: summary.owned,
      duplicates: summary.duplicates,
      progress: summary.progress,
      albumUpdatedAt
    };
    if (hasReputation(reputation)) payload.reputacaoTroca = reputation;
    try {
      const publicRef = db.collection(FIREBASE_COLLECTIONS.publicUsers).doc(currentUser.uid);
      await publicRef.set(payload, { merge: true });
      if (albumPayload) await publicRef.update(albumPayload);
    } catch (error) {
      console.warn("Nao foi possivel salvar perfil publico.", error);
    }
  }

  function watchPublicCollectors() {
    if (!db || publicUsersUnsubscribe) return;
    try {
      publicUsersUnsubscribe = db.collection(FIREBASE_COLLECTIONS.publicUsers)
        .orderBy("lastOnlineAt", "desc")
        .limit(80)
        .onSnapshot(snapshot => {
          const liveUsers = snapshot.docs
            .map(doc => publicUserFromDoc(doc))
            .filter(Boolean)
            .filter(user => !currentUser || user.id !== currentUser.uid);
          collectorUsers = collectorsWithDemo(liveUsers);
          renderMap();
          renderUserSearchResults();
          if (els["nearby-dialog"] && els["nearby-dialog"].open) renderNearbyCollectors();
        }, error => {
          console.warn("Nao foi possivel acompanhar colecionadores.", error);
          collectorUsers = collectorsWithDemo([]);
          renderMap();
          renderUserSearchResults();
          if (els["nearby-dialog"] && els["nearby-dialog"].open) renderNearbyCollectors();
        });
    } catch (error) {
      console.warn("Mapa publico indisponivel.", error);
      collectorUsers = collectorsWithDemo([]);
      renderMap();
      renderUserSearchResults();
    }
  }

  function watchCommunityMeetingEvent() {
    if (!db || meetingEventUnsubscribe) return;
    try {
      meetingEventUnsubscribe = db.collection(FIREBASE_COLLECTIONS.settings)
        .doc(COMMUNITY_MEETING_DOC_ID)
        .onSnapshot(doc => {
          applyCommunityMeetingEvent(doc.exists ? doc.data() : DEFAULT_COMMUNITY_MEETING_EVENT);
        }, error => {
          console.warn("Encontro comunitario indisponivel.", error);
        });
    } catch (error) {
      console.warn("Nao foi possivel acompanhar encontro comunitario.", error);
    }
  }

  function openAdminEventDialog() {
    if (!isAdminUser()) {
      toast("Apenas o dono pode configurar o encontro.");
      return;
    }
    const startAt = STICKER_EVENT.enabled && isCommunityMeetingVisible() && STICKER_EVENT.startAt ? STICKER_EVENT.startAt : Date.now() + 86400000;
    if (els["admin-event-date"]) els["admin-event-date"].value = dateInputValue(startAt);
    if (els["admin-event-time"]) els["admin-event-time"].value = timeInputValue(startAt);
    updateAdminEventPreview();
    if (els["admin-event-dialog"] && !els["admin-event-dialog"].open) els["admin-event-dialog"].showModal();
  }

  function updateAdminEventPreview() {
    if (!els["admin-event-preview"]) return;
    const startAt = adminEventInputStartAt();
    els["admin-event-preview"].textContent = startAt ? formatCountdown(Math.max(0, startAt - Date.now())) : "--:--:--:--";
  }

  function adminEventInputStartAt() {
    const date = els["admin-event-date"] && els["admin-event-date"].value;
    const time = els["admin-event-time"] && els["admin-event-time"].value;
    if (!date || !time) return 0;
    const parsed = new Date(date + "T" + time);
    const startAt = parsed.getTime();
    return Number.isFinite(startAt) ? startAt : 0;
  }

  async function saveAdminCommunityMeeting() {
    if (!isAdminUser()) {
      toast("Apenas o dono pode configurar o encontro.");
      return;
    }
    const startAt = adminEventInputStartAt();
    if (!startAt) {
      toast("Preencha dia e hora do encontro.");
      return;
    }
    const event = {
      enabled: true,
      pointId: STICKER_EVENT.pointId,
      title: "Proximo evento",
      place: "Estacionamento 10 do Parque da Cidade",
      schedule: formatMeetingSchedule(startAt),
      startAt,
      endAt: startAt + COMMUNITY_MEETING_DURATION_MS,
      updatedAt: Date.now()
    };
    applyCommunityMeetingEvent(event);
    try {
      if (!firebaseReady || !db) throw new Error("firebase_indisponivel");
      await db.collection(FIREBASE_COLLECTIONS.settings).doc(COMMUNITY_MEETING_DOC_ID).set({
        ...event,
        updatedBy: currentUser && currentUser.email ? String(currentUser.email).toLowerCase() : "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      toast("Encontro ativado no Estacionamento 10.");
    } catch (error) {
      console.warn("Nao foi possivel publicar encontro comunitario.", error);
      toast("Encontro ativado neste aparelho; nao consegui publicar agora.");
    }
    if (els["admin-event-dialog"]) els["admin-event-dialog"].close();
  }

  async function clearAdminCommunityMeeting() {
    if (!isAdminUser()) {
      toast("Apenas o dono pode configurar o encontro.");
      return;
    }
    applyCommunityMeetingEvent(null);
    try {
      if (!firebaseReady || !db) throw new Error("firebase_indisponivel");
      await db.collection(FIREBASE_COLLECTIONS.settings).doc(COMMUNITY_MEETING_DOC_ID).set({
        enabled: false,
        startAt: 0,
        endAt: 0,
        schedule: "",
        updatedBy: currentUser && currentUser.email ? String(currentUser.email).toLowerCase() : "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      toast("Encontro desativado.");
    } catch (error) {
      console.warn("Nao foi possivel desativar encontro comunitario.", error);
      toast("Encontro removido deste aparelho; nao consegui publicar agora.");
    }
    if (els["admin-event-dialog"]) els["admin-event-dialog"].close();
  }

  function dateInputValue(ms) {
    const date = new Date(ms);
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
  }

  function timeInputValue(ms) {
    const date = new Date(ms);
    return pad2(date.getHours()) + ":" + pad2(date.getMinutes());
  }

  function formatMeetingSchedule(ms) {
    const date = new Date(ms);
    return pad2(date.getDate()) + "/" + pad2(date.getMonth() + 1) + "/" + date.getFullYear() + " " + pad2(date.getHours()) + ":" + pad2(date.getMinutes());
  }

  function sameLocalDate(a, b) {
    const first = new Date(a);
    const second = new Date(b);
    return first.getFullYear() === second.getFullYear()
      && first.getMonth() === second.getMonth()
      && first.getDate() === second.getDate();
  }

  function publicUserFromDoc(doc) {
    const data = doc.data() || {};
    const location = validLocation(data.location) ? locationFromData(data.location) : null;
    if (!location) return null;
    const id = data.uid || doc.id;
    const username = usernameFromProfile(data);
    const name = profileDisplayName({ username, usernameLower: username, nickname: data.apelido, name: data.nome }) || "Colecionador";
    const resetAlbum = shouldResetAlbumForUserId(id);
    return {
      id,
      name,
      username,
      usernameLower: username,
      instagram: data.instagram || "",
      lat: location.lat,
      lng: location.lng,
      x: Number(location.x || 52),
      y: Number(location.y || 55),
      accuracy: location.accuracy,
      hasLocation: true,
      initials: initialsFromName(name),
      photo: data.foto || "",
      colors: userColors(id),
      album: resetAlbum ? {} : sanitizeAlbumMap(data.album || {}),
      tradeReputation: normalizeReputation(data.reputacaoTroca || data.tradeReputation || data.reputation),
      profileViewsTotal: normalizeProfileViews(data.profileViews || data.profileViewsPublic || data.views).total,
      officialBadges: normalizeOfficialBadgeIds(data.officialBadges || data.badges),
      xp: Math.max(0, Math.round(Number(data.xp || data.rewardXp || 0))),
      level: Math.max(0, Math.round(Number(data.level || 0))),
      lastOnlineMs: timestampToMillis(data.lastOnlineAt || data.atualizadoEm)
    };
  }

  function shouldResetAlbumForUserId(userId) {
    return RESET_ALBUM_USER_IDS.has(String(userId || ""));
  }

  function userColors(seed) {
    return teamPalette[hashText(seed || "user") % teamPalette.length];
  }

  function timestampToMillis(value) {
    if (!value) return 0;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.seconds === "number") return value.seconds * 1000;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function locationFromData(location) {
    return {
      lat: Number(location.lat),
      lng: Number(location.lng),
      x: Number.isFinite(Number(location.x)) ? Number(location.x) : latLngToPercent(Number(location.lat), Number(location.lng)).x,
      y: Number.isFinite(Number(location.y)) ? Number(location.y) : latLngToPercent(Number(location.lat), Number(location.lng)).y,
      accuracy: Math.max(120, Math.min(900, Number(location.accuracy || 180))),
      updatedAt: Math.max(0, Number(location.updatedAt || Date.now()))
    };
  }

  function initLeafletMap() {
    if (!els["collector-map"] || !window.L) {
      if (els["map-fallback"]) els["map-fallback"].hidden = false;
      return;
    }
    leafletMap = L.map(els["collector-map"], {
      zoomAnimation: true,
      markerZoomAnimation: true,
      zoomControl: true,
      attributionControl: false
    }).setView(MAP_CENTER, 14.4);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20
    }).addTo(leafletMap);
    L.imageOverlay(MAP_OVERLAY_URL, MAP_BOUNDS, { opacity: 0.35 }).addTo(leafletMap);
    leafletMap.fitBounds(MAP_BOUNDS, { padding: [8, 8] });
    leafletMap.on("zoomend moveend", syncLeafletMarkerZoom);
    setTimeout(syncLeafletMarkerZoom, 0);
  }

  function clearLeafletMarkers(list) {
    list.forEach(marker => marker.remove());
    list.length = 0;
  }

  function renderLeafletMarkers(users) {
    if (!leafletMap) return;
    clearLeafletMarkers(leafletMarkers.points);
    clearLeafletMarkers(leafletMarkers.collectors);

    tradePoints.forEach(point => {
      const isEventPoint = point.id === STICKER_EVENT.pointId && isCommunityMeetingVisible();
      const pointPlayers = usersForPoint(point, users);
      const marker = L.marker([point.lat, point.lng], {
        icon: L.divIcon({
          className: "official-location-marker" + (isEventPoint ? " event-location-marker" : ""),
          html: officialPointHtml(point, isEventPoint, pointPlayers.length),
          iconSize: [1, 1],
          iconAnchor: [0, 0]
        }),
        zIndexOffset: isEventPoint ? 620 : 100
      }).addTo(leafletMap);
      marker.pointId = point.id;
      marker.bindPopup(pointPopupHtml(point, isEventPoint, pointPlayers), { closeButton: true });
      leafletMarkers.points.push(marker);
    });

    users.forEach(user => {
      const latlng = userLatLng(user);
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          className: "collector-location-marker",
          html: collectorMarkerHtml(user),
          iconSize: [1, 1],
          iconAnchor: [0, 0]
        }),
        zIndexOffset: user.id === "me" ? 420 : 300
      }).addTo(leafletMap);
      marker.bindPopup(collectorPopupHtml(user), { closeButton: true });
      marker.on("click", () => openProfile(user.id));
      leafletMarkers.collectors.push(marker);
    });
    syncLeafletMarkerZoom();
    renderAdminAnalyticsMarkers();
  }

  function officialPointHtml(point, isEventPoint, nearbyCount) {
    const badge = nearbyCount > 0
      ? '<span class="official-online-count" aria-label="' + nearbyCount + ' usuario perto">' + nearbyCount + '</span>'
      : "";
    const timer = isEventPoint
      ? '<span class="event-point-timer" data-event-timer-inline>' + escapeHtml(eventCountdownLabel()) + '</span>'
      : "";
    return (
      '<button class="official-pin' + (isEventPoint ? " event-point-pin" : "") + '" type="button" aria-label="' + escapeHtml(point.name) + '" title="' + escapeHtml(point.name) + '">' +
        '<span class="official-point-badge"><img src="' + OFFICIAL_POINT_ICON_URL + '" alt=""></span>' +
        '<span class="official-mini-cube"><i></i></span>' +
        badge +
        timer +
      '</button>'
    );
  }

  function pointPopupHtml(point, isEventPoint, pointPlayers) {
    if (isEventPoint) return eventPointPopupHtml(point, pointPlayers);
    return (
      '<div class="location-card point-location-card">' +
        '<strong>' + escapeHtml(point.name) + '</strong>' +
        '<span>Estacionamento oficial de troca</span>' +
        pointActionsHtml(point, false) +
        pointPlayersHtml(pointPlayers) +
      '</div>'
    );
  }

  function eventPointPopupHtml(point, pointPlayers) {
    return (
      '<div class="location-card event-location-card">' +
        '<strong data-event-timer-inline>' + escapeHtml(eventCountdownLabel()) + '</strong>' +
        '<span>' + escapeHtml(STICKER_EVENT.place) + '</span>' +
        '<small>' + escapeHtml(STICKER_EVENT.schedule) + '</small>' +
        pointActionsHtml(point, true) +
        pointPlayersHtml(pointPlayers) +
      '</div>'
    );
  }

  function pointActionsHtml(point, includeShare) {
    const share = includeShare
      ? '<a class="point-share-link" href="' + eventShareUrl(point) + '" target="_blank" rel="noopener">Compartilhar</a>'
      : "";
    return (
      '<div class="point-action-row">' +
        '<a class="point-route-link" href="' + pointRouteUrl(point) + '" target="_blank" rel="noopener">Rota</a>' +
        share +
      '</div>'
    );
  }

  function pointRouteUrl(point) {
    const query = encodeURIComponent(Number(point.lat).toFixed(6) + "," + Number(point.lng).toFixed(6));
    return "https://www.google.com/maps/dir/?api=1&destination=" + query;
  }

  function eventShareUrl(point) {
    return "https://wa.me/?text=" + encodeURIComponent(eventShareText(point));
  }

  function eventShareText(point) {
    return [
      "Encontro comunitario - " + point.name,
      STICKER_EVENT.place,
      STICKER_EVENT.schedule,
      eventCountdownLabel(),
      PUBLIC_SITE_URL
    ].join("\n");
  }

  function pointPlayersHtml(pointPlayers) {
    const players = Array.isArray(pointPlayers) ? pointPlayers : [];
    const rows = players.length
      ? players.map(pointPlayerRowHtml).join("")
      : '<span class="point-player-empty">Nenhum jogador ate 200m agora</span>';
    return (
      '<div class="point-player-block">' +
        '<div class="point-player-head"><strong>' + players.length + ' perto agora</strong><small>ate 200m deste estacionamento</small></div>' +
        '<div class="point-player-list">' + rows + '</div>' +
      '</div>'
    );
  }

  function pointPlayerRowHtml(item) {
    const user = item.user;
    const tier = tradeRankTier(user);
    const name = user.id === "me" ? "Voce" : user.name;
    return (
      '<button class="point-player-row" type="button" data-point-user="' + escapeHtml(user.id) + '">' +
        '<span class="point-player-avatar">' + pinAvatarHtml(user, tier) + '</span>' +
        '<span class="point-player-info">' +
          '<strong>' + escapeHtml(name) + '</strong>' +
          '<small>' + escapeHtml(formatDistance(item.distance)) + ' - ' + escapeHtml(userOnlineLabel(user)) + '</small>' +
        '</span>' +
      '</button>'
    );
  }

  function maybeFitLeafletToSpreadDemo(users) {
    if (!leafletMap || leafletFitDemoDone || !window.L) return;
    const demoOutsidePark = users.some(user => {
      const lat = Number(user && user.lat);
      const lng = Number(user && user.lng);
      return user && user.demo && Number.isFinite(lat) && Number.isFinite(lng) && !isInsideMapBounds(lat, lng);
    });
    if (!demoOutsidePark) return;
    const latLngs = users
      .map(user => userLatLng(user))
      .filter(latlng => Number.isFinite(Number(latlng[0])) && Number.isFinite(Number(latlng[1])));
    tradePoints.forEach(point => latLngs.push([point.lat, point.lng]));
    if (latLngs.length < 2) return;
    leafletFitDemoDone = true;
    setTimeout(() => {
      if (!leafletMap) return;
      leafletMap.fitBounds(L.latLngBounds(latLngs), { padding: [38, 38], maxZoom: 6.2, animate: false });
      syncLeafletMarkerZoom();
    }, 120);
  }

  function isInsideMapBounds(lat, lng) {
    return lat >= MAP_BOUNDS[0][0] && lat <= MAP_BOUNDS[1][0] && lng >= MAP_BOUNDS[0][1] && lng <= MAP_BOUNDS[1][1];
  }

  function userLatLng(user) {
    if (Number.isFinite(Number(user.lat)) && Number.isFinite(Number(user.lng))) {
      return [Number(user.lat), Number(user.lng)];
    }
    return percentToLatLng(Number(user.x || 52), Number(user.y || 55));
  }

  function userHasGps(user) {
    return user
      && user.hasLocation !== false
      && Number.isFinite(Number(user.lat))
      && Number.isFinite(Number(user.lng));
  }

  function isOnlineNow(user, now = Date.now()) {
    if (!user) return false;
    if (user.id === "me") return userHasGps(user);
    const ms = Number(user.lastOnlineMs || 0);
    return ms > 0 && now - ms <= ONLINE_NOW_WINDOW_MS;
  }

  function usersForPoint(point, users) {
    const now = Date.now();
    return (Array.isArray(users) ? users : [])
      .filter(user => userHasGps(user) && isOnlineNow(user, now))
      .map(user => ({ user, distance: pointDistanceMeters(point, user) }))
      .filter(item => item.distance <= POINT_PLAYER_RADIUS_M)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, POINT_PLAYER_LIMIT);
  }

  function pointDistanceMeters(point, user) {
    const latlng = userLatLng(user);
    return distanceMeters(point.lat, point.lng, latlng[0], latlng[1]);
  }

  function distanceMeters(lat1, lng1, lat2, lng2) {
    const radius = 6371000;
    const toRad = value => Number(value) * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
      * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(meters) {
    const value = Math.max(0, Number(meters) || 0);
    if (value < 1000) return Math.round(value / 10) * 10 + " m";
    return (value / 1000).toFixed(value < 10000 ? 1 : 0).replace(".", ",") + " km";
  }

  function collectorPopupHtml(user) {
    return (
      '<div class="location-card">' +
        '<strong>' + escapeHtml(user.id === "me" ? "Voce" : user.name) + '</strong>' +
        '<span>' + escapeHtml(userOnlineLabel(user)) + '</span>' +
      '</div>'
    );
  }

  function collectorMarkerHtml(user) {
    const tier = tradeRankTier(user);
    return (
      '<button class="collector-card-pin leaflet-pin' + (user.id === "me" ? " mine" : "") + '" type="button" data-user="' + escapeHtml(user.id) + '" data-tier="' + tier.id + '" aria-label="Abrir album de ' + escapeHtml(user.name) + '" style="--card-a:' + tier.colors[0] + ';--card-b:' + tier.colors[1] + ';--tier-accent:' + tier.accent + '">' +
        '<span class="pin-card-face" aria-hidden="true"></span>' +
      '</button>'
    );
  }

  function progressTier(progress) {
    if (progress >= 95) {
      return tierVisual("diamond");
    }
    if (progress >= 80) {
      return tierVisual("platinum");
    }
    if (progress >= 60) {
      return tierVisual("gold");
    }
    if (progress >= 40) {
      return tierVisual("silver");
    }
    return tierVisual("glass");
  }

  function tierVisual(id) {
    if (id === "diamond") return { id: "diamond", colors: ["#edfaff", "#38bdf8"], accent: "#ffffff" };
    if (id === "platinum") return { id: "platinum", colors: ["#7c3aed", "#d946ef"], accent: "#f5d0fe" };
    if (id === "gold") return { id: "gold", colors: ["#facc15", "#f59e0b"], accent: "#fef08a" };
    if (id === "silver") return { id: "silver", colors: ["#64748b", "#cbd5e1"], accent: "#f8fafc" };
    return { id: "glass", colors: ["#67e8f9", "#14b8a6"], accent: "#ccfbf1" };
  }

  function tradeRankTier(user) {
    const reputation = normalizeReputation(user && (user.tradeReputation || user.reputation || user.reputacaoTroca));
    let active = TRADE_RANK_STEPS[0];
    for (let index = 0; index < TRADE_RANK_STEPS.length; index += 1) {
      if (reputation.tradeUsers >= TRADE_RANK_STEPS[index].min) active = TRADE_RANK_STEPS[index];
    }
    const next = TRADE_RANK_STEPS.find(step => step.min > reputation.tradeUsers) || null;
    return Object.assign(tierVisual(active.id), {
      label: active.label,
      min: active.min,
      text: active.text,
      next,
      tradeUsers: reputation.tradeUsers,
      tradeStickers: reputation.tradeStickers
    });
  }

  function tradeRankLine(user, tier) {
    const rank = tier || tradeRankTier(user);
    const people = formatNumberPt(rank.tradeUsers);
    const base = rank.label + " de troca - " + people + " " + pluralTradePersonLabel(rank.tradeUsers);
    return user && user.id !== "me" ? base + " - " + userOnlineLabel(user) : base;
  }

  function tradeRankNextText(tier) {
    const rank = tier || tradeRankTier(null);
    if (!rank.next) return "Rank m\u00e1ximo atingido";
    const remaining = Math.max(0, rank.next.min - rank.tradeUsers);
    return "Faltam " + remaining + " " + pluralTradePersonLabel(remaining) + " para " + rank.next.label;
  }

  function tradeRankProgressPercent(tier) {
    const rank = tier || tradeRankTier(null);
    if (!rank.next) return 100;
    const span = Math.max(1, rank.next.min - rank.min);
    return Math.max(0, Math.min(100, Math.round(((rank.tradeUsers - rank.min) / span) * 100)));
  }

  function pluralTradePersonLabel(value) {
    return value === 1 ? "pessoa" : "pessoas";
  }

  function tierEmblemHtml(tier, variant) {
    const id = tier && tier.id ? tier.id : "glass";
    const src = TIER_EMBLEM_IMAGES[id] || TIER_EMBLEM_IMAGES.glass;
    return '<span class="tier-emblem tier-' + escapeHtml(id) + (variant ? " tier-" + escapeHtml(variant) : "") + '" aria-hidden="true"><img src="' + escapeHtml(src) + '" alt="" loading="lazy"></span>';
  }

  function pinAvatarHtml(user, tier) {
    return user.photo
      ? '<img src="' + escapeHtml(user.photo) + '" alt="" referrerpolicy="no-referrer" onerror="this.hidden=true">'
      : tierEmblemHtml(tier, "pin");
  }

  function syncLeafletMarkerZoom() {
    if (!leafletMap) return;
    const zoom = leafletMap.getZoom();
    const mode = zoom >= MAP_DETAIL_ZOOM ? "zoom-detail" : zoom >= MAP_NEAR_ZOOM ? "zoom-near" : "zoom-far";
    const scale = Math.max(0.78, Math.min(1.24, 0.78 + ((zoom - 14) * 0.12)));
    leafletMarkers.collectors.forEach(marker => {
      const element = marker.getElement && marker.getElement();
      if (!element) return;
      element.classList.remove("zoom-far", "zoom-near", "zoom-detail");
      element.classList.add(mode);
      element.style.setProperty("--pin-scale", scale.toFixed(2));
    });
    leafletMarkers.points.forEach(marker => {
      const element = marker.getElement && marker.getElement();
      if (!element) return;
      element.classList.remove("zoom-far", "zoom-near", "zoom-detail");
      element.classList.add(mode);
    });
  }

  function shortMarkerName(name) {
    const first = String(name || "Colecionador").trim().split(/\s+/)[0] || "Colecionador";
    return first.length > 8 ? first.slice(0, 6) + "." : first;
  }

  function userOnlineLabel(user) {
    const ms = Number(user && user.lastOnlineMs || 0);
    if (!ms) return "online recente";
    const minutes = Math.max(0, Math.round((Date.now() - ms) / 60000));
    if (minutes < 2) return "online agora";
    if (minutes < 60) return "ha " + minutes + " min";
    const hours = Math.round(minutes / 60);
    if (hours < 24) return "ha " + hours + " h";
    return "ha " + Math.round(hours / 24) + " d";
  }

  function centerOnDevice() {
    requestAndSaveApproxLocation({ force: true, center: true, toast: true });
  }

  function startLocationSync() {
    stopLocationSync();
    requestAndSaveApproxLocation({ force: true, silent: true });
    locationSyncTimer = setInterval(() => {
      requestAndSaveApproxLocation({ silent: true });
    }, GEO_SYNC_INTERVAL_MS);
  }

  function stopLocationSync() {
    if (locationSyncTimer) clearInterval(locationSyncTimer);
    locationSyncTimer = null;
  }

  function requestAndSaveApproxLocation(options = {}) {
    if (!navigator.geolocation) {
      if (options.toast) toast("Localizacao indisponivel neste navegador.");
      return Promise.resolve(null);
    }
    if (!options.force && Date.now() - lastLocationWriteAt < GEO_SYNC_INTERVAL_MS - 1000) {
      return Promise.resolve(state.myLocation);
    }
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(position => {
        const location = approximateLocation(position.coords);
        lastLocationWriteAt = Date.now();
        saveApproxLocation(location);
        recordAnalyticsEvent("gps_location", {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          locationKind: options.silent ? "sync" : "manual"
        });
        renderMap();
        if (leafletMap && options.center) {
          leafletMap.flyTo([location.lat, location.lng], Math.max(leafletMap.getZoom(), 16), { animate: true, duration: 0.7 });
          setTimeout(() => openProfile("me"), 480);
        }
        if (currentUser && currentUser.uid) {
          savePublicUserDoc({ locationOnly: true });
        }
        if (options.toast) toast("Seu card foi levado para sua localizacao aproximada.");
        resolve(location);
      }, () => {
        if (options.toast) toast("Ative a localizacao para mostrar seu card no mapa.");
        resolve(null);
      }, {
        enableHighAccuracy: false,
        timeout: 16000,
        maximumAge: GEO_SYNC_INTERVAL_MS
      });
    });
  }

  function approximateLocation(coords) {
    const lat = approximateCoordinate(Number(coords.latitude));
    const lng = approximateCoordinate(Number(coords.longitude));
    const percent = latLngToPercent(lat, lng);
    return {
      lat,
      lng,
      x: percent.x,
      y: percent.y,
      accuracy: Math.max(120, Math.min(900, Number(coords.accuracy || 180))),
      updatedAt: Date.now()
    };
  }

  function approximateCoordinate(value) {
    return Number((Math.round(value / APPROX_LOCATION_GRID) * APPROX_LOCATION_GRID).toFixed(6));
  }

  function qty(cardId) {
    return Math.max(0, Number(state.album[cardId] || 0));
  }

  function setQty(cardId, next) {
    const value = Math.max(0, Math.min(9, Number(next) || 0));
    const updatedAt = Date.now();
    setRawQty(cardId, value, updatedAt);
    saveAlbum(updatedAt);
    render();
  }

  function addSticker(cardId) {
    setQty(cardId, qty(cardId) + 1);
    maybeLoginAfterGuestAdd();
  }

  function maybeLoginAfterGuestAdd() {
    if (currentUser && currentUser.uid) return;
    guestAddClicks += 1;
    if (guestAddClicks === GUEST_ADD_LOGIN_THRESHOLD) loginGoogle();
  }

  function stats() {
    const owned = cards.filter(card => qty(card.id) > 0).length;
    const duplicates = cards.reduce((sum, card) => sum + Math.max(0, qty(card.id) - 1), 0);
    const missing = cards.length - owned;
    const progress = Math.round((owned / cards.length) * 100);
    return { owned, duplicates, missing, total: cards.length, progress };
  }

  function render() {
    const summary = stats();
    els["side-progress"].textContent = summary.progress + "%";
    els["side-progress-line"].style.width = summary.progress + "%";
    els["progress-percent"].textContent = summary.progress + "%";
    els["progress-ring"].style.setProperty("--progress", String(summary.progress));
    els["summary-title"].textContent = levelName(summary.progress);
    els["summary-subtitle"].textContent = summary.owned + " de " + summary.total + " figurinhas";
    els["stat-owned"].textContent = summary.owned;
    els["stat-missing"].textContent = summary.missing;
    els["stat-duplicates"].textContent = summary.duplicates;
    els["stat-total"].textContent = summary.total;
    renderAlbumGrid();
    renderMissingList();
    renderDuplicateList();
    renderMap();
    renderMatch();
  }

  function setView(view) {
    state.view = view;
    document.body.dataset.view = view;
    document.querySelector(".app-shell").dataset.view = view;
    document.querySelectorAll(".nav-btn").forEach(button => {
      button.classList.toggle("active", button.dataset.view === view);
    });
    document.querySelectorAll(".view").forEach(panel => {
      panel.classList.toggle("active", panel.id === "view-" + view);
    });
    const titles = {
      map: ["", "NEXO Card"],
      album: ["Colecao local", "Figurinhas"],
      missing: ["Controle rapido", "Faltantes"],
      duplicates: ["Trocas locais", "Repetidas"]
    };
    const [eyebrow, title] = titles[view] || titles.album;
    els["view-eyebrow"].textContent = eyebrow;
    els["view-eyebrow"].hidden = !eyebrow;
    els["view-title"].textContent = title;
    document.getElementById("overview-panel").style.display = "none";
    document.querySelector(".stats-grid").style.display = "none";
    document.getElementById("collection-toolbar").style.display = view === "album" ? "grid" : "none";
    document.getElementById("group-strip").style.display = view === "album" ? "flex" : "none";
    renderUserSearchResults();
    if (view === "map" && leafletMap) {
      setTimeout(() => {
        leafletMap.invalidateSize();
        syncLeafletMarkerZoom();
      }, 60);
    }
  }

  function renderMap() {
    const users = [myMapUser()].concat(collectorUsers);
    const onlineNowCount = users.filter(user => userHasGps(user) && isOnlineNow(user)).length;
    renderLeafletMarkers(users);
    if (leafletMap && state.view === "map") {
      setTimeout(() => {
        leafletMap.invalidateSize();
        syncLeafletMarkerZoom();
      }, 0);
    }

    const myStats = stats();
    els["map-summary-grid"].innerHTML = [
      ["Album", myStats.progress + "%", "seu progresso"],
      ["Online agora", String(onlineNowCount), "com app ativado"],
      ["Repetidas", String(myStats.duplicates), "para troca"],
      ["Estacionamentos", String(tradePoints.length), "locais marcados"]
    ].map(item => '<div><span>' + item[0] + '</span><strong>' + item[1] + '</strong><small>' + item[2] + '</small></div>').join("");
  }

  function startEventCountdown() {
    updateEventCountdown();
    clearInterval(eventCountdownTimer);
    eventCountdownTimer = setInterval(updateEventCountdown, 1000);
  }

  function updateEventCountdown() {
    const now = Date.now();
    const visible = isCommunityMeetingVisible(now);
    const wasVisible = document.body.classList.contains("community-meeting-active");
    const active = visible && now >= STICKER_EVENT.startAt && now <= STICKER_EVENT.endAt;
    const label = eventCountdownLabel(now);
    syncOfficialRewardState({ render: false });
    document.querySelectorAll("[data-event-timer-inline]").forEach(node => {
      node.textContent = label;
    });
    document.body.classList.toggle("community-meeting-active", visible);
    if (wasVisible !== visible && leafletMap) renderMap();
    if (!els["event-countdown"] || !els["event-status"] || !els["event-timer"] || !els["event-detail"]) return;
    els["event-countdown"].hidden = !visible;
    if (!visible) return;
    els["event-countdown"].classList.toggle("is-live", active);
    els["event-countdown"].classList.toggle("is-ended", now > STICKER_EVENT.endAt);
    els["event-status"].textContent = active ? "Evento ativo" : "Proximo evento";
    els["event-timer"].textContent = label;
    els["event-detail"].textContent = STICKER_EVENT.place + " - " + STICKER_EVENT.schedule;
    if (els["event-detail-title"]) els["event-detail-title"].textContent = active ? "Evento ativo" : "Proximo evento";
    if (els["event-detail-timer"]) els["event-detail-timer"].textContent = label;
    if (els["event-detail-place"]) els["event-detail-place"].textContent = STICKER_EVENT.place;
    if (els["event-detail-schedule"]) els["event-detail-schedule"].textContent = STICKER_EVENT.schedule;
    if (els["event-reward-status"]) {
      const claimed = Boolean(state.officialBadges && state.officialBadges[EVENT_JUNE_6_BADGE_ID]);
      const rewardStatus = claimed
        ? "Emblema garantido para sempre"
        : active
          ? "No local: emblema unico"
          : "Emblema unico ao comparecer";
      els["event-reward-status"].textContent = rewardStatus;
      if (els["event-detail-reward-status"]) els["event-detail-reward-status"].textContent = rewardStatus;
    }
  }

  function openEventDetails() {
    updateEventCountdown();
    if (els["event-detail-dialog"] && !els["event-detail-dialog"].open) els["event-detail-dialog"].showModal();
  }

  function focusEventDetailPoint(event) {
    if (event && event.type) event.stopPropagation();
    if (els["event-detail-dialog"] && els["event-detail-dialog"].open) els["event-detail-dialog"].close();
    focusStickerEventPoint();
  }

  function openChallengeDialog() {
    setChallengeTab("daily");
    if (els["challenge-dialog"] && !els["challenge-dialog"].open) els["challenge-dialog"].showModal();
  }

  function setChallengeTab(tab) {
    const selected = ["daily", "weekly", "event", "monthly"].includes(tab) ? tab : "daily";
    document.querySelectorAll("[data-challenge-tab]").forEach(button => {
      button.classList.toggle("active", button.dataset.challengeTab === selected);
    });
    document.querySelectorAll("[data-challenge-panel]").forEach(panel => {
      const active = panel.dataset.challengePanel === selected;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  }

  function isCommunityMeetingVisible(now = Date.now()) {
    return Boolean(STICKER_EVENT.enabled && STICKER_EVENT.startAt && STICKER_EVENT.endAt && now <= STICKER_EVENT.endAt);
  }

  function eventCountdownLabel(now = Date.now()) {
    if (!isCommunityMeetingVisible(now)) return "00:00:00:00";
    const target = now < STICKER_EVENT.startAt ? STICKER_EVENT.startAt : STICKER_EVENT.endAt;
    return formatCountdown(Math.max(0, target - now));
  }

  function formatCountdown(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return pad2(days) + ":" + pad2(hours) + ":" + pad2(minutes) + ":" + pad2(seconds);
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function showStickerEventOnEntry() {
    if (state.view !== "map") return;
    if (!isCommunityMeetingVisible()) return;
    setTimeout(() => focusStickerEventPoint({ silent: true, zoom: 16.4 }), 850);
  }

  function focusStickerEventPoint(options = {}) {
    if (options && options.type) options = {};
    const point = tradePoints.find(item => item.id === STICKER_EVENT.pointId);
    if (!point || !leafletMap) {
      if (!options.silent) toast("Estacionamento 10 indisponivel no mapa agora.");
      return;
    }
    leafletMap.flyTo([point.lat, point.lng], Math.max(leafletMap.getZoom(), options.zoom || 16.4), { animate: true, duration: 0.8 });
    const marker = leafletMarkers.points.find(item => item.pointId === STICKER_EVENT.pointId);
    setTimeout(() => {
      if (marker && marker.openPopup) marker.openPopup();
    }, 650);
    if (!options.silent) toast("Estacionamento 10 centralizado.");
  }

  function myMapUser() {
    const location = validLocation(state.myLocation) ? locationFromData(state.myLocation) : null;
    const name = currentUser && currentUser.uid ? profileDisplayName(currentUser) : "Voce";
    return {
      id: "me",
      name,
      username: currentUser && currentUser.username ? usernameFromProfile(currentUser) : "",
      usernameLower: currentUser && currentUser.usernameLower ? usernameFromProfile(currentUser) : "",
      instagram: currentUser && currentUser.instagram ? currentUser.instagram : "",
      x: location ? location.x : 52,
      y: location ? location.y : 55,
      lat: location ? location.lat : null,
      lng: location ? location.lng : null,
      accuracy: location ? location.accuracy : null,
      hasLocation: Boolean(location),
      initials: initialsFromName(name),
      photo: currentUser && currentUser.photo ? currentUser.photo : "",
      colors: ["#13c8a3", "#087f63"],
      album: state.album,
      tradeReputation: normalizeReputation(currentUser && (currentUser.tradeReputation || currentUser.reputation)),
      officialBadges: officialBadgeIdsForCurrentUser()
    };
  }

  function openNearbyCollectors() {
    renderNearbyCollectors();
    if (els["nearby-dialog"] && !els["nearby-dialog"].open) els["nearby-dialog"].showModal();
  }

  function nearbyRows() {
    const rows = collectorUsers
      .filter(user => user && !user.demo)
      .map(user => {
        const comparison = compareAlbums(user.album);
        const online = isOnlineNow(user);
        const recent = !online && Number(user.lastOnlineMs || 0) > 0 && Date.now() - Number(user.lastOnlineMs || 0) <= 60 * 60 * 1000;
        const distance = state.myLocation && userHasGps(user)
          ? distanceMeters(state.myLocation.lat, state.myLocation.lng, user.lat, user.lng)
          : null;
        return { user, comparison, online, recent, distance };
      });
    const filtered = rows.filter(row => {
      if (state.nearbyFilter === "online") return row.online;
      if (state.nearbyFilter === "trade") return row.comparison.total > 0;
      return true;
    });
    return filtered.sort((a, b) => {
      if (state.nearbyFilter === "trade" && b.comparison.total !== a.comparison.total) {
        return b.comparison.total - a.comparison.total;
      }
      if (a.online !== b.online) return a.online ? -1 : 1;
      if (a.distance !== null && b.distance !== null && a.distance !== b.distance) return a.distance - b.distance;
      return Number(b.user.lastOnlineMs || 0) - Number(a.user.lastOnlineMs || 0);
    });
  }

  function renderNearbyCollectors() {
    if (!els["nearby-list"]) return;
    document.querySelectorAll("[data-nearby-filter]").forEach(button => {
      button.classList.toggle("active", button.dataset.nearbyFilter === state.nearbyFilter);
    });
    const rows = nearbyRows();
    const total = collectorUsers.filter(user => user && !user.demo).length;
    const online = collectorUsers.filter(user => user && !user.demo && isOnlineNow(user)).length;
    if (els["nearby-summary"]) {
      els["nearby-summary"].textContent = total
        ? online + " online de " + total + " colecionadores recentes"
        : "Entre com Google e ative o mapa para encontrar colecionadores.";
    }
    els["nearby-list"].innerHTML = rows.length
      ? rows.slice(0, 80).map(nearbyRowHtml).join("")
      : nearbyEmptyHtml();
  }

  function nearbyRowHtml(row) {
    const user = row.user;
    const tier = tradeRankTier(user);
    const status = row.online ? "online" : row.recent ? "recent" : "offline";
    const statusText = row.online ? "online" : row.recent ? "recente" : "offline";
    const tradeText = row.comparison.total > 0
      ? row.comparison.total + " troca" + (row.comparison.total === 1 ? "" : "s") + " possivel" + (row.comparison.total === 1 ? "" : "s")
      : "sem troca agora";
    const distanceText = row.distance !== null ? " - " + formatDistance(row.distance) : "";
    return (
      '<button class="nearby-row" type="button" data-nearby-user="' + escapeHtml(user.id) + '">' +
        '<span class="nearby-avatar" style="--card-a:' + tier.colors[0] + ';--card-b:' + tier.colors[1] + ';--tier-accent:' + tier.accent + '">' +
          tierEmblemHtml(tier, "nearby") +
          '<i class="nearby-status ' + status + '" aria-label="' + escapeHtml(statusText) + '"></i>' +
        '</span>' +
        '<span class="nearby-info">' +
          '<strong>' + escapeHtml(profileDisplayName(user)) + '</strong>' +
          '<small>' + escapeHtml(statusText + distanceText) + '</small>' +
        '</span>' +
        '<span class="nearby-trade">' +
          '<b>' + row.comparison.total + '</b>' +
          '<small>' + escapeHtml(tradeText) + '</small>' +
        '</span>' +
      '</button>'
    );
  }

  function nearbyEmptyHtml() {
    const message = state.nearbyFilter === "online"
      ? "Nenhum colecionador online agora."
      : state.nearbyFilter === "trade"
        ? "Nenhuma troca possivel com os colecionadores recentes."
        : "Nenhum colecionador recente encontrado.";
    return '<div class="nearby-empty"><strong>' + escapeHtml(message) + '</strong><span>Atualize seu album e ative sua localizacao aproximada para melhorar as combinacoes.</span></div>';
  }

  function onNearbyListClick(event) {
    const row = event.target.closest("[data-nearby-user]");
    if (!row) return;
    if (els["nearby-dialog"]) els["nearby-dialog"].close();
    openProfile(row.dataset.nearbyUser);
  }

  function initialsFromName(name) {
    const parts = String(name || "").trim().replace(/^@+/, "").split(/\s+/).filter(Boolean);
    return (parts[0] && parts[1] ? parts[0][0] + parts[1][0] : (parts[0] || "EU").slice(0, 2)).toUpperCase();
  }

  function onCollectorClick(event) {
    const pin = event.target.closest("[data-user]");
    if (!pin) return;
    openProfile(pin.dataset.user);
  }

  function onPointPlayerListClick(event) {
    const row = event.target.closest("[data-point-user]");
    if (!row) return;
    event.preventDefault();
    openProfile(row.dataset.pointUser);
  }

  function openProfile(userId) {
    const user = getMapUser(userId);
    if (!user) return;
    state.selectedUserId = user.id;
    els["profile-content"].innerHTML = profileHtml(user);
    if (!els["profile-dialog"].open) els["profile-dialog"].show();
    if (user.id !== "me") recordAnalyticsEvent("profile_open", { targetUser: user.demo ? "demo" : "collector" });
    syncProfileViews(user);
  }

  function getMapUser(userId) {
    if (userId === "me") return myMapUser();
    return collectorUsers.find(user => user.id === userId);
  }

  function profileHtml(user) {
    const userStats = albumStats(user.album);
    const comparison = compareAlbums(user.album);
    const tier = tradeRankTier(user);
    return (
      '<div class="profile-shell" style="--card-a:' + tier.colors[0] + ';--card-b:' + tier.colors[1] + ';--tier-accent:' + tier.accent + '">' +
        '<div class="profile-card" role="button" tabindex="0" data-flip-profile>' +
          '<span class="profile-card-inner">' +
            '<span class="profile-front">' +
              '<span class="profile-shine"></span>' +
              '<button class="profile-close-control" type="button" data-close-profile aria-label="Fechar perfil">x</button>' +
              '<span class="profile-dashboard-title" aria-label="Perfil NEXO Card"><b>Perfil <strong>NEXO Card</strong></b></span>' +
              '<span class="profile-dashboard-hero">' +
                '<span class="profile-identity">' +
                  '<span class="profile-photo">' + profilePhotoHtml(user, tier) + '</span>' +
                  '<span class="profile-user-meta">' +
                    '<strong>' + escapeHtml(user.name) + '</strong>' +
                    '<em>' + escapeHtml(tradeRankLine(user, tier)) + '</em>' +
                    instagramButtonHtml(user) +
                  '</span>' +
                '</span>' +
                profileXpHtml(user, userStats) +
              '</span>' +
              '<span class="profile-dashboard-body">' +
                '<span class="profile-dashboard-stats">' +
                  profileStatusHtml(userStats) +
                  profileReputationHtml(user) +
                '</span>' +
                profileOfficialBadgesPanelHtml(user) +
              '</span>' +
              profileDashboardNavHtml(user) +
            '</span>' +
            '<span class="profile-back">' +
              '<span class="profile-back-scroll" data-profile-back>' +
                comparePanelHtml(user, comparison, tier) +
              '</span>' +
            '</span>' +
          '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function profilePhotoHtml(user, tier) {
    const photo = user.photo
      ? '<img src="' + escapeHtml(user.photo) + '" alt="" referrerpolicy="no-referrer" onerror="this.hidden=true">'
      : '<svg class="profile-default-photo" viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" rx="48" fill="#e5e7eb"/><circle cx="48" cy="35" r="15" fill="#9ca3af"/><path d="M24 78c6-20 18-30 24-30s18 10 24 30" fill="#aeb6c2"/><path d="M20 86c7-20 20-32 28-32s21 12 28 32" fill="#cbd5e1"/></svg>';
    return photo + '<button class="profile-photo-badge" type="button" data-profile-emblems data-profile-user="' + escapeHtml(user.id) + '" aria-label="Ver ranking de trocas">' + tierEmblemHtml(tier, "photo") + '</button>';
  }

  function profileXpHtml(user, userStats) {
    const reward = profileXpSummary(user, userStats);
    return (
      '<span class="profile-xp-card" aria-label="Nivel ' + reward.level + ', ' + reward.totalXp + ' XP">' +
        '<span>' +
          '<b>Nivel ' + reward.level + '</b>' +
          '<small>' + escapeHtml(reward.title) + '</small>' +
        '</span>' +
        '<strong>' + formatNumberPt(reward.totalXp) + ' XP</strong>' +
        '<i><span style="width:' + reward.percent + '%"></span></i>' +
      '</span>'
    );
  }

  function profileDashboardNavHtml(user) {
    const target = escapeHtml(user.id);
    const tradeButton = user.id === "me"
      ? '<button type="button" data-profile-emblems data-profile-user="' + target + '"><i class="profile-nav-ico trades"></i><span>Trocas</span></button>'
      : '<button type="button" data-message-menu data-message-user="' + target + '"><i class="profile-nav-ico trades"></i><span>Trocas</span></button>';
    const settingsButton = user.id === "me"
      ? '<button type="button" data-open-profile-settings><i class="profile-nav-ico settings"></i><span>Ajustes</span></button>'
      : '<button type="button" data-preset-message="like" data-message-user="' + target + '"><i class="profile-nav-ico settings"></i><span>Curtir</span></button>';
    return (
      '<span class="profile-dashboard-nav" aria-label="Acoes do perfil">' +
        '<button type="button" data-profile-action="album" data-profile-user="' + target + '"><i class="profile-nav-ico album"></i><span>Album</span></button>' +
        tradeButton +
        '<button type="button" data-open-profile-challenges><i class="profile-nav-ico events"></i><span>Eventos</span></button>' +
        '<button type="button" data-profile-emblems data-profile-user="' + target + '"><i class="profile-nav-ico ranking"></i><span>Ranking</span></button>' +
        settingsButton +
      '</span>'
    );
  }

  function profileOfficialBadgesHtml(user) {
    const badges = officialBadgesForUser(user);
    if (!badges.length) return "";
    return (
      '<span class="profile-official-badges" aria-label="Emblemas oficiais">' +
        badges.map(badge => (
          '<button class="profile-official-badge" type="button" data-official-badge="' + escapeHtml(badge.id) + '" data-badge-user="' + escapeHtml(user.id) + '" aria-label="Ver emblema ' + escapeHtml(badge.title) + '">' +
            '<img src="' + escapeHtml(badge.image) + '" alt="" loading="lazy">' +
            '<span>' + escapeHtml(badge.shortTitle) + '</span>' +
          '</button>'
        )).join("") +
      '</span>'
    );
  }

  function profileOfficialBadgesPanelHtml(user) {
    const badges = officialBadgesForUser(user);
    const secretSlots = Math.max(0, Math.min(3, 4 - badges.length));
    const earnedBadges = badges.map(badge => (
      '<button class="profile-official-badge" type="button" data-official-badge="' + escapeHtml(badge.id) + '" data-badge-user="' + escapeHtml(user.id) + '" aria-label="Ver emblema ' + escapeHtml(badge.title) + '">' +
        '<img src="' + escapeHtml(badge.image) + '" alt="" loading="lazy">' +
        '<span>' + escapeHtml(badge.shortTitle) + '</span>' +
      '</button>'
    )).join("");
    const secretBadges = Array.from({ length: secretSlots }, () => (
      '<span class="profile-secret-badge" aria-label="Emblema secreto">' +
        '<i></i>' +
        '<b>Segredo</b>' +
      '</span>'
    )).join("");
    return (
      '<span class="profile-emblems-showcase">' +
        '<span class="profile-emblems-head"><b>Seus emblemas</b><small>Conquistas oficiais ficam na frente do card</small></span>' +
        '<span class="profile-official-badges" aria-label="Emblemas oficiais">' + earnedBadges + secretBadges + '</span>' +
      '</span>'
    );
  }

  function officialBadgesForUser(user) {
    const ids = new Set(normalizeOfficialBadgeIds(user && (user.officialBadges || user.badges)));
    if (user && user.id === "me") officialBadgeIdsForCurrentUser().forEach(id => ids.add(id));
    if (user && user.demo) ids.add(CHEGUEI_BRASIL_BADGE_ID);
    if (Date.now() <= CHEGUEI_BRASIL_END_AT) ids.add(CHEGUEI_BRASIL_BADGE_ID);
    return OFFICIAL_BADGES.filter(badge => ids.has(badge.id));
  }

  function profileXpSummary(user, userStats) {
    const summary = userStats || albumStats(user && user.album || {});
    const reputation = normalizeReputation(user && (user.tradeReputation || user.reputation || user.reputacaoTroca));
    const badgeXp = officialBadgesForUser(user).reduce((total, badge) => total + Number(badge.xp || 0), 0);
    const computedXp =
      summary.owned * 5 +
      summary.duplicates * 2 +
      reputation.tradeUsers * 25 +
      reputation.tradeStickers * 2 +
      reputation.likes * 3 +
      Math.min(500, Math.max(0, Number(user && user.profileViewsTotal || 0))) +
      badgeXp;
    const savedXp = Math.max(0, Math.round(Number(user && (user.xp || user.rewardXp) || 0)));
    const totalXp = Math.max(savedXp, Math.round(computedXp));
    const levelSize = 240;
    const level = Math.max(1, Math.min(99, Math.floor(totalXp / levelSize) + 1));
    const currentLevelStart = (level - 1) * levelSize;
    const percent = Math.max(0, Math.min(100, Math.round(((totalXp - currentLevelStart) / levelSize) * 100)));
    return {
      totalXp,
      level,
      percent,
      title: level >= 20 ? "Especialista" : level >= 10 ? "Colecionador ativo" : "Colecionador"
    };
  }

  function instagramButtonHtml(user) {
    const username = instagramUsername(user);
    if (!username) return "";
    return '<a class="profile-instagram" href="' + instagramUrl(username) + '" target="_blank" rel="noopener noreferrer" aria-label="Abrir Instagram de ' + escapeHtml(user.name) + '"><img src="assets/instagram-icon.png" alt="">@' + escapeHtml(username) + '</a>';
  }

  function instagramUsername(user) {
    return String(user && user.instagram || "").trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@+/, "")
      .replace(/\/+$/, "");
  }

  function profileInstagram(user) {
    return instagramUsername(user);
  }

  function instagramUrl(username) {
    return "https://www.instagram.com/" + encodeURIComponent(username) + "/";
  }

  function profileReputationHtml(user) {
    const reputation = normalizeReputation(user && (user.tradeReputation || user.reputation));
    return (
      '<span class="profile-reputation-panel">' +
        '<span class="profile-reputation-head">' +
          '<b>Reputa&ccedil;&atilde;o de troca</b>' +
          '<span><strong>' + formatRatingPt(reputation.rating, reputation.reviews) + '</strong>' + reputationStarsHtml(reputation.rating, reputation.reviews) + '<em>(' + formatNumberPt(reputation.reviews) + ')</em></span>' +
        '</span>' +
        '<span class="profile-reputation-metrics">' +
          reputationMetricHtml("pessoas", reputation.tradeUsers) +
          reputationMetricHtml("figurinhas", reputation.tradeStickers) +
          reputationMetricHtml("curtidas", reputation.likes) +
          reputationMetricHtml("descurtidas", reputation.dislikes) +
          profileViewsMetricHtml(user) +
        '</span>' +
      '</span>'
    );
  }

  function reputationMetricHtml(label, value) {
    return '<span><b>' + formatNumberPt(value) + '</b><small>' + escapeHtml(label) + '</small></span>';
  }

  function profileViewsMetricHtml(user) {
    const total = Math.max(0, Number(user && user.profileViewsTotal || 0));
    const targetUserId = user && user.id === "me" && currentUser && currentUser.uid ? currentUser.uid : user && user.id || "";
    return '<span data-profile-view-total data-profile-view-user="' + escapeHtml(targetUserId) + '"><b>' + formatNumberPt(total) + '</b><small>views</small></span>';
  }

  function reputationStarsHtml(rating, reviews) {
    const score = reviews ? Math.max(0, Math.min(5, Number(rating) || 0)) : 0;
    const filled = Math.max(0, Math.min(5, Math.floor(score)));
    let html = "";
    for (let index = 1; index <= 5; index += 1) {
      const active = index <= filled;
      html += '<i class="' + (active ? "active" : "") + '">' + (active ? "&#9733;" : "&#9734;") + '</i>';
    }
    return '<span class="profile-stars" aria-hidden="true">' + html + '</span>';
  }

  function reputationPreset(rating, reviews, tradeUsers, tradeStickers, likes, dislikes) {
    return normalizeReputation({ rating, reviews, tradeUsers, tradeStickers, likes, dislikes });
  }

  function normalizeReputation(source) {
    const data = source && typeof source === "object" ? source : {};
    const likes = clampReputationCount(pickReputationNumber(data, ["likes", "curtidas"]));
    const dislikes = clampReputationCount(pickReputationNumber(data, ["dislikes", "descurtidas"]));
    const tradeUsers = clampReputationCount(pickReputationNumber(data, ["tradeUsers", "trocasUsuarios", "usuarios"]));
    const tradeStickers = clampReputationCount(pickReputationNumber(data, ["tradeStickers", "trocasFigurinhas", "figurinhas"]));
    let reviews = clampReputationCount(pickReputationNumber(data, ["reviews", "avaliacoes", "votos"]));
    if (!reviews) reviews = likes + dislikes;
    let rating = Number(pickReputationNumber(data, ["rating", "nota"]));
    if ((!Number.isFinite(rating) || rating <= 0) && reviews) {
      rating = 1 + (likes / Math.max(1, reviews)) * 4;
    }
    rating = reviews ? Math.max(1, Math.min(5, rating || 0)) : 0;
    return {
      rating: Math.round(rating * 10) / 10,
      reviews,
      tradeUsers,
      tradeStickers,
      likes,
      dislikes
    };
  }

  function pickReputationNumber(source, keys) {
    for (let index = 0; index < keys.length; index += 1) {
      const value = source[keys[index]];
      if (value !== undefined && value !== null && value !== "") return Number(value);
    }
    return 0;
  }

  function clampReputationCount(value) {
    return Math.max(0, Math.min(999999, Math.round(Number(value) || 0)));
  }

  function hasReputation(reputation) {
    return !!(reputation && (reputation.reviews || reputation.tradeUsers || reputation.tradeStickers || reputation.likes || reputation.dislikes));
  }

  function formatRatingPt(value, reviews) {
    if (!reviews) return "Novo";
    return (Math.round((Number(value) || 0) * 10) / 10).toFixed(1).replace(".", ",");
  }

  function formatNumberPt(value) {
    return clampReputationCount(value).toLocaleString("pt-BR");
  }

  function profileStatusHtml(userStats) {
    return (
      '<span class="profile-status-panel">' +
        profileStatHtml("Tenho", userStats.owned, "owned") +
        profileStatHtml("Faltam", userStats.missing, "missing") +
        profileStatHtml("Repetidas", userStats.duplicates, "duplicates") +
        profileStatHtml("Total", userStats.total, "total") +
      '</span>' +
      '<span class="profile-complete-panel">' +
        '<span class="complete-icon"></span>' +
        '<span><b>Completo</b><i><span style="width:' + userStats.progress + '%"></span></i></span>' +
        '<strong>' + userStats.progress + '%</strong>' +
      '</span>'
    );
  }

  function profileStatHtml(label, value, kind) {
    return (
      '<span class="profile-stat-row stat-' + kind + '">' +
        '<i></i><b>' + escapeHtml(label) + '</b><strong>' + value + '</strong>' +
      '</span>'
    );
  }

  function presetActionHtml(user) {
    if (user.id === "me") {
      return '<div class="profile-actions profile-actions-note"><span>Seu cartão aparece para colecionadores próximos quando você está no mapa.</span></div>';
    }
    return (
      '<div class="profile-actions preset-actions">' +
        '<button class="primary-btn" type="button" data-preset-message="trade_interest" data-message-user="' + escapeHtml(user.id) + '">Tenho interesse</button>' +
        '<button class="ghost-btn" type="button" data-preset-message="like" data-message-user="' + escapeHtml(user.id) + '">Curtir</button>' +
        '<button class="ghost-btn" type="button" data-preset-message="hello" data-message-user="' + escapeHtml(user.id) + '">Ola</button>' +
      '</div>'
    );
  }

  function userStickerStripHtml(user) {
    const owned = cards.filter(card => qtyFrom(user.album, card.id) > 0).slice(0, 8);
    return (
      '<div class="user-sticker-strip">' +
        '<span>Figurinhas de ' + escapeHtml(user.id === "me" ? "voce" : user.name.split(" ")[0]) + '</span>' +
        '<div>' + owned.map(card => '<b>' + escapeHtml(card.code + " " + card.number) + '</b>').join("") + '</div>' +
      '</div>'
    );
  }

  function comparePanelHtml(user, comparison, tier) {
    if (user.id === "me") {
      return profileAlbumHtml(user, tier, "countries", "BRA");
    }
    return (
      '<section class="album-compare-panel">' +
        '<div class="compare-head">' +
          '<span class="compare-handshake">' + tierEmblemHtml(tier, "compare") + '</span>' +
          '<span class="compare-head-copy">' +
            '<strong>Compatibilidade de troca</strong>' +
            '<small>' + comparison.total + ' figurinhas combinam agora</small>' +
          '</span>' +
        '</div>' +
        compareTradePlanHtml(comparison) +
        compareSectionHtml("Ele tem e voc\u00ea precisa", comparison.receive, "receive") +
        compareSectionHtml("Voc\u00ea tem e ele precisa", comparison.give, "give") +
        '<div class="compare-action-row">' +
          '<button type="button" class="compare-action-btn" data-message-menu data-message-user="' + escapeHtml(user.id) + '">Mensagem</button>' +
          '<button type="button" class="compare-action-btn" data-message-user="' + escapeHtml(user.id) + '" data-preset-message="trade_interest">Tenho interesse</button>' +
          '<button type="button" class="compare-action-btn" data-profile-action="album" data-profile-user="' + escapeHtml(user.id) + '">Ver álbum</button>' +
        '</div>' +
        '<small class="compare-tip">' + comparePlanNote(comparison) + '</small>' +
      '</section>'
    );
  }

  function compareTradePlanHtml(comparison) {
    const balanced = comparison.balanced || 0;
    const ideal = balanced ? balanced + " x " + balanced : "0 x 0";
    const idealHint = balanced ? "troca equilibrada" : comparison.total ? "falta equil\u00edbrio" : "sem combina\u00e7\u00e3o";
    return (
      '<div class="compare-trade-plan">' +
        comparePlanMetricHtml("Ele te ajuda", comparison.receive.length, "para receber", "receive") +
        comparePlanMetricHtml("Troca ideal", ideal, idealHint, "ideal") +
        comparePlanMetricHtml("Voc\u00ea ajuda", comparison.give.length, "para oferecer", "give") +
      '</div>'
    );
  }

  function comparePlanMetricHtml(label, value, hint, kind) {
    return (
      '<span class="compare-plan-metric compare-plan-' + kind + '">' +
        '<small>' + label + '</small>' +
        '<b>' + value + '</b>' +
        '<em>' + hint + '</em>' +
      '</span>'
    );
  }

  function comparePlanNote(comparison) {
    const balanced = comparison.balanced || 0;
    if (balanced) {
      return 'Sugest\u00e3o: comece por ' + balanced + ' ' + pluralStickerLabel(balanced) + ' de cada lado.';
    }
    if (comparison.total) {
      return 'Existe ajuda de um lado, mas ainda falta uma troca equilibrada.';
    }
    return 'Ainda n\u00e3o h\u00e1 figurinhas compat\u00edveis com o seu \u00e1lbum.';
  }

  function pluralStickerLabel(value) {
    return value === 1 ? "figurinha" : "figurinhas";
  }

  function compareSectionHtml(title, list, kind) {
    const visible = list.slice(0, 5);
    const extra = Math.max(0, list.length - visible.length);
    const helper = kind === "receive" ? "Figurinhas que voc\u00ea pode receber" : "Figurinhas que voc\u00ea pode oferecer";
    return (
      '<div class="compare-trade-section compare-' + kind + '">' +
        '<div class="compare-section-head"><span><strong>' + escapeHtml(title) + '</strong><small>' + helper + '</small></span><b>' + list.length + '</b></div>' +
        '<div class="compare-card-strip">' +
          (visible.map(compareStickerTileHtml).join("") || '<span class="compare-empty">Nada por enquanto</span>') +
          (extra ? '<span class="compare-more"><b>+' + extra + '</b><small>outras</small></span>' : "") +
        '</div>' +
      '</div>'
    );
  }

  function compareStickerTileHtml(card) {
    return (
      '<span class="compare-sticker-tile">' +
        flagImgHtml(card) +
        '<strong>' + escapeHtml(card.code) + '</strong>' +
        '<b>' + String(card.number).padStart(2, "0") + '</b>' +
      '</span>'
    );
  }

  function renderProfileAlbum(userId, mode, selected) {
    const user = getMapUser(userId);
    const back = els["profile-content"].querySelector("[data-profile-back]");
    if (!user || !back) return;
    const tier = tradeRankTier(user);
    back.innerHTML = profileAlbumHtml(user, tier, mode, selected);
    const card = els["profile-content"].querySelector("[data-flip-profile]");
    if (card) card.classList.add("flipped");
    requestAnimationFrame(() => {
      const active = back.querySelector(".profile-album-strip button.active");
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "center" });
    });
  }

  function renderProfileEmblemGuide(userId) {
    const user = getMapUser(userId);
    const back = els["profile-content"].querySelector("[data-profile-back]");
    if (!user || !back) return;
    const tier = tradeRankTier(user);
    back.innerHTML = profileEmblemGuideHtml(user, tier);
    const card = els["profile-content"].querySelector("[data-flip-profile]");
    if (card) card.classList.add("flipped");
  }

  function profileEmblemGuideHtml(user, currentTier) {
    const tier = currentTier || tradeRankTier(user);
    const currentId = tier.id;
    return (
      '<section class="profile-emblem-guide">' +
        '<header><strong>Ranking de trocas</strong><span>' + formatNumberPt(tier.tradeUsers) + ' ' + pluralTradePersonLabel(tier.tradeUsers) + ' com troca confirmada</span></header>' +
        '<div class="profile-rank-progress">' +
          '<span><b>' + escapeHtml(tier.label) + '</b><small>' + escapeHtml(tradeRankNextText(tier)) + '</small></span>' +
          '<i><span style="width:' + tradeRankProgressPercent(tier) + '%"></span></i>' +
        '</div>' +
        '<div class="profile-emblem-grid">' +
          TRADE_RANK_STEPS.map(step => {
            const stepTier = Object.assign(tierVisual(step.id), { label: step.label });
            return (
              '<span class="profile-emblem-step' + (step.id === currentId ? " active" : "") + '">' +
                tierEmblemHtml(stepTier, "guide") +
                '<b>' + escapeHtml(step.label) + '</b>' +
                '<small>' + escapeHtml(step.text) + '</small>' +
              '</span>'
            );
          }).join("") +
        '</div>' +
        '<p>O emblema agora sobe por pessoas com troca confirmada. Figurinhas trocadas e reputa\u00e7\u00e3o continuam como estat\u00edsticas separadas.</p>' +
      '</section>'
    );
  }

  function profileAlbumHtml(user, tier, mode, selected) {
    const activeMode = mode || "countries";
    const albumMap = user.album || {};
    const selection = profileAlbumSelection(albumMap, activeMode, selected);
    const visibleCards = profileAlbumCards(albumMap, activeMode, selection);
    const title = activeMode === "groups" ? "Grupo " + selection : (selection || "BRA");
    const status = profileAlbumCollectionStats(visibleCards, albumMap);
    return (
      '<section class="profile-album-panel" data-profile-album data-album-user="' + escapeHtml(user.id) + '" data-album-mode="' + escapeHtml(activeMode) + '" data-album-selected="' + escapeHtml(selection || "") + '" style="--card-a:' + tier.colors[0] + ';--card-b:' + tier.colors[1] + ';--tier-accent:' + tier.accent + '">' +
        '<div class="profile-album-tabs">' +
          profileAlbumTabHtml("groups", "Grupos", activeMode, user.id, selection) +
          profileAlbumTabHtml("countries", "Países", activeMode, user.id, selection) +
          profileAlbumTabHtml("duplicates", "Repetidas", activeMode, user.id, selection) +
          profileAlbumTabHtml("missing", "Faltam", activeMode, user.id, selection) +
        '</div>' +
        profileAlbumSelectorHtml(albumMap, activeMode, user.id, selection) +
        '<div class="profile-album-heading">' +
          '<strong>' + escapeHtml(title) + '</strong>' +
          '<span><i class="dot-owned"></i>' + status.owned + '<i class="dot-duplicate"></i>' + status.duplicates + '<i class="dot-missing"></i>' + status.missing + '</span>' +
        '</div>' +
        '<div class="profile-album-grid">' +
          (visibleCards.map(card => profileAlbumStickerHtml(card, albumMap)).join("") || '<span class="profile-album-empty">Nada para mostrar neste filtro</span>') +
        '</div>' +
        '<div class="profile-album-legend"><span><i class="dot-owned"></i>Tenho</span><span><i class="dot-duplicate"></i>Repetida</span><span><i class="dot-missing"></i>Falta</span></div>' +
      '</section>'
    );
  }

  function profileAlbumTabHtml(mode, label, activeMode, userId, selection) {
    return '<button type="button" class="' + (mode === activeMode ? "active" : "") + '" data-album-mode="' + mode + '" data-album-user="' + escapeHtml(userId) + '" data-album-selected="' + escapeHtml(selection || "") + '">' + escapeHtml(label) + '</button>';
  }

  function profileAlbumSelectorHtml(albumMap, mode, userId, selection) {
    if (mode === "groups") {
      const groups = Array.from(new Set(cards.map(card => card.group))).sort();
      return '<div class="profile-album-strip">' + groups.map(group => {
        const list = cards.filter(card => card.group === group);
        const statsForGroup = profileAlbumCollectionStats(list, albumMap);
        return '<button type="button" class="' + (group === selection ? "active" : "") + '" data-album-group="' + escapeHtml(group) + '" data-album-user="' + escapeHtml(userId) + '"><b>Grupo ' + escapeHtml(group) + '</b><small>' + statsForGroup.owned + '/' + statsForGroup.total + '</small></button>';
      }).join("") + '</div>';
    }
    const countries = profileAlbumCountries();
    return '<div class="profile-album-strip">' + countries.map(team => {
      const list = cards.filter(card => card.code === team.code);
      const statsForTeam = profileAlbumCollectionStats(list, albumMap);
      return '<button type="button" class="' + (team.code === selection ? "active" : "") + '" data-album-country="' + escapeHtml(team.code) + '" data-album-user="' + escapeHtml(userId) + '" data-album-mode="' + mode + '">' + flagImgHtml(list[0]) + '<b>' + escapeHtml(team.code) + '</b><small>' + statsForTeam.owned + '/' + statsForTeam.total + '</small></button>';
    }).join("") + '</div>';
  }

  function profileAlbumCountries() {
    const seen = new Set();
    return cards.reduce((list, card) => {
      if (seen.has(card.code)) return list;
      seen.add(card.code);
      list.push({ code: card.code, country: card.country });
      return list;
    }, []);
  }

  function profileAlbumSelection(albumMap, mode, selected) {
    if (mode === "groups") {
      const groups = Array.from(new Set(cards.map(card => card.group))).sort();
      return groups.includes(selected) ? selected : (groups[0] || "A");
    }
    const countries = profileAlbumCountries().map(team => team.code);
    if (selected && countries.includes(selected)) return selected;
    if (mode === "duplicates") {
      const duplicateCountry = countries.find(code => cards.some(card => card.code === code && qtyFrom(albumMap, card.id) > 1));
      return duplicateCountry || "BRA";
    }
    if (mode === "missing") {
      const missingCountry = countries.find(code => cards.some(card => card.code === code && qtyFrom(albumMap, card.id) === 0));
      return missingCountry || "BRA";
    }
    return countries.includes("BRA") ? "BRA" : (countries[0] || "");
  }

  function profileAlbumSequence(albumMap, mode) {
    if (mode === "groups") {
      return Array.from(new Set(cards.map(card => card.group))).sort();
    }
    const countries = profileAlbumCountries().map(team => team.code);
    if (mode === "duplicates") {
      const filtered = countries.filter(code => cards.some(card => card.code === code && qtyFrom(albumMap, card.id) > 1));
      return filtered.length ? filtered : countries;
    }
    if (mode === "missing") {
      const filtered = countries.filter(code => cards.some(card => card.code === code && qtyFrom(albumMap, card.id) === 0));
      return filtered.length ? filtered : countries;
    }
    return countries;
  }

  function shiftProfileAlbum(panel, direction) {
    const user = getMapUser(panel.dataset.albumUser || state.selectedUserId);
    if (!user) return;
    const mode = panel.dataset.albumMode || "countries";
    const current = panel.dataset.albumSelected || "";
    const sequence = profileAlbumSequence(user.album || {}, mode);
    if (!sequence.length) return;
    const index = Math.max(0, sequence.indexOf(current));
    const nextIndex = (index + direction + sequence.length) % sequence.length;
    renderProfileAlbum(user.id, mode, sequence[nextIndex]);
  }

  function onOfficialBadgeClick(event) {
    const close = event.target.closest("[data-close-badge-reveal]");
    if (close) {
      if (els["badge-reveal-dialog"]) els["badge-reveal-dialog"].close();
      event.stopPropagation();
      return;
    }
    const badgeButton = event.target.closest("[data-official-badge]");
    if (!badgeButton) return;
    showOfficialBadgeReveal(badgeButton.dataset.officialBadge, badgeButton.dataset.badgeUser || state.selectedUserId);
    event.stopPropagation();
  }

  function showOfficialBadgeReveal(badgeId, userId) {
    const badge = officialBadgeById(badgeId);
    if (!badge || !els["badge-reveal-dialog"] || !els["badge-reveal-content"]) return;
    const user = getMapUser(userId || state.selectedUserId) || myMapUser();
    const owned = officialBadgesForUser(user).some(item => item.id === badge.id);
    const title = owned ? "Emblema conquistado" : "Emblema exclusivo";
    els["badge-reveal-content"].innerHTML = (
      '<section class="badge-reveal-card">' +
        '<button class="badge-reveal-close" type="button" data-close-badge-reveal aria-label="Fechar">x</button>' +
        '<span class="badge-reveal-glow"></span>' +
        '<img class="badge-reveal-image" src="' + escapeHtml(badge.image) + '" alt="">' +
        '<div class="badge-reveal-copy">' +
          '<small>' + escapeHtml(title) + '</small>' +
          '<strong>' + escapeHtml(badge.title) + '</strong>' +
          '<p>' + escapeHtml(badge.revealText) + '</p>' +
          '<span><b>+' + formatNumberPt(badge.xp) + ' XP</b><em>' + escapeHtml(badge.availability) + '</em></span>' +
        '</div>' +
      '</section>'
    );
    if (!els["badge-reveal-dialog"].open) els["badge-reveal-dialog"].showModal();
    playRewardChime();
  }

  function playRewardChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const gain = context.createGain();
      gain.connect(context.destination);
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.15);
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.13);
        oscillator.connect(gain);
        oscillator.start(context.currentTime + index * 0.13);
        oscillator.stop(context.currentTime + 0.9 + index * 0.08);
      });
      setTimeout(() => context.close(), 1300);
    } catch (error) {
      // Som decorativo; se o navegador bloquear, a revelacao continua normal.
    }
  }

  function profileAlbumCards(albumMap, mode, selection) {
    let list = mode === "groups"
      ? cards.filter(card => card.group === selection)
      : cards.filter(card => card.code === selection);
    if (mode === "duplicates") list = list.filter(card => qtyFrom(albumMap, card.id) > 1);
    if (mode === "missing") list = list.filter(card => qtyFrom(albumMap, card.id) === 0);
    return list;
  }

  function profileAlbumCollectionStats(list, albumMap) {
    return list.reduce((total, card) => {
      const count = qtyFrom(albumMap, card.id);
      total.total += 1;
      if (count > 1) total.duplicates += 1;
      else if (count > 0) total.owned += 1;
      else total.missing += 1;
      return total;
    }, { total: 0, owned: 0, duplicates: 0, missing: 0 });
  }

  function profileAlbumStickerHtml(card, albumMap) {
    const count = qtyFrom(albumMap, card.id);
    const status = count > 1 ? "duplicate" : (count > 0 ? "owned" : "missing");
    return (
      '<span class="profile-album-sticker album-' + status + '">' +
        flagImgHtml(card) +
        '<b>' + escapeHtml(card.code) + '</b>' +
        '<strong>' + String(card.number).padStart(2, "0") + '</strong>' +
      '</span>'
    );
  }

  function onProfileClick(event) {
    const emblemGuide = event.target.closest("[data-profile-emblems]");
    const officialBadge = event.target.closest("[data-official-badge]");
    const instagram = event.target.closest(".profile-instagram");
    const albumAction = event.target.closest("[data-profile-action='album']");
    const profileChallenges = event.target.closest("[data-open-profile-challenges]");
    const profileSettings = event.target.closest("[data-open-profile-settings]");
    const albumMode = event.target.closest("[data-album-mode]");
    const albumCountry = event.target.closest("[data-album-country]");
    const albumGroup = event.target.closest("[data-album-group]");
    const albumPanel = event.target.closest("[data-profile-album]");
    const emblemPanel = event.target.closest(".profile-emblem-guide");
    const flip = event.target.closest("[data-flip-profile]");
    const messageMenu = event.target.closest("[data-message-menu]");
    const message = event.target.closest("[data-message-user]");
    const close = event.target.closest("[data-close-profile]");
    if (officialBadge) {
      showOfficialBadgeReveal(officialBadge.dataset.officialBadge, officialBadge.dataset.badgeUser || state.selectedUserId);
      event.stopPropagation();
      return;
    }
    if (emblemGuide) {
      renderProfileEmblemGuide(emblemGuide.dataset.profileUser || state.selectedUserId);
      event.stopPropagation();
      return;
    }
    if (instagram) {
      event.stopPropagation();
      return;
    }
    if (messageMenu) {
      openPresetMessageDialog(messageMenu.dataset.messageUser || state.selectedUserId);
      event.stopPropagation();
      return;
    }
    if (message) {
      sendPresetMessage(message.dataset.messageUser, message.dataset.presetMessage || "trade_interest");
      event.stopPropagation();
      return;
    }
    if (albumAction) {
      renderProfileAlbum(albumAction.dataset.profileUser || state.selectedUserId, "countries", "BRA");
      event.stopPropagation();
      return;
    }
    if (profileChallenges) {
      if (els["profile-dialog"].open) els["profile-dialog"].close();
      openChallengeDialog();
      event.stopPropagation();
      return;
    }
    if (profileSettings) {
      if (els["profile-dialog"].open) els["profile-dialog"].close();
      openAccountSettings();
      event.stopPropagation();
      return;
    }
    if (albumCountry) {
      renderProfileAlbum(albumCountry.dataset.albumUser || state.selectedUserId, albumCountry.dataset.albumMode || "countries", albumCountry.dataset.albumCountry || "BRA");
      event.stopPropagation();
      return;
    }
    if (albumGroup) {
      renderProfileAlbum(albumGroup.dataset.albumUser || state.selectedUserId, "groups", albumGroup.dataset.albumGroup || "A");
      event.stopPropagation();
      return;
    }
    if (albumMode) {
      renderProfileAlbum(albumMode.dataset.albumUser || state.selectedUserId, albumMode.dataset.albumMode || "countries", albumMode.dataset.albumSelected || "");
      event.stopPropagation();
      return;
    }
    if (albumPanel) {
      event.stopPropagation();
      return;
    }
    if (emblemPanel) {
      event.stopPropagation();
      return;
    }
    if (event.target.closest(".compare-action-btn")) {
      event.stopPropagation();
      return;
    }
    if (flip) flip.classList.toggle("flipped");
    if (close) els["profile-dialog"].close();
  }

  function onProfilePointerDown(event) {
    const panel = event.target.closest("[data-profile-album]");
    if (!panel) {
      state.profileSwipe = null;
      return;
    }
    state.profileSwipe = {
      panel,
      x: event.clientX,
      y: event.clientY
    };
  }

  function onProfilePointerUp(event) {
    if (!state.profileSwipe) return;
    const swipe = state.profileSwipe;
    state.profileSwipe = null;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    shiftProfileAlbum(swipe.panel, dx < 0 ? 1 : -1);
  }

  function onProfilePointerCancel() {
    state.profileSwipe = null;
  }

  function openPresetMessageDialog(targetUserId) {
    const targetUser = getMapUser(targetUserId);
    if (!targetUser || targetUser.id === "me") return;
    state.messageTargetUserId = targetUser.id;
    state.messageReplyToId = "";
    state.messageTargetFallback = null;
    if (els["message-target-name"]) {
      els["message-target-name"].textContent = "Para " + profileDisplayName(targetUser);
    }
    setMessageSendStatus("");
    renderPresetMessageOptions(targetUser.id);
    if (els["message-dialog"] && !els["message-dialog"].open) els["message-dialog"].showModal();
  }

  function renderPresetMessageOptions(targetUserId) {
    if (!els["message-options"]) return;
    els["message-options"].innerHTML = SAFE_MESSAGE_KEYS.map(key => {
      const preset = presetMessage(key);
      const blocked = messageCooldownRemaining(targetUserId, key) > 0;
      return (
        '<button type="button" class="message-option' + (blocked ? " cooling" : "") + '" data-message-choice="' + escapeHtml(key) + '">' +
          '<strong>' + escapeHtml(preset.label) + '</strong>' +
          '<span>' + escapeHtml(preset.text) + '</span>' +
          (blocked ? '<small>Aguarde ' + formatCooldown(messageCooldownRemaining(targetUserId, key)) + '</small>' : "") +
        '</button>'
      );
    }).join("");
  }

  function onMessageOptionClick(event) {
    const option = event.target.closest("[data-message-choice]");
    if (!option) return;
    sendPresetMessage(state.messageTargetUserId, option.dataset.messageChoice || "trade_interest");
  }

  function onProfileMessageClick(event) {
    const reply = event.target.closest("[data-reply-message]");
    if (reply) {
      openReplyMessageDialog(reply.dataset.replyMessage);
      return;
    }
    const openSender = event.target.closest("[data-open-message-user]");
    if (openSender) {
      openProfile(openSender.dataset.openMessageUser);
    }
  }

  function syncProfileViews(user) {
    if (!user || user.demo || !firebaseReady || !db) return;
    const targetUserId = user.id === "me" && currentUser && currentUser.uid ? currentUser.uid : user.id;
    if (!targetUserId || targetUserId === "me") return;
    refreshProfileViewCount(targetUserId);
    if (!currentUser || !currentUser.uid || targetUserId === currentUser.uid) return;
    recordPublicProfileView(targetUserId);
  }

  async function refreshProfileViewCount(targetUserId) {
    if (!firebaseReady || !db || !targetUserId) return;
    try {
      const doc = await db.collection(FIREBASE_COLLECTIONS.profileViews).doc(targetUserId).get();
      const views = normalizeProfileViews(doc.exists ? doc.data() : {});
      updateProfileViewCount(targetUserId, views.total);
    } catch (error) {
      console.warn("Nao foi possivel carregar visualizacoes.", error);
    }
  }

  async function recordPublicProfileView(targetUserId) {
    const day = todayKey();
    const localKey = PROFILE_VIEW_LOCAL_PREFIX + ":" + targetUserId + ":" + currentUser.uid + ":" + day;
    if (localStorage.getItem(localKey)) return;
    try {
      const ref = db.collection(FIREBASE_COLLECTIONS.profileViews).doc(targetUserId);
      let nextTotal = 1;
      await db.runTransaction(async transaction => {
        const snap = await transaction.get(ref);
        const views = normalizeProfileViews(snap.exists ? snap.data() : {});
        views.total += 1;
        views.byDay[day] = Math.max(0, Number(views.byDay[day] || 0)) + 1;
        nextTotal = views.total;
        transaction.set(ref, {
          targetUserId,
          total: views.total,
          byDay: views.byDay,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
      localStorage.setItem(localKey, "1");
      updateProfileViewCount(targetUserId, nextTotal);
    } catch (error) {
      console.warn("Nao foi possivel registrar visualizacao.", error);
    }
  }

  function normalizeProfileViews(source) {
    const data = source && typeof source === "object" ? source : {};
    const nested = data.profileViews && typeof data.profileViews === "object" ? data.profileViews : {};
    const total = Math.max(0, Math.round(Number(data.total || nested.total || data.profileViewsTotal || 0)));
    const byDay = data.byDay && typeof data.byDay === "object"
      ? Object.assign({}, data.byDay)
      : nested.byDay && typeof nested.byDay === "object"
        ? Object.assign({}, nested.byDay)
        : {};
    return { total, byDay };
  }

  function updateProfileViewCount(targetUserId, total) {
    document.querySelectorAll('[data-profile-view-user="' + cssEscape(targetUserId) + '"] b').forEach(node => {
      node.textContent = formatNumberPt(total);
    });
    const selected = getMapUser(targetUserId);
    if (selected) selected.profileViewsTotal = Math.max(0, Number(total) || 0);
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(String(value || ""));
    return String(value || "").replace(/["\\]/g, "\\$&");
  }

  function presetMessage(key) {
    return PRESET_MESSAGES[key] || PRESET_MESSAGES.trade_interest;
  }

  function messageCooldownKey(targetUserId, key) {
    const from = currentUser && currentUser.uid ? currentUser.uid : "anon";
    return "albumCopa2026MessageCooldown:" + from + ":" + targetUserId + ":" + key;
  }

  function messageCooldownRemaining(targetUserId, key) {
    const sentAt = Number(localStorage.getItem(messageCooldownKey(targetUserId, key)) || 0);
    return Math.max(0, MESSAGE_COOLDOWN_MS - (Date.now() - sentAt));
  }

  function rememberMessageCooldown(targetUserId, key) {
    localStorage.setItem(messageCooldownKey(targetUserId, key), String(Date.now()));
  }

  function messageCooldownBucket(now = Date.now()) {
    return String(Math.floor(now / MESSAGE_COOLDOWN_MS));
  }

  function notificationDocId(fromUid, targetUserId, key, bucket) {
    return [fromUid, targetUserId, key, bucket].map(value => String(value || "").replace(/[^A-Za-z0-9_-]/g, "_")).join("_");
  }

  function formatCooldown(ms) {
    const minutes = Math.max(1, Math.ceil((Number(ms) || 0) / 60000));
    return minutes + " min";
  }

  async function sendPresetMessage(targetUserId, type) {
    const fallback = state.messageTargetFallback && state.messageTargetFallback.id === targetUserId
      ? state.messageTargetFallback
      : null;
    const targetUser = getMapUser(targetUserId) || fallback;
    if (!targetUser || targetUser.id === "me") return;
    const key = PRESET_MESSAGES[type] ? type : "trade_interest";
    const preset = presetMessage(key);
    const text = preset.text;
    const replyToId = els["message-dialog"] && els["message-dialog"].open ? state.messageReplyToId || "" : "";
    const isReply = Boolean(replyToId);
    const remaining = isReply ? 0 : messageCooldownRemaining(targetUser.id, key);
    if (!isReply && remaining > 0) {
      toast("Aguarde " + formatCooldown(remaining) + " para repetir esta mensagem.");
      renderPresetMessageOptions(targetUser.id);
      return;
    }
    if (!currentUser || !currentUser.uid) {
      toast("Entre com Google para enviar notificacao.");
      return;
    }
    if (!db || !firebaseReady) {
      toast("Conta indisponivel para enviar notificacao.");
      return;
    }
    try {
      setMessageSendStatus("Enviando mensagem...");
      const bucket = messageCooldownBucket();
      const docKey = isReply ? key + "_reply_" + replyToId : key;
      const notificationId = notificationDocId(currentUser.uid, targetUser.id, docKey, bucket);
      const ref = db.collection(FIREBASE_COLLECTIONS.notifications).doc(notificationId);
      const existing = await ref.get();
      if (existing.exists) {
        if (!isReply) rememberMessageCooldown(targetUser.id, key);
        const sentMessage = isReply ? "Resposta ja enviada." : "Esta mensagem ja foi enviada. Aguarde 10 minutos.";
        setMessageSendStatus(sentMessage);
        toast(sentMessage);
        renderPresetMessageOptions(targetUser.id);
        return;
      }
      await ref.set({
        fromUid: currentUser.uid,
        fromName: currentUser.name || "Colecionador",
        fromPhoto: currentUser.photo || "",
        targetUserId: targetUser.id,
        targetName: targetUser.name,
        type: preset.type,
        messageKey: key,
        messageText: text,
        message: text,
        replyToId,
        cooldownBucket: bucket,
        status: "pending",
        response: "",
        createdAtClient: Date.now(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      if (isReply) {
        await markMessageResponded(replyToId, key, text);
      } else {
        rememberMessageCooldown(targetUser.id, key);
      }
      renderPresetMessageOptions(targetUser.id);
      const successText = isReply
        ? "Resposta enviada para " + profileDisplayName(targetUser) + "."
        : key === "trade_interest"
          ? "Interesse enviado para " + profileDisplayName(targetUser) + "."
          : "Mensagem enviada para " + profileDisplayName(targetUser) + ".";
      setMessageSendStatus(successText);
      toast(successText);
      setTimeout(() => {
        if (els["message-dialog"] && els["message-dialog"].open) els["message-dialog"].close();
        state.messageReplyToId = "";
        state.messageTargetFallback = null;
        setMessageSendStatus("");
      }, 900);
    } catch (error) {
      console.warn("Nao foi possivel enviar notificacao.", error);
      setMessageSendStatus("Nao consegui enviar agora. Tente novamente.");
      toast("Nao consegui enviar a notificacao agora.");
    }
  }

  function setMessageSendStatus(message) {
    if (!els["message-send-status"]) return;
    const text = String(message || "").trim();
    els["message-send-status"].hidden = !text;
    els["message-send-status"].textContent = text;
  }

  function closeMessageDialog() {
    state.messageReplyToId = "";
    state.messageTargetFallback = null;
    setMessageSendStatus("");
    if (els["message-dialog"]) els["message-dialog"].close();
  }

  async function markMessageResponded(notificationId, key, text) {
    if (!notificationId || !db || !firebaseReady) return;
    try {
      await db.collection(FIREBASE_COLLECTIONS.notifications).doc(notificationId).set({
        status: "responded",
        responseKey: key,
        responseText: text,
        response: text,
        responseFromUid: currentUser && currentUser.uid ? currentUser.uid : "",
        respondedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.warn("Resposta enviada, mas nao consegui marcar a mensagem original.", error);
    }
  }

  function openReplyMessageDialog(notificationId) {
    const message = state.profileMessages.find(item => item.id === notificationId);
    if (!message || !message.fromUid) {
      toast("Mensagem indisponivel para responder.");
      return;
    }
    const targetUser = getMapUser(message.fromUid) || {
      id: message.fromUid,
      name: message.fromName || "Colecionador",
      nickname: message.fromName || "",
      photo: message.fromPhoto || "",
      demo: false
    };
    state.messageTargetUserId = targetUser.id;
    state.messageReplyToId = message.id;
    state.messageTargetFallback = targetUser;
    if (els["message-target-name"]) {
      els["message-target-name"].textContent = "Responder para " + profileDisplayName(targetUser);
    }
    setMessageSendStatus("");
    renderPresetMessageOptions(targetUser.id);
    if (els["message-dialog"] && !els["message-dialog"].open) els["message-dialog"].showModal();
  }

  function pendingMessageCount() {
    return state.profileMessages.filter(message => message.status !== "responded").length;
  }

  function updateMessageBadges() {
    const count = pendingMessageCount();
    ["nav-message-count", "account-message-count"].forEach(id => {
      const node = els[id] || document.getElementById(id);
      if (!node) return;
      node.hidden = !count;
      node.textContent = count > 9 ? "9+" : String(count);
    });
  }

  function renderProfileMessages() {
    if (!els["profile-message-list"]) return;
    const connected = Boolean(currentUser && currentUser.uid);
    if (!connected) {
      if (els["profile-message-status"]) els["profile-message-status"].textContent = "Entre com Google para receber mensagens.";
      els["profile-message-list"].innerHTML = '<div class="profile-message-empty">Entre com Google para ver suas mensagens.</div>';
      updateMessageBadges();
      return;
    }
    const incoming = state.profileMessages.slice(0, MESSAGE_INBOX_LIMIT);
    const sent = state.sentProfileMessages.slice(0, 6);
    const pending = pendingMessageCount();
    if (els["profile-message-status"]) {
      els["profile-message-status"].textContent = incoming.length
        ? pending + " aguardando resposta de " + incoming.length + " recebida" + (incoming.length === 1 ? "" : "s") + "."
        : "Nenhuma mensagem recebida ainda.";
    }
    const incomingHtml = incoming.length
      ? incoming.map(message => profileMessageHtml(message, "incoming")).join("")
      : '<div class="profile-message-empty">Nenhuma mensagem recebida ainda.</div>';
    const sentHtml = sent.length
      ? '<div class="profile-message-sent-head">Enviadas recentes</div>' + sent.map(message => profileMessageHtml(message, "sent")).join("")
      : "";
    els["profile-message-list"].innerHTML = incomingHtml + sentHtml;
    updateMessageBadges();
  }

  function profileMessageHtml(message, mode) {
    const incoming = mode !== "sent";
    const displayName = incoming ? message.fromName : message.targetName;
    const photo = incoming ? message.fromPhoto : "";
    const answered = message.status === "responded" || Boolean(message.responseText);
    const time = formatMessageTime(message.createdAtMs || message.updatedAtMs);
    return (
      '<article class="profile-message-row ' + (incoming ? "incoming" : "sent") + (answered ? " answered" : "") + '">' +
        '<span class="profile-message-avatar" data-initials="' + escapeHtml(initialsFromName(displayName)) + '">' +
          (photo ? '<img src="' + escapeHtml(photo) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">' : "") +
        '</span>' +
        '<span class="profile-message-body">' +
          '<span class="profile-message-meta">' +
            '<strong>' + escapeHtml(incoming ? displayName : "Para " + displayName) + '</strong>' +
            '<small>' + escapeHtml(time) + '</small>' +
          '</span>' +
          '<span class="profile-message-text">' + escapeHtml(message.messageText || "Mensagem segura") + '</span>' +
          (message.responseText ? '<span class="profile-message-response">Resposta: ' + escapeHtml(message.responseText) + '</span>' : "") +
          '<span class="profile-message-actions">' +
            (incoming && !answered ? '<button type="button" data-reply-message="' + escapeHtml(message.id) + '">Responder</button>' : "") +
            '<em>' + escapeHtml(answered ? "Respondida" : incoming ? "Aguardando resposta" : "Enviada") + '</em>' +
          '</span>' +
        '</span>' +
      '</article>'
    );
  }

  function formatMessageTime(ms) {
    const value = Math.max(0, Number(ms) || 0);
    if (!value) return "agora";
    const diff = Date.now() - value;
    if (diff < 60000) return "agora";
    if (diff < 3600000) return Math.floor(diff / 60000) + " min";
    if (diff < 86400000) return Math.floor(diff / 3600000) + " h";
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  function albumStats(albumMap) {
    const owned = cards.filter(card => qtyFrom(albumMap, card.id) > 0).length;
    const duplicates = cards.reduce((sum, card) => sum + Math.max(0, qtyFrom(albumMap, card.id) - 1), 0);
    const missing = cards.length - owned;
    const progress = Math.round((owned / cards.length) * 100);
    return { owned, duplicates, missing, total: cards.length, progress };
  }

  function compareAlbums(otherAlbum) {
    const myDuplicates = new Set(cards.filter(card => qty(card.id) > 1).map(card => card.id));
    const myMissing = new Set(cards.filter(card => qty(card.id) === 0).map(card => card.id));
    const otherDuplicates = new Set(cards.filter(card => qtyFrom(otherAlbum, card.id) > 1).map(card => card.id));
    const otherMissing = new Set(cards.filter(card => qtyFrom(otherAlbum, card.id) === 0).map(card => card.id));
    const give = cards.filter(card => myDuplicates.has(card.id) && otherMissing.has(card.id));
    const receive = cards.filter(card => myMissing.has(card.id) && otherDuplicates.has(card.id));
    return { give, receive, total: give.length + receive.length, balanced: Math.min(give.length, receive.length) };
  }

  function qtyFrom(albumMap, cardId) {
    return Math.max(0, Number(albumMap && albumMap[cardId] || 0));
  }

  function renderGroups() {
    const groups = ["ALL"].concat(Array.from(new Set(cards.map(card => card.group))).sort());
    els["group-strip"].innerHTML = groups.map(group => (
      '<button class="group-chip' + (state.group === group ? " active" : "") + '" type="button" data-group="' + group + '">' +
      (group === "ALL" ? "Todos" : "Grupo " + group) +
      '</button>'
    )).join("");

    els["group-strip"].querySelectorAll("[data-group]").forEach(button => {
      button.addEventListener("click", () => {
        state.group = button.dataset.group || "ALL";
        renderGroups();
        renderAlbumGrid();
      });
    });
  }

  function renderUserSearchResults() {
    if (!els["user-search-results"]) return;
    const query = String(state.query || "").trim();
    if (state.view !== "album" || query.length < 2) {
      els["user-search-results"].hidden = true;
      els["user-search-results"].innerHTML = "";
      return;
    }
    const matches = matchingUsersForQuery(query);
    els["user-search-results"].hidden = false;
    els["user-search-results"].innerHTML = matches.length
      ? '<div class="user-search-head"><span>Usuarios encontrados</span><b>' + matches.length + '</b></div><div class="user-search-list">' + matches.slice(0, 12).map(userSearchRowHtml).join("") + '</div>'
      : '<div class="user-search-head"><span>Nenhum usuario encontrado</span><b>0</b></div>';
  }

  function matchingUsersForQuery(query) {
    const textQuery = normalize(query).replace(/^@+/, "");
    const usernameQuery = normalizeUsername(query);
    if (!textQuery && !usernameQuery) return [];
    const seen = new Set();
    return [myMapUser()].concat(collectorUsers)
      .filter(user => {
        if (!user || seen.has(user.id)) return false;
        seen.add(user.id);
        return userMatchesQuery(user, textQuery, usernameQuery);
      })
      .sort((a, b) => userSearchScore(b, textQuery, usernameQuery) - userSearchScore(a, textQuery, usernameQuery));
  }

  function userMatchesQuery(user, textQuery, usernameQuery) {
    const username = usernameFromProfile(user);
    const haystack = normalize([
      profileDisplayName(user),
      user.name,
      user.nickname,
      user.username,
      user.usernameLower,
      user.instagram,
      user.email
    ].filter(Boolean).join(" ")).replace(/@+/g, "");
    return Boolean(
      (textQuery && haystack.includes(textQuery)) ||
      (usernameQuery && username.includes(usernameQuery))
    );
  }

  function userSearchScore(user, textQuery, usernameQuery) {
    const username = usernameFromProfile(user);
    const name = normalize(profileDisplayName(user)).replace(/@+/g, "");
    if (usernameQuery && username === usernameQuery) return 100;
    if (textQuery && name === textQuery) return 90;
    if (usernameQuery && username.startsWith(usernameQuery)) return 80;
    if (textQuery && name.startsWith(textQuery)) return 70;
    return isOnlineNow(user) ? 20 : 10;
  }

  function userSearchRowHtml(user) {
    const tier = tradeRankTier(user);
    const userStats = albumStats(user.album || {});
    const comparison = user.id === "me" ? null : compareAlbums(user.album || {});
    const status = user.id === "me" ? "Seu card" : isOnlineNow(user) ? "Online agora" : userOnlineLabel(user);
    const tradeText = comparison ? comparison.total + " troca" + (comparison.total === 1 ? "" : "s") : userStats.progress + "% do album";
    const name = profileDisplayName(user);
    const initials = initialsFromName(name);
    const colors = user.colors || tier.colors || ["#13c8a3", "#087f63"];
    const avatar = '<span class="user-search-avatar" style="--card-a:' + colors[0] + ';--card-b:' + colors[1] + '"><b>' + escapeHtml(initials) + '</b>' + (user.photo ? '<img src="' + escapeHtml(user.photo) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '</span>';
    return (
      '<button class="user-search-row" type="button" data-search-user="' + escapeHtml(user.id) + '">' +
        avatar +
        '<span class="user-search-info">' +
          '<strong>' + escapeHtml(name) + '</strong>' +
          '<small>' + escapeHtml(status + " - " + tradeText) + '</small>' +
        '</span>' +
        '<span class="user-search-open">Abrir</span>' +
      '</button>'
    );
  }

  function onUserSearchResultsClick(event) {
    const row = event.target.closest("[data-search-user]");
    if (!row) return;
    openProfile(row.dataset.searchUser);
  }

  function renderRosterAudit() {
    if (!els["players-audit"]) return;
    if (!playerAudit) {
      els["players-audit"].textContent = "Base de jogadores padrao em uso";
      return;
    }
    const warning = (playerAudit.warnings || [])[0];
    const suffix = warning ? " - verificar " + warning.country + " (" + warning.players + "/" + warning.expected + ")" : " - estrutura completa";
    els["players-audit"].textContent = playerAudit.teams + " selecoes, " + playerAudit.players + " jogadores" + suffix;
  }

  function copyRosterWarning() {
    if (!playerAudit) {
      copyText("Base de jogadores padrao em uso.", "Aviso copiado.");
      return;
    }
    const warnings = (playerAudit.warnings || []).map(item =>
      item.country + ": " + item.players + " nomes encontrados; esperado " + item.expected + "."
    );
    const corrections = (playerAudit.corrections || []).map(item =>
      item.country + ": corrigido " + item.from.join(" / ") + " para " + item.to.join(" / ") + "."
    );
    const text = [
      "Base: " + playerAudit.teams + " selecoes, " + playerAudit.players + " jogadores.",
      "Esperado se fossem 18 por selecao: " + playerAudit.expectedPlayersIf18PerTeam + ".",
      corrections.length ? "Correcoes: " + corrections.join(" ") : "Correcoes: nenhuma.",
      warnings.length ? "Avisos: " + warnings.join(" ") : "Avisos: nenhum."
    ].join("\n");
    copyText(text, "Aviso copiado.");
  }

  function filteredCards(forcedFilter) {
    const activeFilter = forcedFilter || state.filter;
    return cards.filter(card => {
      const count = qty(card.id);
      const text = normalize(card.code + " " + card.country + " " + card.label + " " + card.number);
      if (state.group !== "ALL" && card.group !== state.group) return false;
      if (state.query && !text.includes(state.query)) return false;
      if (activeFilter === "owned" && count < 1) return false;
      if (activeFilter === "missing" && count > 0) return false;
      if (activeFilter === "duplicate" && count < 2) return false;
      return true;
    });
  }

  function renderAlbumGrid() {
    setStickerEditMode(state.stickerEditMode);
    const list = filteredCards();
    els["album-grid"].innerHTML = list.map(card => stickerHtml(card)).join("") || emptyHtml("Nada encontrado", "Ajuste a busca ou o grupo.");
    renderUserSearchResults();
  }

  function stickerHtml(card) {
    const count = qty(card.id);
    const className = count === 0 ? "missing" : count > 1 ? "duplicate" : "owned";
    return (
      '<button class="sticker sticker-compact ' + className + '" type="button" data-card-id="' + escapeHtml(card.id) + '" title="' + escapeHtml(card.code + " " + card.number + " - " + card.country) + '" style="--team-a:' + card.a + ';--team-b:' + card.b + '">' +
        '<span class="sticker-top"><span class="code-pill">' + flagImgHtml(card) + escapeHtml(card.code) + '</span><span class="qty-pill">x' + count + '</span></span>' +
        '<strong class="sticker-number">' + String(card.number).padStart(2, "0") + '</strong>' +
      '</button>'
    );
  }

  function flagImgHtml(card) {
    if (!card.flag) return "";
    return '<img class="flag-img" src="' + escapeHtml(card.flag) + '" alt="">';
  }

  function renderMissingList() {
    const list = cards.filter(card => qty(card.id) === 0);
    els["missing-list"].innerHTML = list.map(card => listRow(card)).join("") || emptyHtml("Album completo", "Todas as figurinhas estao marcadas.");
  }

  function renderDuplicateList() {
    const list = cards.filter(card => qty(card.id) > 1);
    els["duplicate-list"].innerHTML = list.map(card => (
      '<div class="trade-row" style="--team-a:' + card.a + ';--team-b:' + card.b + '">' +
        '<div class="list-row">' +
          '<div class="mini-card">' + escapeHtml(card.code) + " " + card.number + '</div>' +
          '<div><strong>' + escapeHtml(card.country) + '</strong><span>' + escapeHtml(card.label) + '</span></div>' +
          '<div class="count-stepper"><button type="button" data-dec="' + card.id + '">-</button><strong>x' + qty(card.id) + '</strong><button type="button" data-inc="' + card.id + '">+</button></div>' +
        '</div>' +
      '</div>'
    )).join("") || emptyHtml("Sem repetidas", "Marque duas ou mais unidades.");
  }

  function listRow(card) {
    return (
      '<div class="list-row" style="--team-a:' + card.a + ';--team-b:' + card.b + '">' +
        '<div class="mini-card">' + escapeHtml(card.code) + " " + card.number + '</div>' +
        '<div><strong>' + escapeHtml(card.country) + '</strong><span>' + escapeHtml(card.label) + '</span></div>' +
        '<div class="count-stepper"><button type="button" data-dec="' + card.id + '">-</button><strong>x' + qty(card.id) + '</strong><button type="button" data-inc="' + card.id + '">+</button></div>' +
      '</div>'
    );
  }

  function onCardGridClick(event) {
    const cardButton = event.target.closest("[data-card-id]");
    if (!cardButton) return;
    const cardId = cardButton.dataset.cardId;
    if (state.stickerEditMode === "remove") setQty(cardId, qty(cardId) - 1);
    else addSticker(cardId);
  }

  function onListClick(event) {
    const inc = event.target.closest("[data-inc]");
    const dec = event.target.closest("[data-dec]");
    if (inc) addSticker(inc.dataset.inc);
    else if (dec) setQty(dec.dataset.dec, qty(dec.dataset.dec) - 1);
  }

  function openDetails(cardId) {
    const card = cards.find(item => item.id === cardId);
    if (!card) return;
    els["dialog-content"].innerHTML = (
      '<div class="dialog-card" style="--team-a:' + card.a + ';--team-b:' + card.b + '">' +
        '<div class="dialog-visual">' + card.number + '</div>' +
        '<div><strong>' + escapeHtml(card.code + " " + card.number + " - " + card.label) + '</strong><span>' + escapeHtml(card.country) + '</span></div>' +
        '<div class="count-stepper"><button type="button" id="dialog-dec">-</button><strong>x' + qty(card.id) + '</strong><button type="button" id="dialog-inc">+</button></div>' +
      '</div>'
    );
    document.getElementById("dialog-inc").addEventListener("click", () => {
      addSticker(card.id);
      openDetails(card.id);
    });
    document.getElementById("dialog-dec").addEventListener("click", () => {
      setQty(card.id, qty(card.id) - 1);
      openDetails(card.id);
    });
    els["sticker-dialog"].showModal();
  }

  function makeTradeCode() {
    const payload = makePayload("Meu album");
    state.tradeCode = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    els["trade-code-label"].textContent = payload.id.slice(-6).toUpperCase();
    renderQr(state.tradeCode);
    toast("Codigo de troca gerado.");
  }

  function makePayload(name) {
    return {
      app: "Album Copa 2026 Web",
      id: "local-" + Date.now().toString(36),
      name,
      owned: cards.filter(card => qty(card.id) > 0).map(card => card.id),
      duplicates: cards.filter(card => qty(card.id) > 1).map(card => card.id),
      missing: cards.filter(card => qty(card.id) === 0).map(card => card.id)
    };
  }

  function copyTradeCode() {
    if (!state.tradeCode) makeTradeCode();
    copyText(state.tradeCode, "Codigo copiado.");
  }

  function useSampleFriend() {
    const friendAlbum = {};
    cards.forEach((card, index) => {
      if (index % 5 === 0) friendAlbum[card.id] = 2;
      else if (index % 4 === 0) friendAlbum[card.id] = 1;
    });
    const oldAlbum = state.album;
    state.album = friendAlbum;
    const payload = makePayload("Amigo");
    state.album = oldAlbum;
    els["friend-code"].value = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    toast("Codigo exemplo carregado.");
  }

  function compareFriend() {
    const value = els["friend-code"].value.trim();
    if (!value) {
      toast("Cole um codigo primeiro.");
      return;
    }
    try {
      state.friend = JSON.parse(decodeURIComponent(escape(atob(value))));
      toast("Comparacao pronta.");
      renderMatch();
    } catch (error) {
      state.friend = null;
      toast("Codigo invalido.");
    }
  }

  function renderMatch() {
    if (!els["match-panel"]) return;
    if (!state.friend) {
      els["match-panel"].innerHTML = emptyHtml("Nenhuma comparacao", "Gere ou cole um codigo de troca.");
      return;
    }
    const myDuplicates = new Set(cards.filter(card => qty(card.id) > 1).map(card => card.id));
    const myMissing = new Set(cards.filter(card => qty(card.id) === 0).map(card => card.id));
    const friendMissing = new Set(state.friend.missing || []);
    const friendDuplicates = new Set(state.friend.duplicates || []);
    const give = cards.filter(card => myDuplicates.has(card.id) && friendMissing.has(card.id));
    const receive = cards.filter(card => myMissing.has(card.id) && friendDuplicates.has(card.id));
    els["match-panel"].innerHTML = (
      '<div class="match-grid">' +
        '<div class="match-card"><strong>Voce entrega</strong>' + miniList(give) + '</div>' +
        '<div class="match-card"><strong>Voce recebe</strong>' + miniList(receive) + '</div>' +
      '</div>' +
      '<button class="primary-btn wide" type="button" id="confirm-trade">Confirmar troca local</button>'
    );
    document.getElementById("confirm-trade").addEventListener("click", () => {
      const updatedAt = Date.now();
      receive.forEach(card => { setRawQty(card.id, Math.max(1, qty(card.id)), updatedAt); });
      give.forEach(card => { setRawQty(card.id, qty(card.id) - 1, updatedAt); });
      saveAlbum(updatedAt);
      recordConfirmedTrade(receive.length + give.length);
      toast("Troca aplicada ao album.");
      render();
    });
  }

  function recordConfirmedTrade(stickerCount) {
    recordAnalyticsEvent("trade_confirmed", { stickerCount: Math.max(1, Math.round(Number(stickerCount) || 0)) });
    if (!currentUser || !currentUser.uid) return;
    const reputation = normalizeReputation(currentUser.tradeReputation || currentUser.reputation);
    reputation.tradeUsers += 1;
    reputation.tradeStickers += Math.max(1, Math.round(Number(stickerCount) || 0));
    currentUser.tradeReputation = normalizeReputation(reputation);
    saveProfile(currentUser);
    savePublicUserDoc();
  }

  function miniList(list) {
    if (!list.length) return '<span>Nada para esta troca.</span>';
    return list.slice(0, 8).map(card => '<span>' + escapeHtml(card.code + " " + card.number + " - " + card.label) + '</span>').join("");
  }

  function setRawQty(cardId, next, updatedAt) {
    const value = Math.max(0, Math.min(9, Number(next) || 0));
    if (value <= 0) delete state.album[cardId];
    else state.album[cardId] = value;
    touchAlbumCard(cardId, updatedAt);
  }

  function renderQr(text) {
    if (!els["qr-matrix"]) return;
    const hash = hashText(text || "Album Copa 2026");
    let html = "";
    for (let i = 0; i < 169; i++) {
      const finder = isFinderCell(i);
      const on = finder || ((hash + i * 17 + (i % 11) * 31) % 7 < 3);
      html += '<i class="' + (on ? "" : "off") + '"></i>';
    }
    els["qr-matrix"].innerHTML = html;
  }

  function isFinderCell(index) {
    const row = Math.floor(index / 13);
    const col = index % 13;
    return inFinder(row, col, 0, 0) || inFinder(row, col, 0, 8) || inFinder(row, col, 8, 0);
  }

  function inFinder(row, col, top, left) {
    return row >= top && row < top + 5 && col >= left && col < left + 5 &&
      (row === top || row === top + 4 || col === left || col === left + 4 || (row >= top + 2 && row <= top + 2 && col >= left + 2 && col <= left + 2));
  }

  function hashText(text) {
    return String(text).split("").reduce((sum, char) => ((sum << 5) - sum + char.charCodeAt(0)) >>> 0, 0);
  }

  function shareSummary() {
    const text = buildOwnedReport();
    recordAnalyticsEvent("share", { action: "whatsapp" });
    copyText(text, "Relatorio copiado e aberto no WhatsApp.");
    const url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function buildOwnedReport() {
    const summary = stats();
    const owned = cards.filter(card => qty(card.id) > 0);
    const rows = owned.map(card => {
      const count = qty(card.id);
      return card.code + " " + String(card.number).padStart(2, "0") + " - " + card.label + (count > 1 ? " x" + count : "");
    });
    return [
      "NEXO Card Copa 2026",
      "Tenho " + summary.owned + "/" + summary.total + " | Faltam " + summary.missing + " | Repetidas " + summary.duplicates,
      "",
      "Minhas cartas:",
      rows.join("\n") || "Ainda nao marquei cartas.",
      "",
      PUBLIC_SITE_URL
    ].join("\n");
  }

  function copyDuplicates() {
    const rows = cards.filter(card => qty(card.id) > 1).map(card => card.code + " " + card.number + " - " + card.label + " x" + qty(card.id));
    copyText(rows.join("\n") || "Sem repetidas", "Lista copiada.");
  }

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "Album Copa 2026 Web",
      album: state.album
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "album-copa-2026-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    toast("Backup exportado.");
  }

  function importJson(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || "{}"));
        const updatedAt = Date.now();
        state.album = payload.album && typeof payload.album === "object" ? payload.album : payload;
        state.albumCardUpdatedAt = normalizeAlbumCardUpdatedAt(state.album, updatedAt, markAllAlbumCardsUpdated(updatedAt));
        saveAlbum(updatedAt);
        toast("Backup importado.");
        render();
      } catch (error) {
        toast("Arquivo invalido.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function resetProgress() {
    if (!window.confirm("Apagar o progresso local deste navegador?")) return;
    const updatedAt = Date.now();
    state.album = {};
    state.albumCardUpdatedAt = markAllAlbumCardsUpdated(updatedAt);
    saveAlbum(updatedAt);
    toast("Progresso apagado.");
    render();
  }

  function applyTheme(theme) {
    const selected = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = selected;
    document.body.dataset.theme = selected;
    document.querySelector(".app-shell").dataset.theme = selected;
    localStorage.setItem(THEME_KEY, selected);
    document.querySelectorAll("[data-theme-choice]").forEach(button => {
      button.classList.toggle("active", button.dataset.themeChoice === selected);
    });
  }

  function levelName(progress) {
    if (progress >= 95) return "Lenda da Copa";
    if (progress >= 75) return "Mestre do album";
    if (progress >= 45) return "Colecionador ativo";
    if (progress >= 15) return "Primeira fase";
    return "Comecando";
  }

  function emptyHtml(title, subtitle) {
    return '<div class="empty-state"><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(subtitle) + '</span></div>';
  }

  function copyText(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast(message)).catch(() => fallbackCopy(text, message));
    } else {
      fallbackCopy(text, message);
    }
  }

  function fallbackCopy(text, message) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.focus();
    area.select();
    document.execCommand("copy");
    area.remove();
    toast(message);
  }

  function toast(message) {
    els["toast"].textContent = message;
    els["toast"].classList.add("active");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => els["toast"].classList.remove("active"), 2200);
  }

  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }
})();
