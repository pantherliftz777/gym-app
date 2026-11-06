# 01 — Product Overview & Market Positioning

> **Source Code & Spec Citations:**  
> - `FITFUEL_COMPREHENSIVE_GUIDE.md` (Lines 11–22, 235–257, 283–311)  
> - `gym-app/public/index.html` (Lines 1–150)  
> - `gym-app/public/features.js` (Lines 1–120)  
> - `gym-app/server.js` (Lines 1–40, 221–235)  

---

## 1. What the Product Is

**FiTusion / FitFuel** is an integrated athletic operating system combining precision sports nutrition, real-time computer vision biomechanics, intelligent progressive strength tracking, and commercial gym facility access into a unified, privacy-first web application.

- **Brand Identity ("FiTusion"):** The public-facing high-fashion, editorial athletic lifestyle brand presented on the cinematic marketing landing page (`index.html`).
- **Platform Intelligence ("FitFuel"):** The underlying software engine, database state, calculation algorithms (`algo.js`), and athletic member dashboard (`dashboard.html`).

---

## 2. The Problem It Solves

Modern fitness tracking is fractured across incompatible, subscription-fatigued tools:
1. **Tool Sprawl:** Lifters use MyFitnessPal for calories, Strong or Hevy for weight training, a separate gym key fob or branded app for turnstile entry, and Google Sheets for 1RM calculations.
2. **Injury Risks in Isolation:** Solo lifters in commercial gyms often compromise spinal alignment or knee tracking during heavy compound lifts without real-time corrective feedback.
3. **Data Loss in Gym Basements:** Underground gym facilities often lack cellular connectivity, causing conventional cloud fitness apps to fail or stall during workouts.
4. **Facility Management Friction:** Gym owners struggle with turnstile line bottlenecks, badge sharing fraud, and manual equipment maintenance tracking.

FitFuel unifies all four pillars into a single Progressive Web App (PWA) with zero native installation barriers.

---

## 3. The 3-Sentence Value Proposition

1. **For Athletes:** FitFuel delivers precision nutrition and progressive overload programming powered by on-device computer vision form analysis that keeps lifters safe without human trainers.
2. **For Coaches:** FitFuel eliminates client check-in sprawl by combining asynchronous biomechanical video auditing, live food diaries, and adherence heatmaps into one dashboard.
3. **For Facilities:** FitFuel modernizes gym operations with dynamic fraud-proof QR turnstile access, live floor occupancy meters, and integrated equipment issue ticketing.

---

## 4. Target User Personas

| Persona | Role | Primary Needs | Key FitFuel Screens Used |
|:---|:---|:---|:---|
| **Jordan Davis (28)** | *Serious Gym Lifter* | Macro tracking, RPE auto-recalibration, PR alerts, rest timing. | `#view-today`, `#view-food-log`, `#view-exercise-library`, `#view-tracking` |
| **Elena Vance (34)** | *Personal Trainer & Coach* | Multi-client compliance review, biomechanics audits, plan generation. | `#view-ai-coach`, `#view-posture`, `#view-admin` |
| **Marcus Brody (46)** | *Gym Owner & General Manager* | Contactless gate entry, equipment upkeep logs, peak floor traffic analysis. | `#view-features` (QR Pass & Crowd), `#view-admin` |
| **Chloe Chen (22)** | *Casual Fitness Enthusiast* | Class booking (HIIT, Spin), hydration reminders, 3D body fat tracking. | `#view-features`, `#view-today`, `#view-body-analysis` |

---

## 5. Competitors It Replaces

| Competitor Category | Typical Incumbents | FitFuel Advantage |
|:---|:---|:---|
| **Macro & Food Trackers** | MyFitnessPal, Cronometer, MacroFactor | Zero paywalled barcode scanning; built-in Mifflin-St Jeor engine; local-first speed. |
| **Workout Loggers** | Strong, Hevy, JEFIT | Automatic RPE load recalibration; 120+ exercise library with muscle targeting; integrated timer. |
| **Motion & Pose Apps** | FormCheck, OxeFit, Tempo | On-device MediaPipe WebAssembly inference; 100% private video (never uploaded to servers). |
| **Gym Management Software** | Mindbody, GymMaster, ABC Fitness | Dynamic 30s rotating cryptographic QR codes; integrated member telemetry in one portal. |

---

## 6. Business Model & Tiering Matrix

*(Sourced from `FITFUEL_COMPREHENSIVE_GUIDE.md` Lines 283–311)*

```mermaid
graph LR
    Tier1["Core Free<br/>$0/mo"] --> Tier2["Pro Lifter<br/>$9.99/mo"]
    Tier2 --> Tier3["Coach / Trainer<br/>$29.99/mo"]
    Tier3 --> Tier4["Commercial Facility<br/>$99+/mo"]
```

| Tier Name | Price | Target Audience | What It Unlocks | Status in Code |
|:---|:---:|:---|:---|:---:|
| **Core Free** | **$0 / free** | Everyday gym goers | Full workout logging, 120+ exercise library, manual calorie & macro logging, water tracking, streak metrics. | **LIVE** (`fitfuel.js`) |
| **Pro Lifter** | **$9.99 / mo** | Performance lifters | AI Coach interactive chat, 3D body composition mesh, MediaPipe camera posture feedback, AI meal scanner. | **PARTIAL / BETA** (`beta-features.js`) |
| **Coach / Trainer** | **$29.99 / mo** | Independent personal trainers | Up to 15 client profiles, asynchronous video form reviews, macro compliance heatmaps, custom periodization builder. | **PLANNED** (`FITFUEL_COMPREHENSIVE_GUIDE.md`) |
| **Commercial Facility** | **$99+ / mo** | Gym owners & health clubs | Dynamic QR turnstile entry engine, live floor crowd density heatmap, member equipment maintenance ticketing. | **LIVE** (`features.js`, `server.js`) |
