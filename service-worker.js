// Service Worker for 谢飞机 te_v37
const CACHE = 'te-v37';
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

self.addEventListener('message', function(e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  
  // Network-first for HTML documents (always get latest)
  if (e.request.mode === 'navigate' || url.pathname.indexOf('.html') !== -1 || url.pathname === '/') {
    e.respondWith(
      fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var rc = response.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, rc); });
        }
        return response;
      }).catch(function() {
        return caches.match(e.request).then(function(r) {
          return r || caches.match('./');
        });
      })
    );
    return;
  }
  
  // Cache-first for other assets
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
