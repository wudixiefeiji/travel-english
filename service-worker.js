// Service Worker for 旅行英语 te_v11
const CACHE = 'te-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon-32.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS).catch(function() {});
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(r) {
      if (r) return r;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          var rc = response.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, rc); });
        }
        return response;
      }).catch(function() {
        return caches.match('./');
      });
    })
  );
});
