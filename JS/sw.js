const cacheName = 'db-fighters-cache-v1';
const filesToCache = [
  '/Dragoboru/',
  '/Dragoboru/index.html',
  '/Dragoboru/CSS/index.css',
  '/Dragoboru/JS/index.js',
  '/Dragoboru/Logo.png',
  '/Dragoboru/JSON/manifest.json'
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
