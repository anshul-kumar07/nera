// NER Logistics Intelligence Platform — Modern Service Worker
// Network-First strategy ensures fresh JS/CSS code is always served during updates

const CACHE_NAME = "ner-logistics-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http protocols
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // For localhost development and Next.js internal chunks: Network Only
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.pathname.includes("/_next/")) {
    return;
  }

  // Network First for all other assets with offline cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
