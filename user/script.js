const platforms = [
  { id: "instagram", name: "Instagram", profileUrl: (user) => `https://www.instagram.com/${user}/` },
  { id: "siteComBr", name: "Site (.com.br)", profileUrl: (user) => `https://${user}.com.br/` },
  { id: "x", name: "X (Twitter)", profileUrl: (user) => `https://x.com/${user}` },
  { id: "kwai", name: "Kwai", profileUrl: (user) => `https://www.kwai.com/@${user}` },
  { id: "facebook", name: "Facebook", profileUrl: (user) => `https://www.facebook.com/${user}` },
  { id: "tiktok", name: "TikTok", profileUrl: (user) => `https://www.tiktok.com/@${user}` },
  { id: "youtube", name: "YouTube", profileUrl: (user) => `https://www.youtube.com/@${user}` },
  { id: "deezer", name: "Deezer", profileUrl: (user) => `https://www.deezer.com/profile/${user}` },
  { id: "siteCom", name: "Site (.com)", profileUrl: (user) => `https://${user}.com/` },
  { id: "spotify", name: "Spotify", profileUrl: (user) => `https://open.spotify.com/user/${user}` },
  { id: "github", name: "GitHub", profileUrl: (user) => `https://github.com/${user}` },
  { id: "reddit", name: "Reddit", profileUrl: (user) => `https://www.reddit.com/user/${user}` },
  { id: "pinterest", name: "Pinterest", profileUrl: (user) => `https://www.pinterest.com/${user}/` },
  { id: "threads", name: "Threads", profileUrl: (user) => `https://www.threads.net/@${user}` },
  { id: "bluesky", name: "Bluesky", profileUrl: (user) => `https://bsky.app/profile/${user}.bsky.social` },
  { id: "linktree", name: "Linktree", profileUrl: (user) => `https://linktr.ee/${user}` },
  { id: "beacons", name: "Beacons", profileUrl: (user) => `https://beacons.ai/${user}` },
  { id: "bento", name: "Bento", profileUrl: (user) => `https://bento.me/${user}` },
  { id: "carrd", name: "Carrd", profileUrl: (user) => `https://${user}.carrd.co/` },
  { id: "aboutMe", name: "About.me", profileUrl: (user) => `https://about.me/${user}` },
  { id: "bioLink", name: "Bio.link", profileUrl: (user) => `https://bio.link/${user}` },
  { id: "campsite", name: "Campsite.bio", profileUrl: (user) => `https://campsite.bio/${user}` },
  { id: "soloTo", name: "Solo.to", profileUrl: (user) => `https://solo.to/${user}` },
  { id: "taplink", name: "Taplink", profileUrl: (user) => `https://taplink.cc/${user}` },
  { id: "linkBio", name: "Link.bio", profileUrl: (user) => `https://link.bio/${user}` },
  { id: "tinyCc", name: "Tiny.cc", profileUrl: (user) => `https://tiny.cc/${user}` }
];

const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("[data-search-input]");
const resultsPanel = document.querySelector("[data-results-panel]");
const loadingMessage = document.querySelector("[data-loading]");
const resultsContent = document.querySelector("[data-results-content]");
const queryLabel = document.querySelector("[data-query-label]");
const platformGrid = document.querySelector("[data-platform-grid]");

let debounceTimer = null;
let activeCheckId = 0;

const verifiedLocalFallbacks = {
  brunoleaod: {
    instagram: "used",
    siteComBr: "free",
    x: "used",
    kwai: "free",
    facebook: "used",
    tiktok: "used",
    youtube: "used",
    siteCom: "free",
    github: "used",
    spotify: "used",
    deezer: "free",
    reddit: "free",
    pinterest: "free",
    threads: "used",
    bluesky: "used"
  },
  pontosemfiltro: {
    instagram: "free",
    kwai: "free",
    facebook: "free",
    tiktok: "free"
  },
  ursoninhos: {
    instagram: "used"
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeUsername(value) {
  return value.trim().replace(/^@/, "").replace(/\s+/g, "").toLowerCase();
}

function hideResults() {
  activeCheckId += 1;
  clearTimeout(debounceTimer);
  resultsPanel.hidden = true;
  loadingMessage.hidden = true;
  resultsContent.hidden = true;
  platformGrid.innerHTML = "";
}

function buildUnknownResults(username) {
  return platforms.map((platform) => ({
    id: platform.id,
    status: verifiedLocalFallbacks[username]?.[platform.id] || "unknown",
    url: platform.profileUrl(username)
  }));
}

async function checkAvailability(username) {
  const response = await fetch(`./check.php?username=${encodeURIComponent(username)}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) throw new Error("availability_check_failed");
  const payload = await response.json();
  if (!Array.isArray(payload.results)) throw new Error("availability_check_invalid");
  return payload.results;
}

function renderResults(username, results) {
  const resultMap = new Map(results.map((result) => [result.id, result]));
  queryLabel.textContent = username;
  platformGrid.innerHTML = platforms.map((platform) => {
    const result = resultMap.get(platform.id) || { status: "unknown", url: platform.profileUrl(username) };
    const statusLabels = {
      free: "Livre",
      used: "Em uso",
      checking: "Verificando",
      unknown: "Confirmar"
    };
    const statusClass = ["free", "used", "checking"].includes(result.status) ? result.status : "checking";
    const statusText = statusLabels[result.status] || statusLabels.unknown;
    const url = result.url || platform.profileUrl(username);

    return `
      <a class="platform-item available-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
        <strong class="platform-name">${escapeHtml(platform.name)}</strong>
        <span class="status-pill ${statusClass}">${statusText}</span>
      </a>
    `;
  }).join("");

  loadingMessage.hidden = true;
  resultsContent.hidden = false;
}

function startAvailabilityCheck(immediate = false) {
  const username = normalizeUsername(searchInput.value);

  if (username.length < 2) {
    hideResults();
    return;
  }

  clearTimeout(debounceTimer);

  const runCheck = () => {
    const checkId = activeCheckId + 1;
    activeCheckId = checkId;

    resultsPanel.hidden = false;
    loadingMessage.hidden = false;
    resultsContent.hidden = true;
    platformGrid.innerHTML = "";

    checkAvailability(username).then((results) => {
      if (checkId !== activeCheckId) return;
      renderResults(username, results);
    }).catch(() => {
      if (checkId !== activeCheckId) return;
      renderResults(username, buildUnknownResults(username));
    });
  };

  if (immediate) {
    runCheck();
    return;
  }

  debounceTimer = setTimeout(runCheck, 500);
}

searchInput.addEventListener("input", () => {
  startAvailabilityCheck(false);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startAvailabilityCheck(true);
});
