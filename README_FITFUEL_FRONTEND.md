# FitFuel — Athletic Intelligence, Precision Nutrition & Member Dashboard

> **Platform:** FitFuel — Athletic Intelligence  
> **Tagline:** "Sculpt Your Body, Elevate Your Spirit."  
> **Stack:** React 18 + Vite + TypeScript + Tailwind CSS (CSS Variables) + Framer Motion + Lucide Icons + Recharts  
> **Typography:** Display: Syne (700, 800) • Body/UI: Outfit (300–700) • Tabular/Stats: Plus Jakarta Sans  
> **PWA:** Standalone manifest (`#060709`), service worker caching stub, offline banner, and offline write queue.

---

## 1. Quick Start & Execution

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server (hot-reloading on http://localhost:5173)
npm run dev

# 3. Compile TypeScript & build production bundle
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 2. Architecture & Folder Structure

```
├── components/
│   ├── ui/                         # Design system component library
│   │   ├── Button.tsx              # Primary, Ghost, Icon, Demo-Lifter pulse outline
│   │   ├── Cards.tsx               # Card, GlassCard, AngledCard (24px chamfered clip-path)
│   │   ├── Feedback.tsx            # SVG MacroRing, HydrationWave, Toast, StatusPill, Skeleton
│   │   ├── Inputs.tsx              # Input, Slider, SegmentedPills, RPESelector (1-10), ChipFilter
│   │   ├── AuthModal.tsx           # VIP Auth with 1-Click "Instant Demo Lifter" bypass
│   │   ├── BetaGateModal.tsx       # Gating modal for computer vision & body analysis
│   │   └── QRPassModal.tsx         # 30-second rolling optical turnstile pass modal
│   │
│   ├── landing/                    # Editorial brand showcase & marketing page
│   │   ├── Navbar.tsx              # Sticky blurred nav, logo glyph, theme switch, drawer
│   │   ├── HeroSection.tsx         # Volumetric light cone lerp physics, 5 stat badges
│   │   ├── PartnerMarquee.tsx      # Infinite 28s apparel wordmark marquee with pause on hover
│   │   ├── InspireSection.tsx      # Dual athlete visual + 6-item performance checklist
│   │   ├── FeaturesSection.tsx     # 4 interactive discipline tabs with 3D mouse tilt
│   │   ├── BentoShowcase.tsx       # 6 live preview tiles (Macro rings, RPE, Pose, etc.)
│   │   ├── CoursesSection.tsx      # 3 AngledCards with hover corner pips
│   │   ├── PricingSection.tsx      # 4 tiers (Core Free, Pro Lifter, Coach, Facility)
│   │   ├── TestimonialsSection.tsx # Fictional athlete carousel ("12k+ happy spirits")
│   │   └── Footer.tsx              # CTA band, links, newsletter, WCAG AA legal statement
│   │
│   └── dashboard/
│       └── DashboardShell.tsx      # Collapsible desktop sidebar, mobile bottom tab bar, sync dot
│
├── views/                          # 17 Hash-routed SPA views
│   ├── TodayView.tsx               # Command Center: 4 dynamic rings (lime->amber->coral), hydration
│   ├── FoodLogView.tsx             # 5 meal slots, barcode scan modal, live auto-suggest
│   ├── ExerciseLibraryView.tsx     # 120+ exercises, muscle chips, equipment selector, cues
│   ├── WorkoutTrackerView.tsx      # Set logger, auto rest timer (60/90/120/180s), PR confetti
│   ├── StartingLoadView.tsx        # 1RM-free starting ceiling based on bodyweight ratios
│   ├── AICoachView.tsx             # Context-injected assistant, streaming response, chips
│   ├── FacilityView.tsx            # 30s rotating QR code, class reservation, live crowd meter
│   ├── ProfileView.tsx             # Biometrics form, overrides, JSON export, danger erase
│   ├── PostureView.tsx             # BETA: On-device MediaPipe pose skeleton, knee/hip gauges
│   ├── BodyAnalysisView.tsx        # BETA: Navy body-fat formula, Ramanujan perimeter, WHR/WHtR
│   ├── CardioLogView.tsx           # Heart rate zones (Zone 1 to 5), pace, distance, kcal
│   ├── WearablesView.tsx           # PARTIAL: Apple Health, Whoop, Garmin, Oura waitlist
│   ├── MealPrepView.tsx            # PARTIAL: Batch cooking protocol & automated grocery list
│   ├── MyFoodsView.tsx             # Custom food & recipe macro builder
│   ├── ChallengesView.tsx          # November Overload Gauntlet (20 workouts), podium, badges
│   ├── AppearanceView.tsx          # Dual-theme toggle & 4 chromatic accent swatches
│   └── AdminConsoleView.tsx        # Security locked sub-system (Demo PIN: 777)
│
├── lib/
│   ├── algo.ts                     # Mifflin-St Jeor, TDEE, Epley 1RM, U.S. Navy BF, Ramanujan
│   ├── api.ts                      # REST contract mock, Jordan Davis seed, 500ms auto-save, offline queue
│   ├── exerciseData.ts             # 120+ structured exercises with anatomical cues & tips
│   └── foodData.ts                 # Nutritional database with barcodes and macro distributions
│
├── styles/
│   └── tokens.css                  # CSS Variables for Dark & Light themes, chamfer shapes, glow
├── App.tsx                         # Master router, state synchronizer & global modals
├── main.tsx                        # React 18 hydration & PWA service worker bootstrap
└── index.html                      # Semantic HTML5 entry, Google Fonts preconnect, hero preload
```

---

## 3. Design Tokens & Dual-Theme Guide

FitFuel features two meticulously crafted themes built with CSS custom properties on `:root` and `[data-theme="light"]`:

### Dark Theme (Signature High-Energy Obsidian)
- `--bg`: `#060709` (Pitch Obsidian)
- `--surface`: `#0D0F12`
- `--surface-card`: `#14171F`
- `--surface-hover`: `#1A1E27`
- `--accent`: `#CEFF1A` (Electric Neon Lime)
- `--accent-glow`: `rgba(206, 255, 26, 0.35)`
- `--cone-glow`: Volumetric white-to-lime bloom tracking mouse coordinates via a 60 FPS `requestAnimationFrame` lerp loop ($\alpha = 0.08$).

### Light Theme (Warm Porcelain Editorial Sibling — NOT an Inversion)
- `--bg`: `#F6F5F0` (Porcelain Slate)
- `--surface`: `#FFFFFF`
- `--surface-card`: `#EFEFEA`
- `--surface-hover`: `#E7E7E0`
- `--accent`: `#0E9F6E` (Deep High-Performance Emerald)
- `--accent-glow`: `rgba(14, 159, 110, 0.28)`
- `--cone-glow`: Warm morning sunbeam (`rgba(255, 235, 180, 0.45)`) radial gradient.

### Chromatic Accent Swatches (Configurable in Appearance Studio)
- **Neon Lime:** `#CEFF1A`
- **Porcelain Emerald:** `#10B981`
- **Cyber Cyan:** `#06B6D4`
- **Crimson Surge:** `#F43F5E`

---

## 4. Scientific Algorithms (`lib/algo.ts`)

All formulas are implemented with zero third-party math dependencies:

1. **Mifflin-St Jeor BMR Equation:**
   $$\text{BMR}_{\text{male}} = 10 \cdot w + 6.25 \cdot h - 5 \cdot a + 5$$
   $$\text{BMR}_{\text{female}} = 10 \cdot w + 6.25 \cdot h - 5 \cdot a - 161$$
   Multiplied by TDEE activity factor ($1.20$ to $1.90$).

2. **Epley Estimated 1-Rep Max (e1RM):**
   $$\text{e1RM} = w \cdot \left(1 + \frac{\text{reps}}{30}\right)$$
   Triggers automatic Personal Record (PR) detection, lime banner, and `canvas-confetti` celebrations.

3. **U.S. Navy Hodgdon-Beckett Body Fat Equation:**
   $$\%BF_{\text{men}} = 86.010 \cdot \log_{10}(\text{waist} - \text{neck}) - 70.041 \cdot \log_{10}(\text{height}) + 36.76$$
   $$\%BF_{\text{women}} = 163.205 \cdot \log_{10}(\text{waist} + \text{hips} - \text{neck}) - 97.684 \cdot \log_{10}(\text{height}) - 78.387$$

4. **Ramanujan's Second Elliptical Perimeter Approximation:**
   Approximates human cross-sectional torso perimeters within $0.004\%$ error using semi-major axis $a$ (transverse width) and semi-minor axis $b$ (sagittal depth):
   $$h = \frac{(a - b)^2}{(a + b)^2}, \quad C \approx \pi (a + b) \left( 1 + \frac{3h}{10 + \sqrt{4 - 3h}} \right)$$

---

## 5. Automated Verification & Multi-Viewport Audit

A headless Chromium test suite (`tests/verify_frontends.mjs`) verified visual and functional integrity:

- **Mobile (`390x844`):** `scrollWidth == innerWidth` (0px horizontal overflow). Mobile bottom tab bar and navigation drawer verified.
- **Tablet (`768x1024`):** `scrollWidth == innerWidth` (0px horizontal overflow). Responsive grid columns verified.
- **Desktop (`1440x900`):** `scrollWidth == innerWidth` (0px horizontal overflow). Sticky navbar & volumetric cone verified.
- **Instant Demo Lifter:** 1-click bypass loads Jordan Davis seed data and routes to Command Center.
- **Auto-Save & Offline:** State writes to `localStorage`, emits debounced 500ms sync dot updates, and queues offline actions to `ff_offline_queue_v1`.
