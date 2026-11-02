/* FitFuel Service Worker v8.1.0 — Offline Gym Mode with Cache-Busting & Immediate Invalidation */
const CACHE_NAME = 'fitfuel-cache-v8.1.0-merged';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/fitfuel.js',
  '/api.js',
  '/data.js',
  '/algo.js',
  '/motion.min.js',
  '/manifest.json',
  '/features.html',
  '/features.css',
  '/features.js',
  '/shared/featureStatus.js',
  '/shared/betaAccess.js',
  '/images/fitfuel-ai-logo.svg',
  '/images/fitfuel-bot-round.png',
  '/images/fitfuel-coach-avatar.png',
  '/modules/exercise-equipment-engine.js',
  '/modules/beta-manager.js',
  '/modules/pwa-sync.js',
  '/modules/voice-coach.js',
  '/modules/barcode-scanner.js',
  '/modules/social-card.js',
  '/modules/mediapipe-posture.js',
  '/modules/hero-carousel.js',
  '/assets/hero-carousel/hero-01.png',
  '/assets/hero-carousel/hero-02.png',
  '/assets/hero-carousel/hero-03.png',
  '/assets/hero-carousel/hero-04.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[FitFuel SW] Non-critical asset cache skip:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[FitFuel SW] Deleting obsolete cache:', k);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET and chrome-extension/external API requests
  if (req.method !== 'GET') return;
  
  // For API endpoints, use network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(JSON.stringify({ offline: true, error: 'Offline mode active. Changes queued locally.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For HTML documents and navigation requests: NETWORK-FIRST to guarantee immediate visibility of new updates
  const isDocumentReq = req.mode === 'navigate' || req.destination === 'document' || 
    (req.headers.get('accept') && req.headers.get('accept').includes('text/html'));

  if (isDocumentReq) {
    event.respondWith(
      fetch(req).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(req).then(cached => cached || caches.match('/index.html'));
      })
    );
    return;
  }

  // For scripts, stylesheets, and images: Network-first if query string has version (?v=) or cache fallback
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
        return networkResponse;
      }).catch(() => cached);

      // If URL contains version string, prefer network to avoid stale caches
      if (url.searchParams.has('v')) {
        return fetchPromise.catch(() => cached);
      }

      return cached || fetchPromise;
    })
  );
});
