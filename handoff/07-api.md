# 07 — Complete API Reference for Designers & Frontend Engineers

> **Source Code Citations:**  
> - `gym-app/server.js` (Lines 309–1273, 2580–2634)  
> - `gym-app/public/api.js` (Lines 1–150)  

---

## 1. Authentication & Session Domain

### `POST /api/auth/register` (`server.js:682`)
- **Auth Required:** No
- **Request Body:** `{ name: "Jordan Davis", email: "jordan@example.com", password: "Password123!", contact: "+1234567890" }`
- **Response (201):** `{ token: "64_char_hex_token", user: { id, name, email, is_admin: 0 } }`
- **Designer UI Trigger:** Shows button spinner on "Create Account" $\to$ on 201 success shows green toast "Welcome to FiTusion" and navigates to `dashboard.html`. On 400/409 shows inline red field error "Email already registered".

### `POST /api/auth/login` (`server.js:708`)
- **Auth Required:** No
- **Request Body:** `{ email: "jordan@example.com", password: "Password123!" }`
- **Response (200):** `{ token: "64_char_hex_token", user: { id, name, email, is_admin, is_beta_tester } }`
- **Designer UI Trigger:** Stores token in `localStorage.fitfuel_auth` and forwards to dashboard. On 401 shows error badge "Invalid email or password".

### `GET /api/auth/me` (`server.js:724`)
- **Auth Required:** Yes (`Authorization: Bearer <token>`)
- **Response (200):** `{ user: { id, name, email, is_admin, is_beta_tester } }`
- **Designer UI Trigger:** Validates current session on page load. If 401, clears stale token and prompts login modal.

### `POST /api/auth/logout` (`server.js:729`)
- **Auth Required:** Yes
- **Response (200):** `{ ok: true }`
- **Designer UI Trigger:** Clears tokens and returns user to `index.html`.

---

## 2. Core State & Activity Domain

### `GET /api/data` (`server.js:735`)
- **Auth Required:** Yes
- **Response (200):** Full state object `{ profile, plan, settings, water, log, custom, weights, workouts }`
- **Designer UI Trigger:** Powers initial dashboard render; shows skeleton loading shimmer while pending.

### `PUT /api/state` (`server.js:741`)
- **Auth Required:** Yes
- **Request Body:** `{ profile?, plan?, settings?, water?, log?, custom? }`
- **Response (200):** `{ ok: true, synced: true }`
- **Designer UI Trigger:** Background autosave debounce (500ms); shows subtle green sync dot in top navbar.

### `POST /api/weight` (`server.js:747`)
- **Auth Required:** Yes
- **Request Body:** `{ date: "2026-11-07", wKg: 78.5 }`
- **Response (200):** `{ ok: true }`
- **Designer UI Trigger:** Updates weight history line graph immediately.

### `POST /api/workout` (`server.js:755`)
- **Auth Required:** Yes
- **Request Body:** `{ date: "2026-11-07", name: "Push Day A", volumeKg: 8450 }`
- **Response (200):** `{ ok: true, prsBroken: [ "Bench Press" ] }`
- **Designer UI Trigger:** Triggers confetti particle canvas effect and prompts Social Story Card modal.

---

## 3. Computer Vision & Anthropometrics Domain

### `GET /api/posture/sessions` & `POST /api/posture/session` (`server.js:826–855`)
- **Auth Required:** Yes
- **POST Body:** `{ exercise: "Squat", score: 94.2, jointAngles: { hip: 88, knee: 84 }, issuesDetected: [], durationSec: 180 }`
- **Response (200):** `{ ok: true, id: 14 }`
- **Designer UI Trigger:** Saves form check report card; shows green status badge "Posture Assessed".

### `POST /api/body-scan/assessment` (`server.js:883`)
- **Auth Required:** Yes
- **Request Body:** `{ waistCm: 82.5, neckCm: 39.0, hipCm: 98.0, bodyFatPct: 14.8 }`
- **Response (200):** `{ ok: true, assessment: { id, bodyFatPct, whr: 0.84, riskCategory: "Low" } }`
- **Designer UI Trigger:** Updates 3D body composition mesh and health risk radar chart.

---

## 4. Artificial Intelligence & Coaching Domain

### `POST /api/ai-coach` (`server.js:1117`)
- **Auth Required:** Yes
- **Request Body:** `{ message: "What can I eat for 30g protein?", context: { currentGoal: "cut" } }`
- **Response (200):** `{ reply: "Here are 4 high-protein options..." }`
- **Designer UI Trigger:** Streaming message renderer with typewriter effect.

### `POST /api/ai-plan` (`server.js:1202`)
- **Auth Required:** Yes
- **Request Body:** `{ daysPerWeek: 4, goal: "hypertrophy", equipment: "gym" }`
- **Response (200):** `{ plan: { splitName: "4-Day Upper/Lower", days: [ ... ] } }`
- **Designer UI Trigger:** Renders periodized workout schedule preview card with "Save to My Program" button.

---

## 5. Facility, Beta & Governance Domain

### `GET /api/features` & `POST /api/features/waitlist` (`server.js:585–600`)
- **Auth Required:** No
- **POST Body:** `{ email: "member@example.com", featureId: "wearableSync" }`
- **Response (200):** `{ ok: true, message: "Added to waitlist" }`
- **Designer UI Trigger:** Changes button from "Join Waitlist" to "✓ Waitlisted".

### `POST /api/beta/apply` (`server.js:366`)
- **Auth Required:** Yes
- **Request Body:** `{ featureId: "formCorrectionAi", reason: "I want to audit my squat depth", device: "iPhone 15 Pro" }`
- **Response (200):** `{ ok: true, status: "pending" }`
- **Designer UI Trigger:** Replaces beta application form with "Application Pending Review" clock badge.

### `POST /api/complaint` (`server.js:972`)
- **Auth Required:** Yes
- **Request Body:** `{ title: "Cable station 3 fraying", category: "equipment", description: "..." }`
- **Response (200):** `{ ok: true, ticketId: 104 }`
- **Designer UI Trigger:** Clears modal and displays toast "Ticket #104 submitted to facility management".

### `GET /api/admin/stats` & `GET /api/admin/users` (`server.js:1021–1045`)
- **Auth Required:** Yes (Admin role required)
- **Response (200):** `{ totalUsers: 142, activeToday: 38, totalWorkouts: 1240, memoryMb: 54 }`
- **Designer UI Trigger:** Populates executive telemetry stat cards and member table in `#view-admin`.
