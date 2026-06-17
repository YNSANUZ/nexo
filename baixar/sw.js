const CACHE_NAME = "baixanexo-v20260616-3";
const appRoot = new URL("./", self.location.href);
const shellFiles = [
  "./",
  "./manifest.webmanifest",
  "./public/styles.css?v=20260616-2",
  "./public/app.js?v=20260616-2",
  "./public/cube.js?v=20260616-2",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
].map((path) => new URL(path, appRoot).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(shellFiles))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.includes("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(new URL("./", appRoot).href, clone));
          return response;
        })
        .catch(() => caches.match(new URL("./", appRoot).href))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
