// FGX Trading Monitor · service worker: red primero (siempre la versión nueva), caché solo como respaldo sin conexión.
// Solo toca archivos de la propia app: Google Drive / Google Identity / fuentes pasan directos.
const V = 'fgx-tm-v3';
const SHELL = ['./', 'index.html', 'manifest.json', 'logo.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
