// ==========================================================================
// WEBNest Service Worker — Offline Caching & High-Performance Android Shell
// ==========================================================================

const CACHE_NAME = 'webnest-cache-v1.0';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json',
  '/images/icon.svg',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/icon-maskable.png',
  '/images/star-icon.svg',
  '/images/project_galaxygreen.jpg',
  '/images/service_android.jpg'
];

// Install event — Pre-cache critical application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('WEBNest ServiceWorker pre-cache non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event — Clean up previous cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event — Stale-While-Revalidate with Network Fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip range requests (videos)
  if (event.request.method !== 'GET') return;
  if (event.request.headers.has('range')) return;

  const url = new URL(event.request.url);

  // Skip external fonts or non-local API calls
  if (url.origin !== self.origin) {
    // For external CDNs (Google Fonts, GSAP, Lenis), try cache first or network fallback
    if (url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com') || 
        url.hostname.includes('cdnjs.cloudflare.com') ||
        url.hostname.includes('cdn.jsdelivr.net')) {
      event.respondWith(
        caches.match(event.request).then((cached) => {
          return cached || fetch(event.request).then((response) => {
            if (response.status === 200) {
              const resClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
            return response;
          }).catch(() => cached);
        })
      );
    }
    return;
  }

  // Same-origin assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Return cached response if offline
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
