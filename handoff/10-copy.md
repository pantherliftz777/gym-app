# 10 — Content & Microcopy Inventory

> **Source Code Citations:**  
> - Landing Page: `gym-app/public/index.html` (Lines 40–550)  
> - Dashboard UI: `gym-app/public/dashboard.html` (Lines 100–1200)  
> - State & Persona: `gym-app/public/fitfuel.js` (Lines 400–600)  

---

## 1. Landing Page Signature Copy

### A. Hero Section (`index.html:50–110`)
- **Brand Title:** `FiTusion`
- **Main Headline (Display Syne 800):**  
  > *"Sculpt Your Body, Elevate Your Spirit"*
- **Floating Stat Badges:**
  - `1.5 Hours` — Daily training investment
  - `20 Poses` — Biomechanical movement patterns analyzed
  - `550 Kcal` — Average active burn per session
  - `5 Sets` — Compound progression baseline
  - `12k+ Happy Spirits` — Verified active lifters
- **Hero CTA Button:** `Let's Start > > >`
- **Header CTAs:** `Contact Us` (secondary outline), `Get Started` (primary lime pill), `Demo Lifter` (instant bypass).

### B. "Inspired to Inspire Your Best Self" (`index.html:180–240`)
- **Headline:** *"Inspired to Inspire Your Best Self"*
- **Subhead:** *"We're Your Partner In Achieving A Healthier, Stronger, And More Confident You."*
- **Feature Checklist Items:**
  - `Nutrition Guidance`
  - `Progress Tracking`
  - `Community Support`
  - `Expert Trainers`
  - `Premium Membership`
  - `Next-Level Fitness Spaces`

### C. "Discover What Sets Us Apart" (`index.html:280–360`)
- **Category Pills & Descriptions:**
  - **Cardio Training:** *"Boost endurance and heart health with high-energy cardio sessions designed to keep you moving."*
  - **Strength Build:** *"Develop power and resilience through expert-guided strength training tailored to all fitness levels."*
  - **Fat Loss:** *"Shed unwanted fat with dynamic workout routines and fat-burning strategies that deliver lasting results."*
  - **HIIT Workouts:** *"Maximize calorie burn and improve fitness with short, intense high-intensity interval training sessions."*

### D. "Train Smarter, Unleash Your Potential" (`index.html:380–460`)
- **Course Titles:**
  - `Barbell Basics` (Foundation compound lifts)
  - `Kettlebell Masterclass` (Ballistic power & hip hinge)
  - `Cardio Power Boost` (Lactate threshold & sprint conditioning)

---

## 2. Dashboard Microcopy & Empty States

| Component / State | Display Text / Microcopy | Location in Code |
|:---|:---|:---|
| **Morning Greeting** | `Good morning, Jordan` / `Good evening, Jordan` (Dynamic by hour) | `fitfuel.js:1435` |
| **Command Subhead** | `Your athletic performance dashboard is ready.` | `dashboard.html:128` |
| **Empty Food Log** | *"No meals logged for today yet. Tap the search bar or scan a barcode to log your first meal."* | `dashboard.html:480` |
| **Empty Workout History** | *"No completed workouts recorded. Pick a routine from the Exercise Library and log your first set!"* | `dashboard.html:1920` |
| **Offline Mode Banner** | *"Operating Offline — Your sets and meals are saved locally and will sync when reconnected."* | `pwa-sync.js:32` |
| **New PR Toast** | *"🔥 Personal Record Broken! New 1RM: {weight} kg on {exercise}."* | `fitfuel.js:3250` |
| **Beta Lock Notification** | *"Experimental Beta Feature: This module requires local hardware acceleration. Apply for early access."* | `beta-manager.js:45` |
| **Turnstile Expiry** | *"Rotating in {seconds}s — Keep screen bright against optical scanner."* | `features.js:220` |

---

## 3. Demo Persona Profile ("Jordan Davis")

When reviewers or testers click **Instant Demo Lifter**, the following verified persona is loaded:

- **Name:** `Jordan Davis`
- **Email:** `jordan@fitfuel.app`
- **Biological Sex:** `Male`
- **Age:** `28 years`
- **Height:** `182 cm` (6'0")
- **Morning Bodyweight:** `78.5 kg` (173.0 lbs)
- **Primary Goal:** `Hypertrophy (Lean Mass Gain)`
- **Activity Level:** `Moderately Active (3–5 workouts/week)`
- **Calculated BMR:** `1,792 kcal/day`
- **Calculated TDEE:** `2,778 kcal/day`
- **Daily Target:** `3,078 kcal/day` (TDEE + 300 surplus)
- **Macro Distribution:** `Protein: 157g` | `Carbs: 423g` | `Fat: 85g`
- **Current PRs:** Bench Press: 110 kg, Squat: 145 kg, Deadlift: 180 kg, Overhead Press: 72.5 kg
- **Active Split:** Push / Pull / Legs (PPL)
