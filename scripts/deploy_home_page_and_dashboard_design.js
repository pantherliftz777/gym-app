const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// ============================================================================
// 1. GENERATE UPDATED INDEX.HTML
// ============================================================================
const indexHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FitFuel &mdash; Athletic Intelligence Platform</title>
  <meta name="description" content="FitFuel is the premier athletic intelligence platform uniting nutrition, strength tracking, computer vision form checking, and gym access.">

  <!-- Anti-flicker Theme Script: Applied Before First Paint -->
  <script>
    (function() {
      const saved = localStorage.getItem('fitfuel_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
    })();
  </script>

  <!-- Typography: Syne (Display) & Outfit (Body) & Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Favicon & PWA Web Manifest -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#060709">

  <!-- FitFuel High-End Stylesheet -->
  <link rel="stylesheet" href="/styles.css?v=9.1.0">
</head>
<body>

  <!-- ================= 1. TOP LUXURY NAVIGATION BAR ================= -->
  <header class="site-header" id="siteHeader">
    <div class="header-inner">
      <a href="/" class="brand-wrap" aria-label="FitFuel Home">
        <div class="brand-symbol">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#CEFF1A"><path d="M4 14L16 4V12L24 10L12 24V16L4 14Z"/></svg>
        </div>
        <span class="brand-text">Fit<span class="brand-accent">Fuel</span></span>
      </a>

      <nav class="site-nav" aria-label="Main Navigation">
        <a href="#heroStage" class="nav-link active">Home</a>
        <a href="#inspireSection" class="nav-link">About</a>
        <a href="#setsApartSection" class="nav-link">Features</a>
        <a href="#coursesSection" class="nav-link">Programs</a>
        <a href="#pricingPreview" class="nav-link">Pricing</a>
      </nav>

      <div class="header-actions">
        <!-- Theme Switcher -->
        <button class="theme-toggle" id="themeToggleBtn" aria-label="Toggle Theme" title="Toggle Light / Dark Mode">
          <span class="theme-icon-sun">☀️</span>
          <span class="theme-icon-moon">🌙</span>
        </button>

        <button class="btn-ghost auth-trigger" id="navContactBtn">
          Contact Us
        </button>

        <button class="btn-primary auth-trigger" id="navGetStartedBtn">
          Get Started
        </button>

        <button class="mobile-nav-toggle" id="mobileNavBtn" aria-label="Open Navigation">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <!-- MOBILE NAVIGATION DRAWER -->
  <div class="mobile-drawer" id="mobileDrawer">
    <div class="drawer-header">
      <span class="brand-text">Fit<span class="brand-accent">Fuel</span></span>
      <button class="drawer-close" id="drawerCloseBtn" aria-label="Close Navigation">&times;</button>
    </div>
    <div class="drawer-links">
      <a href="#heroStage" class="drawer-link">Home</a>
      <a href="#inspireSection" class="drawer-link">About</a>
      <a href="#setsApartSection" class="drawer-link">Features</a>
      <a href="#coursesSection" class="drawer-link">Programs</a>
      <a href="#pricingPreview" class="drawer-link">Pricing</a>
    </div>
    <div class="drawer-actions">
      <button class="btn-primary auth-trigger" style="width:100%;margin-bottom:12px;">Get Started</button>
      <button class="btn-ghost demo-lifter-trigger" style="width:100%;">Instant Demo Lifter</button>
    </div>
  </div>

  <main>
    <!-- ================= 2. HERO SECTION: SCULPT YOUR BODY, ELEVATE YOUR SPIRIT ================= -->
    <section class="fitusion-hero-section light-stage" id="heroStage" data-light="hero">
      <!-- Side Pagination Indicators -->
      <div class="fitusion-side-pager fitusion-pager-prev" aria-hidden="true">
        <span>P</span><span>R</span><span>E</span><span>V</span>
      </div>
      <div class="fitusion-side-pager fitusion-pager-next" aria-hidden="true">
        <span>N</span><span>E</span><span>X</span><span>T</span>
      </div>

      <!-- Volumetric Light Cone Behind Athlete (Dark: White Bloom / Light: Morning Sunbeam) -->
      <div class="fitusion-volumetric-light-cone" id="heroLightCone" aria-hidden="true">
        <div class="light-cone-core"></div>
        <div class="light-cone-halo"></div>
        <div class="light-cone-ambient"></div>
      </div>

      <!-- Main Hero Headline Typography (Solid flat brand colors, Syne 800) -->
      <div class="fitusion-hero-typography">
        <h1 class="fitusion-hero-heading">
          <span class="hero-word-sculpt">Sculpt</span> 
          <span class="hero-word-your-1">Your</span> 
          <span class="hero-word-body">Body,</span>
          <br>
          <span class="hero-word-elevate">Elevate</span> 
          <span class="hero-word-your-2">Your Spirit</span>
        </h1>
      </div>

      <!-- Athlete Stage with Central Cutout & 4 Telemetry Glass Badges -->
      <div class="fitusion-athlete-stage" id="fitusionAthleteStage">
        <!-- Top Left Card: Hours 1.5 -->
        <div class="fitusion-metric-card card-top-left">
          <div class="metric-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Hours</span>
            <span class="metric-value">1.5</span>
          </div>
        </div>

        <!-- Top Right Card: Poses 20 -->
        <div class="fitusion-metric-card card-top-right">
          <div class="metric-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Poses</span>
            <span class="metric-value">20</span>
          </div>
        </div>

        <!-- Central Muscular Athlete Visual Cutout -->
        <div class="fitusion-athlete-wrapper" id="fitusionAthleteWrapper">
          <img src="/images/fitusion_exact/athlete_hero.png" alt="FitFuel Muscular Athlete" class="fitusion-athlete-img" id="heroAthleteImg">
        </div>

        <!-- Bottom Left Card: Kcal 550 -->
        <div class="fitusion-metric-card card-bottom-left">
          <div class="metric-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Kcal</span>
            <span class="metric-value">550</span>
          </div>
        </div>

        <!-- Bottom Right Card: Sets 5 -->
        <div class="fitusion-metric-card card-bottom-right">
          <div class="metric-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Sets</span>
            <span class="metric-value">5</span>
          </div>
        </div>
      </div>

      <!-- Bottom Hero Telemetry & Action Bar -->
      <div class="fitusion-hero-bottom-bar">
        <!-- 12k+ Happy Spirits Social Proof Badge -->
        <div class="fitusion-social-proof">
          <div class="avatar-stack">
            <img src="/images/fitusion_exact/avatars_proof.png" alt="Happy Spirits Athletes">
          </div>
          <div class="social-text">
            <span class="social-count">12k+</span>
            <span class="social-sub">Happy Spirits</span>
          </div>
        </div>

        <!-- Signature "Let's Start >>>" CTA Button -->
        <button class="fitusion-cta-start-btn auth-trigger" id="landingHeroGetStarted">
          <span>Let's Start</span>
          <span class="carets">&gt;&gt;&gt;</span>
        </button>
      </div>

      <!-- Sponsor Brand Strip -->
      <div class="fitusion-sponsors-strip" aria-label="Partner Brands">
        <div class="sponsor-logo">UNDER ARMOUR</div>
        <div class="sponsor-logo">Reebok</div>
        <div class="sponsor-logo">adidas</div>
        <div class="sponsor-logo">PUMA</div>
        <div class="sponsor-logo">THE NORTH FACE</div>
        <div class="sponsor-logo">NIKE</div>
      </div>
    </section>

    <!-- ================= 3. SECTION 2: INSPIRED TO INSPIRE YOUR BEST SELF ================= -->
    <section class="fitusion-inspire-section" id="inspireSection">
      <div class="fitusion-section-header">
        <h2 class="fitusion-section-title">
          Inspired to<br>
          <span class="text-lime-cream">Inspire Your Best Self</span>
        </h2>
        <p class="fitusion-section-subtitle">
          We're Your Partner In Achieving A Healthier, Stronger, And More Confident You.
        </p>
      </div>

      <div class="fitusion-inspire-card">
        <div class="inspire-features-grid">
          <div class="inspire-feature-item">
            <div class="feature-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A7.003 7.003 0 0 1 5.07 11H5a1 1 0 0 1 0-2h.07A7.003 7.003 0 0 1 11 5.07V5a1 1 0 0 1 2 0v.07A7.003 7.003 0 0 1 18.93 11H19a1 1 0 0 1 0 2h-.07A7.003 7.003 0 0 1 13 16.93z"/></svg>
            </div>
            <span>Nutrition Guidance</span>
          </div>
          <div class="inspire-feature-item">
            <div class="feature-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>
            </div>
            <span>Expert Trainers</span>
          </div>
          <div class="inspire-feature-item">
            <div class="feature-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <span>Progress Tracking</span>
          </div>
          <div class="inspire-feature-item">
            <div class="feature-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span>Premium Membership</span>
          </div>
          <div class="inspire-feature-item">
            <div class="feature-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span>Community Support</span>
          </div>
          <div class="inspire-feature-item">
            <div class="feature-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
            <span>Next-Level Fitness Spaces</span>
          </div>
        </div>

        <div class="inspire-athlete-visual">
          <img src="/images/fitusion_exact/athlete_inspire.png" alt="Inspired Athlete Lifting Dumbbell" class="inspire-athlete-img">
        </div>
      </div>

      <div class="fitusion-discover-teaser">
        <span class="discover-label">Discover</span>
      </div>
    </section>

    <!-- ================= 4. SECTION 3: DISCOVER WHAT SETS US APART (4 PILLARS) ================= -->
    <section class="fitusion-sets-apart-section" id="setsApartSection">
      <div class="fitusion-section-header">
        <h2 class="fitusion-section-title">
          Discover<br>
          <span class="text-lime-cream">What Sets Us Apart</span>
        </h2>
        <p class="fitusion-section-subtitle">
          We Deliver A Fitness Experience That's Truly One-Of-A-Kind. Explore How We Help You Achieve Your Goals Faster And Smarter.
        </p>
      </div>

      <div class="fitusion-pillars-carousel">
        <!-- Card 1: Cardio Training -->
        <div class="fitusion-pillar-card">
          <div class="pillar-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <h3 class="pillar-card-title">Cardio Training</h3>
          <p class="pillar-card-desc">Boost endurance and heart health with high-energy cardio sessions designed to keep you moving.</p>
          <button class="pillar-btn-plan auth-trigger" data-plan="Cardio Training">See Plan</button>
        </div>

        <!-- Card 2: Strength Build -->
        <div class="fitusion-pillar-card">
          <div class="pillar-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          </div>
          <h3 class="pillar-card-title">Strength Build</h3>
          <p class="pillar-card-desc">Develop power and resilience through expert-guided strength training tailored to all fitness levels.</p>
          <button class="pillar-btn-plan auth-trigger" data-plan="Strength Build">See Plan</button>
        </div>

        <!-- Card 3: Fat Loss -->
        <div class="fitusion-pillar-card">
          <div class="pillar-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          </div>
          <h3 class="pillar-card-title">Fat Loss</h3>
          <p class="pillar-card-desc">Shed unwanted fat with dynamic workout routines and fat-burning strategies that deliver lasting results.</p>
          <button class="pillar-btn-plan auth-trigger" data-plan="Fat Loss">See Plan</button>
        </div>

        <!-- Card 4: HIIT Workouts -->
        <div class="fitusion-pillar-card">
          <div class="pillar-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </div>
          <h3 class="pillar-card-title">HIIT Workouts</h3>
          <p class="pillar-card-desc">Maximize calorie burn and improve fitness with short, intense high-intensity interval training sessions.</p>
          <button class="pillar-btn-plan auth-trigger" data-plan="HIIT Workouts">See Plan</button>
        </div>
      </div>

      <!-- Carousel Dots Indicator -->
      <div class="fitusion-carousel-dots">
        <span class="dot-pill active"></span>
        <span class="dot-circle"></span>
        <span class="dot-circle"></span>
      </div>
    </section>

    <!-- ================= 5. SECTION 4: TRAIN SMARTER, UNLEASH YOUR POTENTIAL (COURSES GRID) ================= -->
    <section class="fitusion-train-smarter-section" id="coursesSection">
      <div class="fitusion-section-header">
        <h2 class="fitusion-section-title">
          Train Smarter<br>
          <span class="text-lime-cream">Unleash Your Potential</span>
        </h2>
        <p class="fitusion-section-subtitle">
          Unlock Your Full Potential With Our Expertly Designed Courses, Tailored To Help You Maximize Results In Less Time.
        </p>
      </div>

      <div class="fitusion-courses-grid">
        <!-- Course 1 -->
        <div class="fitusion-course-card auth-trigger" data-course="Barbell Basics">
          <div class="course-image-wrap">
            <div class="corner-tab-accent top-right"></div>
            <div class="corner-tab-accent bottom-left"></div>
            <img src="/images/fitusion_exact/course_barbell.jpg" alt="Barbell Basics Squat Training">
          </div>
          <h3 class="course-card-title">Barbell Basics</h3>
        </div>

        <!-- Course 2 -->
        <div class="fitusion-course-card auth-trigger" data-course="Kettlebell Masterclass">
          <div class="course-image-wrap">
            <div class="corner-tab-accent top-right"></div>
            <div class="corner-tab-accent bottom-left"></div>
            <img src="/images/fitusion_exact/course_kettlebell.jpg" alt="Kettlebell Masterclass Chalk Training">
          </div>
          <h3 class="course-card-title">Kettlebell Masterclass</h3>
        </div>

        <!-- Course 3 -->
        <div class="fitusion-course-card auth-trigger" data-course="Cardio Power Boost">
          <div class="course-image-wrap">
            <div class="corner-tab-accent top-right"></div>
            <div class="corner-tab-accent bottom-left"></div>
            <img src="/images/fitusion_exact/course_cardio.jpg" alt="Cardio Power Boost Sprinting">
          </div>
          <h3 class="course-card-title">Cardio Power Boost</h3>
        </div>

        <!-- Course 4 -->
        <div class="fitusion-course-card auth-trigger" data-course="Heavy Compound Power">
          <div class="course-image-wrap">
            <div class="corner-tab-accent top-right"></div>
            <div class="corner-tab-accent bottom-left"></div>
            <img src="/images/fitusion/course-deadlift.jpg" alt="Heavy Compound Power Deadlift">
          </div>
          <h3 class="course-card-title">Heavy Compound Power</h3>
        </div>

        <!-- Course 5 -->
        <div class="fitusion-course-card auth-trigger" data-course="Battle Ropes Conditioning">
          <div class="course-image-wrap">
            <div class="corner-tab-accent top-right"></div>
            <div class="corner-tab-accent bottom-left"></div>
            <img src="/images/fitusion/course-ropes.jpg" alt="Battle Ropes Conditioning">
          </div>
          <h3 class="course-card-title">Battle Ropes Conditioning</h3>
        </div>

        <!-- Course 6 -->
        <div class="fitusion-course-card auth-trigger" data-course="Mobility & Suspension Matrix">
          <div class="course-image-wrap">
            <div class="corner-tab-accent top-right"></div>
            <div class="corner-tab-accent bottom-left"></div>
            <img src="/images/fitusion/course-mobility.jpg" alt="Mobility & Suspension Matrix">
          </div>
          <h3 class="course-card-title">Mobility &amp; Suspension</h3>
        </div>
      </div>
    </section>

    <!-- ================= 6. INTERACTIVE PERFORMANCE SANDBOX ================= -->
    <section class="section-wrap" id="interactiveDemo">
      <div class="section-header">
        <div class="section-eyebrow">LIVE TELEMETRY</div>
        <h2 class="section-title">Test Your Physical Thresholds</h2>
        <p class="section-desc">Real-time biomechanical calculators running on-device with zero lag.</p>
      </div>

      <div class="interactive-grid">
        <!-- 1RM Epley Formula Calculator -->
        <div class="interactive-card spotlight-card">
          <div class="calc-header">
            <div class="calc-title">Epley 1RM Strength Estimator</div>
            <span class="calc-badge">Formula: W &times; (1 + r/30)</span>
          </div>

          <div class="calc-inputs">
            <div class="calc-field">
              <label for="calcWeight">Lifted Weight (kg)</label>
              <input type="number" id="calcWeight" value="140" min="20" max="400" step="2.5">
            </div>
            <div class="calc-field">
              <label for="calcReps">Completed Reps</label>
              <input type="number" id="calcReps" value="8" min="1" max="15" step="1">
            </div>
          </div>

          <div class="calc-result-box">
            <div class="result-label">Predicted 1-Rep Maximum</div>
            <div class="result-number" id="epleyResult">177 kg</div>
          </div>
        </div>

        <!-- Quick Hydration Tracker -->
        <div class="interactive-card spotlight-card">
          <div class="calc-header">
            <div class="calc-title">Rapid Water Intake Tracker</div>
            <span class="calc-badge">Daily Target: 3,500 ml</span>
          </div>

          <div class="water-progress-wrap">
            <div class="water-bar">
              <div class="water-fill" id="waterFill" style="width: 35%;"></div>
            </div>
            <div class="water-readout">
              <span id="waterCurrent">1,250 ml</span>
              <span>/ 3,500 ml</span>
            </div>
          </div>

          <button class="btn-primary" id="btnLogWater" style="width: 100%;">
            <span>+ Log 250ml Water</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ================= 7. MEMBERSHIP PLANS ================= -->
    <section class="section-wrap" id="pricingPreview">
      <div class="section-header">
        <div class="section-eyebrow">MEMBERSHIPS</div>
        <h2 class="section-title">Simple, Transparent Athletic Tiers</h2>
        <p class="section-desc">From weekend lifters to elite competitive bodybuilders and coaches.</p>
      </div>

      <div class="pricing-grid">
        <!-- Tier 1: Free Athlete -->
        <div class="pricing-card">
          <div class="pricing-badge">Free Forever</div>
          <div class="pricing-name">Free Athlete</div>
          <div class="pricing-cost">
            <span class="cost-amount">$0</span>
            <span class="cost-period">/ month</span>
          </div>
          <p class="pricing-summary">Complete offline-first workout logging &amp; verified nutrition tracking.</p>
          <ul class="pricing-features">
            <li><span>✓</span> 120+ exercise animations &amp; guides</li>
            <li><span>✓</span> Barcode &amp; macro database</li>
            <li><span>✓</span> Offline Gym Mode (PWA)</li>
          </ul>
          <button class="pricing-btn pricing-btn-ghost auth-trigger">Get Started</button>
        </div>

        <!-- Tier 2: Pro Lifter (Featured) -->
        <div class="pricing-card pricing-featured">
          <div class="pricing-badge">Most Popular</div>
          <div class="pricing-name">Pro Lifter</div>
          <div class="pricing-cost">
            <span class="cost-amount">$19</span>
            <span class="cost-period">/ month</span>
          </div>
          <p class="pricing-summary">Full AI Vision posture analysis, meal scanning, and smart progression.</p>
          <ul class="pricing-features">
            <li><span>✓</span> Everything in Free Athlete</li>
            <li><span>✓</span> Real-time MediaPipe joint posture alerts</li>
            <li><span>✓</span> AI Meal Photo Scanner</li>
            <li><span>✓</span> Contactless Turnstile QR Code</li>
          </ul>
          <button class="pricing-btn pricing-btn-primary auth-trigger">Start 14-Day Free Trial</button>
        </div>

        <!-- Tier 3: Elite Club -->
        <div class="pricing-card">
          <div class="pricing-badge">All Inclusive</div>
          <div class="pricing-name">Elite Club</div>
          <div class="pricing-cost">
            <span class="cost-amount">$49</span>
            <span class="cost-period">/ month</span>
          </div>
          <p class="pricing-summary">For gym facilities, personal trainers, and high-performance teams.</p>
          <ul class="pricing-features">
            <li><span>✓</span> Everything in Pro Lifter</li>
            <li><span>✓</span> Multi-client coach portal</li>
            <li><span>✓</span> Turnstile hardware API integration</li>
          </ul>
          <button class="pricing-btn pricing-btn-ghost auth-trigger">Contact Sales</button>
        </div>
      </div>
    </section>
  </main>

  <!-- ================= 8. FOOTER ================= -->
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand-col">
        <div class="brand-wrap">
          <div class="brand-symbol">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#CEFF1A"><path d="M4 14L16 4V12L24 10L12 24V16L4 14Z"/></svg>
          </div>
          <span class="brand-text">Fit<span class="brand-accent">Fuel</span></span>
        </div>
        <p class="footer-tagline">
          The athletic intelligence platform for human peak performance.
        </p>
      </div>

      <div class="footer-links-col">
        <div class="footer-col-title">Platform</div>
        <a href="#heroStage">Home</a>
        <a href="#inspireSection">About</a>
        <a href="#setsApartSection">Features</a>
        <a href="#coursesSection">Courses</a>
        <a href="#pricingPreview">Pricing</a>
      </div>

      <div class="footer-links-col">
        <div class="footer-col-title">System Status</div>
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span>Turso Cloud SQLite &bull; Online</span>
        </div>
        <div class="status-indicator" style="margin-top:8px;">
          <span class="status-dot"></span>
          <span>PWA Service Worker &bull; v9.1.0</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 FitFuel Athletic Intelligence Inc. All rights reserved.</span>
    </div>
  </footer>

  <!-- ================= 9. VIP AUTH GATE PORTAL MODAL ================= -->
  <div class="auth-modal-overlay" id="authModalOverlay" aria-hidden="true">
    <div class="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
      <button class="auth-modal-close" id="authCloseBtn" aria-label="Close Modal">&times;</button>

      <div class="auth-modal-header">
        <div class="brand-wrap" style="justify-content: center; margin-bottom: 8px;">
          <div class="brand-symbol">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#CEFF1A"><path d="M4 14L16 4V12L24 10L12 24V16L4 14Z"/></svg>
          </div>
          <span class="brand-text">Fit<span class="brand-accent">Fuel</span></span>
        </div>
        <h3 id="authModalTitle" style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:var(--text);margin:0;">Athletic Intelligence Portal</h3>
        <p style="font-size:0.88rem;color:var(--muted);margin-top:4px;">Sign in or launch instant demo access to your personal dashboard.</p>
      </div>

      <form class="auth-form" id="authForm">
        <div class="auth-input-group">
          <label for="authEmail">Email Address</label>
          <input type="email" id="authEmail" class="auth-input" value="jordan.davis@fitfuel.ai" placeholder="name@domain.com" required>
        </div>

        <div class="auth-input-group">
          <label for="authPassword">Password</label>
          <input type="password" id="authPassword" class="auth-input" value="Password123!" placeholder="••••••••••••" required>
        </div>

        <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">
          <span>⚡ Launch Personal Dashboard</span>
        </button>

        <div class="auth-divider">
          <span>OR 1-CLICK INSTANT DEMO</span>
        </div>

        <button type="button" class="btn-demo-instant demo-lifter-trigger" id="btnInstantDemo">
          🚀 Instant Demo Lifter (Jordan Davis)
        </button>
      </form>
    </div>
  </div>

  <!-- Shared Controller Script -->
  <script src="/app.js?v=9.1.0"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml, 'utf8');
