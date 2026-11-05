const CACHE_NAME = "nakahya-shell-v1";
self.addEventListener("install", (event) => { event.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", (event) => { event.waitUntil((async () => { await self.clients.claim(); const keys = await caches.keys(); await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))); })()); });
// Network-only by design: never cache authenticated pages, profiles, messages or API responses.
self.addEventListener("fetch", () => {});
