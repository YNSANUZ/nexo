(() => {
  "use strict";

  const heroSlides = [
    {
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Congresso_Nacional.jpg/1280px-Congresso_Nacional.jpg",
      fallback: "assets/noticias/obras-do-gdf-na-sua-porta-transformam-a-rotina-de-moradores-de-ceilandia.jpg",
      alt: "Congresso Nacional iluminado à noite, em Brasília",
      tag: "NOTÍCIAS",
      title: "Câmara aprova projeto que amplia isenção do Imposto de Renda",
      summary: "Proposta segue agora para análise do Senado. Mudança deve beneficiar mais de 15 milhões de brasileiros.",
      time: "Há 25 minutos",
      datetime: "PT25M",
      category: "Política",
      href: "noticias.html?categoria=politica",
      credit: "Foto: Rob Sinclair/Wikimedia Commons — CC BY-SA 2.0"
    },
    {
      image: "assets/noticias/primeira-edicao-da-rua-do-lazer-no-gama-proporciona-um-domingo-de-esporte-e-convivencia.jpg",
      alt: "Moradores participam de ação comunitária no Distrito Federal",
      tag: "NOTÍCIAS",
      title: "Comunidade ganha novas opções de esporte e convivência no DF",
      summary: "Programação reúne famílias e amplia o acesso a atividades gratuitas nas regiões administrativas.",
      time: "Há 42 minutos",
      datetime: "PT42M",
      category: "Cidades",
      href: "noticias.html?categoria=cidades",
      credit: "Imagem de desenvolvimento — crédito editorial será obrigatório na publicação"
    },
    {
      image: "assets/noticias/lei-de-incentivo-ao-esporte-comissao-define-calendario-para-2026-e-abre-prazo-para-novos-projetos.jpg",
      alt: "Atividade esportiva no Lago Paranoá",
      tag: "NOTÍCIAS",
      title: "Calendário esportivo do DF terá novos projetos em 2026",
      summary: "Entidades poderão apresentar propostas para ampliar atividades esportivas e ações de inclusão.",
      time: "Há 1 hora",
      datetime: "PT1H",
      category: "Esportes",
      href: "noticias.html?categoria=esportes",
      credit: "Imagem de desenvolvimento — crédito editorial será obrigatório na publicação"
    },
    {
      image: "assets/atividade-corrida-lite.jpg",
      alt: "Corredor pratica atividade física em parque de Brasília",
      tag: "NOTÍCIAS",
      title: "Brasília recebe circuito de corridas em diferentes regiões",
      summary: "A agenda reúne atletas profissionais, amadores e ações voltadas para toda a família.",
      time: "Há 2 horas",
      datetime: "PT2H",
      category: "Corridas",
      href: "noticias.html?categoria=corridas",
      credit: "Imagem de desenvolvimento — crédito editorial será obrigatório na publicação"
    },
    {
      image: "assets/evento-lago-lite.jpg",
      alt: "Fotógrafo registra atividade no Lago Paranoá",
      tag: "NOTÍCIAS",
      title: "Eventos movimentam o turismo e a economia criativa de Brasília",
      summary: "Programações culturais e esportivas ocupam diferentes pontos da capital durante o fim de semana.",
      time: "Há 3 horas",
      datetime: "PT3H",
      category: "Eventos",
      href: "noticias.html?categoria=eventos",
      credit: "Imagem de desenvolvimento — crédito editorial será obrigatório na publicação"
    },
    {
      image: "assets/park-bg-lite.jpg",
      alt: "Área verde arborizada no Distrito Federal",
      tag: "NOTÍCIAS",
      title: "Defesa Civil reforça orientações para o período de chuvas",
      summary: "Moradores podem receber alertas e acompanhar os avisos oficiais para cada região administrativa.",
      time: "Há 4 horas",
      datetime: "PT4H",
      category: "Clima",
      href: "noticias.html?categoria=clima",
      credit: "Imagem de desenvolvimento — crédito editorial será obrigatório na publicação"
    },
    {
      image: "assets/noticias/obras-do-gdf-na-sua-porta-transformam-a-rotina-de-moradores-de-ceilandia.jpg",
      alt: "Equipamento público no Distrito Federal",
      tag: "NOTÍCIAS",
      title: "Obras de infraestrutura avançam nas regiões administrativas",
      summary: "Intervenções incluem mobilidade, esporte e recuperação de espaços de uso comunitário.",
      time: "Há 5 horas",
      datetime: "PT5H",
      category: "Cidades",
      href: "noticias.html?categoria=cidades",
      credit: "Imagem de desenvolvimento — crédito editorial será obrigatório na publicação"
    }
  ];

  const heroImage = document.querySelector("#heroImage");
  const heroTag = document.querySelector("#heroTag");
  const heroTitle = document.querySelector("#heroTitle");
  const heroSummary = document.querySelector("#heroSummary");
  const heroTime = document.querySelector("#heroTime");
  const heroCategory = document.querySelector("#heroCategory");
  const heroCredit = document.querySelector("#heroCredit");
  const heroDots = document.querySelector("#heroDots");
  let activeSlide = 0;
  let heroTimer = 0;

  function renderHero(index, options = {}) {
    const slide = heroSlides[index];
    if (!slide || !heroImage) return;

    activeSlide = index;
    heroImage.style.opacity = "0.25";
    window.setTimeout(() => {
      heroImage.src = slide.image;
      heroImage.alt = slide.alt;
      heroImage.dataset.fallback = slide.fallback || "assets/park-bg-lite.jpg";
      heroTag.textContent = slide.tag;
      heroTitle.textContent = slide.title;
      heroSummary.textContent = slide.summary;
      heroTime.textContent = slide.time;
      heroTime.setAttribute("datetime", slide.datetime);
      heroCategory.textContent = slide.category;
      heroCategory.href = slide.href;
      heroCredit.textContent = slide.credit;
      heroImage.style.opacity = "1";
    }, options.instant ? 0 : 120);

    [...heroDots.children].forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function restartHeroTimer() {
    window.clearInterval(heroTimer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer = window.setInterval(() => {
      renderHero((activeSlide + 1) % heroSlides.length);
    }, 7000);
  }

  if (heroDots) {
    heroSlides.forEach((slide, index) => {
      const dot = document.createElement("button");
      dot.className = "hero__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Mostrar manchete ${index + 1}: ${slide.title}`);
      dot.addEventListener("click", () => {
        renderHero(index);
        restartHeroTimer();
      });
      heroDots.append(dot);
    });
    renderHero(0, { instant: true });
    restartHeroTimer();
  }

  heroImage?.addEventListener("error", () => {
    const fallback = heroImage.dataset.fallback;
    if (fallback && !heroImage.src.endsWith(fallback)) heroImage.src = fallback;
  });

  const body = document.body;
  const menuButton = document.querySelector("#menuButton");
  const bottomMenuButton = document.querySelector("#bottomMenuButton");
  const closeMenuButton = document.querySelector("#closeMenuButton");
  const sideDrawer = document.querySelector("#sideDrawer");
  const drawerBackdrop = document.querySelector("#drawerBackdrop");
  let drawerReturnFocus = null;

  function setDrawer(open, trigger = null) {
    if (!sideDrawer || !drawerBackdrop) return;
    if (open) drawerReturnFocus = trigger || document.activeElement;
    sideDrawer.classList.toggle("is-open", open);
    sideDrawer.setAttribute("aria-hidden", open ? "false" : "true");
    drawerBackdrop.hidden = !open;
    menuButton?.setAttribute("aria-expanded", open ? "true" : "false");
    body.classList.toggle("is-locked", open);
    if (open) closeMenuButton?.focus();
    else drawerReturnFocus?.focus?.();
  }

  menuButton?.addEventListener("click", () => setDrawer(true, menuButton));
  bottomMenuButton?.addEventListener("click", () => setDrawer(true, bottomMenuButton));
  closeMenuButton?.addEventListener("click", () => setDrawer(false));
  drawerBackdrop?.addEventListener("click", () => setDrawer(false));

  const searchButton = document.querySelector("#searchButton");
  const closeSearchButton = document.querySelector("#closeSearchButton");
  const searchPanel = document.querySelector("#searchPanel");
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
    if (event.key !== "Escape") return;
    if (searchPanel && !searchPanel.hidden) setSearch(false);
    else if (sideDrawer?.classList.contains("is-open")) setDrawer(false);
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("portal-sw.js").catch(() => {});
    });
  }

  window.lucide?.createIcons?.();
})();
