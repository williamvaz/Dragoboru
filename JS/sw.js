const cacheName = 'db-fighters-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/css/index.css',
  '/js/index.js',
  '/Logo.png',
  '/manifest.json'
  // ➕ Adicione outros arquivos que queira deixar offline
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
