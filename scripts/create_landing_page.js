const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../public/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const landingHtml = `
      <!-- ================= VIEW 0: CINEMATIC DRIBBBLE LANDING SHOWCASE ================= -->
      <section class="view active" id="view-landing" style="padding:0;margin:0;width:100%;max-width:100%;overflow-x:hidden;">
        <!-- LANDING HERO CONTAINER WITH CINEMATIC LIGHT CONE -->
        <div class="landing-cinematic-hero" id="landingHero">
          <!-- 1. VOLUMETRIC BACKLIGHT CONE (EXPANDS ON LOAD, TRACKS CURSOR) -->
          <div class="hero-light-cone" id="heroLightCone" aria-hidden="true">
            <div class="cone-core"></div>
            <div class="cone-radial-flare"></div>
            <div class="cone-ambient-dust"></div>
          </div>

          <!-- 2. LUXURY LANDING TOPBAR -->
          <nav class="landing-nav-bar" id="landingNavBar" aria-label="Landing Navigation">
            <div class="landing-brand-wrap">
              <span class="landing-brand-beacon"></span>
              <span class="landing-brand-text">FITFUEL</span>
              <span class="landing-brand-badge">PRO v8.2</span>
            </div>

            <div class="landing-nav-links">
              <a href="#landingFeatures" class="landing-nav-link skiper-link">Features</a>
              <a href="#landingScience" class="landing-nav-link skiper-link">Biomechanics</a>
              <a href="#landingWorkouts" class="landing-nav-link skiper-link">Library</a>
              <a href="#landingPricing" class="landing-nav-link skiper-link">Memberships</a>
            </div>

            <div class="landing-nav-actions">
              <!-- INSTANT LIGHT / DARK THEME TOGGLE -->
              <button type="button" class="landing-theme-toggle-btn" id="landingThemeToggleBtn" title="Toggle Light / Dark Mode" aria-label="Toggle Theme">
                <svg class="sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                <svg class="moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                <span id="landingThemeLabel">Light Mode</span>
              </button>

              <!-- GET STARTED / ENTER APP CTA -->
              <button type="button" class="landing-launch-app-btn" onclick="switchView('today')">
                <span>Enter Dashboard</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </nav>

          <!-- 3. HERO CONTENT GRID (ASYMMETRICAL DRIBBBLE EDITORIAL LAYOUT) -->
          <div class="landing-hero-grid">
            <!-- LEFT COLUMN: EDITORIAL STATEMENT & TELEMETRY -->
            <div class="hero-left-col">
              <div class="hero-kicker-pill">
                <span class="kicker-dot"></span>
                <span>ELITE BIOMECHANICAL SPORTS SCIENCE</span>
              </div>

              <h1 class="hero-editorial-title">
                SCULPT YOUR <br>
                <span class="hero-title-accent">PEAK FORM</span><br>
                WITH PRECISION.
              </h1>

              <p class="hero-editorial-sub">
                FitFuel converges clinical-grade body composition modeling, real-time MediaPipe joint vision, and precision Indian &amp; global nutritional intelligence into a seamless, high-velocity platform.
              </p>

              <!-- HERO PRIMARY CTAS (VENGEANCEUI TACTILE BUTTONS) -->
              <div class="hero-btn-row">
                <button type="button" class="hero-btn-primary" id="landingHeroGetStarted" onclick="switchView('today')">
                  <span>Get Started Free</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
                <button type="button" class="hero-btn-secondary" onclick="document.getElementById('landingFeatures').scrollIntoView({behavior:'smooth'})">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                  <span>Explore Architecture</span>
                </button>
              </div>

              <!-- LIVE ATHLETIC STATS -->
              <div class="hero-editorial-stats">
                <div class="hero-stat-block">
                  <div class="hero-stat-digit">302+</div>
                  <div class="hero-stat-caption">Human SVG Guides</div>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat-block">
                  <div class="hero-stat-digit">98.4%</div>
                  <div class="hero-stat-caption">Posture AI Precision</div>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat-block">
                  <div class="hero-stat-digit">3.2M+</div>
                  <div class="hero-stat-caption">Macro Database Items</div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: ATHLETE HERO SILHOUETTE WITH DYNAMIC LIGHT CONE -->
            <div class="hero-right-col" id="heroRightAthleteWrap">
              <div class="athlete-display-frame">
                <!-- THE ATHLETE MAN CUTOUT IMAGE -->
                <img src="images/fitfuel-athlete-hero.png" alt="FitFuel Elite Male Athlete Silhouette" class="athlete-hero-cutout" id="athleteHeroImg" loading="eager">

                <!-- FLOATING LIVE METRIC BADGE 1 (VO2 / HEART RATE) -->
                <div class="athlete-floating-chip chip-top-right">
                  <div class="chip-icon-box pulse-card-light">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <div class="chip-content">
                    <span class="chip-label">Cardiovascular Load</span>
                    <span class="chip-val">164 BPM &bull; Zone 4 (Peak)</span>
                  </div>
                </div>

                <!-- FLOATING LIVE METRIC BADGE 2 (POSTURE DEPTH) -->
                <div class="athlete-floating-chip chip-bottom-left">
                  <div class="chip-icon-box pulse-card-light">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
                  </div>
                  <div class="chip-content">
                    <span class="chip-label">Squat Kinematics</span>
                    <span class="chip-val">Optimal Depth (112&deg; Femur Angle)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: 4-PILLAR PERFORMANCE MATRIX (WITH CONTINUOUS AMBIENT LUMINESCENCE) -->
        <div class="landing-section-wrap" id="landingFeatures">
          <div class="landing-section-header">
            <span class="landing-section-kicker">ENGINEERED PERFORMANCE PILLARS</span>
            <h2 class="landing-section-title">Sports Science Meets Machine Intelligence</h2>
            <p class="landing-section-subtitle">
              Every module is designed to eliminate guesswork, enforce progressive overload, and calibrate nutritional fuel with mathematical precision.
            </p>
          </div>

          <div class="landing-feature-grid">
            <!-- PILLAR 1: 4D BODY ANALYSIS (LEAD CARD WITH AMBIENT VOLUMETRIC LIGHT) -->
            <article class="luminous-feature-card card-lead" onclick="switchView('body-analysis')">
              <div class="card-ambient-beam"></div>
              <div class="card-top-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 0-4 4c0 1.66 1 3.1 2.5 3.7V11h3V9.7C15 9.1 16 7.66 16 6a4 4 0 0 0-4-4Z"/><path d="M10 11v3"/><path d="M14 11v3"/><path d="M6 14v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/></svg>
              </div>
              <span class="card-pill">BIOMECHANICAL SCAN</span>
              <h3 class="card-headline">4D Holographic Muscle &amp; Composition Modeling</h3>
              <p class="card-desc">
                Derived from the Ramanujan Elliptical Tape Model and U.S. Navy Hodgdon-Beckett equations. Calculates cross-sectional circumferences, visceral fat tiers, and skeletal muscle mass with zero radiation scanning.
              </p>
              <div class="card-action-link">
                <span>Inspect Analyzer</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </article>

            <!-- PILLAR 2: INDIAN & GLOBAL NUTRITION -->
            <article class="luminous-feature-card" onclick="switchView('food-log')">
              <div class="card-ambient-beam"></div>
              <div class="card-top-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
              </div>
              <span class="card-pill">PRECISION NUTRITION</span>
              <h3 class="card-headline">Indian Food Engine &amp; Barcode Camera Scanner</h3>
              <p class="card-desc">
                Accurate macronutrient profiles for traditional roti, dal varieties, paneer, and regional staples paired with live camera barcode scanning (OpenFoodFacts API).
              </p>
              <div class="card-action-link">
                <span>View Macro Engine</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </article>

            <!-- PILLAR 3: PROGRESSIVE OVERLOAD -->
            <article class="luminous-feature-card" onclick="switchView('starting-load')">
              <div class="card-ambient-beam"></div>
              <div class="card-top-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5v14"/><path d="M18 5v14"/><path d="M2 9h20"/><path d="M2 15h20"/></svg>
              </div>
              <span class="card-pill">AUTOREGULATION</span>
              <h3 class="card-headline">No-1RM Starting Load &amp; RPE Overload Planner</h3>
              <p class="card-desc">
                Calculates safe, potent starting weights from bodyweight standards across 5 core compound lifts. Weekly RPE autoregulation dynamically adjusts volume.
              </p>
              <div class="card-action-link">
                <span>Calculate Starting Load</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </article>

            <!-- PILLAR 4: MEDIAPIPE POSTURE AI -->
            <article class="luminous-feature-card" onclick="switchView('posture')">
              <div class="card-ambient-beam"></div>
              <div class="card-top-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </div>
              <span class="card-pill">COMPUTER VISION</span>
              <h3 class="card-headline">Live Webcam Posture &amp; Joint Angle AI</h3>
              <p class="card-desc">
                33-point real-time skeletal tracking. Detects lumbar rounding on deadlifts, knee valgus, and barbell depth with zero cloud video upload.
              </p>
              <div class="card-action-link">
                <span>Launch Posture Camera</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </article>
          </div>
        </div>

        <!-- SECTION 3: 512x512 HUMAN SVG FORM ENGINE SHOWCASE -->
        <div class="landing-section-wrap" id="landingWorkouts" style="padding-top:20px;">
          <div class="landing-showcase-box">
            <div class="showcase-content-side">
              <span class="landing-section-kicker">302+ EXERCISE ANATOMY SUITE</span>
              <h2 class="showcase-title">512&times;512 Vector Form Guides</h2>
              <p class="showcase-sub">
                No pixelated GIFs or confusing stick diagrams. FitFuel delivers high-definition vector SVG animations cycling through initial setup, midpoint execution, and lockout with muscle recruitment maps.
              </p>
              <div class="showcase-badges-list">
                <div class="showcase-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 4.2-Second CSS Crossfade Engine</div>
                <div class="showcase-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Interactive Keyboard Freeze &amp; Step Mode</div>
                <div class="showcase-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Primary &amp; Synergist Target Highlights</div>
              </div>
              <div style="margin-top:24px;">
                <button type="button" class="hero-btn-primary" onclick="switchView('exercise-library')">
                  <span>Browse All 302 Exercises</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <div class="showcase-visual-side">
              <div class="vector-frame-card">
                <div class="card-ambient-beam"></div>
                <img src="exercise-animations/bench-press/frame-1.svg" alt="Bench Press Vector Demonstration" class="showcase-vector-img" id="showcaseVectorImg">
                <div class="vector-caption-bar">
                  <span class="caption-exercise">Barbell Bench Press</span>
                  <span class="caption-state">Execution Phase &bull; Pectoralis Major</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 4: MEMBERSHIP TIERS & PRICING -->
        <div class="landing-section-wrap" id="landingPricing">
          <div class="landing-section-header">
            <span class="landing-section-kicker">HONEST ACCESS</span>
            <h2 class="landing-section-title">Elevate Your Training Journey</h2>
            <p class="landing-section-subtitle">
              Transparent, athlete-first access. Start free forever or unlock VIP experimental beta capabilities.
            </p>
          </div>

          <div class="pricing-tiers-grid">
            <!-- TIER 1: FREE ATHLETE -->
            <div class="pricing-tier-card">
              <div class="card-ambient-beam"></div>
              <div class="tier-name">Foundation Athlete</div>
              <div class="tier-price">$0 <span>/ forever</span></div>
              <p class="tier-sub">Complete full-stack gym platform for self-directed lifters and tracking.</p>
              <ul class="tier-features-list">
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> 302+ 512px Vector Exercise Library</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Indian &amp; Global Macro Food Log</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> 12-Cup Hydration &amp; Water Balance</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Offline Gym Mode &amp; PWA Sync</li>
              </ul>
              <button type="button" class="tier-cta-btn secondary" onclick="switchView('today')">
                Launch Free Dashboard
              </button>
            </div>

            <!-- TIER 2: PRO ATHLETE (RECOMMENDED WITH HIGHLIGHT SPOTLIGHT) -->
            <div class="pricing-tier-card tier-pro-highlight">
              <div class="card-ambient-beam"></div>
              <div class="tier-popular-pill">ATHLETE PREFERRED</div>
              <div class="tier-name">Pro Performance</div>
              <div class="tier-price">$14 <span>/ month</span></div>
              <p class="tier-sub">Full biomechanical modeling, AI coach synthesis, and camera tracking.</p>
              <ul class="tier-features-list">
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> <strong>Everything in Foundation, plus:</strong></li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> 4D Holographic Body Scan &amp; SMM Tracking</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> MediaPipe Live Camera Posture Guidance</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> 1080&times;1920 Instagram Story PR Generator</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Context-Aware AI Coach &amp; Rest Timers</li>
              </ul>
              <button type="button" class="tier-cta-btn primary" onclick="switchView('today')">
                Claim 14-Day Free Trial
              </button>
            </div>

            <!-- TIER 3: VIP COHORT -->
            <div class="pricing-tier-card">
              <div class="card-ambient-beam"></div>
              <div class="tier-name">Closed Beta VIP</div>
              <div class="tier-price">Invite <span>/ Cohort</span></div>
              <p class="tier-sub">Direct access to experimental labs and engineering feature flags.</p>
              <ul class="tier-features-list">
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> BLE Heart Rate Broadcast &amp; Wearable Sync</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Instacart Meal-Prep Automated Grocery Sync</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Direct Discord Line with Sports Biomechanist</li>
              </ul>
              <button type="button" class="tier-cta-btn secondary" onclick="switchView('features')">
                Apply for Cohort Slot
              </button>
            </div>
          </div>
        </div>

        <!-- SECTION 5: FINAL CTA BANNER -->
        <div class="landing-section-wrap" style="padding-bottom:50px;">
          <div class="final-cta-card">
            <div class="card-ambient-beam"></div>
            <h2 class="final-cta-title">Ready to Experience Elite Biomechanical Training?</h2>
            <p class="final-cta-sub">
              Zero credit card required. Works completely offline on mobile, desktop, and tablet.
            </p>
            <div style="margin-top:20px;">
              <button type="button" class="hero-btn-primary" onclick="switchView('today')" style="padding:14px 36px;font-size:1.05rem;">
                <span>Launch FitFuel Dashboard</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- SECTION 6: EDITORIAL FOOTER -->
        <footer class="landing-footer">
          <div class="footer-inner">
            <div class="footer-brand-side">
              <div class="landing-brand-text">FITFUEL</div>
              <p class="footer-brand-desc">Next-generation athletic training, posture vision &amp; precision macro fuel.</p>
              <div class="footer-status-pill">
                <span class="status-green-dot"></span>
                <span>All Systems Operational &bull; Turso LibSQL Cloud</span>
              </div>
            </div>
            <div class="footer-links-side">
              <div class="footer-col">
                <span class="footer-col-title">Platform</span>
                <a href="#landingFeatures" class="footer-link">Posture Vision</a>
                <a href="#landingFeatures" class="footer-link">4D Body Scan</a>
                <a href="#landingWorkouts" class="footer-link">Exercise Library</a>
                <a href="#landingPricing" class="footer-link">Membership Tiers</a>
              </div>
              <div class="footer-col">
                <span class="footer-col-title">App Access</span>
                <button type="button" class="footer-text-btn" onclick="switchView('today')">Daily Hub</button>
                <button type="button" class="footer-text-btn" onclick="switchView('food-log')">Food Log</button>
                <button type="button" class="footer-text-btn" onclick="switchView('starting-load')">Load Planner</button>
                <button type="button" class="footer-text-btn" onclick="switchView('profile')">Social PR Card</button>
              </div>
            </div>
          </div>
          <div class="footer-bottom-row">
            <span>&copy; 2026 FitFuel Performance Technologies. Built with pure ES2024 &amp; Zero Build Bloat.</span>
            <span>Privacy &bull; Terms &bull; PWA Certified</span>
          </div>
        </footer>
      </section>
`;

// Insert #view-landing right before <section class="view active" id="view-today"> or <section class="view" id="view-today">
if (!html.includes('id="view-landing"')) {
  html = html.replace(
    /(<div class="page-content">\s*)<!-- ================= VIEW 1: TODAY ================= -->\s*<section class="view( active)?" id="view-today">/i,
    `$1${landingHtml}\n      <!-- ================= VIEW 1: TODAY ================= -->\n      <section class="view" id="view-today">`
  );
}

// Add Showcase / Landing button to primary-nav sidebar if not present
if (!html.includes('data-view="landing"')) {
  const showcaseBtn = `      <!-- 0. SHOWCASE / LANDING -->
      <button class="nav-link selected" data-view="landing" data-section="landing" title="Landing Showcase" onclick="switchView('landing')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span>Showcase</span>
        <span class="nav-active-dot"></span>
      </button>\n`;
  html = html.replace('<nav class="primary-nav" aria-label="Main navigation">', `<nav class="primary-nav" aria-label="Main navigation">\n${showcaseBtn}`);
  // Unselect today in primary nav initially
  html = html.replace('<button class="nav-link selected" data-view="today"', '<button class="nav-link" data-view="today"');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully injected #view-landing into index.html!');
