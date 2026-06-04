import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const API_SOURCES = [
  {
    name: "API publica com CORS",
    url: "https://loteriascaixa-api.herokuapp.com/api/megasena/latest",
    contestUrl: (contest) => `https://loteriascaixa-api.herokuapp.com/api/megasena/${contest}`
  },
  {
    name: "Portal Loterias Caixa",
    url: "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena",
    contestUrl: (contest) => `https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${contest}`
  }
];
const OFFICIAL_URL = "https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx";
const SITE_URL = "https://primusdf.com.br/jogos";
const MEGA_RULES = {
  name: "Mega-Sena",
  min: 1,
  max: 60,
  minPick: 6,
  maxPick: 20,
  drawSize: 6
};

let currentDraw = {
  contest: null,
  date: null,
  nextDate: null,
  numbers: [],
  source: null,
  raw: null
};
let lastCheckedGames = [];

const els = {
  cubeCanvas: document.querySelector("#cubeCanvas"),
  refreshButton: document.querySelector("#refreshButton"),
  resultModeLabel: document.querySelector("#resultModeLabel"),
  sourceStatus: document.querySelector("#sourceStatus"),
  contestTitle: document.querySelector("#contestTitle"),
  drawBalls: document.querySelector("#drawBalls"),
  contestInput: document.querySelector("#contestInput"),
  loadContestButton: document.querySelector("#loadContestButton"),
  latestButton: document.querySelector("#latestButton"),
  nextDraw: document.querySelector("#nextDraw"),
  updatedAt: document.querySelector("#updatedAt"),
  gamesInput: document.querySelector("#gamesInput"),
  checkButton: document.querySelector("#checkButton"),
  sampleButton: document.querySelector("#sampleButton"),
  clearButton: document.querySelector("#clearButton"),
  shareButton: document.querySelector("#shareButton"),
  shareLinks: document.querySelector("#shareLinks"),
  shareStatus: document.querySelector("#shareStatus"),
  summaryMeta: document.querySelector("#summaryMeta"),
  summaryTitle: document.querySelector("#summaryTitle"),
  summaryList: document.querySelector("#summaryList"),
  prizeDetails: document.querySelector("#prizeDetails"),
  winnerDetails: document.querySelector("#winnerDetails"),
  rawStatus: document.querySelector("#rawStatus")
};

initCube();
bindEvents();
loadLatestResult();

function bindEvents() {
  els.refreshButton.addEventListener("click", loadSelectedResult);
  els.loadContestButton.addEventListener("click", loadSelectedResult);
  els.latestButton.addEventListener("click", () => {
    els.contestInput.value = "";
    loadLatestResult();
  });
  els.contestInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadSelectedResult();
  });
  els.checkButton.addEventListener("click", checkGames);
  els.shareButton.addEventListener("click", shareResults);
  els.sampleButton.addEventListener("click", () => {
    els.gamesInput.value = "04 12 18 23 35 59\n01-07-22-33-44-60\n5, 9, 10, 31, 48, 52";
    checkGames();
  });
  els.clearButton.addEventListener("click", () => {
    els.gamesInput.value = "";
    lastCheckedGames = [];
    els.summaryTitle.textContent = "Pronto para conferir";
    els.summaryList.innerHTML = '<p class="empty-state">Cole seus jogos e toque em conferir.</p>';
    els.shareLinks.innerHTML = "";
    els.shareStatus.textContent = "";
  });
  els.summaryList.addEventListener("click", (event) => {
    const button = event.target.closest(".game-head");
    if (!button) return;
    button.closest(".game-result").classList.toggle("open");
  });
}

async function loadLatestResult() {
  return loadResult();
}

async function loadSelectedResult() {
  const contest = readContestInput();
  if (contest === null) return;
  if (!contest) return loadLatestResult();
  return loadResult(contest);
}

async function loadResult(contest = null) {
  setStatus("Buscando");
  setLoading(true);

  try {
    const { data, source } = await fetchFirstAvailableSource(contest);
    currentDraw = normalizeDraw(data, source);
    renderDraw(Boolean(contest));
    renderPrizeDetails(data);
    renderWinnerDetails(data);
    setStatus("Atualizado");
    els.rawStatus.textContent = `Concurso ${currentDraw.contest || "-"} carregado de ${source.name}: ${source.url}`;
    checkGames({ silentEmpty: true });
  } catch (error) {
    setStatus("Sem conexao", true);
    els.contestTitle.textContent = "Resultado indisponivel";
    els.drawBalls.innerHTML = emptyBalls();
    els.updatedAt.textContent = "Nao foi possivel buscar agora. Confira a fonte oficial da Caixa e tente atualizar novamente.";
    els.rawStatus.textContent = `Falha ao buscar as fontes configuradas: ${error.message}`;
  } finally {
    setLoading(false);
  }
}

