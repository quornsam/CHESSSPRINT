const CACHE_NAME = "kwik-chess-pwa-v0-213";
const ASSETS = [
  "./manifest.json",
  "./assets/logo-king.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./robots.txt",
  "./sitemap.xml"
];
const INDEX_URL = "./index.html?v=0.213";

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([...ASSETS, INDEX_URL]).catch(() => undefined))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const request = event.request;
  const isDocument = request.mode === "navigate" || request.destination === "document";

  if (isDocument) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(INDEX_URL, copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(INDEX_URL).then(cached => cached || caches.match("./index.html") || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => undefined);
      return response;
    }))
  );
});
