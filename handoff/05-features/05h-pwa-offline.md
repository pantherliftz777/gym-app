# 05h — Feature Spec: PWA & Offline Synchronization

> **Status:** LIVE  
> **Source Files & Citations:**  
> - Service Worker: `gym-app/public/sw.js` (Lines 1–125)  
> - Sync Manager: `gym-app/public/modules/pwa-sync.js` (Lines 1–173)  
> - Manifest: `gym-app/public/manifest.json`  

---

## 1. Zero Network Dependency Architecture

Commercial gyms and strength basements frequently have thick reinforced concrete walls and zero cellular or Wi-Fi reception. FitFuel was engineered from day one as an **offline-first Progressive Web Application (PWA)**:

```mermaid
graph TD
    UserAction["User Action in Basement:<br/>Logs Set: Bench 100kg x 8 reps"] --> OnlineCheck{navigator.onLine?}
    
    OnlineCheck -->|Yes| FastSync["Direct HTTP PUT /api/state"]
    FastSync --> TursoCloud["Turso Edge Database"]
    
    OnlineCheck -->|No (Offline)| Enqueue["Save to Offline Queue<br/>(localStorage: ff_offline_queue_v1)"]
    Enqueue --> ToastNotification["UI Toast: 'Saved to offline queue'"]
    Enqueue --> ListenOnline["window.addEventListener('online')"]
    
    ListenOnline --> Reconnected["Connection Restored"]
    Reconnected --> Flush["flushQueue() batches all pending sets"]
    Flush --> TursoCloud
    Flush --> SuccessToast["UI Toast: 'Offline data synced successfully'"]
```

---

## 2. Service Worker Caching Matrix (`sw.js`)

FitFuel's Service Worker (`v9.0.0-production`) uses a hybrid **Cache-First for Static Assets** and **Network-First with Cache Fallback for APIs**:

| Asset Type | Caching Strategy | Target URLs / Files |
|:---|:---|:---|
| **Core App Shell** | Cache-First with Stale-While-Revalidate | `/`, `/index.html`, `/dashboard.html`, `/styles.css`, `/dashboard-styles.css`, `/fitfuel.js`, `/app.js`, `/algo.js`, `/api.js` |
| **Typography & Fonts** | Cache-First (Immutable) | Google Fonts WOFF2 files: `Syne` (700, 800), `Outfit` (300, 400, 600, 700), `Plus Jakarta Sans` |
| **Media & Icons** | Cache-First | `/images/fitusion_exact/*`, `/images/cutouts/*`, `/images/fitfuel-ai-logo.svg`, SVG icons |
| **REST API Calls** | Network-First with Offline State Fallback | `/api/data`, `/api/plans`, `/api/beta/status` |

---

## 3. PWA Installation & Native Manifest Attributes

- **Display Mode:** `standalone` (removes mobile browser address bar and navigation controls, providing a true native iOS/Android feel).
- **Theme Color:** `#060709` (matches dark mode background to seamlessly color the mobile system status bar).
- **App Icons:** High-resolution SVG vector icon with PNG fallbacks (`192x192` and `512x512` maskable icons).
- **Install Prompt Hook:** Intercepts `beforeinstallprompt` and renders an elegant in-app install banner in the sidebar footer.