async function fetchFirstAvailableSource(contest = null) {
  const errors = [];

  for (const source of API_SOURCES) {
    try {
      const url = contest ? source.contestUrl(contest) : source.url;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
      return { data: await response.json(), source: { ...source, url } };
    } catch (error) {
      errors.push(error.message);
    }
  }

  throw new Error(errors.join(" | "));
}

function normalizeDraw(data, source) {
  return {
    contest: data.numero || data.concurso || null,
    date: data.dataApuracao || data.data || null,
    nextDate: data.dataProximoConcurso || null,
    numbers: (data.listaDezenas || data.dezenas || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b),
    source,
    raw: data
  };
}

function renderDraw(isSpecificContest = false) {
  els.resultModeLabel.textContent = isSpecificContest ? "Resultado escolhido" : "Resultado mais recente";
  els.contestTitle.textContent = currentDraw.contest ? `Concurso ${currentDraw.contest}` : "Concurso atual";
  els.contestInput.value = currentDraw.contest || "";
  els.drawBalls.innerHTML = currentDraw.numbers.map((number) => `<span class="ball">${pad(number)}</span>`).join("");
  els.nextDraw.textContent = currentDraw.nextDate || "A confirmar";
  els.updatedAt.textContent = `Sorteio em ${currentDraw.date || "data nao informada"}. Atualizado no seu navegador em ${new Date().toLocaleString("pt-BR")}.`;
  renderSummaryMeta();
}

function renderPrizeDetails(data) {
  const prizes = data.listaRateioPremio || data.premiacoes || [];
  const rows = prizes.map((item) => `
    <tr>
      <td>${escapeHtml(item.descricaoFaixa || item.descricao || `${item.faixa} faixa`)}</td>
      <td>${Number(item.numeroDeGanhadores || item.ganhadores || 0).toLocaleString("pt-BR")}</td>
      <td>${formatCurrency(item.valorPremio)}</td>
    </tr>
  `).join("");

  els.prizeDetails.innerHTML = `
    <p>Estimativa do proximo concurso: <strong>${formatCurrency(data.valorEstimadoProximoConcurso)}</strong></p>
    <table>
      <thead><tr><th>Faixa</th><th>Ganhadores</th><th>Premio</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3">Sem rateio informado.</td></tr>'}</tbody>
    </table>
  `;
}

