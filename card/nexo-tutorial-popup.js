(function () {
  "use strict";

  var VIDEO_SRC = "assets/nexo-card-tutorial.mp4";
  var STORAGE_KEY = "nexoTutorialClosed";
  var AUTO_OPEN_DELAY_MS = 1600;
  var DIALOG_RETRY_DELAY_MS = 3000;
  var SHOW_ONCE_PER_SESSION = true;

  function createTutorialPopup() {
    var modal = document.createElement("div");
    modal.className = "nexo-tutorial-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Tutorial NEXO");

    var dialog = document.createElement("div");
    dialog.className = "nexo-tutorial-dialog";

    var closeButton = document.createElement("button");
    closeButton.className = "nexo-tutorial-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Fechar tutorial");
    closeButton.textContent = "X";

    var muteButton = document.createElement("button");
    muteButton.className = "nexo-tutorial-mute";
    muteButton.type = "button";
    muteButton.setAttribute("aria-label", "Mutar video");
    muteButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="mic-body" d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"></path><path class="mic-stand" d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"></path><path class="mic-slash" d="M4 4l16 16"></path></svg>';

    var playButton = document.createElement("button");
    playButton.className = "nexo-tutorial-play";
    playButton.type = "button";
    playButton.setAttribute("aria-label", "Reproduzir video");
    playButton.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M24 17Q24 12 28.4 14.6L49.7 27.8Q55.2 31.2 49.7 34.6L28.4 49.4Q24 52 24 47Z"></path></svg>';

    dialog.appendChild(closeButton);
    dialog.appendChild(playButton);
    dialog.appendChild(muteButton);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    function addVideo(options) {
      var soundEnabled = options && options.sound === true;
      var existingVideo = dialog.querySelector("video");
      if (existingVideo) {
        setVideoSound(existingVideo, soundEnabled);
        if (soundEnabled) existingVideo.currentTime = 0;
        existingVideo.play().catch(function () {});
        syncMuteButton();
        return;
      }

      var video = document.createElement("video");
      video.className = "nexo-tutorial-video";
      video.src = VIDEO_SRC;
      video.autoplay = true;
      video.playsInline = true;
      video.controls = false;
      video.loop = false;
      setVideoSound(video, soundEnabled);
      video.volume = 1;
      video.preload = "auto";
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      dialog.insertBefore(video, closeButton);
      syncMuteButton();
      syncPlayButton(true);
      playCurrentVideo();
      video.addEventListener("loadeddata", playCurrentVideo, { once: true });
      video.addEventListener("canplay", playCurrentVideo, { once: true });
      video.addEventListener("play", syncPlayButton);
      video.addEventListener("playing", syncPlayButton);
      video.addEventListener("pause", syncPlayButton);
      video.addEventListener("ended", syncPlayButton);
      video.addEventListener("error", function () { syncPlayButton(true); });
      window.setTimeout(playCurrentVideo, 120);
      window.setTimeout(function () {
        if (video.paused) syncPlayButton(true);
      }, 650);
    }

    function playCurrentVideo(options) {
      var video = dialog.querySelector("video");
      if (!video) return;
      if (options && options.sound === true) setVideoSound(video, true);
      syncMuteButton();
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.then === "function") {
        playAttempt.then(syncPlayButton).catch(function () {
          syncPlayButton(true);
        });
      } else {
        syncPlayButton();
      }
    }

    function setVideoSound(video, soundEnabled) {
      video.muted = !soundEnabled;
      video.defaultMuted = !soundEnabled;
      if (soundEnabled) {
        video.removeAttribute("muted");
      } else {
        video.setAttribute("muted", "");
      }
    }

    function syncMuteButton() {
      var video = dialog.querySelector("video");
      var muted = !video || video.muted;
      muteButton.classList.toggle("is-muted", muted);
      muteButton.setAttribute("aria-label", muted ? "Ativar som do video" : "Mutar video");
    }

    function syncPlayButton(forceVisible) {
      var video = dialog.querySelector("video");
      var show = !!forceVisible || !video || video.paused || video.ended;
      playButton.classList.toggle("is-visible", show);
      playButton.hidden = !show;
    }

    function hasOpenNativeDialog() {
      return Boolean(document.querySelector("dialog[open]"));
    }

    function alreadyClosed() {
      try {
        return sessionStorage.getItem(STORAGE_KEY) === "1";
      } catch (error) {
        return false;
      }
    }

    function rememberClosed() {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch (error) {
        /* sessionStorage can be blocked in some browsers. */
      }
    }

    function openModal(options) {
      var force = options && options.force;
      if (!force && SHOW_ONCE_PER_SESSION && alreadyClosed()) return;
      if (!force && hasOpenNativeDialog()) {
        window.setTimeout(openModal, DIALOG_RETRY_DELAY_MS);
        return;
      }
      modal.classList.add("is-open");
      addVideo({ sound: true });
      closeButton.focus();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      var video = dialog.querySelector("video");
      if (video) {
        video.pause();
        video.remove();
      }
      rememberClosed();
    }

    window.openNexoTutorial = function () {
      openModal({ force: true });
    };

    document.querySelectorAll("[data-open-nexo-tutorial]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        openModal({ force: true });
      });
    });

    closeButton.addEventListener("click", closeModal);

    muteButton.addEventListener("click", function (event) {
      event.stopPropagation();
      var video = dialog.querySelector("video");
      if (!video) return;
      var soundEnabled = video.muted;
      setVideoSound(video, soundEnabled);
      if (soundEnabled) video.volume = 1;
      playCurrentVideo({ sound: soundEnabled });
      syncMuteButton();
    });

    playButton.addEventListener("click", function (event) {
      event.stopPropagation();
      playCurrentVideo({ sound: true });
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === closeButton || event.target === muteButton || event.target === playButton || event.target.closest(".nexo-tutorial-mute") || event.target.closest(".nexo-tutorial-play")) return;
      playCurrentVideo({ sound: true });
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    window.setTimeout(function () {
      openModal({ force: false });
    }, AUTO_OPEN_DELAY_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createTutorialPopup);
  } else {
    createTutorialPopup();
  }
})();