console.log('Successfully created index.html with all Dribbble sections!');

// ============================================================================
// 2. GENERATE COMPLETE STYLES.CSS
// ============================================================================
const stylesCss = `/* ==========================================================================
   FITFUEL HIGH-END EDITORIAL ATHLETIC SYSTEM
   Reference: Dribbble Shot 25337726 (Fitness Website Design)
   - Strict Anti-Slop Guidelines (Syne 800 Solid Headings, Outfit Body, Lucide SVGs)
   - Volumetric White Light Cone Behind Athlete (Dark) & Sunbeam (Light)
   - Responsive (360px to 1920px), 60fps rAF Lerner Motion, Respects Reduced Motion
   - Complete 4 Signature Dribbble Sections + Telemetry + Interactive Sandboxes
   ========================================================================== */

:root {
  /* DARK THEME (Default) */
  --bg: #060709;
  --surface: #0D0F12;
  --surface-card: #14171F;
  --surface-hover: #1A1E27;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --accent: #CEFF1A;
  --accent-glow: rgba(206, 255, 26, 0.35);
  --accent-soft: #E2F885;
  --text: #F5F7FA;
  --text-muted: #8A93A0;
  --muted: #8A93A0;

  --font-display: 'Syne', sans-serif;
  --font-body: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  --cone-x: 0px;
  --cone-y: 0px;
  --tilt-x: 0deg;
  --tilt-y: 0deg;
}

[data-theme="light"] {
  --bg: #F6F5F0;
  --surface: #FFFFFF;
  --surface-card: #EFEFEA;
  --surface-hover: #E7E7E0;
  --border: rgba(10, 20, 15, 0.10);
  --border-strong: rgba(10, 20, 15, 0.20);
  --accent: #0E9F6E;
  --accent-glow: rgba(14, 159, 110, 0.30);
  --accent-soft: #A7F3D0;
  --text: #0B1410;
  --text-muted: #5B665F;
  --muted: #5B665F;
}

/* Base Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
}

body {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.5;
  overflow-x: hidden;
  transition: background-color var(--transition), color var(--transition);
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

/* ================= 1. HEADER & NAVBAR ================= */
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(6, 7, 9, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  transition: background var(--transition), border-color var(--transition);
}

[data-theme="light"] .site-header {
  background: rgba(246, 245, 240, 0.88);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.brand-symbol {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(206, 255, 26, 0.12);
}

.brand-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text);
}

.brand-accent {
  color: var(--accent);
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.site-nav .nav-link {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--transition);
}

.site-nav .nav-link:hover,
.site-nav .nav-link.active {
  color: var(--text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: transform 0.2s ease, border-color var(--transition);
}

.theme-toggle:hover {
  transform: scale(1.05);
  border-color: var(--accent);
}

[data-theme="dark"] .theme-icon-moon { display: none; }
[data-theme="light"] .theme-icon-sun { display: none; }

.btn-primary {
  padding: 0.65rem 1.4rem;
  border-radius: 9999px;
  background: var(--accent);
  color: #060709;
  font-weight: 700;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

[data-theme="light"] .btn-primary {
  color: #FFFFFF;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--accent-glow);
}

.btn-ghost {
  padding: 0.65rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  color: var(--text);
  font-weight: 600;
  font-size: 0.92rem;
  transition: border-color var(--transition), background var(--transition);
}

.btn-ghost:hover {
  border-color: var(--border-strong);
  background: var(--surface);
}

.mobile-nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 28px;
  height: 24px;
}

.mobile-nav-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
}

/* Mobile Drawer */
.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 300px;
  height: 100%;
  background: var(--surface);
  border-left: 1px solid var(--border);
  z-index: 2000;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  transition: right 0.35s var(--ease);
}

.mobile-drawer.open {
  right: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.drawer-close {
  font-size: 2rem;
  color: var(--text-muted);
}

.drawer-links {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: auto;
}

.drawer-link {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text);
}

/* ================= 2. HERO SECTION ================= */
.fitusion-hero-section {
  position: relative;
  min-height: calc(100vh - 76px);
  padding: 3rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
}

/* Side Pagination Labels */
.fitusion-side-pager {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: var(--text-muted);
  opacity: 0.45;
  user-select: none;
  z-index: 10;
}

.fitusion-pager-prev { left: 3rem; }
.fitusion-pager-next { right: 3rem; }

/* Volumetric Light Cone Behind Athlete */
.fitusion-volumetric-light-cone {
  position: absolute;
  top: -10%;
  left: 50%;
  width: 900px;
  height: 900px;
  transform: translate(-50%, 0) translate(var(--cone-x), var(--cone-y)) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  pointer-events: none;
  z-index: 1;
  transition: opacity 1.2s ease-out;
  transform-style: preserve-3d;
}

.light-cone-core {
  position: absolute;
  top: 0;
  left: 50%;
  width: 550px;
  height: 800px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at top center, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 80%);
  clip-path: polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%);
  filter: blur(30px);
}

[data-theme="light"] .light-cone-core {
  background: radial-gradient(ellipse at top center, rgba(253, 230, 138, 0.5) 0%, rgba(14, 159, 110, 0.12) 50%, transparent 80%);
}

.light-cone-halo {
  position: absolute;
  top: 15%;
  left: 50%;
  width: 700px;
  height: 700px;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  filter: blur(50px);
}

/* Hero Typography */
.fitusion-hero-typography {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-top: 1rem;
}

.fitusion-hero-heading {
  font-family: var(--font-display);
  font-size: clamp(3.2rem, 7.5vw, 6.8rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: var(--text);
  text-transform: capitalize;
}

.hero-word-elevate,
.hero-word-sculpt {
  color: var(--text);
}

.hero-word-your-1,
.hero-word-your-2,
.hero-word-body {
  color: var(--accent-soft);
}

[data-theme="light"] .hero-word-your-1,
[data-theme="light"] .hero-word-your-2,
[data-theme="light"] .hero-word-body {
  color: #0B3D2E;
}

/* Athlete Stage & Floating Metric Badges */
.fitusion-athlete-stage {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 520px;
  margin: 1.5rem auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.fitusion-athlete-wrapper {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 580px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 3;
}

.fitusion-athlete-img {
  max-height: 520px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.7));
  user-select: none;
  pointer-events: none;
}

/* 4 Floating Badges */
.fitusion-metric-card {
  position: absolute;
  z-index: 4;
  background: rgba(20, 23, 31, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 1.1rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 110px;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

[data-theme="light"] .fitusion-metric-card {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.fitusion-metric-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
}

.card-top-left { top: 12%; left: 16%; }
.card-top-right { top: 18%; right: 16%; }
.card-bottom-left { bottom: 15%; left: 18%; }
.card-bottom-right { bottom: 12%; right: 18%; }

.metric-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(206, 255, 26, 0.15);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-theme="light"] .metric-icon-wrap {
  background: rgba(14, 159, 110, 0.15);
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.metric-value {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1.1;
}

/* Bottom Hero Telemetry Bar */
.fitusion-hero-bottom-bar {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}

.fitusion-social-proof {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-stack img {
  height: 36px;
  width: auto;
  border-radius: 9999px;
}

.social-text {
  display: flex;
  flex-direction: column;
}

.social-count {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}

.social-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.fitusion-cta-start-btn {
  padding: 0.9rem 2.2rem;
  border-radius: 9999px;
  background: var(--accent);
  color: #060709;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  letter-spacing: -0.01em;
  box-shadow: 0 8px 30px var(--accent-glow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

[data-theme="light"] .fitusion-cta-start-btn {
  color: #FFFFFF;
}

.fitusion-cta-start-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 35px var(--accent-glow);
}

.fitusion-cta-start-btn .carets {
  letter-spacing: -0.1em;
  font-size: 1.15rem;
}

/* Sponsor Marquee */
.fitusion-sponsors-strip {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2.5rem 0 1rem;
  opacity: 0.65;
  border-top: 1px solid var(--border);
  margin-top: 2rem;
}

.sponsor-logo {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text);
  transition: opacity 0.2s ease;
}

.sponsor-logo:hover {
  opacity: 1;
  color: var(--accent);
}

/* ================= 3. SECTION 2: INSPIRED TO INSPIRE ================= */
.fitusion-inspire-section {
  max-width: 1200px;
  margin: 6rem auto;
  padding: 0 2rem;
}

.fitusion-section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.fitusion-section-title {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 4.8vw, 4.2rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text);
}

.text-lime-cream {
  color: var(--accent-soft);
}

[data-theme="light"] .text-lime-cream {
  color: #0B3D2E;
}

.fitusion-section-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  max-width: 650px;
  margin: 1rem auto 0;
}

.fitusion-inspire-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 32px;
  padding: 3.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.inspire-features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8rem 2rem;
}

.inspire-feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  font-size: 1.02rem;
  color: var(--text);
}

.feature-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.inspire-athlete-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.inspire-athlete-img {
  width: 100%;
  max-width: 440px;
  height: auto;
  border-radius: 24px;
  filter: contrast(1.1);
}

.fitusion-discover-teaser {
  text-align: center;
  margin-top: 3.5rem;
}

.discover-label {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
}

/* ================= 4. SECTION 3: DISCOVER WHAT SETS US APART ================= */
.fitusion-sets-apart-section {
  max-width: 1300px;
  margin: 6rem auto;
  padding: 0 2rem;
}

.fitusion-pillars-carousel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.fitusion-pillar-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 26px;
  padding: 2.2rem 1.8rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.fitusion-pillar-card:hover {
  transform: translateY(-6px);
  border-color: var(--accent);
}

.pillar-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(206, 255, 26, 0.12);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

[data-theme="light"] .pillar-icon-box {
  background: rgba(14, 159, 110, 0.12);
}

.pillar-card-title {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.8rem;
}

.pillar-card-desc {
  font-size: 0.92rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin-bottom: 2rem;
  flex-grow: 1;
}

.pillar-btn-plan {
  padding: 0.65rem 1.4rem;
  border-radius: 9999px;
  background: var(--accent);
  color: #060709;
  font-weight: 700;
  font-size: 0.88rem;
  align-self: flex-start;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

[data-theme="light"] .pillar-btn-plan {
  color: #FFFFFF;
}

.pillar-btn-plan:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px var(--accent-glow);
}

.fitusion-carousel-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 2.5rem;
}

.dot-pill {
  width: 28px;
  height: 8px;
  border-radius: 9999px;
  background: var(--accent);
}

.dot-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-strong);
}

/* ================= 5. SECTION 4: TRAIN SMARTER COURSES ================= */
.fitusion-train-smarter-section {
  max-width: 1300px;
  margin: 6rem auto;
  padding: 0 2rem;
}

.fitusion-courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}

.fitusion-course-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.fitusion-course-card:hover {
  transform: translateY(-6px);
}

.course-image-wrap {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 1.2rem;
}

.course-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) contrast(1.15);
  transition: transform 0.4s ease, filter 0.4s ease;
}

.fitusion-course-card:hover .course-image-wrap img {
  transform: scale(1.05);
  filter: grayscale(40%) contrast(1.1);
}

/* Corner Notches */
.corner-tab-accent {
  position: absolute;
  width: 22px;
  height: 22px;
  border: 3px solid var(--accent);
  z-index: 2;
  pointer-events: none;
}

.corner-tab-accent.top-right {
  top: 12px;
  right: 12px;
  border-left: none;
  border-bottom: none;
}

.corner-tab-accent.bottom-left {
  bottom: 12px;
  left: 12px;
  border-right: none;
  border-top: none;
}

.course-card-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent-soft);
  letter-spacing: -0.01em;
}

[data-theme="light"] .course-card-title {
  color: #0B3D2E;
}

/* ================= 6. INTERACTIVE TELEMETRY & SANDBOX ================= */
.section-wrap {
  max-width: 1300px;
  margin: 6rem auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-eyebrow {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text);
}

.section-desc {
  font-size: 1rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0.8rem auto 0;
}

.interactive-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.interactive-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 2.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.calc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calc-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
}

.calc-badge {
  font-size: 0.78rem;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  background: var(--surface-hover);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.calc-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.calc-field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.calc-field input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 600;
}

.calc-field input:focus {
  outline: none;
  border-color: var(--accent);
}

.calc-result-box {
  padding: 1.2rem;
  border-radius: 16px;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-muted);
}

.result-number {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--accent);
}

.water-progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.water-bar {
  width: 100%;
  height: 16px;
  border-radius: 9999px;
  background: var(--bg);
  overflow: hidden;
  border: 1px solid var(--border);
}

.water-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 9999px;
  transition: width 0.4s var(--ease);
}

.water-readout {
  display: flex;
  justify-content: space-between;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text);
}

/* ================= 7. PRICING CARDS ================= */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.pricing-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 26px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-6px);
}

.pricing-featured {
  border-color: var(--accent);
  box-shadow: 0 12px 40px var(--accent-glow);
}

.pricing-badge {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  background: var(--surface-hover);
  color: var(--accent);
  border: 1px solid var(--border);
  align-self: flex-start;
  margin-bottom: 1.2rem;
}

.pricing-featured .pricing-badge {
  background: var(--accent);
  color: #060709;
}

[data-theme="light"] .pricing-featured .pricing-badge {
  color: #FFFFFF;
}

.pricing-name {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.pricing-cost {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

.cost-amount {
  font-family: var(--font-display);
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--text);
}

.cost-period {
  font-size: 0.92rem;
  color: var(--text-muted);
}

.pricing-summary {
  font-size: 0.92rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 2rem;
}

.pricing-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 2.5rem;
  flex-grow: 1;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.92rem;
  color: var(--text);
}

.pricing-features li span {
  color: var(--accent);
  font-weight: 800;
}

.pricing-btn {
  width: 100%;
  padding: 0.85rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pricing-btn-primary {
  background: var(--accent);
  color: #060709;
}

[data-theme="light"] .pricing-btn-primary {
  color: #FFFFFF;
}

.pricing-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--accent-glow);
}

.pricing-btn-ghost {
  border: 1px solid var(--border);
  color: var(--text);
}

.pricing-btn-ghost:hover {
  border-color: var(--accent);
  background: var(--surface-hover);
}

/* ================= 8. FOOTER ================= */
.site-footer {
  border-top: 1px solid var(--border);
  padding: 4rem 2rem 2rem;
  background: var(--surface);
}

.footer-inner {
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-tagline {
  font-size: 0.95rem;
  color: var(--text-muted);
  max-width: 380px;
  margin-top: 1rem;
}

.footer-col-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1.2rem;
}

.footer-links-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links-col a {
  font-size: 0.92rem;
  color: var(--text-muted);
  transition: color var(--transition);
}

.footer-links-col a:hover {
  color: var(--accent);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 10px #10B981;
}

.footer-bottom {
  max-width: 1300px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* ================= 9. VIP AUTH MODAL ================= */
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  padding: 1rem;
}

.auth-modal-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.auth-modal-card {
  width: 100%;
  max-width: 440px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 2.5rem;
  position: relative;
  transform: translateY(20px);
  transition: transform 0.3s var(--ease);
}

.auth-modal-overlay.open .auth-modal-card {
  transform: translateY(0);
}

.auth-modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 1.6rem;
  color: var(--text-muted);
  cursor: pointer;
}

.auth-modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.auth-input-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.auth-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: inherit;
  font-size: 0.95rem;
}

.auth-input:focus {
  outline: none;
  border-color: var(--accent);
}

.auth-divider {
  text-align: center;
  position: relative;
  margin: 0.6rem 0;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border);
}

.auth-divider span {
  position: relative;
  background: var(--surface);
  padding: 0 0.8rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.btn-demo-instant {
  width: 100%;
  padding: 0.85rem;
  border-radius: 9999px;
  border: 1px solid var(--accent);
  background: rgba(206, 255, 26, 0.08);
  color: var(--accent);
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s ease, background 0.2s ease;
}

[data-theme="light"] .btn-demo-instant {
  color: var(--accent);
  background: rgba(14, 159, 110, 0.08);
}

.btn-demo-instant:hover {
  transform: translateY(-2px);
  background: var(--accent);
  color: #060709;
}

[data-theme="light"] .btn-demo-instant:hover {
  color: #FFFFFF;
}

/* ================= 10. RESPONSIVE BREAKPOINTS ================= */
@media (max-width: 1100px) {
  .fitusion-pillars-carousel { grid-template-columns: repeat(2, 1fr); }
  .fitusion-courses-grid { grid-template-columns: repeat(2, 1fr); }
  .pricing-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
}

@media (max-width: 900px) {
  .site-nav { display: none; }
  .mobile-nav-toggle { display: flex; }
  .fitusion-inspire-card { grid-template-columns: 1fr; padding: 2rem; }
  .interactive-grid { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; gap: 2rem; }
  .fitusion-side-pager { display: none; }
  .card-top-left { top: 8%; left: 5%; }
  .card-top-right { top: 12%; right: 5%; }
  .card-bottom-left { bottom: 8%; left: 5%; }
  .card-bottom-right { bottom: 5%; right: 5%; }
}

@media (max-width: 600px) {
  .header-inner { padding: 1rem 1.25rem; }
  .fitusion-hero-section { padding: 2rem 1rem 1rem; }
  .fitusion-athlete-stage { height: 420px; }
  .fitusion-athlete-img { max-height: 420px; }
  .fitusion-metric-card { padding: 0.75rem 1rem; min-width: 90px; }
  .metric-value { font-size: 1.3rem; }
  .fitusion-hero-bottom-bar { flex-direction: column; gap: 1.5rem; text-align: center; }
  .fitusion-sponsors-strip { flex-wrap: wrap; gap: 1rem; justify-content: center; }
  .fitusion-pillars-carousel { grid-template-columns: 1fr; }
  .fitusion-courses-grid { grid-template-columns: 1fr; }
  .inspire-features-grid { grid-template-columns: 1fr; }
}

/* ================= 11. DASHBOARD VIEW ISOLATION FIX ================= */
.fitusion-logo-icon,
svg.fitusion-logo-icon {
  width: 28px !important;
  height: 28px !important;
  max-width: 28px !important;
  max-height: 28px !important;
  flex: none !important;
}

.page-content > .view {
  display: none !important;
}

.page-content > .view.active {
  display: block !important;
}

#view-landing:not(.active) {
  display: none !important;
}
#view-landing.active {
  display: block !important;
}
`;