function renderWinnerDetails(data) {
  const winners = data.listaMunicipioUFGanhadores || data.localGanhadores || [];
  if (!winners.length) {
    els.winnerDetails.innerHTML = "<p>Nenhuma cidade de ganhador principal informada para este concurso.</p>";
    return;
  }

  els.winnerDetails.innerHTML = `
    <table>
      <thead><tr><th>Cidade</th><th>UF</th><th>Ganhadores</th></tr></thead>
      <tbody>
        ${winners.map((winner) => `
          <tr>
            <td>${escapeHtml(winner.municipio || "-")}</td>
            <td>${escapeHtml(winner.uf || "-")}</td>
            <td>${Number(winner.ganhadores || 0).toLocaleString("pt-BR")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function checkGames(options = {}) {
  const text = els.gamesInput.value.trim();
  if (!text) {
    if (!options.silentEmpty) {
      els.summaryTitle.textContent = "Nenhum jogo colado";
      els.summaryList.innerHTML = '<p class="empty-state">Cole pelo menos um jogo para conferir.</p>';
    }
    lastCheckedGames = [];
    return;
  }

  const games = parseGames(text);
  if (!games.length) {
    els.summaryTitle.textContent = "Nao encontrei dezenas";
    els.summaryList.innerHTML = '<p class="empty-state">Use numeros de 1 a 60. Separadores como espaco, virgula e hifen podem ficar como estao.</p>';
    lastCheckedGames = [];
    return;
  }

  const validGames = games.filter((game) => !game.warnings.some((warning) => warning.type === "invalid-size"));
  const best = games.reduce((max, game) => Math.max(max, game.hits.length), 0);
  const sortedGames = games
    .map((game, index) => ({ ...game, originalIndex: index }))
    .sort((a, b) => b.hits.length - a.hits.length || a.originalIndex - b.originalIndex);
  lastCheckedGames = sortedGames;

  els.summaryTitle.textContent = currentDraw.numbers.length
    ? `${games.length} jogo${games.length > 1 ? "s" : ""} conferido${games.length > 1 ? "s" : ""}`
    : "Jogos lidos, aguardando resultado";

  els.summaryList.innerHTML = sortedGames.map((game) => renderGameResult(game, game.originalIndex)).join("");

  if (currentDraw.numbers.length && validGames.length) {
    const plural = best === 1 ? "acerto" : "acertos";
    els.summaryTitle.textContent += ` - melhor: ${best} ${plural}`;
  }
}

function parseGames(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.match(/\d+/g) || [])
    .filter((numbers) => numbers.length)
    .map((tokens) => buildGame(tokens.map(Number)));
}

function buildGame(numbers) {
  const warnings = [];
  const seen = new Set();
  const duplicated = new Set();
  const outOfRange = [];
  const unique = [];

  numbers.forEach((number) => {
    if (!Number.isFinite(number)) return;
    if (number < MEGA_RULES.min || number > MEGA_RULES.max) outOfRange.push(number);
    if (seen.has(number)) duplicated.add(number);
    seen.add(number);
    if (!unique.includes(number)) unique.push(number);
  });

  const validNumbers = unique.filter((number) => number >= MEGA_RULES.min && number <= MEGA_RULES.max);
  if (validNumbers.length < MEGA_RULES.minPick || validNumbers.length > MEGA_RULES.maxPick) {
    warnings.push({ type: "invalid-size", text: `Este jogo tem ${validNumbers.length} dezena${validNumbers.length === 1 ? "" : "s"} validas.` });
  }
  if (duplicated.size) {
    warnings.push({ type: "duplicate", text: `Dezena repetida: ${[...duplicated].map(pad).join(", ")}.` });
  }
  if (outOfRange.length) {
    warnings.push({ type: "range", text: `Fora do intervalo 1 a 60: ${outOfRange.join(", ")}.` });
  }

  const hits = currentDraw.numbers.length
    ? validNumbers.filter((number) => currentDraw.numbers.includes(number)).sort((a, b) => a - b)
    : [];

  return {
    numbers: validNumbers.sort((a, b) => a - b),
    hits,
    warnings
  };
}

function renderGameResult(game, index) {
  const hasDraw = currentDraw.numbers.length > 0;
  const warningClass = game.warnings.length ? "warn" : game.hits.length >= 4 ? "" : "low";
  const hitLabel = hasDraw ? `${game.hits.length} acerto${game.hits.length === 1 ? "" : "s"}` : "Aguardando";
  const subtitle = game.numbers.length ? game.numbers.map(pad).join(" ") : "Sem dezenas validas";
  const hitDetail = game.hits.length ? `Acertou: ${game.hits.map(pad).join(", ")}.` : "";
  const warningDetail = game.warnings.map((warning) => warning.text).join(" ");
  const ariaLabel = escapeHtml(`Jogo ${index + 1}: ${hitLabel}. ${hitDetail} ${warningDetail}`);

  return `
    <div class="game-result">
      <button class="game-head compact-game-head" type="button" aria-label="${ariaLabel}">
        <span class="game-main">
          <span class="game-title">Jogo ${index + 1}</span>
          <span class="game-subtitle">${subtitle}</span>
        </span>
        <span class="hit-count ${warningClass}">${hitLabel}</span>
      </button>
    </div>
  `;
}

function setStatus(text, isError = false) {
  els.sourceStatus.textContent = text;
  els.sourceStatus.classList.toggle("error", isError);
}

function renderSummaryMeta() {
  const contest = currentDraw.contest ? `Concurso ${currentDraw.contest}` : "Concurso aguardando resultado";
  const date = currentDraw.date ? ` de ${currentDraw.date}` : "";
  const balls = currentDraw.numbers.length
    ? `<span class="summary-draw-balls" aria-label="Numeros sorteados">${currentDraw.numbers.map((number) => `<span class="summary-draw-ball">${pad(number)}</span>`).join("")}</span>`
    : "";

  els.summaryMeta.innerHTML = `
    <span>${contest}${date}</span>
    ${balls}
  `;
}

async function shareResults() {
  if (!lastCheckedGames.length) {
    els.shareStatus.textContent = "Confira os jogos antes de compartilhar.";
    return;
  }

  const text = buildShareText();
  renderShareLinks(text);

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  window.location.href = getWhatsAppUrl(text);
}

function buildShareText() {
  const contest = currentDraw.contest ? `Concurso ${currentDraw.contest}` : "Concurso";
  const date = currentDraw.date ? ` de ${currentDraw.date}` : "";
  const numbers = currentDraw.numbers.length ? currentDraw.numbers.map(pad).join(" ") : "resultado aguardando";
  const lines = [
    "NEXO Jogos - Resultado da conferencia",
    `${contest}${date}`,
    `Sorteadas: ${numbers}`,
    ""
  ];

  lastCheckedGames.forEach((game) => {
    const gameNumbers = game.numbers.length ? game.numbers.map(pad).join(" ") : "sem dezenas validas";
    const hitLabel = currentDraw.numbers.length
      ? `${game.hits.length} acerto${game.hits.length === 1 ? "" : "s"}`
      : "aguardando resultado";
    const hits = game.hits.length ? ` (${game.hits.map(pad).join(", ")})` : "";
    lines.push(`Jogo ${game.originalIndex + 1}: ${gameNumbers} - ${hitLabel}${hits}`);
  });

  lines.push("");
  lines.push(`pelo site ${SITE_URL.replace("https://", "")}`);
  return lines.join("\n");
}

function renderShareLinks(text) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(SITE_URL);
  const subject = encodeURIComponent("NEXO Jogos - Resultado da conferencia");

  els.shareLinks.innerHTML = `
    <a class="share-link" href="${getWhatsAppUrl(text)}" target="_blank" rel="noreferrer">WhatsApp</a>
    <a class="share-link" href="mailto:?subject=${subject}&body=${encodedText}">Email</a>
    <a class="share-link" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}" target="_blank" rel="noreferrer">Facebook</a>
  `;
}

