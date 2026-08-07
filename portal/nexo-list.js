(() => {
  "use strict";

  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const params = new URLSearchParams(location.search);
  const category = normalize(params.get("categoria"));
  const query = normalize(params.get("q"));
  const cards = [...document.querySelectorAll(".expanded-card")];
  const emptyState = document.querySelector("#newsListEmpty");
  const title = document.querySelector("#newsIndexTitle");
  const description = document.querySelector("#newsIndexDescription");
  const archiveSearch = document.querySelector("#archiveSearch");

  let visibleCount = 0;
  cards.forEach((card) => {
    const cardCategory = normalize(card.dataset.category);
    const searchable = normalize(`${card.dataset.search} ${card.textContent}`);
    const matchesCategory = !category || cardCategory === category;
    const matchesQuery = !query || searchable.includes(query);
    const visible = matchesCategory && matchesQuery;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (emptyState) emptyState.hidden = visibleCount > 0;
  if (archiveSearch && query) archiveSearch.value = params.get("q") || "";

  document.querySelectorAll(".filter-chips a").forEach((link) => {
    const linkCategory = normalize(new URL(link.href).searchParams.get("categoria"));
    link.classList.toggle("is-active", linkCategory === category);
  });

  if (category && title) {
    const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
    title.textContent = displayCategory;
    if (description) description.textContent = `Últimas notícias de ${displayCategory} no Distrito Federal.`;
    document.title = `${displayCategory} | NEXO Notícias`;
  } else if (query && title) {
    title.textContent = `Busca por “${params.get("q") || ""}”`;
    if (description) description.textContent = `${visibleCount} resultado${visibleCount === 1 ? "" : "s"} encontrado${visibleCount === 1 ? "" : "s"}.`;
    document.title = `Busca | NEXO Notícias`;
  }
})();
