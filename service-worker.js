const CACHE_NAME = 'checkout-world-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './Logo.png',
  './THE-MENACE.gif',
  './icon-192.png',
  './icon-512.png'
];

// Installation - Cache alle wichtigen Dateien
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Service Worker: Error caching', err))
  );
});

// Aktivierung - Lösche alte Caches und übernehme sofort
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network First: Immer zuerst Netzwerk versuchen, Cache nur als Fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Gültige Antwort vom Netzwerk - Cache aktualisieren
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Kein Netzwerk - aus Cache laden (Offline-Fallback)
        console.log('Service Worker: Offline - serving from cache');
        return caches.match(event.request);
      })
  );
});
