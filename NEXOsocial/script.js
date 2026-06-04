const STORE_KEY = "nexoChatStateV2";
const PHOTO_UNLOCK_LEVEL = 10;
const IMGBB_API_KEY = window.NEXO_IMGBB_API_KEY || "";

const views = document.querySelectorAll("[data-view]");
const leftColumn = document.querySelector("[data-left-column]");
const mainStage = document.querySelector("[data-main-stage]");
const rightColumn = document.querySelector("[data-right-column]");
const modal = document.querySelector("[data-modal]");
const gifGrid = document.querySelector("[data-gif-grid]");
const badgeModal = document.querySelector("[data-badge-modal]");
const giftModal = document.querySelector("[data-gift-modal]");
const giftGrid = document.querySelector("[data-gift-grid]");
const toast = document.querySelector("[data-toast]");
const spaceParallax = document.querySelector("[data-space-parallax]");

const launchBadge = {
  id: "cheguei-brasil",
  name: "Cheguei Brasil",
  fullName: "Cheguei Brasil - Fundador NEXO",
  deadlineLabel: "30/06/2026",
  image: "https://i.ibb.co/HTdqKBr4/11-layout-primus-2.png"
};

const defaultAvatar = {
  style: "masc",
  skin: "#f0b78f",
  hairStyle: "short",
  hair: "#151823",
  shirt: "#2f66c7",
  accessory: "none",
  expression: "happy",
  background: "#e9f4ff"
};

const avatarOptions = {
  style: ["masc", "fem", "neutral"],
  skin: ["#f0b78f", "#c47f56", "#8f563b", "#5d3829", "#f2c8a9", "#2f1f1a"],
  hairStyle: ["short", "long", "curly", "mohawk", "bald"],
  hair: ["#151823", "#6a3f2a", "#d69a34", "#c85b84", "#f2f2f2"],
  shirt: ["#2f66c7", "#38a37a", "#9b4d78", "#e0a53b", "#26364f"],
  accessory: ["none", "glasses", "beard", "hat", "earring"],
  expression: ["happy", "serious", "wink"]
};

const GIPHY_API_KEY = window.NEXO_GIPHY_API_KEY || localStorage.getItem("nexo-social-giphy-key") || "";

