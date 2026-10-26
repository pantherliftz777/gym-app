/* FitFuel Service Worker v1.0.0 — Offline Gym Mode */
const CACHE_NAME = 'fitfuel-cache-v7-3';
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
  '/images/fitfuel-ai-logo.svg',
  '/images/fitfuel-bot-round.png',
  '/images/fitfuel-coach-avatar.png',
  '/modules/pwa-sync.js',
  '/modules/voice-coach.js',
  '/modules/barcode-scanner.js',
  '/modules/social-card.js',
  '/modules/mediapipe-posture.js'
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
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
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

  // For static app shell, use stale-while-revalidate strategy
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
        return networkResponse;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
