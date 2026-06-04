(function () {
  "use strict";

  var script = document.currentScript || {};
  var endpoint = script.dataset && script.dataset.endpoint
    ? script.dataset.endpoint
    : new URL("collect.php", script.src || location.href).href;
  var siteId = script.dataset && script.dataset.siteId ? script.dataset.siteId : inferSiteId();
  var siteName = script.dataset && script.dataset.siteName ? script.dataset.siteName : document.title || siteId;
  var startedAt = Date.now();
  var pageSent = false;
  var geoPromise = null;

  if (!siteId || window.__primusAnalyticsStarted) return;
  window.__primusAnalyticsStarted = true;

  function randomId(prefix) {
    var bytes = new Uint8Array(12);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    return prefix + Array.from(bytes).map(function (item) {
      return item.toString(16).padStart(2, "0");
    }).join("");
  }

  function storageGet(storage, key) {
    try { return storage.getItem(key); } catch (error) { return ""; }
  }

  function storageSet(storage, key, value) {
    try { storage.setItem(key, value); } catch (error) {}
  }

  function getVisitorId() {
    var key = "primusAnalyticsVisitorId";
    var value = storageGet(localStorage, key);
    if (!value) {
      value = randomId("v_");
      storageSet(localStorage, key, value);
    }
    return value;
  }

  function getSessionId() {
    var key = "primusAnalyticsSessionId";
    var value = storageGet(sessionStorage, key);
    if (!value) {
      value = randomId("s_");
      storageSet(sessionStorage, key, value);
    }
    return value;
  }

  function inferSiteId() {
    var host = location.hostname.replace(/^www\./, "");
    var path = location.pathname.toLowerCase();
    if (host === "nexovagas.com.br") {
      if (path.indexOf("/eventos") === 0) return "nexo-eventos";
      if (path.indexOf("/corridas") === 0) return "nexo-corridas";
      if (path.indexOf("/copa") === 0) return "nexo-copa";
      return "nexo-vagas";
    }
    if (host === "pontosemfiltro.com.br") return path.indexOf("/bio") === 0 ? "ponto-sem-filtro-bio" : "ponto-sem-filtro";
    if (path.indexOf("/contas") === 0) return "primus-contas";
    if (path.indexOf("/credencial") === 0 || path.indexOf("/credenciamento") === 0) return "primus-credencial";
    if (path.indexOf("/card") === 0) return "primus-card";
    if (path.indexOf("/jogos") === 0) return "primus-jogos";
    if (path.indexOf("/nexosocial") === 0) return "primus-social";
    if (path.indexOf("/user") === 0) return "primus-user";
    if (path.indexOf("/nexo") === 0) return "primus-nexo";
    return "primus-home";
  }

  function getDevice() {
    var ua = navigator.userAgent || "";
    if (/tablet|ipad/i.test(ua)) return "tablet";
    if (/mobile|android|iphone|ipod/i.test(ua)) return "mobile";
    return "desktop";
  }

  function getBrowser() {
    var ua = navigator.userAgent || "";
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\//.test(ua)) return "Opera";
    if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
    if (/Firefox\//.test(ua)) return "Firefox";
    return "Outro";
  }

  function getOs() {
    var ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac OS X/i.test(ua)) return "Mac";
    if (/Linux/i.test(ua)) return "Linux";
    return "Outro";
  }

  function getGeo() {
    if (geoPromise) return geoPromise;
    geoPromise = new Promise(function (resolve) {
      var key = "primusAnalyticsGeo";
      try {
        var cached = JSON.parse(localStorage.getItem(key) || "null");
        if (cached && cached.savedAt && Date.now() - cached.savedAt < 6 * 60 * 60 * 1000) {
          resolve(cached);
          return;
        }
      } catch (error) {}

      fetch("https://ipapi.co/json/", { cache: "no-store" })
        .then(function (response) { return response.ok ? response.json() : null; })
        .then(function (data) {
          var geo = {
            countryCode: String(data && data.country_code || ""),
            countryName: String(data && data.country_name || ""),
            region: String(data && data.region || ""),
            city: String(data && data.city || ""),
            lat: Number(data && data.latitude),
            lng: Number(data && data.longitude),
            savedAt: Date.now()
          };
          storageSet(localStorage, key, JSON.stringify(geo));
          resolve(geo);
        })
        .catch(function () { resolve({}); });
    });
    return geoPromise;
  }

  function basePayload(eventName, extra, geo) {
    return Object.assign({
      siteId: siteId,
      siteName: siteName,
      event: eventName,
      createdAtMs: Date.now(),
      page: location.pathname + location.search,
      title: document.title || siteName,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      referrer: document.referrer || "",
      durationSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
      device: getDevice(),
      browser: getBrowser(),
      os: getOs(),
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      screen: window.innerWidth + "x" + window.innerHeight,
      countryCode: geo.countryCode || "",
      countryName: geo.countryName || "",
      region: geo.region || "",
      city: geo.city || "",
      lat: Number.isFinite(geo.lat) ? geo.lat : null,
      lng: Number.isFinite(geo.lng) ? geo.lng : null
    }, extra || {});
  }

  function send(eventName, extra) {
    getGeo().then(function (geo) {
      var payload = JSON.stringify(basePayload(eventName, extra, geo || {}));
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, payload)) return;
      fetch(endpoint, {
        method: "POST",
        mode: "cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload
      }).catch(function () {});
    });
  }

  function sendPageView() {
    if (pageSent) return;
    pageSent = true;
    send("page_view");
  }

  document.addEventListener("click", function (event) {
    var target = event.target.closest("a,button,[data-analytics-action]");
    if (!target) return;
    var href = target.href || "";
    var label = target.getAttribute("aria-label") || target.textContent || href || target.id || "";
    var name = href && new URL(href, location.href).hostname !== location.hostname ? "outbound_click" : "click";
    send(name, { target: String(label).trim().slice(0, 180) });
  }, { capture: true });

  window.addEventListener("error", function (event) {
    send("error", { target: String(event.message || "erro").slice(0, 180) });
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") send("session_end");
  });

  window.addEventListener("pagehide", function () { send("session_end"); });
  setInterval(function () {
    if (document.visibilityState !== "hidden") send("heartbeat");
  }, 60000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sendPageView);
  } else {
    sendPageView();
  }
})();
