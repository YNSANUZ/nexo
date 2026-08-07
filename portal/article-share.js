(() => {
  function getSharePayload(button) {
    return {
      title: button.dataset.shareTitle || document.title,
      text: button.dataset.shareText || document.title,
      url: button.dataset.shareUrl || window.location.href
    };
  }

  function setButtonStatus(button, label) {
    const original = button.dataset.shareLabel || button.textContent;
    button.dataset.shareLabel = original;
    button.querySelector(".article-share__button-label").textContent = label;
    window.setTimeout(() => {
      button.querySelector(".article-share__button-label").textContent = original;
    }, 1800);
  }

  async function copyShareUrl(button, url) {
    try {
      await navigator.clipboard.writeText(url);
      setButtonStatus(button, "Link copiado");
    } catch {
      window.prompt("Copie o link da materia:", url);
    }
  }

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-article-share]");
    if (!button) return;

    const payload = getSharePayload(button);

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    await copyShareUrl(button, payload.url);
  });
})();
