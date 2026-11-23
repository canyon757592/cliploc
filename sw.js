/* Voûte : mise en cache pour ouvrir le viseur dehors, même avec peu de réseau. */
const V = "voute-v1";
const COEUR = ["/ciel/", "/assets/css/site.css", "/assets/css/ciel.css", "/assets/js/ciel.js", "/assets/js/sky.js", "/assets/js/achats.js", "/assets/js/astronomy.min.js", "/assets/data/sky.json", "/assets/fonts/bodoni-moda-latin-400-italic.woff2", "/assets/fonts/bodoni-moda-latin-500-normal.woff2", "/assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2", "/assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2", "/icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(COEUR)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  // réseau d'abord (contenu toujours à jour), cache si pas de réseau
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
