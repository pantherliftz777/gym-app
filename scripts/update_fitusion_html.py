import os

with open('gym-app/public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace font links in head to include Outfit and Syne
old_font = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
new_font = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">'

if old_font in html:
    html = html.replace(old_font, new_font)
elif 'family=Syne' not in html:
    head_pos = html.find('</head>')
    html = html[:head_pos] + '  ' + new_font + '\n' + html[head_pos:]

# Locate current landing section
start_pos = html.find('<section class="view active" id="view-landing"')
if start_pos == -1:
    start_pos = html.find('id="view-landing"')
    if start_pos != -1:
        start_pos = html.rfind('<section', 0, start_pos)

end_marker = '<!-- ================= VIEW 1: TODAY ================= -->'
end_pos = html.find(end_marker)

print(f'start_pos: {start_pos}, end_pos: {end_pos}')

landing_html = '''<!-- ================= VIEW: FITUSION DRIBBLLE CINEMATIC LANDING SHOWCASE ================= -->
      <section class="view active fitusion-landing-container" id="view-landing" style="padding:0;margin:0;width:100%;max-width:100%;overflow-x:hidden;">

        <!-- 1. TOP LUXURY NAVIGATION BAR -->
        <header class="fitusion-nav-header" id="fitusionNavHeader">
          <div class="fitusion-nav-brand">
            <svg class="fitusion-logo-icon" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 14L16 4V12L24 10L12 24V16L4 14Z" fill="#CEFF1A" />
            </svg>
            <span class="fitusion-brand-text">Fi<span class="fitusion-brand-accent">Tusion</span></span>
          </div>

          <nav class="fitusion-nav-links" aria-label="Main Navigation">
            <a href="#fitusionHero" class="fitusion-nav-link active">Home</a>
            <a href="#fitusionInspire" class="fitusion-nav-link">About</a>
            <a href="#fitusionSetsApart" class="fitusion-nav-link">Features</a>
            <a href="#fitusionTrainSmarter" class="fitusion-nav-link">Service</a>
            <a href="#fitusionTrainSmarter" class="fitusion-nav-link">Exercise</a>
          </nav>

          <div class="fitusion-nav-actions">
            <!-- Theme Switcher -->
            <button class="fitusion-theme-toggle" id="landingThemeToggleBtn" aria-label="Toggle Theme" title="Toggle Light / Dark Mode">
              <span class="theme-icon-sun">☀️</span>
              <span class="theme-icon-moon">🌙</span>
              <span class="theme-label" id="landingThemeLabel">Dark Mode</span>
            </button>

            <button class="fitusion-btn-pill fitusion-btn-contact fitusion-auth-trigger" id="fitusionContactBtn">
              Contact Us
            </button>

            <button class="fitusion-btn-pill fitusion-btn-getstarted fitusion-auth-trigger" id="fitusionGetStartedBtn">
              Get Started
            </button>
          </div>
        </header>

        <!-- 2. HERO SECTION: SCULPT YOUR BODY, ELEVATE YOUR SPIRIT -->
        <section class="fitusion-hero-section" id="fitusionHero">
          <!-- Side Pagination Indicators -->
          <div class="fitusion-side-pager fitusion-pager-prev" aria-hidden="true">
            <span>P</span><span>R</span><span>E</span><span>V</span>
          </div>
          <div class="fitusion-side-pager fitusion-pager-next" aria-hidden="true">
            <span>N</span><span>E</span><span>X</span><span>T</span>
          </div>

          <!-- Volumetric Light Cone Behind Athlete (Ignites on load, tracks cursor dynamically) -->
          <div class="fitusion-volumetric-light-cone" id="heroLightCone" aria-hidden="true">
            <div class="light-cone-core"></div>
            <div class="light-cone-halo"></div>
            <div class="light-cone-ambient"></div>
          </div>

          <!-- Main Hero Giant Typography (Positioned behind/around athlete) -->
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

          <!-- Athlete Cutout Stage & Surrounding 4 Floating Metric Badges -->
          <div class="fitusion-athlete-stage" id="fitusionAthleteStage">
            <!-- Top Left Floating Card: Hours 1.5 -->
            <div class="fitusion-metric-card card-top-left">
              <div class="metric-icon-wrap icon-lime">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="metric-info">
                <span class="metric-label">Hours</span>
                <span class="metric-value">1.5</span>
              </div>
            </div>

            <!-- Top Right Floating Card: Poses 20 -->
            <div class="fitusion-metric-card card-top-right">
              <div class="metric-icon-wrap icon-lime">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>
              </div>
              <div class="metric-info">
                <span class="metric-label">Poses</span>
                <span class="metric-value">20</span>
              </div>
            </div>

            <!-- Central Muscular Athlete Cutout Visual -->
            <div class="fitusion-athlete-wrapper" id="fitusionAthleteWrapper">
              <img src="images/fitusion/hero-athlete-feathered.png" alt="FiTusion Muscular Athlete" class="fitusion-athlete-img" id="heroAthleteImg" />
            </div>

            <!-- Bottom Left Floating Card: Kcal 550 -->
            <div class="fitusion-metric-card card-bottom-left">
              <div class="metric-icon-wrap icon-lime">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </div>
              <div class="metric-info">
                <span class="metric-label">Kcal</span>
                <span class="metric-value">550</span>
              </div>
            </div>

            <!-- Bottom Right Floating Card: Sets 5 -->
            <div class="fitusion-metric-card card-bottom-right">
              <div class="metric-icon-wrap icon-lime">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
              </div>
              <div class="metric-info">
                <span class="metric-label">Sets</span>
                <span class="metric-value">5</span>
              </div>
            </div>
          </div>

          <!-- Bottom Hero Telemetry & Action Bar -->
          <div class="fitusion-hero-bottom-bar">
            <!-- 12k+ Happy Spirits Social Proof -->
            <div class="fitusion-social-proof">
              <div class="avatar-stack">
                <img src="images/fitfuel-coach-avatar.png" class="avatar-pill" alt="Athlete 1">
                <img src="images/fitfuel-bot-round.png" class="avatar-pill" alt="Athlete 2">
                <img src="images/fitfuel-coach-hero.png" class="avatar-pill" alt="Athlete 3">
              </div>
              <div class="social-text">
                <span class="social-count">12k+</span>
                <span class="social-sub">Happy Spirits</span>
              </div>
            </div>

            <!-- Let's Start >>> Button -->
            <button class="fitusion-cta-start-btn fitusion-auth-trigger" id="landingHeroGetStarted">
              <span>Let's Start</span>
              <span class="carets">&gt;&gt;&gt;</span>
            </button>
          </div>

          <!-- Sponsor Logos Strip -->
          <div class="fitusion-sponsors-strip">
            <div class="sponsor-logo">UNDER ARMOUR</div>
            <div class="sponsor-logo">Reebok</div>
            <div class="sponsor-logo">adidas</div>
            <div class="sponsor-logo">PUMA</div>
            <div class="sponsor-logo">THE NORTH FACE</div>
            <div class="sponsor-logo">NIKE</div>
          </div>
        </section>

        <!-- 3. SECTION 2: INSPIRED TO INSPIRE YOUR BEST SELF -->
        <section class="fitusion-inspire-section" id="fitusionInspire">
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A7.003 7.003 0 0 1 5.07 11H5a1 1 0 0 1 0-2h.07A7.003 7.003 0 0 1 11 5.07V5a1 1 0 0 1 2 0v.07A7.003 7.003 0 0 1 18.93 11H19a1 1 0 0 1 0 2h-.07A7.003 7.003 0 0 1 13 16.93z"/></svg>
                </div>
                <span>Nutrition Guidance</span>
              </div>
              <div class="inspire-feature-item">
                <div class="feature-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.5"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>
                </div>
                <span>Expert Trainers</span>
              </div>
              <div class="inspire-feature-item">
                <div class="feature-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <span>Progress Tracking</span>
              </div>
              <div class="inspire-feature-item">
                <div class="feature-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <span>Premium Membership</span>
              </div>
              <div class="inspire-feature-item">
                <div class="feature-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <span>Community Support</span>
              </div>
              <div class="inspire-feature-item">
                <div class="feature-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                </div>
                <span>Next-Level Fitness Spaces</span>
              </div>
            </div>

            <div class="inspire-athlete-visual">
              <img src="images/fitusion/inspire-athlete.jpg" alt="Inspired Athlete Training" class="inspire-athlete-img" />
            </div>
          </div>

          <div class="fitusion-discover-teaser">
            <span class="discover-label">Discover</span>
          </div>
        </section>

        <!-- 4. SECTION 3: DISCOVER WHAT SETS US APART (4 CARDS) -->
        <section class="fitusion-sets-apart-section" id="fitusionSetsApart">
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </div>
              <h3 class="pillar-card-title">Cardio Training</h3>
              <p class="pillar-card-desc">Boost endurance and heart health with high-energy cardio sessions designed to keep you moving.</p>
              <button class="pillar-btn-plan fitusion-auth-trigger" data-action="cardio-plan">See Plan</button>
            </div>

            <!-- Card 2: Strength Build -->
            <div class="fitusion-pillar-card">
              <div class="pillar-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.2"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
              </div>
              <h3 class="pillar-card-title">Strength Build</h3>
              <p class="pillar-card-desc">Develop power and resilience through expert-guided strength training tailored to all fitness levels.</p>
              <button class="pillar-btn-plan fitusion-auth-trigger" data-action="strength-plan">See Plan</button>
            </div>

            <!-- Card 3: Fat Loss -->
            <div class="fitusion-pillar-card">
              <div class="pillar-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </div>
              <h3 class="pillar-card-title">Fat Loss</h3>
              <p class="pillar-card-desc">Shed unwanted fat with dynamic workout routines and fat-burning strategies that deliver lasting results.</p>
              <button class="pillar-btn-plan fitusion-auth-trigger" data-action="fatloss-plan">See Plan</button>
            </div>

            <!-- Card 4: HIIT Workouts -->
            <div class="fitusion-pillar-card">
              <div class="pillar-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CEFF1A" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </div>
              <h3 class="pillar-card-title">HIIT Workouts</h3>
              <p class="pillar-card-desc">Maximize calorie burn and improve fitness with short, intense high-intensity interval training sessions.</p>
              <button class="pillar-btn-plan fitusion-auth-trigger" data-action="hiit-plan">See Plan</button>
            </div>
          </div>

          <!-- Carousel Dots Indicator -->
          <div class="fitusion-carousel-dots">
            <span class="dot-pill active"></span>
            <span class="dot-circle"></span>
            <span class="dot-circle"></span>
          </div>
        </section>

        <!-- 5. SECTION 4: TRAIN SMARTER, UNLEASH YOUR POTENTIAL (6 COURSES GRID) -->
        <section class="fitusion-train-smarter-section" id="fitusionTrainSmarter">
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
            <div class="fitusion-course-card fitusion-auth-trigger" data-action="course-barbell">
              <div class="course-image-wrap">
                <div class="corner-tab-accent top-right"></div>
                <div class="corner-tab-accent bottom-left"></div>
                <img src="images/fitusion/course-barbell.jpg" alt="Barbell Basics" />
              </div>
              <h3 class="course-card-title">Barbell Basics</h3>
            </div>

            <!-- Course 2 -->
            <div class="fitusion-course-card fitusion-auth-trigger" data-action="course-kettlebell">
              <div class="course-image-wrap">
                <div class="corner-tab-accent top-right"></div>
                <div class="corner-tab-accent bottom-left"></div>
                <img src="images/fitusion/course-kettlebell.jpg" alt="Kettlebell Masterclass" />
              </div>
              <h3 class="course-card-title">Kettlebell Masterclass</h3>
            </div>

            <!-- Course 3 -->
            <div class="fitusion-course-card fitusion-auth-trigger" data-action="course-cardio">
              <div class="course-image-wrap">
                <div class="corner-tab-accent top-right"></div>
                <div class="corner-tab-accent bottom-left"></div>
                <img src="images/fitusion/course-cardio.jpg" alt="Cardio Power Boost" />
              </div>
              <h3 class="course-card-title">Cardio Power Boost</h3>
            </div>

            <!-- Course 4 -->
            <div class="fitusion-course-card fitusion-auth-trigger" data-action="course-deadlift">
              <div class="course-image-wrap">
                <div class="corner-tab-accent top-right"></div>
                <div class="corner-tab-accent bottom-left"></div>
                <img src="images/fitusion/course-deadlift.jpg" alt="Heavy Compound Power" />
              </div>
              <h3 class="course-card-title">Heavy Compound Power</h3>
            </div>

            <!-- Course 5 -->
            <div class="fitusion-course-card fitusion-auth-trigger" data-action="course-ropes">
              <div class="course-image-wrap">
                <div class="corner-tab-accent top-right"></div>
                <div class="corner-tab-accent bottom-left"></div>
                <img src="images/fitusion/course-ropes.jpg" alt="Battle Ropes Conditioning" />
              </div>
              <h3 class="course-card-title">Battle Ropes Conditioning</h3>
            </div>

            <!-- Course 6 -->
            <div class="fitusion-course-card fitusion-auth-trigger" data-action="course-mobility">
              <div class="course-image-wrap">
                <div class="corner-tab-accent top-right"></div>
                <div class="corner-tab-accent bottom-left"></div>
                <img src="images/fitusion/course-mobility.jpg" alt="Suspension & Mobility" />
              </div>
              <h3 class="course-card-title">Suspension & Mobility</h3>
            </div>
          </div>
        </section>

        <!-- 6. FOOTER SECTION -->
        <footer class="fitusion-landing-footer">
          <div class="footer-top">
            <div class="footer-brand">
              <span class="footer-logo">Fi<span class="text-lime">Tusion</span></span>
              <p>Sculpt Your Body, Elevate Your Spirit. Full-stack athletic intelligence, nutrition &amp; posture mastery.</p>
            </div>
            <div class="footer-links">
              <a href="#fitusionHero">Home</a>
              <a href="#fitusionInspire">About Us</a>
              <a href="#fitusionSetsApart">Features</a>
              <a href="#fitusionTrainSmarter">Courses</a>
              <a href="#" class="fitusion-auth-trigger" data-action="login">Athlete Login</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; 2026 FiTusion Performance Technologies. All rights reserved.</span>
            <span>Privacy Policy &bull; Terms of Service &bull; PWA Certified</span>
          </div>
        </footer>

      </section>

      <!-- ================= VIP AUTH GATE PORTAL MODAL ================= -->
      <div class="fitusion-auth-modal" id="fitusionAuthModal" aria-hidden="true" style="display: none;">
        <div class="auth-modal-backdrop" id="authModalBackdrop"></div>
        <div class="auth-modal-card">
          <button class="auth-modal-close" id="authModalCloseBtn" aria-label="Close Auth Modal">&times;</button>
          
          <div class="auth-card-header">
            <div class="auth-logo-badge">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 14L16 4V12L24 10L12 24V16L4 14Z" fill="#CEFF1A"/></svg>
            </div>
            <h3 class="auth-card-title">Welcome to FiTusion</h3>
            <p class="auth-card-sub">Sign in to unlock your live personal nutrition, workouts, 3D body scan &amp; AI coach engine.</p>
          </div>

          <form class="auth-card-form" id="fitusionLoginForm" onsubmit="return false;">
            <div class="auth-input-group">
              <label for="authEmail">Athlete Email</label>
              <input type="email" id="authEmail" class="auth-input-field" value="jordan.davis@fitfuel.ai" placeholder="athlete@domain.com" required>
            </div>
            <div class="auth-input-group">
              <label for="authPassword">Password</label>
              <input type="password" id="authPassword" class="auth-input-field" value="••••••••••••" placeholder="Password" required>
            </div>

            <button type="button" class="auth-btn-submit" id="authSubmitBtn">
              <span>⚡ Sign In &amp; Launch Dashboard</span>
            </button>

            <div class="auth-divider">
              <span>OR 1-CLICK INSTANT ATHLETE ACCESS</span>
            </div>

            <button type="button" class="auth-btn-demo" id="authDemoBtn">
              <span>🚀 Continue as Jordan Davis (Demo Lifter)</span>
            </button>
          </form>
        </div>
      </div>
'''

new_html = html[:start_pos] + landing_html + '\n      ' + html[end_pos:]

with open('gym-app/public/index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Successfully updated gym-app/public/index.html with new FiTusion Dribbble landing & auth modal!')