fs.writeFileSync(path.join(publicDir, 'styles.css'), stylesCss, 'utf8');
console.log('Successfully written styles.css!');

// ============================================================================
// 3. GENERATE APP.JS (INTERACTIVE SCRIPT & LERP LIGHT CONE)
// ============================================================================
const appJs = `/**
 * FitFuel Frontend Controller v9.1.0
 * Handles Volumetric Light Cone physics, theme toggles, modal lifecycle, and demo login.
 */
(function() {
  'use strict';

  // 1. THEME CONTROLLER
  function initTheme() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('fitfuel_theme', next);
    });
  }

  // 2. VOLUMETRIC LIGHT CONE CURSOR TRACKING
  function initHeroLightCone() {
    const hero = document.getElementById('heroStage');
    const cone = document.getElementById('heroLightCone');
    if (!hero || !cone) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    function renderLoop() {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      hero.style.setProperty('--cone-x', currentX.toFixed(2) + 'px');
      hero.style.setProperty('--cone-y', currentY.toFixed(2) + 'px');
      hero.style.setProperty('--tilt-x', (currentY * -0.06).toFixed(2) + 'deg');
      hero.style.setProperty('--tilt-y', (currentX * 0.06).toFixed(2) + 'deg');

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(renderLoop);
      } else {
        rafId = null;
      }
    }

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height * 0.45;

      targetX = Math.max(-180, Math.min(180, (e.clientX - midX) * 0.4));
      targetY = Math.max(-120, Math.min(120, (e.clientY - midY) * 0.3));

      if (!rafId) rafId = requestAnimationFrame(renderLoop);
    });
  }

  // 3. VIP AUTH GATE MODAL & DEMO LIFTER
  function initAuthModal() {
    const overlay = document.getElementById('authModalOverlay');
    const closeBtn = document.getElementById('authCloseBtn');
    const triggers = document.querySelectorAll('.auth-trigger');
    const demoBtns = document.querySelectorAll('.demo-lifter-trigger, .btn-demo-instant');
    const authForm = document.getElementById('authForm');

    if (!overlay) return;

    function openModal() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    triggers.forEach(b => b.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    }));

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    // 1-Click Instant Demo Lifter
    demoBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('fitfuel_auth', 'true');
        localStorage.setItem('fitfuel_demo_user', 'Jordan Davis');
        closeModal();
        window.location.href = '/dashboard.html';
      });
    });

    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('fitfuel_auth', 'true');
        localStorage.setItem('fitfuel_demo_user', 'Jordan Davis');
        closeModal();
        window.location.href = '/dashboard.html';
      });
    }
  }

  // 4. MOBILE DRAWER
  function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobileNavBtn');
    const drawer = document.getElementById('mobileDrawer');
    const closeBtn = document.getElementById('drawerCloseBtn');
    const links = document.querySelectorAll('.drawer-link');

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => drawer.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
    links.forEach(l => l.addEventListener('click', () => drawer.classList.remove('open')));
  }

  // 5. 1RM EPLEY CALCULATOR
  function initCalculator() {
    const w = document.getElementById('calcWeight');
    const r = document.getElementById('calcReps');
    const res = document.getElementById('epleyResult');
    if (!w || !r || !res) return;

    function calc() {
      const weight = parseFloat(w.value) || 0;
      const reps = parseInt(r.value, 10) || 1;
      const oneRm = reps === 1 ? weight : Math.round(weight * (1 + reps / 30));
      res.textContent = oneRm + ' kg';
    }

    w.addEventListener('input', calc);
    r.addEventListener('input', calc);
    calc();
  }

  // 6. HYDRATION TRACKER
  function initHydration() {
    const btn = document.getElementById('btnLogWater');
    const fill = document.getElementById('waterFill');
    const cur = document.getElementById('waterCurrent');
    if (!btn || !fill || !cur) return;

    let total = 1250;
    const goal = 3500;

    btn.addEventListener('click', () => {
      total = Math.min(goal, total + 500);
      const pct = Math.round((total / goal) * 100);
      fill.style.width = pct + '%';
      cur.textContent = total.toLocaleString() + ' ml';
    });
  }

  // INIT EVERYTHING ON DOM READY
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHeroLightCone();
    initAuthModal();
    initMobileDrawer();
    initCalculator();
    initHydration();
  });
})();
`;

fs.writeFileSync(path.join(publicDir, 'app.js'), appJs, 'utf8');
console.log('Successfully written app.js!');
`;

fs.writeFileSync(path.join(__dirname, '..', 'scripts', 'deploy_home_page_and_dashboard_design.js'), deployScript, 'utf8');
console.log('Created deploy script.');
