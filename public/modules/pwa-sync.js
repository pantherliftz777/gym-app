/* FitFuel PWA & Offline Sync Manager */
(function() {
  'use strict';

  const QUEUE_KEY = 'ff_offline_queue_v1';
  let deferredInstallPrompt = null;

  function getQueue() {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveQueue(q) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch (e) {}
  }

  function enqueueAction(actionType, payload) {
    const q = getQueue();
    q.push({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: actionType,
      payload: payload,
      timestamp: Date.now()
    });
    saveQueue(q);
    if (typeof window.toast === 'function') {
      window.toast('Offline: Action saved to offline queue.');
    }
  }

  async function flushQueue() {
    if (!navigator.onLine) return;
    const q = getQueue();
    if (q.length === 0) return;

    let processed = 0;
    const remaining = [];

    for (const item of q) {
      try {
        if (typeof window.FF !== 'undefined' && window.FF.patch) {
          if (item.type === 'patch') {
            await window.FF.patch(item.payload);
            processed++;
            continue;
          }
        }
        remaining.push(item);
      } catch (err) {
        remaining.push(item);
      }
    }

    saveQueue(remaining);

    if (processed > 0 && typeof window.toast === 'function') {
      window.toast(`Back online! Synced ${processed} pending items to cloud.`);
    }
  }

  // Register Service Worker with instant cache-invalidation
  function initPWA() {
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      let hadController = Boolean(navigator.serviceWorker.controller);
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController) {
          hadController = true;
          return;
        }
        if (!refreshing) {
          refreshing = true;
          console.log('[FitFuel PWA] Service Worker controller changed, auto-reloading to apply latest updates...');
          window.location.reload();
        }
      });

      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          console.log('[FitFuel PWA] Service Worker registered:', reg.scope);
          try {
            reg.update();
            if (reg.waiting) {
              reg.waiting.postMessage({ action: 'skipWaiting' });
            }
            reg.addEventListener('updatefound', () => {
              const worker = reg.installing;
              if (worker) {
                worker.addEventListener('statechange', () => {
                  if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[FitFuel PWA] New update installed, activating immediately...');
                    worker.postMessage({ action: 'skipWaiting' });
                  }
                });
              }
            });
          } catch (e) {}
        }).catch(err => {
          console.warn('[FitFuel PWA] Service Worker registration failed:', err);
        });
      });
    }

    // Capture install prompt for PWA install button
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const installBtn = document.getElementById('btnPwaInstall');
      if (installBtn) installBtn.style.display = 'inline-flex';
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      const installBtn = document.getElementById('btnPwaInstall');
      if (installBtn) installBtn.style.display = 'none';
      if (typeof window.toast === 'function') {
        window.toast('FitFuel app successfully installed!');
      }
    });

    // Listen for online / offline events
    window.addEventListener('online', () => {
      document.body.classList.remove('is-offline');
      if (typeof window.toast === 'function') {
        window.toast('Internet connection restored.');
      }
      flushQueue();
    });

    window.addEventListener('offline', () => {
      document.body.classList.add('is-offline');
      if (typeof window.toast === 'function') {
        window.toast('You are offline. Gym Offline Mode active.');
      }
    });

    // Initial check
    if (!navigator.onLine) {
      document.body.classList.add('is-offline');
    }
  }

  async function promptInstall() {
    if (!deferredInstallPrompt) {
      if (typeof window.toast === 'function') {
        window.toast('FitFuel is already installed or install is supported via browser menu.');
      }
      return;
    }
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('[FitFuel PWA] User accepted the install prompt');
    }
    deferredInstallPrompt = null;
  }

  // Auto init
  if (typeof window !== 'undefined') {
    initPWA();
    window.FitFuelPWA = {
      promptInstall,
      enqueueAction,
      flushQueue,
      isOnline: () => navigator.onLine
    };
  }
})();
