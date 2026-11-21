# 13 — Gaps, Technical Debt & Roadmap Opportunities

> **Analysis Scope:** Comparison of `FITFUEL_COMPREHENSIVE_GUIDE.md` specification against the live production codebase (`server.js`, `dashboard.html`, `fitfuel.js`, `features.js`).

---

## 1. Feature Status Audit Matrix

| Feature Module | Spec Requirement | Code Reality | Status | Recommended Action for Incoming Team |
|:---|:---|:---|:---:|:---|
| **Landing Volumetric Light Cone** | Blooming white/lime radial glow following cursor | Fully implemented with lerp loop (`app.js:15–48`, `styles.css:210`) | **LIVE** | Maintain 60fps budget. |
| **Dual Theme Switcher** | Dark mode (#060709) and Light mode (#F6F5F0) | Synchronous theme persistence in localStorage | **LIVE** | Ensure high contrast compliance on new views. |
| **Macro Engine & Food Log** | Mifflin-St Jeor TDEE + 5 meal slots | Implemented in `algo.js` and `#view-food-log` | **LIVE** | Ready for production. |
| **120+ Exercise Library** | Categorized movements with muscle targeting | Active in `#view-exercise-library` | **LIVE** | Expand 3D bone animation coverage. |
| **RPE & Progressive Overload** | e1RM calculation + PR alerts | Active in `#view-tracking` | **LIVE** | Ready. |
| **Dynamic Turnstile QR Pass** | 30s rotating cryptographic QR code | Implemented in `features.js:29` and modal | **LIVE** | Connect to physical hardware turnstile WebSocket bridge. |
| **MediaPipe Posture Checker** | Local WebAssembly joint tracking | Implemented in `mediapipe-posture.js` | **LIVE (Beta)** | Calibrate bench press angle thresholds (currently tuned for squats/deadlifts). |
| **Wearable BLE Sync** | Live Apple Watch & Whoop Heart Rate | Web Bluetooth scan triggers; awaiting broad BLE device profile integration | **PARTIAL** | Implement dedicated GATT protocol handlers for Polar H10 and Garmin. |
| **AI Grocery & Meal Prep** | Batch cooking high-protein meal plans | UI layout exists; shopping list generation is static | **PARTIAL** | Wire to LLM prompt in `server.js` (`POST /api/meal-prep/generate`). |
| **Gemini 2.0 Flash Meal Photo Scanner** | Camera meal image to instant macro breakdown | Documented in roadmap (`FITFUEL_COMPREHENSIVE_GUIDE.md:299`) | **PLANNED** | Implement `POST /api/ai/analyze-meal` endpoint calling Gemini Vision. |
| **Trainer Client Management Roster** | Multi-client compliance review dashboard | Specified in Tier matrix ($29.99/mo) | **PLANNED** | Build `#view-trainer-portal` with client switching selector. |

---

## 2. Technical Debt & Code Cleanup Opportunities

1. **SPA Monolithic Script Split:**
   - `fitfuel.js` currently holds ~570 KB of dashboard logic. While performant in vanilla JS, breaking this down into modular ES6 import modules (e.g. `modules/nutrition-view.js`, `modules/workout-view.js`) will significantly improve maintainability for new contributors.
2. **Database Migration Pipeline:**
   - Turso SQLite tables are currently created and verified programmatically inside `server.js` at runtime. Introducing a formal migration tool (e.g. Drizzle ORM or Prisma LibSQL adapter) would standardize schema rollouts.
3. **Automated E2E CI/CD Pipeline:**
   - The test suite (`tests/e2e/comprehensive_audit.test.js`) runs 52 headless Puppeteer assertions with 100% pass rate. This should be attached to GitHub Actions so every pull request automatically validates layout integrity across all 3 viewports.

---

## 3. High-Value Roadmap Enhancements (v2.1+)

- **AI Plate Recognition:** Use local camera frame analysis to automatically count Olympic weight plates ($45\text{lb} / 20\text{kg}$) loaded on a barbell.
- **Gym Music Tempo Sync:** Integrate Spotify Web Playback SDK to sync music BPM to rep cadence during cardio and lifting intervals.
- **Barbell Bar Path Tracer:** Trace the vertical trajectory of the barbell during squats and snatches, highlighting forward lean deviations.