function getWhatsAppUrl(text) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

function setLoading(isLoading) {
  els.refreshButton.disabled = isLoading;
  els.loadContestButton.disabled = isLoading;
  els.latestButton.disabled = isLoading;
  els.contestInput.disabled = isLoading;
}

function readContestInput() {
  const value = els.contestInput.value.trim();
  if (!value) return 0;

  const contest = Number(value);
  if (!Number.isInteger(contest) || contest < 1) {
    setStatus("Concurso invalido", true);
    els.updatedAt.textContent = "Digite um numero de concurso valido, como 3010.";
    return null;
  }

  return contest;
}

function emptyBalls() {
  return Array.from({ length: MEGA_RULES.drawSize }, () => '<span class="ball">--</span>').join("");
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initCube() {
  const canvas = els.cubeCanvas;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const pointer = {
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0
  };

  camera.position.z = 5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.76, 1.76, 1.76),
    new THREE.MeshStandardMaterial({
      color: "#19e0bd",
      roughness: 0.28,
      metalness: 0.32,
      emissive: "#087f71",
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.9
    })
  );

  cube.rotation.set(0.72, 0.68, 0.2);
  scene.add(cube);
  scene.add(new THREE.AmbientLight("#35a7ff", 1.3));

  const light = new THREE.PointLight("#72ffe7", 44, 18);
  light.position.set(2.6, 3, 4);
  scene.add(light);

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(cube.geometry),
    new THREE.LineBasicMaterial({ color: "#dcfff8", transparent: true, opacity: 0.28 })
  );
  cube.add(edge);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  canvas.addEventListener("pointerdown", (event) => {
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!pointer.active) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.vx = dx * 0.006;
    pointer.vy = dy * 0.006;
    cube.rotation.y += dx * 0.008;
    cube.rotation.x += dy * 0.008;
  });

  function endPointer(event) {
    pointer.active = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }

  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  window.addEventListener("resize", resize);
  resize();

  function animate() {
    if (!pointer.active) {
      cube.rotation.x += 0.006 + pointer.vy;
      cube.rotation.y += 0.008 + pointer.vx;
      pointer.vx *= 0.94;
      pointer.vy *= 0.94;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
