(() => {
  "use strict";

  const body = document.body;
  const searchButton = document.querySelector("#searchButton");
  const searchPanel = document.querySelector("#searchPanel");
  const closeSearchButton = document.querySelector("#closeSearchButton");
  const searchInput = document.querySelector("#searchInput");

  function setSearch(open) {
    if (!searchPanel) return;
    searchPanel.hidden = !open;
    body.classList.toggle("is-locked", open);
    if (open) window.setTimeout(() => searchInput?.focus(), 0);
    else searchButton?.focus();
  }

  searchButton?.addEventListener("click", () => setSearch(true));
  closeSearchButton?.addEventListener("click", () => setSearch(false));
  searchPanel?.addEventListener("click", (event) => {
    if (event.target === searchPanel) setSearch(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchPanel && !searchPanel.hidden) setSearch(false);
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("portal-sw.js").catch(() => {}));
  }

  window.lucide?.createIcons?.();
})();
