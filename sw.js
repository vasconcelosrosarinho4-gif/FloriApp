const CACHE_NAME = 'floriapp-jardim-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './pages/offline.html',
  './pages/sobre.html',
  './assets/css/styles.css',
  './assets/css/components/dashboard.css',
  './assets/js/app.js',
  './assets/js/db.js',
  './assets/js/modules/api.js',
  './assets/js/modules/UI.js',
  './assets/images/logo.svg',
  './assets/images/icons/icon-192x192.png',
  './assets/images/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage || caches.match('./pages/offline.html');
        })
    );
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
