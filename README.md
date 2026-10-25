# FitFuel — Next-Gen Health, Nutrition & Training Platform

<div align="center">

![FitFuel Hero Banner](public/images/fitfuel-hero-banner.png)

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D22.5.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Turso-SQLite%20LibSQL-00E599?style=for-the-badge&logo=sqlite&logoColor=black)](https://turso.tech/)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A67D8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![UI Style](https://img.shields.io/badge/Design-Glassmorphism%20v2.0-8B5CF6?style=for-the-badge&logo=css3&logoColor=white)](https://github.com/pantherliftz777/gym-app)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/pantherliftz777/gym-app/actions)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**An ultra-modern, all-in-one athletic performance, macro tracking, and biomechanical fitness platform engineered with a pure Glassmorphism aesthetic.**

[Live Features](#-key-features) • [Visual Showcase](#-visual-showcase) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-project-structure)

</div>

---

## 🌟 Overview

**FitFuel** bridges high-performance sports science, AI-driven nutritional guidance, and cutting-edge visual design into an intuitive web application. Built without bulky JavaScript frameworks, FitFuel achieves blazing fast 60fps rendering, realistic frosted glassmorphism surfaces, and seamless dark mode contrast.

Whether you're tracking daily caloric macros, planning progressive overload weights, analyzing full-body composition, or monitoring posture via live camera feedback, FitFuel brings elite fitness intelligence directly to your browser.

---

## ✨ Key Features

### 💎 1. Premium Glassmorphism Design System
- **Pure Frosted Glass Surfaces**: Handcrafted with `backdrop-filter: blur(20px)` and `-webkit-backdrop-filter: blur(20px)`.
- **Specular Edge Highlights**: Multi-layered pseudo-elements (`::before` and `::after`) generating realistic directional light reflections along card edges.
- **Dynamic Ambient Lighting**: Fluid indigo, violet, and electric cyan mesh gradients giving depth behind semi-transparent cards.
- **Enhanced Dark & Light Mode**: Accessible contrast ratios powered by CSS custom properties and Plus Jakarta Sans typography.

### 🤖 2. FitFuel AI Coach
- Context-aware virtual trainer offering personalized recommendations for workouts, rest periods, and macro balancing.
- Instant feedback on training volume, plateau prevention, and recovery indices.

### 🧍 3. 4D Holographic Body Composition Analysis
- Interactive anatomical visualization showing muscle groups, fat distribution, and target areas.
- Track skeletal muscle mass (SMM), body fat percentage, visceral fat level, and total body water over time.

### 🏃 4. Live Activity & GPS Tracking
- Real-time GPS mapping for running, cycling, and outdoor walks.
- Granular telemetry recording split pace, elevation profile, cadence, and heart rate zones.

### 🎯 5. Camera-Based Posture AI
- Real-time pose estimation and webcam alignment for barbell squats, deadlifts, and overhead presses.
- Instant auditory and visual feedback for spinal integrity, knee tracking, and depth angles.

### 🥗 6. Smart Food Log & Nutrition Engine
- Detailed database of meals, whole foods, and micronutrients.
- Real-time macro target dials (Protein, Carbohydrates, Healthy Fats) with caloric balance calculations.
- Interactive **12-Cup Hydration Tracker** with tactile mouse controls and persistent local synchronization.

### 🏋️ 7. Starting Load & Progressive Overload Planner
- Intelligent 1RM (One Rep Max) calculations and warm-up ramp-up load progressions.
- Exercise library with muscle activation maps, form tips, and customizable sets/reps.

### 📱 8. Progressive Web App (PWA) & Gym Offline Mode
- **Zero-signal resilience**: Complete workout logging, hydration tracking, and rest timers function seamlessly in basements and gyms with no internet.
- **Offline Sync Queue**: Automatic background synchronization with Turso Cloud when network connectivity is re-established.
- **Native Experience**: Installable on iOS & Android home screens as a standalone full-screen web app.

### 📸 9. Barcode Scanner with OpenFoodFacts API
- Live camera barcode detection (UPC/EAN) powered by the native `BarcodeDetector` API.
- Instant access to the OpenFoodFacts database (3M+ items) with verified calories, protein, carbohydrates, and fats.

### 🔊 10. Voice Coach & Synthesized Audio Cues
- Hands-free audio rest timer using `window.speechSynthesis` (announces intervals, 30s remaining, 10s warnings).
- Web Audio API real-time sound synthesizer: countdown beeps, metronome tempo cues, and rep completion chimes without external audio dependencies.

### 📤 11. Data Portability & Glassmorphic Social PR Story Cards
- **1-Click Exports**: Export workout history to CSV, nutrition logs to CSV, and complete profile state to JSON.
- **1080x1920 Story Generator**: Dynamically renders high-resolution frosted glass PR share cards for Instagram Stories and X/Twitter.

### 🛡️ 12. Server Sliding-Window Rate Limiting
- In-memory sliding-window IP rate limiter in Node.js protecting `/api/auth/login`, `/api/auth/register`, and `/api/ai/chat`.
- Strict request body size filtering protecting against payload abuse.

---

## 📸 Visual Showcase

<div align="center">

### Daily Dashboard & Health Hub
![FitFuel Glassmorphism Preview](public/images/fitfuel_glassmorphism_preview.png)

<br/>

### AI Coach & Intelligent Recommendations
![FitFuel AI Coach Dark Mode](public/images/fitfuel_ai_coach_dark_fixed.png)

<br/>

### 4D Body Composition & Muscle Analyzer
![FitFuel Body Analysis Dark Mode](public/images/fitfuel_body_analysis_dark_fixed.png)

</div>

---

## 🛠 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Core** | Vanilla HTML5, CSS3, JavaScript (ES2024) | Zero build overhead, instant load times, 60fps UI |
| **Design System** | Custom Glassmorphism Token Architecture | Multi-layer frosted glass, CSS variables, backdrop blurs |
| **Typography** | Plus Jakarta Sans & Inter | High-legibility modern sans-serif fonts |
| **Backend** | Node.js native HTTP server (`server.js`) | Lightweight micro-service handling REST endpoints |
| **Database** | Turso / LibSQL (`@libsql/client`) | SQLite-compatible edge/cloud database with local fallback |
| **Visualization** | Chart.js & Canvas API | Interactive radar charts, telemetry graphs, and macro progress |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v22.5.0` or higher installed ([Download Node.js](https://nodejs.org/))
- **Git**: Installed and configured on your system

### 1. Clone the Repository
```bash
git clone https://github.com/pantherliftz777/gym-app.git
cd gym-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your Turso Database URL and Auth Token to sync across cloud devices, or leave empty to use zero-config local SQLite `file:fitfuel.db`)*

### 4. Initialize Database (Turso / SQLite)
```bash
node scripts/init_turso.js
```
*Optional migrations for body scans and activity logs:*
```bash
node scripts/migrate_body_scan.js
node scripts/migrate_activity.js
```

### 5. Start the Application
```bash
npm start
```
The server will boot up instantly:
```
FitFuel server listening on port 3000...
URL: http://localhost:3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📂 Project Structure

```
gym-app/
├── .github/workflows/ci.yml      # Automated CI/CD build, syntax & smoke test pipeline
├── public/                       # Frontend client assets
│   ├── index.html                # Main application interface (15+ integrated views)
│   ├── styles.css                # Master Glassmorphism design system & variables
│   ├── fitfuel.js                # Core state management, DOM interactions, API client
│   ├── manifest.json             # Progressive Web App configuration
│   ├── sw.js                     # Service Worker for offline gym caching
│   ├── modules/                  # Specialized feature modules
│   │   ├── pwa-sync.js           # PWA install prompt & offline queue sync
│   │   ├── voice-coach.js        # Speech synthesis & Web Audio synthesizer
│   │   ├── social-card.js        # 1080x1920 PR Story card & CSV/JSON exports
│   │   ├── barcode-scanner.js    # Barcode detection & OpenFoodFacts API
│   │   └── mediapipe-posture.js  # Biomechanical joint angle calculation
│   └── images/                   # UI graphics, avatars, anatomy assets & previews
│       ├── fitfuel-hero-banner.png
│       ├── fitfuel_glassmorphism_preview.png
│       ├── fitfuel_ai_coach_dark_fixed.png
│       └── fitfuel_body_analysis_dark_fixed.png
├── scripts/                      # Database migrations & helper utilities
│   ├── init_turso.js             # Schema bootstrap script
│   ├── migrate_activity.js       # Activity telemetry migration
│   ├── migrate_body_scan.js      # Body composition schema setup
│   └── convert-exercises.js      # Exercise library data converter
├── server.js                     # High-performance Node.js REST API server (Rate-limited)
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies and execution scripts
└── README.md                     # Documentation
```

---

## 🎨 Glassmorphism Design Token Standard

FitFuel adheres to a strict frosted-glass mathematical rule for its component architecture:

```css
.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45),
              inset 0 1px 0 rgba(255, 255, 255, 0.22),
              inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  pointer-events: none;
}

.glass-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 1px; height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), transparent, rgba(255, 255, 255, 0.15));
  pointer-events: none;
}
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