const gifs = [
  { id: "aplausos", label: "Aplausos", text: "uhul", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif", previewUrl: "https://media.giphy.com/media/111ebonMs90YLu/200.gif", provider: "GIPHY" },
  { id: "risada", label: "Risada", text: "haha", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", previewUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif", provider: "GIPHY" },
  { id: "saudade", label: "Saudade", text: "saudade", url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif", previewUrl: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/200.gif", provider: "GIPHY" },
  { id: "cheguei", label: "Cheguei", text: "cheguei", url: "https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif", previewUrl: "https://media.giphy.com/media/ASd0Ukj0y3qMM/200.gif", provider: "GIPHY" },
  { id: "ideia", label: "Ideia", text: "ideia", url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif", previewUrl: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/200.gif", provider: "GIPHY" },
  { id: "apoio", label: "Apoio", text: "apoio", url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif", previewUrl: "https://media.giphy.com/media/26u4cqiYI30juCOGY/200.gif", provider: "GIPHY" }
];

const gifts = [
  { id: "cubo", name: "Cubo NEXO", cost: 10, colors: ["#58ebe1", "#2b67c7"] },
  { id: "trofeu", name: "Trofeu", cost: 15, colors: ["#ffe079", "#df9f2d"] },
  { id: "camisa10", name: "Camisa 10", cost: 20, colors: ["#2e986f", "#174384"] },
  { id: "cafe", name: "Cafezinho", cost: 8, colors: ["#8a5a30", "#df9f2d"] },
  { id: "brilho", name: "Brilho", cost: 12, colors: ["#a24f7c", "#58ebe1"] },
  { id: "respeito", name: "Respeito", cost: 25, colors: ["#26364f", "#2b67c7"] }
];

const publicWatchRooms = [
  {
    id: "cartoon-retro",
    name: "Cartoon Retro",
    communityId: "memorias-internet",
    description: "Sessao leve de desenhos e nostalgia para comentar junto.",
    accent: ["#35a7ff", "#a24f7c"],
    viewers: 123,
    sources: [
      { title: "Classicos em dominio publico", embedUrl: "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?autoplay=0&rel=0", thumb: "linear-gradient(135deg, #26364f, #a24f7c)" },
      { title: "Sessao nostalgia", embedUrl: "https://www.youtube-nocookie.com/embed/YE7VzlLtp-4?autoplay=0&rel=0", thumb: "linear-gradient(135deg, #2b67c7, #df9f2d)" }
    ],
    messages: [
      { author: "Bia", text: "alguem mais ama desenho antigo?", time: "20:31" },
      { author: "Lucas", text: "isso aqui tem cara de sabado de manha", time: "20:32" },
      { author: "Nina", text: "vim so ficar um pouco com voces", time: "20:33" }
    ]
  },
  {
    id: "lofi-cantos",
    name: "Lo-fi dos cantos",
    communityId: "praca-nexo",
    description: "Musica de fundo para estudar, trabalhar e conversar baixo.",
    accent: ["#19e0bd", "#35a7ff"],
    viewers: 87,
    sources: [
      { title: "Radio calma", embedUrl: "https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=0&rel=0", thumb: "linear-gradient(135deg, #092735, #2e986f)" },
      { title: "Sala de foco", embedUrl: "https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=0&rel=0", thumb: "linear-gradient(135deg, #06151c, #35a7ff)" }
    ],
    messages: [
      { author: "Akemi", text: "deixei aberto enquanto organizo a comunidade", time: "agora" },
      { author: "Rafa", text: "bom para trabalhar com gente por perto", time: "agora" }
    ]
  },
  {
    id: "futebol-debate",
    name: "Futebol debate",
    communityId: "futebol-da-rodada",
    description: "Mesa social para comentar lances, palpites e resenha leve.",
    accent: ["#2e986f", "#df9f2d"],
    viewers: 215,
    sources: [
      { title: "Pre-jogo da rodada", embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PL8fVUTBmJhHKE4DgAVNnG5tE3ZdUyG_mr&autoplay=0&rel=0", thumb: "linear-gradient(135deg, #113b2b, #df9f2d)" },
      { title: "Resenha da arquibancada", embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PL9tY0BWXOZFvQnRjR2wAGh8rH8QOT9N7P&autoplay=0&rel=0", thumb: "linear-gradient(135deg, #2e986f, #174384)" }
    ],
    messages: [
      { author: "Lucas", text: "palpite sem briga vale aqui", time: "agora" },
      { author: "Mika", text: "so vim pela resenha", time: "agora" }
    ]
  },
  {
    id: "docu-cafe",
    name: "Docu cafe",
    communityId: "nexo-df",
    description: "Documentarios e conversas calmas para descobrir coisas juntos.",
    accent: ["#e0a53b", "#35a7ff"],
    viewers: 42,
    sources: [
      { title: "Curiosidades em sessao", embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PLQlnTldJs0ZQqLScQMr9t88rRREjU62eJ&autoplay=0&rel=0", thumb: "linear-gradient(135deg, #26364f, #8a5a30)" },
      { title: "Cafe e documentario", embedUrl: "https://www.youtube-nocookie.com/embed/21X5lGlDOfg?autoplay=0&rel=0", thumb: "linear-gradient(135deg, #092735, #e0a53b)" }
    ],
    messages: [
      { author: "Rafa", text: "isso combina com domingo lento", time: "agora" },
      { author: "Tiago", text: "docu bom sempre puxa conversa boa", time: "agora" }
    ]
  }
];

const seedState = {
  route: "home",
  selectedCommunityId: "praca-nexo",
  selectedWatchRoomId: "cartoon-retro",
  activeWatchRoomId: null,
  watchComments: {},
  pendingGif: null,
  user: {
    id: "local-user",
    name: "Visitante NEXO",
    handle: "visitante",
    status: "testando o NEXO Social",
    city: "Brasil",
    level: 12,
    coins: 120,
    interests: ["comunidades", "reacoes", "nostalgia"],
    joinedCommunities: ["praca-nexo", "reacoes-recados", "memorias-internet", "nexo-df"],
    badges: ["fundador local", "primeiro recado", "avatar proprio"],
    launchBadgeClaimed: false,
    avatar: defaultAvatar,
    profileVisualMode: "avatar",
    photoUrl: ""
  },
  communities: [
    {
      id: "praca-nexo",
      name: "Praca NEXO",
      category: "geral",
      description: "O ponto de chegada para conversar, conhecer gente e testar o clima do NEXO.",
      members: 42,
      owner: "Akemi",
      colors: ["#2b67c7", "#2e986f"],
      rules: ["Respeite o assunto da roda.", "Sem spam ou golpe.", "Critica pode, ataque pessoal nao."],
      topics: [
        { id: "t1", title: "Quem chegou hoje se apresenta aqui", replies: 18, last: "ha 4 min" },
        { id: "t2", title: "Ideias para o NEXO Social ficar com cara de comunidade", replies: 9, last: "hoje" }
      ]
    },
    {
      id: "reacoes-recados",
      name: "Reacoes e recados",
      category: "jovem",
      description: "Recados rapidos e reacoes para deixar o mural vivo sem guardar arquivo pesado.",
      members: 18,
      owner: "Mika",
      colors: ["#38a37a", "#a24f7c"],
      rules: ["Reacao leve e recado curto.", "Nada de flood repetido.", "Use spoiler quando precisar."],
      topics: [
        { id: "t3", title: "Melhores reacoes de bom dia", replies: 12, last: "ontem" },
        { id: "t4", title: "Qual reacao falta no NEXO?", replies: 6, last: "hoje" }
      ]
    },
    {
      id: "memorias-internet",
      name: "Memorias da Internet",
      category: "adulto",
      description: "Nostalgia digital, depoimentos, comunidades antigas e lembrancas da internet social.",
      members: 31,
      owner: "Tiago",
      colors: ["#2b67c7", "#e0a53b"],
      rules: ["Nostalgia sem briga geracional.", "Pode indicar comunidade antiga.", "Preserve a boa conversa."],
      topics: [
        { id: "t5", title: "Qual comunidade voce recriaria hoje?", replies: 21, last: "ha 1 h" },
        { id: "t6", title: "Depoimentos que davam orgulho", replies: 8, last: "hoje" }
      ]
    },
    {
      id: "nexo-df",
      name: "NEXO DF",
      category: "local",
      description: "Eventos, encontros, empregos e noticias locais em formato de comunidade.",
      members: 27,
      owner: "Rafa",
      colors: ["#26364f", "#2b67c7"],
      rules: ["Marque cidade ou bairro.", "Nada de anuncio enganoso.", "Ajude quem esta chegando."],
      topics: [
        { id: "t7", title: "Eventos do fim de semana", replies: 5, last: "ha 30 min" },
        { id: "t8", title: "Vagas e indicacoes", replies: 14, last: "hoje" }
      ]
    },
    {
      id: "futebol-da-rodada",
      name: "Futebol da Rodada",
      category: "futebol",
      description: "Palpites, zoeira sadia, camisa 10 da semana e conversa de arquibancada.",
      members: 53,
      owner: "Lucas",
      colors: ["#2e986f", "#df9f2d"],
      rules: ["Rivalidade sem ataque pessoal.", "Sem link suspeito.", "Respeite o moderador da rodada."],
      topics: [
        { id: "t9", title: "Palpites do brasileirao", replies: 25, last: "ha 12 min" },
        { id: "t10", title: "Quem foi o camisa 10 da rodada?", replies: 17, last: "hoje" }
      ]
    },
    {
      id: "nexo-games",
      name: "NEXO Games",
      category: "games",
      description: "Videogame, Roblox, console, PC, mobile e convite para jogar com a galera.",
      members: 46,
      owner: "Nina",
      colors: ["#a24f7c", "#2b67c7"],
      rules: ["Combine partidas com respeito.", "Nao venda conta.", "Sem golpe de item."],
      topics: [
        { id: "t11", title: "Quem joga hoje a noite?", replies: 20, last: "ha 20 min" },
        { id: "t12", title: "Indique um game leve para jogar com amigos", replies: 13, last: "hoje" }
      ]
    },
    {
      id: "vagas-classificados",
      name: "Vagas e Classificados",
      category: "empregos",
      description: "Indicacoes, servicos, oportunidades e classificados leves por comunidade.",
      members: 39,
      owner: "Rafa",
      colors: ["#26364f", "#2e986f"],
      rules: ["Informe cidade/bairro.", "Nada de promessa falsa.", "Denuncie golpe."],
      topics: [
        { id: "t13", title: "Vagas abertas esta semana", replies: 16, last: "ha 1 h" },
        { id: "t14", title: "Quem indica profissional confiavel?", replies: 10, last: "hoje" }
      ]
    }
  ],
  friends: [
    { id: "akemi", name: "Akemi", tag: "moderadora", level: 18, skin: "#f0b78f", shirt: "#2b67c7", status: "organizando a Praca NEXO" },
    { id: "mika", name: "Mika", tag: "reacoes", level: 9, skin: "#c47f56", shirt: "#38a37a", status: "testando reacoes" },
    { id: "hinata", name: "Hinata", tag: "anime", level: 15, skin: "#8f563b", shirt: "#9b4d78", status: "abrindo topicos" },
    { id: "lucas", name: "Lucas", tag: "fundador", level: 12, skin: "#f0b78f", shirt: "#e0a53b", status: "online agora" },
    { id: "nina", name: "Nina", tag: "eventos", level: 7, skin: "#5d3829", shirt: "#2f66c7", status: "procurando comunidade local" },
    { id: "rafa", name: "Rafa", tag: "DF", level: 11, skin: "#c47f56", shirt: "#9b4d78", status: "montando classificados" }
  ],
  posts: [
    {
      id: "p1",
      scope: "praca-nexo",
      author: "Akemi",
      text: "Criei a comunidade Praca NEXO. Quem entrar primeiro vira fundador.",
      gif: null,
      created: "ha poucos minutos",
      reactions: { curti: 3, haha: 1, saudade: 0, apoio: 2 },
      reacted: null,
      comments: [{ author: "Mika", text: "Ja deixei meu primeiro recado." }]
    },
    {
      id: "p2",
      scope: "home",
      author: "Tiago",
      text: "Teste inicial: comunidades, amizades e avatar sem precisar armazenar foto.",
      gif: null,
      created: "hoje",
      reactions: { curti: 5, haha: 0, saudade: 2, apoio: 4 },
      reacted: null,
      comments: []
    },
    {
      id: "p3",
      scope: "reacoes-recados",
      author: "Mika",
      text: "Reacao visual entra aqui sem ocupar seu Firebase.",
      gif: gifs[3],
      created: "ontem",
      reactions: { curti: 2, haha: 4, saudade: 0, apoio: 1 },
      reacted: null,
      comments: []
    }
  ],
  testimonials: [
    { from: "Akemi", text: "Chegou com a vibe certa: simples, azulzinho e cheio de comunidade." },
    { from: "Rafa", text: "Se tiver bairro, eventos e vagas, adulto entra sem pensar muito." }
  ]
};

let state = loadState();
saveState();
let activeComposerScope = "home";
let activeGiftPostId = null;
let toastTimer = null;
let splashCubeBoost = null;
let persistentWatchPlayer = null;
let persistentWatchSrc = "";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!saved || !saved.user) return clone(seedState);
    return mergeState(clone(seedState), saved);
  } catch {
    return clone(seedState);
  }
}

function mergeState(base, saved) {
  const userBadges = Array.isArray(saved.user?.badges) ? saved.user.badges : base.user.badges;
  const badges = saved.user?.launchBadgeClaimed && !userBadges.includes(launchBadge.name)
    ? [launchBadge.name, ...userBadges]
    : userBadges;
  const savedCommunities = Array.isArray(saved.communities) ? saved.communities : [];
  const savedPosts = Array.isArray(saved.posts) ? saved.posts : [];
  const merged = {
    ...base,
    ...saved,
    pendingGif: null,
    user: { ...base.user, ...saved.user, badges, avatar: { ...defaultAvatar, ...(saved.user?.avatar || {}) } },
    categoryFilter: saved.categoryFilter || "todas",
    pendingScrapTo: saved.pendingScrapTo || null,
    activeWatchRoomId: saved.activeWatchRoomId || null,
    watchComments: saved.watchComments && typeof saved.watchComments === "object" ? saved.watchComments : {},
    communities: mergeById(base.communities, savedCommunities),
    friends: Array.isArray(saved.friends) ? saved.friends : base.friends,
    posts: mergeById(base.posts, savedPosts).map((post) => ({ gifts: {}, ...post })),
    testimonials: Array.isArray(saved.testimonials) ? saved.testimonials : base.testimonials
  };
  return sanitizeLegacyTerms(merged);
}

function sanitizeLegacyTerms(value) {
  const replaceText = (text) => text
    .replaceAll("NEXO chat", "NEXO Social")
    .replaceAll("nexo chat", "NEXO Social")
    .replaceAll("Memorias Orkut", "Memorias da Internet")
    .replaceAll("memorias orkut", "memorias da internet")
    .replaceAll("Orkut", "internet social")
    .replaceAll("orkut", "internet social")
    .replaceAll("GIFs e scraps", "Reacoes e recados")
    .replaceAll("gifs e scraps", "reacoes e recados")
    .replaceAll("GIF externo", "Reacao visual")
    .replaceAll("GIFs", "Reacoes")
    .replaceAll("GIF", "Reacao")
    .replaceAll("gifs", "reacoes")
    .replaceAll("gifs-scraps", "reacoes-recados")
    .replaceAll("memorias-orkut", "memorias-internet")
    .replaceAll("Scrap", "Recado")
    .replaceAll("scraps", "recados")
    .replaceAll("scrap", "recado");

  if (typeof value === "string") return replaceText(value);
  if (Array.isArray(value)) return value.map(sanitizeLegacyTerms);
  if (value && typeof value === "object") {
    Object.keys(value).forEach((key) => {
      value[key] = sanitizeLegacyTerms(value[key]);
    });
  }
  return value;
}

function mergeById(baseItems, savedItems) {
  const map = new Map(baseItems.map((item) => [item.id, item]));
  savedItems.forEach((item) => map.set(item.id, { ...(map.get(item.id) || {}), ...item }));
  return [...map.values()];
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function setView(name) {
  views.forEach((view) => view.classList.toggle("active", view.dataset.view === name));
}

function setRoute(route, communityId) {
  state.route = route;
  if (communityId) state.selectedCommunityId = communityId;
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function findCommunity(id = state.selectedCommunityId) {
  return state.communities.find((community) => community.id === id) || state.communities[0];
}

function isJoined(id) {
  return state.user.joinedCommunities.includes(id);
}

function joinedCommunities() {
  return state.communities.filter((community) => isJoined(community.id));
}

function hotTopics() {
  return state.communities.flatMap((community) =>
    community.topics.map((topic) => ({ ...topic, communityId: community.id, communityName: community.name }))
  ).sort((a, b) => b.replies - a.replies);
}

function onlineFriends(limit = 6) {
  return state.friends.slice(0, limit);
}

function activeWatchRooms() {
  return publicWatchRooms.map((room, index) => {
    const source = currentWatchSource(room);
    const community = state.communities.find((item) => item.id === room.communityId) || state.communities[0];
    return {
      ...room,
      source,
      community,
      viewersNow: room.viewers + ((new Date().getHours() + index * 7) % 19)
    };
  });
}

function currentWatchSource(room) {
  const sources = room.sources || [];
  if (!sources.length) return null;
  const slot = Math.floor(Date.now() / (1000 * 60 * 45));
  return sources[slot % sources.length];
}

function selectedWatchRoom() {
  return activeWatchRooms().find((room) => room.id === state.selectedWatchRoomId) || activeWatchRooms()[0];
}

function getWatchMessages(room) {
  const saved = Array.isArray(state.watchComments?.[room.id]) ? state.watchComments[room.id] : [];
  return [...(room.messages || []), ...saved];
}

function hasLaunchBadge() {
  return Boolean(state.user.launchBadgeClaimed || state.user.badges.includes(launchBadge.name));
}

function renderBadgePill(badge) {
  if (badge === launchBadge.name) {
    return `
      <span class="badge badge-special">
        <img src="${launchBadge.image}" alt="" />
        <span>${escapeHtml(badge)}</span>
      </span>
    `;
  }
  return `<span class="badge">${escapeHtml(badge)}</span>`;
}

function renderLaunchBadgeMini() {
  if (!hasLaunchBadge()) return "";
  return `<img class="post-badge" src="${launchBadge.image}" alt="${launchBadge.fullName}" title="${launchBadge.fullName}" />`;
}

function canUseProfilePhoto() {
  return Number(state.user.level || 1) >= PHOTO_UNLOCK_LEVEL || state.user.premium === true;
}

function profileVisual(size = "") {
  const photoUrl = String(state.user.photoUrl || "").trim();
  if (state.user.profileVisualMode === "photo" && photoUrl && canUseProfilePhoto()) {
    return `<img class="profile-photo ${size}" src="${escapeHtml(photoUrl)}" alt="Foto de perfil de ${escapeHtml(state.user.name)}" loading="lazy" />`;
  }
  return avatarSvg(state.user.avatar, size);
}

function avatarSvg(avatar = state.user.avatar, size = "") {
  const classes = [
    "nexo-avatar",
    size,
    `style-${avatar.style}`,
    `hair-${avatar.hairStyle}`,
    `expression-${avatar.expression}`,
    avatar.accessory === "glasses" ? "has-glasses" : "",
    avatar.accessory === "beard" ? "has-beard" : "",
    avatar.accessory === "hat" ? "has-hat" : "",
    avatar.accessory === "earring" ? "has-earring" : ""
  ].filter(Boolean).join(" ");

  return `
    <svg class="${classes}" viewBox="0 0 180 220" role="img" aria-label="Avatar NEXO" style="--avatar-skin:${avatar.skin};--avatar-hair:${avatar.hair};--avatar-shirt:${avatar.shirt}">
      <ellipse class="avatar-shadow" cx="90" cy="207" rx="52" ry="10"></ellipse>
      <g class="body">
        <path class="shirt-fill shoulders" d="M42 204l10-58c5-23 20-34 38-34s33 11 38 34l10 58H42z"></path>
        <path fill="rgba(255,255,255,.22)" d="M72 120l18 26 18-26 13 8-18 42H77l-18-42z"></path>
        <path class="line-art" d="M70 126l20 33 20-33M90 158v42"></path>
      </g>
      <g class="head">
        <path class="skin-fill" d="M50 70c0-31 17-50 40-50s40 19 40 50v22c0 30-17 50-40 50s-40-20-40-50V70z"></path>
        <path class="skin-fill" d="M50 82c-9 0-14 8-12 18 2 9 8 14 14 12M130 82c9 0 14 8 12 18-2 9-8 14-14 12"></path>
      </g>
      <g class="hair">
        <path class="hair-fill hair-shape" d="M45 73c-6-33 16-58 46-59 28-1 47 17 48 47-10-9-22-13-35-12 1 9-6 16-17 20-1-8-7-15-16-17-5 10-14 17-28 21 2 6 2 12 0 18-5-4-7-10-8-18z"></path>
        <path class="hair-fill hair-long" d="M45 75c-6-35 16-61 45-61s48 20 48 58c0 31-11 58-23 76-3-18-2-36 0-54-6 4-14 6-23 6-15 0-29-6-39-18 3 28 2 49-5 65-12-23-14-47-3-72z"></path>
        <g class="hair-curls">
          <circle class="hair-fill" cx="56" cy="58" r="16"></circle>
          <circle class="hair-fill" cx="75" cy="38" r="17"></circle>
          <circle class="hair-fill" cx="96" cy="34" r="18"></circle>
          <circle class="hair-fill" cx="118" cy="52" r="17"></circle>
          <circle class="hair-fill" cx="128" cy="75" r="14"></circle>
          <circle class="hair-fill" cx="48" cy="80" r="14"></circle>
        </g>
        <path class="hair-fill hair-mohawk" d="M83 18c5 12 8 24 7 39 8-12 15-22 22-29 2 24-2 43-13 56H72c-7-22-3-44 11-66z"></path>
      </g>
      <g class="avatar-hat">
        <path fill="#26364f" d="M48 62h84c-3-22-18-34-42-34S51 40 48 62z"></path>
        <path fill="#2b67c7" d="M37 64h106c3 0 5 2 5 5s-2 5-5 5H37c-3 0-5-2-5-5s2-5 5-5z"></path>
      </g>
      <g class="face">
        <path class="line-art" d="M66 80c6-5 14-5 20 0M96 80c6-5 14-5 20 0"></path>
        <circle class="eye-fill" cx="76" cy="91" r="4"></circle>
        <circle class="eye-fill right-eye" cx="106" cy="91" r="4"></circle>
        <path class="line-art wink-eye" d="M101 91h12"></path>
        <path class="line-art mouth-smile" d="M78 112c8 8 20 8 28 0"></path>
        <path class="line-art mouth-serious" d="M80 113h24"></path>
      </g>
      <g class="avatar-glasses">
        <path class="line-art" d="M61 87h27v16H61zM94 87h27v16H94zM88 95h6"></path>
      </g>
      <g class="avatar-beard">
        <path fill="rgba(42,29,22,.45)" d="M68 108c5 21 39 21 44 0-5 30-39 30-44 0z"></path>
      </g>
      <g class="avatar-earring">
        <circle fill="#e0a53b" cx="132" cy="107" r="5"></circle>
      </g>
    </svg>
  `;
}

function fakeGif(gif) {
  if (!gif) return "";
  const imageUrl = gif.previewUrl || gif.url;
  if (imageUrl) {
    return `
      <figure class="real-gif">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(gif.label || "GIF")}" loading="lazy" />
        <figcaption>${escapeHtml(gif.label || "GIF")}</figcaption>
      </figure>
    `;
  }
  const colors = Array.isArray(gif.colors) ? gif.colors : ["#2e986f", "#2b67c7", "#a24f7c"];
  return `
    <div class="fake-gif" style="--gif-a:${colors[0]};--gif-b:${colors[1]};--gif-c:${colors[2]}">
      <span class="gif-orbit"></span>
      <span class="gif-spark spark-one"></span>
      <span class="gif-spark spark-two"></span>
      <strong>${escapeHtml(gif.text || gif.label || "GIF")}</strong>
    </div>
  `;
}

function communityIcon(community) {
  const initials = community.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return `<span class="community-icon" style="--c1:${community.colors[0]};--c2:${community.colors[1]}">${escapeHtml(initials)}</span>`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

function render() {
  document.body.dataset.route = state.route;
  renderNav();
  renderLeft();
  renderMain();
  renderRight();
  bindDynamicEvents();
  mountPersistentWatchPlayer();
}

function renderNav() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    const route = button.dataset.route;
    button.classList.toggle("active", route === state.route || (route === "communities" && state.route === "community"));
  });
  document.querySelectorAll(".bottom-nav [data-route]").forEach((button) => {
    const route = button.dataset.route;
    button.classList.toggle("active", route === state.route || (route === "communities" && state.route === "community"));
  });
}

function renderLeft() {
  const isProfileRoute = state.route === "profile";
  leftColumn.innerHTML = `
    <section class="profile-card panel side-profile">
      <div class="avatar-frame" style="background:linear-gradient(145deg, ${state.user.avatar.background}, #f6f0e6)">
        ${profileVisual()}
      </div>
      <h2>${escapeHtml(state.user.name)}</h2>
      <p>${escapeHtml(state.user.status)}</p>
      <button class="secondary-button profile-edit-shortcut" type="button" data-route="profile">editar identidade</button>
      <div class="profile-stats">
        <span><strong>${state.friends.length}</strong> amigos</span>
        <span><strong>${state.posts.length}</strong> recados</span>
        <span><strong>${state.user.joinedCommunities.length}</strong> comunidades</span>
        <span><strong>${state.user.coins || 0}</strong> coins</span>
      </div>
    </section>

    <section class="panel side-badges">
      <div class="panel-title">
        <h2>Emblemas</h2>
        <span>${state.user.badges.length}</span>
      </div>
      <div class="badge-row">
        ${state.user.badges.map(renderBadgePill).join("")}
      </div>
    </section>

    ${isProfileRoute ? `<section class="panel avatar-panel side-avatar-builder">
      <div class="panel-title">
        <h2>Avatar</h2>
        <button class="secondary-button" type="button" data-random-avatar>aleatorio</button>
      </div>
      ${avatarControl("style", "Estilo", [["masc", "homem"], ["fem", "mulher"], ["neutral", "neutro"]])}
      ${avatarSwatches("skin", "Pele", avatarOptions.skin)}
      ${avatarControl("hairStyle", "Cabelo", [["short", "curto"], ["long", "longo"], ["curly", "cacheado"], ["mohawk", "moicano"], ["bald", "careca"]])}
      ${avatarSwatches("hair", "Cor do cabelo", avatarOptions.hair)}
      ${avatarSwatches("shirt", "Roupa", avatarOptions.shirt)}
      ${avatarControl("accessory", "Acessorios", [["none", "sem"], ["glasses", "oculos"], ["beard", "barba"], ["hat", "bone"], ["earring", "brinco"]])}
      ${avatarControl("expression", "Expressao", [["happy", "feliz"], ["serious", "serio"], ["wink", "piscando"]])}
    </section>` : ""}
  `;
}

function avatarControl(key, label, items) {
  return `
    <div class="control-group">
      <span>${label}</span>
      <div class="segmented" data-avatar-control="${key}">
        ${items.map(([value, text]) => `<button type="button" data-value="${value}" class="${state.user.avatar[key] === value ? "active" : ""}">${text}</button>`).join("")}
      </div>
    </div>
  `;
}

function avatarSwatches(key, label, items) {
  return `
    <div class="control-group">
      <span>${label}</span>
      <div class="swatches" data-avatar-control="${key}">
        ${items.map((value) => `<button type="button" style="--swatch:${value}" data-value="${value}" class="${state.user.avatar[key] === value ? "active" : ""}" aria-label="${label} ${value}"></button>`).join("")}
      </div>
    </div>
  `;
}

function renderMain() {
  if (state.route === "profile") {
    renderProfile();
    return;
  }
  if (state.route === "friends") {
    renderFriends();
    return;
  }
  if (state.route === "communities") {
    renderCommunities();
    return;
  }
  if (state.route === "community") {
    renderCommunity(findCommunity());
    return;
  }
  if (state.route === "watch") {
    renderWatchLobby();
    return;
  }
  if (state.route === "watch-room") {
    renderWatchRoom(selectedWatchRoom());
    return;
  }
  renderHome();
}

function renderHome() {
  const homePosts = state.posts.filter((post) => post.scope === "home" || isJoined(post.scope));
  const featured = joinedCommunities();
  const topics = hotTopics().slice(0, 4);
  const activeCommunities = featured.slice(0, 4);
  mainStage.innerHTML = `
    <section class="quick-publish panel">
      <div class="quick-avatar">${avatarSvg(state.user.avatar, "tiny")}</div>
      <button type="button" data-focus-composer>Compartilhe algo com seus cantos</button>
      <button type="button" data-open-gif="home">Reacao</button>
    </section>

    ${composer("home", "publicar no seu mural")}

    <section class="panel home-communities-panel">
      <div class="panel-title">
        <h2>Seus cantos</h2>
        <span>${featured.length}</span>
      </div>
      <div class="home-community-strip">
        ${activeCommunities.map((community) => `
          <button class="home-community-card" type="button" data-open-community="${community.id}">
            ${communityIcon(community)}
            <span>
              <strong>${escapeHtml(community.name)}</strong>
              <small>${community.members} membros - ${escapeHtml(community.category)}</small>
            </span>
          </button>
        `).join("")}
        <button class="home-community-card add-community-card" type="button" data-route="communities">
          <i>+</i>
          <span>
            <strong>Explorar</strong>
            <small>encontre novos cantos</small>
          </span>
        </button>
      </div>
    </section>

    <section class="panel topic-focus-panel">
      <div class="panel-title">
        <h2>Assuntos em movimento</h2>
        <span>agora</span>
      </div>
      <div class="topic-rail">
        ${topics.map((topic) => `
          <button class="topic-chip" type="button" data-open-community="${topic.communityId}">
            <strong>${escapeHtml(topic.title)}</strong>
            <span>${topic.replies} respostas em ${escapeHtml(topic.communityName)}</span>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Atualizações</h2>
        <span>das comunidades</span>
      </div>
      <div class="feed">
        ${homePosts.map(renderPost).join("") || emptyState("Ainda nao tem recado por aqui.")}
      </div>
    </section>

    ${renderLaunchEventPanel(true)}
  `;
}

function renderLaunchEventPanel(compact = false) {
  const claimed = hasLaunchBadge();
  const title = claimed ? "Emblema garantido" : "O primeiro emblema esta vivo";
  const action = claimed ? "ver emblema" : "abrir cubo";
  return `
    <section class="launch-event panel ${compact ? "compact" : ""} ${claimed ? "claimed" : ""}" data-launch-event>
      <div class="launch-copy">
        <p class="eyebrow">evento fundador</p>
        <h2>${title}</h2>
        <p>${claimed ? "Voce ja tem o Cheguei Brasil no perfil. Quem chegar ate a data limite tambem garante." : "Tem algo se mexendo dentro do cubo. Clique para liberar o Cheguei Brasil antes que acabe."}</p>
        <div class="launch-meta">
          <span>emblema unico</span>
          <span>ate ${launchBadge.deadlineLabel}</span>
          <span>${claimed ? "resgatado" : "resgate gratis"}</span>
        </div>
      </div>
      <button class="living-cube-card" type="button" data-claim-launch-badge aria-label="${action} Cheguei Brasil">
        <span class="cube-aura" aria-hidden="true"></span>
        <span class="living-cube" aria-hidden="true">
          <i class="cube-face cube-front"></i>
          <i class="cube-face cube-back"></i>
          <i class="cube-face cube-right"></i>
          <i class="cube-face cube-left"></i>
          <i class="cube-face cube-top"></i>
          <i class="cube-face cube-bottom"></i>
        </span>
        <span class="cube-label">${action}</span>
      </button>
      <div class="launch-badge-preview">
        <img src="${launchBadge.image}" alt="${launchBadge.fullName}" />
      </div>
    </section>
  `;
}

function renderProfile() {
  mainStage.innerHTML = `
    <section class="profile-hero panel">
      <div class="profile-hero-avatar">
        ${profileVisual()}
      </div>
      <div class="profile-hero-copy">
        <p class="eyebrow">perfil</p>
        <h2>${escapeHtml(state.user.name)}</h2>
        <p>@${escapeHtml(state.user.handle)} - ${escapeHtml(state.user.city)} - ${escapeHtml(state.user.status)}</p>
        <div class="badge-row">
          ${state.user.badges.map(renderBadgePill).join("")}
        </div>
      </div>
      <div class="profile-score">
        <div><strong>${state.friends.length}</strong><span>amigos</span></div>
        <div><strong>${state.user.joinedCommunities.length}</strong><span>comunidades</span></div>
        <div><strong>${state.posts.length}</strong><span>recados</span></div>
      </div>
    </section>

    <section class="panel profile-actions-panel">
      <div class="panel-title">
        <h2>Identidade</h2>
        <span>${canUseProfilePhoto() ? "foto liberada no nivel 10" : `foto no nivel ${PHOTO_UNLOCK_LEVEL}`}</span>
      </div>
      <div class="profile-action-grid">
        <button type="button" data-random-avatar>
          <strong>Surpreenda</strong>
          <span>gera outro avatar</span>
        </button>
        <button type="button" data-focus-composer>
          <strong>Novo recado</strong>
          <span>publique no mural</span>
        </button>
        <button type="button" data-route="communities">
          <strong>Novos cantos</strong>
          <span>explore comunidades</span>
        </button>
      </div>
      <div class="photo-upload-panel ${canUseProfilePhoto() ? "" : "is-locked"}">
        <div>
          <strong>Foto de perfil</strong>
          <span>${canUseProfilePhoto()
            ? "Opcional. O avatar continua sendo sua identidade NEXO."
            : `Desbloqueia no nivel ${PHOTO_UNLOCK_LEVEL}. Voce esta no nivel ${state.user.level || 1}.`}</span>
        </div>
        ${canUseProfilePhoto() ? `
          <label class="photo-file-button" for="profile-photo-file">escolher foto</label>
          <input id="profile-photo-file" data-profile-photo-file type="file" accept="image/png,image/jpeg,image/webp" />
          <button class="secondary-button" type="button" data-upload-profile-photo>enviar ImgBB</button>
          ${state.user.photoUrl ? `
            <button class="secondary-button" type="button" data-use-photo-mode>usar foto</button>
            <button class="secondary-button" type="button" data-use-avatar-mode>usar avatar</button>
          ` : ""}
          <small>O NEXO guarda somente a URL da imagem.</small>
        ` : `
          <button class="secondary-button" type="button" disabled>bloqueado</button>
        `}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Editar perfil</h2>
        <span>salva neste navegador</span>
      </div>
      <form class="edit-form" data-profile-form>
        <div class="form-grid">
          <div class="field">
            <label for="profile-name">Nome</label>
            <input id="profile-name" name="name" value="${escapeHtml(state.user.name)}" maxlength="34" />
          </div>
          <div class="field">
            <label for="profile-handle">Apelido</label>
            <input id="profile-handle" name="handle" value="${escapeHtml(state.user.handle)}" maxlength="24" />
          </div>
        </div>
        <div class="field">
          <label for="profile-city">Cidade</label>
          <input id="profile-city" name="city" value="${escapeHtml(state.user.city)}" maxlength="40" />
        </div>
        <div class="field">
          <label for="profile-status">Status</label>
          <textarea id="profile-status" name="status" rows="3" maxlength="120">${escapeHtml(state.user.status)}</textarea>
        </div>
        <div class="form-actions">
          <button class="primary-button" type="submit">salvar perfil</button>
          <button class="secondary-button" type="button" data-route="home">voltar ao inicio</button>
        </div>
      </form>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Depoimentos</h2>
        <span>${state.testimonials.length}</span>
      </div>
      <div class="stack">
        ${state.testimonials.map((item) => `
          <article class="testimonial-card">
            <strong>${escapeHtml(item.from)}</strong>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFriends() {
  const suggested = [
    { name: "Bia", tag: "games", skin: "#f2c8a9", shirt: "#38a37a" },
    { name: "Dani", tag: "eventos", skin: "#8f563b", shirt: "#e0a53b" },
    { name: "Noah", tag: "musica", skin: "#c47f56", shirt: "#2b67c7" }
  ];
  mainStage.innerHTML = `
    <section class="friends-hero panel">
      <div>
        <p class="eyebrow">amigos</p>
        <h2>Gente para conversar agora.</h2>
        <p>Amizade aqui vira comunidade, comentario, recado, convite para topico e presenca no mural.</p>
      </div>
      <div class="friend-online-stack">
        ${onlineFriends(4).map((friend) => `<i class="friend-avatar" style="--skin:${friend.skin};--shirt:${friend.shirt}" title="${escapeHtml(friend.name)}"></i>`).join("")}
      </div>
      <div class="hero-actions">
        <button class="primary-button" type="button" data-add-friend>adicionar sugestao</button>
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Sugestoes para seguir</h2>
        <span>por interesses</span>
      </div>
      <div class="suggestion-row">
        ${suggested.map((friend) => `
          <article class="suggestion-card">
            <i class="friend-avatar" style="--skin:${friend.skin};--shirt:${friend.shirt}"></i>
            <strong>${friend.name}</strong>
            <span>${friend.tag}</span>
            <button class="secondary-button" type="button" data-add-friend>adicionar</button>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Lista de amigos</h2>
        <span>online e recentes</span>
      </div>
      <div class="friend-list">
        ${state.friends.map(renderFriend).join("")}
      </div>
    </section>
  `;
}

function renderFriend(friend) {
  return `
    <article class="friend-card">
      <span class="friend-avatar" style="--skin:${friend.skin};--shirt:${friend.shirt}"></span>
      <div class="friend-body">
        <strong>${escapeHtml(friend.name)}</strong>
        <p>${escapeHtml(friend.status)}</p>
        <div class="friend-meta">
          <span>nivel ${friend.level}</span>
          <span>${escapeHtml(friend.tag)}</span>
        </div>
      </div>
      <button class="secondary-button" type="button" data-send-scrap="${friend.id}">recado</button>
    </article>
  `;
}

function renderCommunities() {
  const categories = ["todas", "adulto", "jovem", "local", "games", "futebol", "eventos", "empregos"];
  const grouped = state.categoryFilter && state.categoryFilter !== "todas"
    ? state.communities.filter((community) => community.category === state.categoryFilter)
    : state.communities;
  mainStage.innerHTML = `
    <section class="communities-hero panel">
      <div>
        <p class="eyebrow">comunidades</p>
        <h2>Explore cantos para cada fase da vida.</h2>
        <p>Adultos encontram bairro, eventos, trabalho e classificados. Jovens encontram memes, anime, games, musica e conversas rapidas.</p>
      </div>
      <div class="community-hero-stats">
        <strong>${state.communities.reduce((total, community) => total + community.members, 0)}</strong>
        <span>membros somados</span>
      </div>
      <div class="hero-actions">
        <button class="primary-button" type="button" data-scroll-create>criar comunidade</button>
      </div>
    </section>

    <section class="panel category-panel">
      <div class="panel-title">
        <h2>Categorias</h2>
        <span>toque para explorar</span>
      </div>
      <div class="category-row">
        ${categories.map((category) => `<button class="chip ${category === (state.categoryFilter || "todas") ? "active" : ""}" type="button" data-category-filter="${category}">${category}</button>`).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Comunidades em destaque</h2>
        <span>${state.communities.length}</span>
      </div>
      <div class="community-list featured-community-grid">
        ${grouped.map(renderCommunityCard).join("") || emptyState("Nenhuma comunidade nessa categoria ainda. Crie a primeira.")}
      </div>
    </section>

    <section class="panel" id="create-community">
      <div class="panel-title">
        <h2>Criar comunidade</h2>
        <span>rede social</span>
      </div>
      <form class="create-form" data-community-form>
        <div class="form-grid">
          <div class="field">
            <label for="community-name">Nome</label>
            <input id="community-name" name="name" maxlength="36" placeholder="ex: NEXO Games" required />
          </div>
          <div class="field">
            <label for="community-category">Categoria</label>
            <input id="community-category" name="category" maxlength="20" placeholder="games, local, adulto" required />
          </div>
        </div>
        <div class="field">
          <label for="community-description">Descricao</label>
          <textarea id="community-description" name="description" rows="3" maxlength="150" placeholder="sobre o que essa comunidade conversa?" required></textarea>
        </div>
        <button class="primary-button" type="submit">criar e entrar</button>
      </form>
    </section>
  `;
}

function renderCommunityCard(community) {
  return `
    <article class="community-card ${community.id === state.selectedCommunityId ? "active" : ""}">
      ${communityIcon(community)}
      <div class="community-body">
        <strong>${escapeHtml(community.name)}</strong>
        <p>${escapeHtml(community.description)}</p>
        <div class="community-meta">
          <span>${community.members} membros</span>
          <span>${escapeHtml(community.category)}</span>
          <span>${isJoined(community.id) ? "participando" : "aberta"}</span>
        </div>
      </div>
      <button class="secondary-button" type="button" data-open-community="${community.id}">abrir</button>
    </article>
  `;
}

function renderCommunity(community) {
  const posts = state.posts.filter((post) => post.scope === community.id);
  mainStage.innerHTML = `
    <section class="community-hero panel">
      ${communityIcon(community)}
      <div class="community-body">
        <p class="eyebrow">comunidade</p>
        <h2>${escapeHtml(community.name)}</h2>
        <p>${escapeHtml(community.description)}</p>
        <div class="community-meta">
          <span>${community.members} membros</span>
          <span>dono: ${escapeHtml(community.owner)}</span>
          <span>${escapeHtml(community.category)}</span>
        </div>
      </div>
      <div class="hero-actions">
        <button class="${isJoined(community.id) ? "secondary-button" : "primary-button"}" type="button" data-join-community="${community.id}">
          ${isJoined(community.id) ? "participando" : "participar"}
        </button>
        <button class="secondary-button" type="button" data-route="communities">voltar</button>
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Topicos</h2>
        <span>forum</span>
      </div>
      <div class="topic-list">
        ${community.topics.map((topic) => `
          <article class="topic-card">
            <strong>${escapeHtml(topic.title)}</strong>
            <p>${topic.replies} respostas - ${escapeHtml(topic.last)}</p>
          </article>
        `).join("")}
      </div>
    </section>

    ${composer(community.id, `escrever em ${community.name}`)}

    <section class="panel">
      <div class="panel-title">
        <h2>Mural da comunidade</h2>
        <span>${posts.length} recados</span>
      </div>
      <div class="feed">
        ${posts.map(renderPost).join("") || emptyState("Seja o primeiro a deixar um recado nesta comunidade.")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Regras</h2>
        <span>moderacao</span>
      </div>
      <ol class="rule-list">
        ${community.rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}
      </ol>
    </section>
  `;
}

function renderWatchLobby() {
  const rooms = activeWatchRooms();
  const featured = rooms[0];
  mainStage.innerHTML = `
    <section class="watch-hero panel">
      <div>
        <p class="eyebrow">assista junto</p>
        <h2>Salas vivas para ficar junto.</h2>
        <p>Conteudo publico entra como fundo da convivencia: escolha uma sala, veja quem esta por perto e converse sem pressa.</p>
      </div>
      <button class="primary-button" type="button" data-open-watch="${featured.id}">entrar agora</button>
    </section>

    <section class="panel watch-room-panel">
      <div class="panel-title">
        <h2>Ao vivo agora</h2>
        <span>rotacao automatica</span>
      </div>
      <div class="watch-room-grid">
        ${rooms.map(renderWatchRoomCard).join("")}
      </div>
    </section>

    <section class="panel watch-note-panel">
      <strong>Salas automaticas, nao feed infinito.</strong>
      <p>As fontes publicas ficam em uma lista curada e a sala troca o embed por horario. O centro continua sendo comunidade, presenca e conversa.</p>
    </section>
  `;
}

function renderWatchRoomCard(room) {
  return `
    <button class="watch-room-card" type="button" data-open-watch="${room.id}" style="--watch-a:${room.accent[0]};--watch-b:${room.accent[1]}">
      <span class="watch-thumb" style="background:${room.source?.thumb || `linear-gradient(135deg, ${room.accent[0]}, ${room.accent[1]})`}">
        <i>AO VIVO</i>
      </span>
      <strong>${escapeHtml(room.name)}</strong>
      <small>${escapeHtml(room.source?.title || room.description)}</small>
      <em>${room.viewersNow} juntos</em>
    </button>
  `;
}

function renderWatchRoom(room) {
  state.activeWatchRoomId = room.id;
  saveState();
  const messages = getWatchMessages(room);
  const watchScope = `watch:${room.id}`;
  const pendingGif = state.pendingGif?.scope === watchScope ? state.pendingGif.gif : null;
  mainStage.innerHTML = `
    <section class="watch-session panel" style="--watch-a:${room.accent[0]};--watch-b:${room.accent[1]}">
      <div class="watch-session-head">
        <button class="secondary-button" type="button" data-route="watch">voltar</button>
        <div>
          <p class="eyebrow">assista junto</p>
          <h2>${escapeHtml(room.name)}</h2>
        </div>
        <span>${room.viewersNow} assistindo</span>
      </div>
      <div class="watch-player watch-player-slot" data-watch-player-slot="${room.id}">
        <span class="live-badge">AO VIVO</span>
      </div>
    </section>

    <section class="panel watch-room-info">
      <span class="watch-mini-thumb" style="background:${room.source?.thumb || `linear-gradient(135deg, ${room.accent[0]}, ${room.accent[1]})`}"></span>
      <div>
        <strong>${escapeHtml(room.source?.title || room.name)}</strong>
        <p>${escapeHtml(room.description)}</p>
      </div>
      <button class="secondary-button" type="button" data-open-community="${room.community.id}">comunidade</button>
    </section>

    <section class="panel watch-chat">
      <div class="watch-presence-line">
        ${onlineFriends(4).map((friend) => `<i class="friend-avatar" style="--skin:${friend.skin};--shirt:${friend.shirt}" title="${escapeHtml(friend.name)}"></i>`).join("")}
        <span>${room.viewersNow} pessoas por aqui</span>
      </div>
      <div class="watch-chat-list">
        <div class="watch-system">Carlos entrou</div>
        ${messages.map((message) => `
          <article class="watch-message">
            <span class="friend-avatar" style="--skin:${friendAvatar(message.author).skin};--shirt:${friendAvatar(message.author).shirt}"></span>
            <div>
              <strong>${escapeHtml(message.author)}</strong>
              <p>${escapeHtml(message.text)}</p>
              ${fakeGif(message.gif)}
            </div>
            <time>${escapeHtml(message.time)}</time>
          </article>
        `).join("")}
        <div class="watch-system">Rafa entrou</div>
      </div>
      <form class="watch-comment-form" data-watch-comment>
        <input name="watchComment" data-watch-comment-input maxlength="120" placeholder="comentar..." />
        <button class="secondary-button" type="button" data-open-gif="${watchScope}">Reacao</button>
        <button class="primary-button" type="button" data-submit-watch-comment>enviar</button>
      </form>
      ${fakeGif(pendingGif)}
    </section>
  `;
}

function composer(scope, label) {
  const gif = state.pendingGif?.scope === scope ? state.pendingGif.gif : null;
  const recipient = scope === "home" && state.pendingScrapTo
    ? state.friends.find((friend) => friend.id === state.pendingScrapTo)
    : null;
  const finalLabel = recipient ? `recado para ${recipient.name}` : label;
  const placeholder = recipient ? `mande um recado para ${recipient.name}` : "o que voce quer deixar no mural?";
  return `
    <section class="composer panel" data-composer-scope="${scope}">
      <label for="composer-${scope}">${escapeHtml(finalLabel)}</label>
      <textarea id="composer-${scope}" rows="3" data-composer-text placeholder="${escapeHtml(placeholder)}"></textarea>
      ${fakeGif(gif)}
      <div class="composer-actions">
        <button type="button" class="secondary-button" data-open-gif="${scope}">Reacao</button>
        <button type="button" class="primary-button" data-post="${scope}">postar</button>
      </div>
    </section>
  `;
}

function renderPost(post) {
  const reactions = ["curti", "haha", "saudade", "apoio"];
  const giftList = Object.entries(post.gifts || {}).filter(([, count]) => count > 0);
  return `
    <article class="post" data-post-id="${post.id}">
      <div class="post-head">
        <div>${avatarSvg(post.author === state.user.name ? state.user.avatar : friendAvatar(post.author), "tiny")}</div>
        <div class="post-body">
          <div class="author-line">
            <strong>${escapeHtml(post.author)}</strong>
            ${post.author === state.user.name ? renderLaunchBadgeMini() : ""}
          </div>
          <p>${escapeHtml(post.text)}</p>
          ${fakeGif(post.gif)}
          <span class="post-time">${escapeHtml(post.created)}</span>
          <div class="reaction-row">
            ${reactions.map((reaction) => `
              <button class="reaction-button ${post.reacted === reaction ? "active" : ""}" type="button" data-react="${post.id}" data-reaction="${reaction}">
                ${reaction} ${post.reactions?.[reaction] || 0}
              </button>
            `).join("")}
            <button class="reaction-button gift-action" type="button" data-open-gift="${post.id}">presentear</button>
            <button class="reaction-button" type="button" data-report="${post.id}">denunciar</button>
          </div>
          ${giftList.length ? `
            <div class="gift-row">
              ${giftList.map(([giftId, count]) => {
                const gift = gifts.find((item) => item.id === giftId) || gifts[0];
                return `<span class="gift-pill" style="--g1:${gift.colors[0]};--g2:${gift.colors[1]}">${escapeHtml(gift.name)} ${count}</span>`;
              }).join("")}
            </div>
          ` : ""}
          <div class="comment-list">
            ${(post.comments || []).map((comment) => `<div class="comment"><strong>${escapeHtml(comment.author)}:</strong> ${escapeHtml(comment.text)}</div>`).join("")}
          </div>
          <form class="comment-form" data-comment-form="${post.id}">
            <label class="sr-only" for="comment-${post.id}">Comentario</label>
            <input id="comment-${post.id}" name="comment" maxlength="120" placeholder="comentar" />
            <button class="secondary-button" type="submit">enviar</button>
          </form>
        </div>
      </div>
    </article>
  `;
}

function friendAvatar(author) {
  const friend = state.friends.find((item) => item.name === author);
  return {
    ...defaultAvatar,
    skin: friend?.skin || "#f0b78f",
    shirt: friend?.shirt || "#2f66c7",
    hair: "#151823",
    hairStyle: "short"
  };
}

function renderRight() {
  const topCommunities = state.communities.slice(0, 5);
  const friends = state.friends.slice(0, 6);
  const rooms = topCommunities.slice(0, 3);
  const watchRooms = activeWatchRooms();
  const featuredWatch = watchRooms[0];
  rightColumn.innerHTML = `
    <section class="panel room-panel">
      <div class="panel-title">
        <h2>Salas abertas</h2>
        <span>${rooms.length}</span>
      </div>
      <div class="right-list">
        ${rooms.map((community, index) => `
          <button type="button" class="community-item room-item" data-open-community="${community.id}">
            <strong>${escapeHtml(community.name)}</strong>
            <span>${Math.max(3, 12 - index * 3)} por aqui</span>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="panel watch-side-panel" style="--watch-a:${featuredWatch.accent[0]};--watch-b:${featuredWatch.accent[1]}">
      <button class="watch-side-card" type="button" data-route="watch">
        <span>Assista junto</span>
        <strong>${escapeHtml(featuredWatch.name)}</strong>
        <small>AO VIVO</small>
        <i aria-hidden="true">play</i>
      </button>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Pessoas</h2>
        <span>${state.friends.length}</span>
      </div>
      <div class="friend-grid">
        ${friends.map((friend) => `
          <button type="button" data-send-scrap="${friend.id}">
            <i class="friend-avatar" style="--skin:${friend.skin};--shirt:${friend.shirt}"></i>
            <span>${escapeHtml(friend.name)}</span>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>Comunidades</h2>
        <span>${state.communities.length}</span>
      </div>
      <div class="right-list">
        ${topCommunities.map((community) => `
          <button type="button" class="community-item ${community.id === state.selectedCommunityId ? "active" : ""}" data-open-community="${community.id}">
            <strong>${escapeHtml(community.name)}</strong>
            <span>${community.members} membros</span>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="panel moderation-panel">
      <div class="panel-title">
        <h2>Moderação</h2>
        <span>limpo</span>
      </div>
      <div class="stack">
        <article class="notice-card">
          <strong>Ambiente cuidado</strong>
          <p class="small-copy">Denuncia, regras e moderadores entram como base de confiança.</p>
        </article>
      </div>
    </section>
  `;
}

function ensurePersistentWatchPlayer() {
  if (persistentWatchPlayer) return persistentWatchPlayer;
  persistentWatchPlayer = document.createElement("section");
  persistentWatchPlayer.className = "persistent-watch-player";
  persistentWatchPlayer.hidden = true;
  persistentWatchPlayer.innerHTML = `
    <div class="persistent-watch-frame" data-persistent-watch-frame></div>
    <div class="persistent-watch-info">
      <strong data-persistent-watch-title>Assista junto</strong>
      <span data-persistent-watch-meta>ao vivo</span>
    </div>
    <button class="secondary-button" type="button" data-return-watch>voltar</button>
    <button class="icon-button" type="button" data-close-watch aria-label="Fechar video">x</button>
  `;
  document.querySelector(".app-view")?.appendChild(persistentWatchPlayer);
  return persistentWatchPlayer;
}

function mountPersistentWatchPlayer() {
  const player = ensurePersistentWatchPlayer();
  const activeId = state.activeWatchRoomId;
  const room = activeId ? activeWatchRooms().find((item) => item.id === activeId) : null;
  if (!room || !room.source?.embedUrl) {
    player.hidden = true;
    persistentWatchSrc = "";
    player.querySelector("[data-persistent-watch-frame]").innerHTML = "";
    return;
  }

  const frameHost = player.querySelector("[data-persistent-watch-frame]");
  if (persistentWatchSrc !== room.source.embedUrl || !frameHost.querySelector("iframe")) {
    persistentWatchSrc = room.source.embedUrl;
    frameHost.innerHTML = `<iframe src="${escapeHtml(room.source.embedUrl)}" title="${escapeHtml(room.name)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }

  player.style.setProperty("--watch-a", room.accent[0]);
  player.style.setProperty("--watch-b", room.accent[1]);
  player.querySelector("[data-persistent-watch-title]").textContent = room.name;
  player.querySelector("[data-persistent-watch-meta]").textContent = `${room.viewersNow} assistindo`;

  const slot = document.querySelector(`[data-watch-player-slot="${CSS.escape(room.id)}"]`);
  if (state.route === "watch-room" && slot) {
    slot.appendChild(player);
    player.hidden = false;
    player.classList.remove("is-mini");
    player.classList.add("is-full");
  } else {
    document.querySelector(".app-view")?.appendChild(player);
    player.hidden = false;
    player.classList.remove("is-full");
    player.classList.add("is-mini");
  }

  player.querySelector("[data-return-watch]").onclick = () => {
    state.selectedWatchRoomId = room.id;
    state.route = "watch-room";
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  player.querySelector("[data-close-watch]").onclick = () => {
    state.activeWatchRoomId = null;
    saveState();
    persistentWatchSrc = "";
    frameHost.innerHTML = "";
    player.hidden = true;
  };
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function focusComposer() {
  const composerNode = document.querySelector("[data-composer-scope]");
  if (!composerNode) {
    setRoute("home");
    setTimeout(focusComposer, 80);
    return;
  }
  composerNode.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => composerNode.querySelector("[data-composer-text]")?.focus(), 250);
}

function beginLaunchBadgeClaim() {
  const card = document.querySelector("[data-launch-event]");
  card?.classList.add("unlocking");
  playUnlockSound();

  if (hasLaunchBadge()) {
    setTimeout(() => openBadgeReveal(false), 650);
    return;
  }

  setTimeout(() => {
    state.user.launchBadgeClaimed = true;
    state.user.badges = [launchBadge.name, ...state.user.badges.filter((badge) => badge !== launchBadge.name)];
    state.posts.unshift({
      id: uid("post"),
      scope: "home",
      author: state.user.name,
      text: `Eu desbloqueei o emblema unico ${launchBadge.fullName}.`,
      gif: null,
      created: "agora",
      reactions: { curti: 0, haha: 0, saudade: 0, apoio: 0 },
      reacted: null,
      comments: []
    });
    saveState();
    render();
    openBadgeReveal(true);
  }, 1350);
}

function openBadgeReveal(fresh) {
  badgeModal.querySelector("[data-badge-image]").src = launchBadge.image;
  badgeModal.querySelector("[data-badge-title]").textContent = launchBadge.fullName;
  badgeModal.querySelector("[data-badge-copy]").textContent = fresh
    ? "Voce garantiu o primeiro emblema unico do NEXO. Esse brilho agora aparece no seu perfil."
    : "Esse emblema ja esta no seu perfil. Compartilhe para chamar mais gente antes do prazo.";
  badgeModal.hidden = false;
}

function closeBadgeReveal() {
  badgeModal.hidden = true;
}

function playUnlockSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.04);
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.15);
    master.connect(context.destination);

    [180, 260, 392, 660].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 3 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.12);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.4, context.currentTime + index * 0.12 + 0.18);
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + index * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.12 + 0.35);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(context.currentTime + index * 0.12);
      oscillator.stop(context.currentTime + index * 0.12 + 0.42);
    });
  } catch {
    // Som e bonus visual: o desbloqueio continua funcionando se o navegador bloquear audio.
  }
}

async function shareBadge() {
  const shareText = `Eu garanti o primeiro emblema unico do NEXO: ${launchBadge.fullName}. Entra antes que acabe: ${location.href}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: launchBadge.fullName, text: shareText, url: location.href });
      return;
    }
    await navigator.clipboard.writeText(shareText);
    showToast("Texto de compartilhamento copiado.");
  } catch {
    showToast("Chame a galera: emblema Cheguei Brasil liberado no NEXO.");
  }
}

function initSpaceParallax() {
  if (!spaceParallax || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let currentScroll = window.scrollY;
  let ticking = false;

  function update() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    currentScroll += (window.scrollY - currentScroll) * 0.08;
    spaceParallax.style.setProperty("--mx", `${currentX.toFixed(2)}px`);
    spaceParallax.style.setProperty("--my", `${currentY.toFixed(2)}px`);
    spaceParallax.style.setProperty("--scroll", `${currentScroll.toFixed(2)}px`);
    ticking = Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1 || Math.abs(window.scrollY - currentScroll) > 0.1;
    if (ticking) requestAnimationFrame(update);
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("pointermove", (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 34;
    targetY = (event.clientY / window.innerHeight - 0.5) * 28;
    requestUpdate();
  }, { passive: true });

  window.addEventListener("scroll", requestUpdate, { passive: true });
  requestUpdate();
}

function bindDynamicEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    if (button.dataset.boundRoute) return;
    button.dataset.boundRoute = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setRoute(button.dataset.route);
    });
  });

  document.querySelectorAll("[data-avatar-control] button").forEach((button) => {
    if (button.dataset.boundAvatar) return;
    button.dataset.boundAvatar = "1";
    button.addEventListener("click", () => {
      const key = button.closest("[data-avatar-control]").dataset.avatarControl;
      state.user.avatar[key] = button.dataset.value;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-toggle-interest]").forEach((button) => {
    if (button.dataset.boundInterest) return;
    button.dataset.boundInterest = "1";
    button.addEventListener("click", () => {
      const interest = button.dataset.toggleInterest;
      state.user.interests = state.user.interests.includes(interest)
        ? state.user.interests.filter((item) => item !== interest)
        : [...state.user.interests, interest];
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-open-community]").forEach((button) => {
    if (button.dataset.boundCommunity) return;
    button.dataset.boundCommunity = "1";
    button.addEventListener("click", () => setRoute("community", button.dataset.openCommunity));
  });

  document.querySelectorAll("[data-open-watch]").forEach((button) => {
    if (button.dataset.boundWatch) return;
    button.dataset.boundWatch = "1";
    button.addEventListener("click", () => {
      state.selectedWatchRoomId = button.dataset.openWatch;
      state.activeWatchRoomId = button.dataset.openWatch;
      state.route = "watch-room";
      saveState();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-watch-comment]").forEach((form) => {
    if (form.dataset.boundWatchComment) return;
    form.dataset.boundWatchComment = "1";
    form.addEventListener("submit", submitWatchComment);
  });

  document.querySelectorAll("[data-submit-watch-comment]").forEach((button) => {
    if (button.dataset.boundWatchSubmit) return;
    button.dataset.boundWatchSubmit = "1";
    button.addEventListener("click", submitWatchComment);
  });

  document.querySelectorAll("[data-join-community]").forEach((button) => {
    if (button.dataset.boundJoin) return;
    button.dataset.boundJoin = "1";
    button.addEventListener("click", () => toggleJoin(button.dataset.joinCommunity));
  });

  document.querySelectorAll("[data-open-gif]").forEach((button) => {
    if (button.dataset.boundGif) return;
    button.dataset.boundGif = "1";
    button.addEventListener("click", () => openGifModal(button.dataset.openGif));
  });

  document.querySelectorAll("[data-post]").forEach((button) => {
    if (button.dataset.boundPost) return;
    button.dataset.boundPost = "1";
    button.addEventListener("click", () => submitPost(button.dataset.post));
  });

  document.querySelectorAll("[data-react]").forEach((button) => {
    if (button.dataset.boundReact) return;
    button.dataset.boundReact = "1";
    button.addEventListener("click", () => reactToPost(button.dataset.react, button.dataset.reaction));
  });

  document.querySelectorAll("[data-report]").forEach((button) => {
    if (button.dataset.boundReport) return;
    button.dataset.boundReport = "1";
    button.addEventListener("click", () => showToast("Denuncia marcada para a moderacao revisar."));
  });

  document.querySelectorAll("[data-open-gift]").forEach((button) => {
    if (button.dataset.boundGift) return;
    button.dataset.boundGift = "1";
    button.addEventListener("click", () => openGiftModal(button.dataset.openGift));
  });

  document.querySelectorAll("[data-comment-form]").forEach((form) => {
    if (form.dataset.boundComment) return;
    form.dataset.boundComment = "1";
    form.addEventListener("submit", (event) => submitComment(event, form.dataset.commentForm));
  });

  document.querySelectorAll("[data-send-scrap]").forEach((button) => {
    if (button.dataset.boundScrap) return;
    button.dataset.boundScrap = "1";
    button.addEventListener("click", () => {
      const friend = state.friends.find((item) => item.id === button.dataset.sendScrap);
      state.pendingScrapTo = friend?.id || null;
      saveState();
      setRoute("home");
      setTimeout(() => {
        showToast(`Recado rapido aberto para ${friend?.name || "amigo"}.`);
        focusComposer();
      }, 80);
    });
  });

  document.querySelectorAll("[data-category-filter]").forEach((button) => {
    if (button.dataset.boundCategory) return;
    button.dataset.boundCategory = "1";
    button.addEventListener("click", () => {
      state.categoryFilter = button.dataset.categoryFilter;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-focus-composer]").forEach((button) => {
    if (button.dataset.boundComposerFocus) return;
    button.dataset.boundComposerFocus = "1";
    button.addEventListener("click", focusComposer);
  });

  document.querySelectorAll("[data-claim-launch-badge]").forEach((button) => {
    if (button.dataset.boundLaunchBadge) return;
    button.dataset.boundLaunchBadge = "1";
    button.addEventListener("click", beginLaunchBadgeClaim);
  });

  const profileForm = document.querySelector("[data-profile-form]");
  if (profileForm) profileForm.addEventListener("submit", submitProfile);

  const communityForm = document.querySelector("[data-community-form]");
  if (communityForm) communityForm.addEventListener("submit", submitCommunity);

  const addFriend = document.querySelector("[data-add-friend]");
  if (addFriend) addFriend.addEventListener("click", addSuggestedFriend);

  const randomAvatar = document.querySelector("[data-random-avatar]");
  if (randomAvatar) randomAvatar.addEventListener("click", randomizeAvatar);

  const uploadProfilePhoto = document.querySelector("[data-upload-profile-photo]");
  if (uploadProfilePhoto) uploadProfilePhoto.addEventListener("click", uploadPhotoToImgBB);

  const useAvatarMode = document.querySelector("[data-use-avatar-mode]");
  if (useAvatarMode) useAvatarMode.addEventListener("click", () => {
    state.user.profileVisualMode = "avatar";
    saveState();
    render();
    showToast("Avatar NEXO ativado.");
  });

  const usePhotoMode = document.querySelector("[data-use-photo-mode]");
  if (usePhotoMode) usePhotoMode.addEventListener("click", () => {
    if (!state.user.photoUrl) return;
    state.user.profileVisualMode = "photo";
    saveState();
    render();
    showToast("Foto de perfil ativada.");
  });

  const scrollCreate = document.querySelector("[data-scroll-create]");
  if (scrollCreate) scrollCreate.addEventListener("click", () => {
    document.querySelector("#create-community")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function submitPost(scope) {
  const composerNode = document.querySelector(`[data-composer-scope="${CSS.escape(scope)}"]`);
  const textNode = composerNode?.querySelector("[data-composer-text]");
  const text = textNode?.value.trim();
  const gif = state.pendingGif?.scope === scope ? state.pendingGif.gif : null;
  if (!text && !gif) return;

  state.posts.unshift({
    id: uid("post"),
    scope,
    author: state.user.name,
    text: state.pendingScrapTo && scope === "home"
      ? `Para ${state.friends.find((friend) => friend.id === state.pendingScrapTo)?.name || "um amigo"}: ${text || "deixei um recado no NEXO."}`
      : text || "Compartilhei uma reacao.",
    gif,
    created: "agora",
    reactions: { curti: 0, haha: 0, saudade: 0, apoio: 0 },
    reacted: null,
    gifts: {},
    comments: []
  });
  state.pendingGif = null;
  state.pendingScrapTo = null;
  saveState();
  render();
  showToast("Recado publicado.");
}

function submitComment(event, postId) {
  event.preventDefault();
  const input = event.currentTarget.elements.comment;
  const text = input.value.trim();
  if (!text) return;
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  post.comments = post.comments || [];
  post.comments.push({ author: state.user.name, text });
  saveState();
  render();
}

function submitWatchComment(event) {
  event.preventDefault();
  const roomId = state.selectedWatchRoomId;
  const form = event.currentTarget.closest?.("[data-watch-comment]") || event.currentTarget;
  const input = form.elements?.watchComment || form.querySelector?.("[data-watch-comment-input]");
  const text = input.value.trim();
  const gifScope = `watch:${roomId}`;
  const gif = state.pendingGif?.scope === gifScope ? state.pendingGif.gif : null;
  if (!text && !gif) return;

  state.watchComments = state.watchComments || {};
  state.watchComments[roomId] = [
    ...(state.watchComments[roomId] || []),
    {
      author: state.user.name,
      text: text || "Compartilhou uma reacao.",
      gif,
      time: "agora"
    }
  ];
  if (gif) state.pendingGif = null;
  input.value = "";
  saveState();
  render();
  showToast("Comentario enviado para a sessao.");
}

function reactToPost(postId, reaction) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  post.reactions = post.reactions || {};
  if (post.reacted === reaction) {
    post.reactions[reaction] = Math.max(0, (post.reactions[reaction] || 0) - 1);
    post.reacted = null;
  } else {
    if (post.reacted) post.reactions[post.reacted] = Math.max(0, (post.reactions[post.reacted] || 0) - 1);
    post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
    post.reacted = reaction;
  }
  saveState();
  render();
}

function openGiftModal(postId) {
  activeGiftPostId = postId;
  const post = state.posts.find((item) => item.id === postId);
  giftModal.querySelector("[data-gift-balance]").textContent = `Seu saldo: ${state.user.coins || 0} NEXO Coins. Presente para ${post?.author || "um post"}.`;
  giftGrid.innerHTML = gifts.map((gift) => `
    <button class="gift-choice" type="button" data-send-gift="${gift.id}">
      <span class="gift-icon" style="--g1:${gift.colors[0]};--g2:${gift.colors[1]}"></span>
      <strong>${escapeHtml(gift.name)}</strong>
      <span>${gift.cost} coins</span>
    </button>
  `).join("");
  giftModal.hidden = false;
  giftGrid.querySelectorAll("[data-send-gift]").forEach((button) => {
    button.addEventListener("click", () => sendGift(button.dataset.sendGift));
  });
}

function closeGiftModal() {
  giftModal.hidden = true;
  activeGiftPostId = null;
}

function sendGift(giftId) {
  const gift = gifts.find((item) => item.id === giftId);
  const post = state.posts.find((item) => item.id === activeGiftPostId);
  if (!gift || !post) return;
  if ((state.user.coins || 0) < gift.cost) {
    showToast("Voce precisa de mais NEXO Coins para esse presente.");
    return;
  }
  state.user.coins -= gift.cost;
  post.gifts = post.gifts || {};
  post.gifts[gift.id] = (post.gifts[gift.id] || 0) + 1;
  saveState();
  closeGiftModal();
  render();
  showToast(`Voce enviou ${gift.name}.`);
}

function submitProfile(event) {
  event.preventDefault();
  const form = event.currentTarget;
  state.user.name = form.elements.name.value.trim() || "Visitante NEXO";
  state.user.handle = form.elements.handle.value.trim().replace(/\s+/g, "-").toLowerCase() || "visitante";
  state.user.city = form.elements.city.value.trim() || "Brasil";
  state.user.status = form.elements.status.value.trim() || "testando o NEXO Social";
  saveState();
  render();
  showToast("Perfil salvo.");
}

async function uploadPhotoToImgBB() {
  if (!canUseProfilePhoto()) {
    showToast(`Foto libera no nivel ${PHOTO_UNLOCK_LEVEL}.`);
    return;
  }

  if (!IMGBB_API_KEY) {
    showToast("Configure a chave ImgBB no firebase-config.js.");
    return;
  }

  const input = document.querySelector("[data-profile-photo-file]");
  const file = input?.files?.[0];
  if (!file) {
    showToast("Escolha uma imagem primeiro.");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    showToast("Use JPG, PNG ou WEBP.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast("Imagem muito pesada. Use ate 2 MB.");
    return;
  }

  const button = document.querySelector("[data-upload-profile-photo]");
  if (button) button.disabled = true;

  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(IMGBB_API_KEY)}`, {
      method: "POST",
      body: formData
    });
    const payload = await response.json();
    const imageUrl = payload?.data?.display_url || payload?.data?.url;
    if (!response.ok || !imageUrl) throw new Error(payload?.error?.message || "Falha no upload");

    state.user.photoUrl = imageUrl;
    state.user.profileVisualMode = "photo";
    saveState();
    render();
    showToast("Foto salva no perfil.");
  } catch (error) {
    showToast("Nao foi possivel enviar a foto.");
  } finally {
    if (button) button.disabled = false;
  }
}

function submitCommunity(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const category = form.elements.category.value.trim();
  const description = form.elements.description.value.trim();
  if (!name || !category || !description) return;
  const id = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || uid("comunidade");
  const community = {
    id,
    name,
    category,
    description,
    members: 1,
    owner: state.user.name,
    colors: ["#2b67c7", "#2e986f"],
    rules: ["Respeite os membros.", "Evite spam.", "Mantenha o assunto da comunidade."],
    topics: [{ id: uid("topic"), title: `Boas-vindas a ${name}`, replies: 0, last: "agora" }]
  };
  state.communities.unshift(community);
  state.user.joinedCommunities = [...new Set([id, ...state.user.joinedCommunities])];
  state.selectedCommunityId = id;
  state.route = "community";
  saveState();
  render();
  showToast("Comunidade criada.");
}

function toggleJoin(communityId) {
  const community = state.communities.find((item) => item.id === communityId);
  if (!community) return;
  if (isJoined(communityId)) {
    state.user.joinedCommunities = state.user.joinedCommunities.filter((id) => id !== communityId);
    community.members = Math.max(0, community.members - 1);
    showToast("Voce saiu da comunidade.");
  } else {
    state.user.joinedCommunities.push(communityId);
    community.members += 1;
    showToast("Voce entrou na comunidade.");
  }
  saveState();
  render();
}

function addSuggestedFriend() {
  const names = ["Bia", "Caua", "Dani", "Leo", "May", "Noah", "Sofia"];
  const name = names[Math.floor(Math.random() * names.length)];
  state.friends.push({
    id: uid("friend"),
    name,
    tag: "novo contato",
    level: Math.floor(Math.random() * 14) + 3,
    skin: avatarOptions.skin[Math.floor(Math.random() * avatarOptions.skin.length)],
    shirt: avatarOptions.shirt[Math.floor(Math.random() * avatarOptions.shirt.length)],
    status: "aceitou testar o NEXO"
  });
  saveState();
  render();
  showToast("Nova sugestao adicionada.");
}

function randomizeAvatar() {
  Object.keys(avatarOptions).forEach((key) => {
    const options = avatarOptions[key];
    state.user.avatar[key] = options[Math.floor(Math.random() * options.length)];
  });
  saveState();
  render();
}

function renderGifOptions(items) {
  gifGrid.innerHTML = items.map((gif) => `
    <button class="gif-choice" type="button" data-pick-gif="${gif.id}">
      ${fakeGif(gif)}
      <strong>${escapeHtml(gif.label)}</strong>
      <span>${escapeHtml(gif.provider || "GIF externo")} - toque para anexar</span>
    </button>
  `).join("");
  modal.hidden = false;
  gifGrid.querySelectorAll("[data-pick-gif]").forEach((button) => {
    button.addEventListener("click", () => {
      const gif = items.find((item) => item.id === button.dataset.pickGif);
      state.pendingGif = { scope: activeComposerScope, gif };
      modal.hidden = true;
      saveState();
      render();
      showToast("GIF adicionado ao recado.");
    });
  });
}

async function searchExternalGifs(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return gifs;
  if (!GIPHY_API_KEY) {
    return gifs.filter((gif) => `${gif.label} ${gif.text}`.toLowerCase().includes(cleanQuery.toLowerCase()));
  }
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    q: cleanQuery,
    limit: "12",
    rating: "pg-13",
    lang: "pt"
  });
  const response = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`);
  if (!response.ok) throw new Error("GIPHY indisponivel");
  const payload = await response.json();
  return (payload.data || []).map((item) => ({
    id: item.id,
    label: item.title || cleanQuery,
    text: cleanQuery,
    url: item.images?.downsized_medium?.url || item.images?.original?.url,
    previewUrl: item.images?.fixed_width_small?.url || item.images?.preview_gif?.url,
    provider: "GIPHY"
  })).filter((item) => item.url || item.previewUrl);
}

function setGifStatus(message) {
  const status = document.querySelector("[data-gif-status]");
  if (status) status.textContent = message;
}

function openGifModal(scope) {
  activeComposerScope = scope;
  const searchInput = document.querySelector("[data-gif-search]");
  if (searchInput) searchInput.value = "";
  setGifStatus(GIPHY_API_KEY ? "Busque GIFs no GIPHY." : "Sem chave GIPHY: usando vitrine animada de teste.");
  renderGifOptions(gifs);
}

async function handleGifSearch() {
  const query = document.querySelector("[data-gif-search]")?.value.trim() || "";
  if (!query) {
    setGifStatus("Mostrando GIFs leves para teste.");
    renderGifOptions(gifs);
    return;
  }
  setGifStatus(GIPHY_API_KEY ? "Buscando no GIPHY..." : "Busca local de teste. Configure a chave GIPHY para buscar na internet.");
  try {
    const results = await searchExternalGifs(query);
    renderGifOptions(results.length ? results : gifs);
    setGifStatus(results.length ? `${results.length} GIFs encontrados.` : "Nada encontrado. Mostrando GIFs de teste.");
  } catch (error) {
    renderGifOptions(gifs);
    setGifStatus("Nao foi possivel buscar agora. Mostrando GIFs de teste.");
  }
}

function closeModal() {
  modal.hidden = true;
}

async function setupCubeCanvas(selector, options = {}) {
  const cubeCanvas = document.querySelector(selector);
  if (!cubeCanvas) return;
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");
    const renderer = new THREE.WebGLRenderer({ canvas: cubeCanvas, antialias: true, alpha: true });
    const width = options.width || 336;
    const height = options.height || 300;
    const size = options.size || 1.75;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshStandardMaterial({
        color: "#19e0bd",
        emissive: "#087f71",
        emissiveIntensity: 0.95,
        metalness: 0.28,
        roughness: 0.3,
        transparent: true,
        opacity: 0.84
      })
    );
    cube.rotation.set(0.72, 0.68, 0.2);
    cube.position.set(0, 0.05, 0);
    scene.add(cube);

    scene.add(new THREE.AmbientLight("#35a7ff", 1.4));
    const light = new THREE.PointLight("#72ffe7", 52, 20);
    light.position.set(3, 3, 6);
    scene.add(light);

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(cube.geometry),
      new THREE.LineBasicMaterial({ color: "#72ffe7", transparent: true, opacity: 0.18 })
    );
    cube.add(edge);

    const pointer = { active: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 };
    const maxInertia = 0.26;
    let clickBoost = 0;
    splashCubeBoost = () => {
      clickBoost = 0.18;
      pointer.velocityX = 0.14;
      pointer.velocityY = -0.06;
    };

    cubeCanvas.addEventListener("pointerdown", (event) => {
      pointer.active = true;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.velocityX = 0;
      pointer.velocityY = 0;
      cubeCanvas.setPointerCapture(event.pointerId);
    });

    cubeCanvas.addEventListener("pointermove", (event) => {
      if (!pointer.active) return;
      const deltaX = event.clientX - pointer.lastX;
      const deltaY = event.clientY - pointer.lastY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.velocityX = THREE.MathUtils.clamp(deltaX * 0.007, -maxInertia, maxInertia);
      pointer.velocityY = THREE.MathUtils.clamp(deltaY * 0.007, -maxInertia, maxInertia);
      cube.rotation.y += deltaX * 0.0048;
      cube.rotation.x += deltaY * 0.0048;
    });

    const releasePointer = (event) => {
      pointer.active = false;
      if (cubeCanvas.hasPointerCapture(event.pointerId)) cubeCanvas.releasePointerCapture(event.pointerId);
    };

    cubeCanvas.addEventListener("pointerup", releasePointer);
    cubeCanvas.addEventListener("pointercancel", releasePointer);

    const renderCube = () => {
      if (!pointer.active) {
        cube.rotation.x += 0.006 + pointer.velocityY + clickBoost;
        cube.rotation.y += 0.008 + pointer.velocityX + clickBoost;
        pointer.velocityX *= 0.988;
        pointer.velocityY *= 0.988;
        clickBoost *= 0.94;
      }
      renderer.render(scene, camera);
      window.requestAnimationFrame(renderCube);
    };
    renderCube();
  } catch (error) {
    cubeCanvas.closest(".splash-logo-cube")?.classList.add("cube-fallback");
  }
}

function enterAsVisitor() {
  state.route = "home";
  saveState();
  setView("app");
  render();
}

function setupSplashIntro() {
  setupCubeCanvas("#splashCube");
  const hint = document.querySelector("[data-cube-hint]");
  document.querySelector("[data-cube-ping]")?.addEventListener("click", () => {
    if (typeof splashCubeBoost === "function") splashCubeBoost();
    if (hint) hint.textContent = "o NEXO respondeu";
    showToast("Cubo NEXO ativo.");
  });
  document.querySelector("[data-google-login]")?.addEventListener("click", () => {
    showToast("Login Google entra aqui. Para testar, use sem login.");
  });
}

document.querySelectorAll("[data-enter]").forEach((button) => {
  button.addEventListener("click", enterAsVisitor);
});

document.querySelector("[data-close-modal]").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.querySelector("[data-gif-search-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  handleGifSearch();
});
document.querySelector("[data-gif-search-button]")?.addEventListener("click", (event) => {
  event.preventDefault();
  handleGifSearch();
});

document.querySelector("[data-close-gift]").addEventListener("click", closeGiftModal);
giftModal.addEventListener("click", (event) => {
  if (event.target === giftModal) closeGiftModal();
});

document.querySelectorAll("[data-close-badge]").forEach((button) => {
  button.addEventListener("click", closeBadgeReveal);
});
badgeModal.addEventListener("click", (event) => {
  if (event.target === badgeModal) closeBadgeReveal();
});
document.querySelector("[data-share-badge]").addEventListener("click", shareBadge);

document.querySelector("[data-search-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = document.querySelector("[data-search]").value.trim().toLowerCase();
  if (!query) return;
  state.route = "communities";
  saveState();
  render();
  const matches = state.communities.filter((community) =>
    `${community.name} ${community.description} ${community.category}`.toLowerCase().includes(query)
  );
  mainStage.insertAdjacentHTML("afterbegin", `
    <section class="panel">
      <div class="panel-title">
        <h2>Busca por "${escapeHtml(query)}"</h2>
        <span>${matches.length} resultados</span>
      </div>
      <div class="search-results">
        ${matches.map(renderCommunityCard).join("") || emptyState("Nada encontrado por enquanto.")}
      </div>
    </section>
  `);
  bindDynamicEvents();
});

render();
initSpaceParallax();
setupSplashIntro();
registerPwa();

function registerPwa() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch(() => {});
  });
}
