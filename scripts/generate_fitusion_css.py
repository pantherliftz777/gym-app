css_content = '''/* ==========================================================================
   FITUSION LUXURY DRIBBLE CINEMATIC LANDING & AUTH PORTAL SYSTEM
   Reference: Dribbble Shot 25337726 (Fitness Website Design)
   - Volumetric White Light Cone Behind Athlete (Ignition + Cursor Physics)
   - Ambient Volumetric Luminous Light Across All Cards & Sections
   - High-Fashion Athletic Display Typography (Syne + Outfit)
   - Electric Lime Accents (#CEFF1A) & Clean Dark/Light Palettes
   - VIP Auth Portal Modal & Transition Pipeline
   ========================================================================== */

/* --- RESET & ROOT TOKENS --- */
:root {
  --fitusion-dark-bg: #08090A;
  --fitusion-dark-surface: #11141A;
  --fitusion-dark-card: #161A22;
  --fitusion-dark-border: rgba(255, 255, 255, 0.08);
  --fitusion-lime: #CEFF1A;
  --fitusion-lime-glow: rgba(206, 255, 26, 0.35);
  --fitusion-lime-soft: #E2F885;
  --fitusion-white: #FFFFFF;
  --fitusion-muted: #8E95A2;
  --fitusion-light-bg: #F8F9FA;
  --fitusion-light-surface: #FFFFFF;
  --fitusion-light-card: #F1F3F5;
  --fitusion-light-border: rgba(0, 0, 0, 0.08);
  --fitusion-light-text: #111827;
  --fitusion-light-lime: #65A30D;
  --font-display: 'Syne', 'Outfit', sans-serif;
  --font-body: 'Outfit', 'Plus Jakarta Sans', sans-serif;
  --spring-ease: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Base Landing View Wrapper */
.fitusion-landing-container {
  background-color: var(--fitusion-dark-bg);
  color: var(--fitusion-white);
  font-family: var(--font-body);
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* Light Theme Overrides */
[data-theme="light"] .fitusion-landing-container {
  background-color: var(--fitusion-light-bg);
  color: var(--fitusion-light-text);
}

/* --- 1. TOP NAVIGATION HEADER --- */
.fitusion-nav-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 4rem;
  background: rgba(8, 9, 10, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--fitusion-dark-border);
  transition: all 0.3s var(--spring-ease);
}

[data-theme="light"] .fitusion-nav-header {
  background: rgba(248, 249, 250, 0.88);
  border-bottom: 1px solid var(--fitusion-light-border);
}

.fitusion-nav-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  cursor: pointer;
}

.fitusion-logo-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 0 10px var(--fitusion-lime-glow));
}

.fitusion-brand-text {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--fitusion-white);
}

[data-theme="light"] .fitusion-brand-text {
  color: var(--fitusion-light-text);
}

.fitusion-brand-accent {
  color: var(--fitusion-lime);
}

[data-theme="light"] .fitusion-brand-accent {
  color: var(--fitusion-light-lime);
}

.fitusion-nav-links {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.fitusion-nav-link {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--fitusion-muted);
  text-decoration: none;
  position: relative;
  padding: 0.4rem 0;
  transition: color 0.25s ease;
}

.fitusion-nav-link:hover,
.fitusion-nav-link.active {
  color: var(--fitusion-white);
}

[data-theme="light"] .fitusion-nav-link:hover,
[data-theme="light"] .fitusion-nav-link.active {
  color: var(--fitusion-light-text);
}

.fitusion-nav-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Theme Toggle Button */
.fitusion-theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--fitusion-dark-border);
  padding: 0.55rem 0.95rem;
  border-radius: 9999px;
  color: var(--fitusion-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s var(--spring-ease);
}

.fitusion-theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--fitusion-white);
  border-color: rgba(255, 255, 255, 0.2);
}

[data-theme="light"] .fitusion-theme-toggle {
  background: rgba(0, 0, 0, 0.05);
  border-color: var(--fitusion-light-border);
  color: var(--fitusion-light-text);
}

.fitusion-btn-pill {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 1.6rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s var(--spring-ease);
}

.fitusion-btn-contact {
  background: var(--fitusion-lime);
  color: #08090A;
  border: none;
  box-shadow: 0 0 20px var(--fitusion-lime-glow);
}

.fitusion-btn-contact:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px var(--fitusion-lime);
}

.fitusion-btn-getstarted {
  background: transparent;
  color: var(--fitusion-white);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.fitusion-btn-getstarted:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--fitusion-white);
  transform: translateY(-2px);
}

[data-theme="light"] .fitusion-btn-getstarted {
  color: var(--fitusion-light-text);
  border-color: rgba(0, 0, 0, 0.2);
}

/* --- 2. HERO SECTION --- */
.fitusion-hero-section {
  position: relative;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 4rem 4rem 4rem;
  overflow: hidden;
}

/* Side Pager Indicators (P R E V / N E X T) */
.fitusion-side-pager {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.3);
  user-select: none;
  z-index: 10;
}

.fitusion-pager-prev { left: 2.5rem; }
.fitusion-pager-next { right: 2.5rem; }

[data-theme="light"] .fitusion-side-pager {
  color: rgba(0, 0, 0, 0.25);
}

/* VOLUMETRIC WHITE LIGHT CONE (EXPANDS ON LOAD, TRACKS CURSOR) */
.fitusion-volumetric-light-cone {
  position: absolute;
  top: 40%;
  left: 50%;
  width: 720px;
  height: 720px;
  pointer-events: none;
  z-index: 1;
  transform: translate(-50%, -50%) translate3d(var(--cone-offset-x, 0px), var(--cone-offset-y, 0px), 0) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg));
  transform-origin: center center;
  transition: transform 0.08s ease-out;
}

.light-cone-core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.55) 20%, rgba(255, 255, 255, 0.18) 45%, rgba(0, 0, 0, 0) 70%);
  filter: blur(50px);
  animation: cinematicConeIgnition 1.8s var(--spring-ease) forwards;
}

.light-cone-halo {
  position: absolute;
  inset: -15%;
  border-radius: 50%;
  background: conic-gradient(from 180deg at 50% 50%, rgba(0, 0, 0, 0) 0deg, rgba(255, 255, 255, 0.8) 55deg, rgba(206, 255, 26, 0.25) 90deg, rgba(0, 0, 0, 0) 140deg);
  filter: blur(75px);
  opacity: 0.85;
}

.light-cone-ambient {
  position: absolute;
  inset: -35%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(206, 255, 26, 0.08) 40%, rgba(0, 0, 0, 0) 75%);
  filter: blur(100px);
}

/* Light Mode Sunbeam Volumetric Cone */
[data-theme="light"] .light-cone-core {
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(245, 235, 205, 0.8) 25%, rgba(206, 255, 26, 0.2) 50%, rgba(255, 255, 255, 0) 70%);
}

[data-theme="light"] .light-cone-halo {
  background: conic-gradient(from 180deg at 50% 50%, rgba(255, 255, 255, 0) 0deg, rgba(255, 245, 220, 0.9) 55deg, rgba(163, 230, 53, 0.3) 90deg, rgba(255, 255, 255, 0) 140deg);
}

@keyframes cinematicConeIgnition {
  0% {
    transform: scale(0.2) translateY(60px);
    opacity: 0;
    filter: blur(80px);
  }
  60% {
    transform: scale(1.08) translateY(-10px);
    opacity: 1;
    filter: blur(40px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
    filter: blur(50px);
  }
}

/* Giant Hero Heading */
.fitusion-hero-typography {
  text-align: center;
  position: relative;
  z-index: 2;
  margin-top: 1rem;
  margin-bottom: -3rem;
  pointer-events: none;
}

.fitusion-hero-heading {
  font-family: var(--font-display);
  font-size: clamp(3rem, 6.8vw, 6.2rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0;
  text-transform: capitalize;
}

.hero-word-sculpt,
.hero-word-body,
.hero-word-elevate {
  color: var(--fitusion-white);
}

[data-theme="light"] .hero-word-sculpt,
[data-theme="light"] .hero-word-body,
[data-theme="light"] .hero-word-elevate {
  color: var(--fitusion-light-text);
}

.hero-word-your-1,
.hero-word-your-2 {
  color: var(--fitusion-lime-soft);
}

[data-theme="light"] .hero-word-your-1,
[data-theme="light"] .hero-word-your-2 {
  color: var(--fitusion-light-lime);
}

/* ATHLETE STAGE & FLOATING METRIC CARDS */
.fitusion-athlete-stage {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 900px;
  height: 580px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.fitusion-athlete-wrapper {
  position: relative;
  z-index: 3;
  width: 380px;
  height: 560px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.fitusion-athlete-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: contrast(1.15) brightness(1.05);
  pointer-events: none;
  user-select: none;
}

/* Floating Squircle Metric Cards */
.fitusion-metric-card {
  position: absolute;
  z-index: 4;
  background: rgba(22, 26, 34, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 1.1rem 1.4rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  transition: transform 0.35s var(--spring-ease), border-color 0.35s ease;
  user-select: none;
}

.fitusion-metric-card:hover {
  transform: translateY(-5px) scale(1.04);
  border-color: var(--fitusion-lime);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 25px var(--fitusion-lime-glow);
}

[data-theme="light"] .fitusion-metric-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
}

.card-top-left {
  top: 15%;
  left: 8%;
}

.card-top-right {
  top: 18%;
  right: 8%;
}

.card-bottom-left {
  bottom: 20%;
  left: 6%;
}

.card-bottom-right {
  bottom: 22%;
  right: 6%;
}

.metric-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(206, 255, 26, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--fitusion-muted);
}

.metric-value {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--fitusion-white);
  line-height: 1.1;
}

[data-theme="light"] .metric-value {
  color: var(--fitusion-light-text);
}

/* Bottom Hero Bar: Social Proof & Let's Start CTA */
.fitusion-hero-bottom-bar {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -1.5rem;
  padding: 0 1rem;
}

.fitusion-social-proof {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar-pill {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid var(--fitusion-dark-bg);
  object-fit: cover;
  margin-left: -12px;
}

.avatar-pill:first-child {
  margin-left: 0;
}

.social-text {
  display: flex;
  flex-direction: column;
}

.social-count {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--fitusion-white);
  line-height: 1.1;
}

[data-theme="light"] .social-count {
  color: var(--fitusion-light-text);
}

.social-sub {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--fitusion-muted);
}

.fitusion-cta-start-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--fitusion-lime);
  color: #08090A;
  border: none;
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 700;
  padding: 0.95rem 2.2rem;
  border-radius: 9999px;
  cursor: pointer;
  box-shadow: 0 0 30px var(--fitusion-lime-glow);
  transition: all 0.3s var(--spring-ease);
}

.fitusion-cta-start-btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 0 45px var(--fitusion-lime);
}

.fitusion-cta-start-btn .carets {
  font-size: 1.15rem;
  letter-spacing: -0.1em;
  transition: transform 0.25s ease;
}

.fitusion-cta-start-btn:hover .carets {
  transform: translateX(4px);
}

/* Sponsor Logos Bar */
.fitusion-sponsors-strip {
  width: 100%;
  max-width: 1100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3.5rem 1rem 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 4rem;
}

.sponsor-logo {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.45);
  transition: color 0.3s ease;
}

.sponsor-logo:hover {
  color: var(--fitusion-white);
}

[data-theme="light"] .sponsor-logo {
  color: rgba(0, 0, 0, 0.35);
}

[data-theme="light"] .sponsor-logo:hover {
  color: var(--fitusion-light-text);
}

/* --- 3. SECTION 2: INSPIRED TO INSPIRE YOUR BEST SELF --- */
.fitusion-inspire-section {
  position: relative;
  padding: 6rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.fitusion-section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.fitusion-section-title {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 4.8vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 1rem 0;
  color: var(--fitusion-white);
}

[data-theme="light"] .fitusion-section-title {
  color: var(--fitusion-light-text);
}

.text-lime-cream {
  color: var(--fitusion-lime-soft);
}

[data-theme="light"] .text-lime-cream {
  color: var(--fitusion-light-lime);
}

.fitusion-section-subtitle {
  font-size: 1.05rem;
  color: var(--fitusion-muted);
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.5;
}

.fitusion-inspire-card {
  background: var(--fitusion-dark-surface);
  border: 1px solid var(--fitusion-dark-border);
  border-radius: 36px;
  padding: 3.5rem 4rem;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: 3rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

/* Ambient Volumetric Pulse on Cards */
.fitusion-inspire-card::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -20%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(206, 255, 26, 0.08) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  animation: ambientLuminousPulse 8s infinite alternate ease-in-out;
}

@keyframes ambientLuminousPulse {
  0% { opacity: 0.35; transform: scale(0.9); }
  100% { opacity: 0.85; transform: scale(1.15); }
}

[data-theme="light"] .fitusion-inspire-card {
  background: var(--fitusion-light-surface);
  border: 1px solid var(--fitusion-light-border);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.05);
}

.inspire-features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem 1.5rem;
}

.inspire-feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--fitusion-white);
}

[data-theme="light"] .inspire-feature-item {
  color: var(--fitusion-light-text);
}

.feature-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(206, 255, 26, 0.12);
  border: 1px solid rgba(206, 255, 26, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.inspire-athlete-visual {
  width: 100%;
  height: 320px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}

.inspire-athlete-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.15);
  border-radius: 24px;
}

.fitusion-discover-teaser {
  text-align: center;
  margin-top: 4rem;
}

.discover-label {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--fitusion-white);
  position: relative;
}

[data-theme="light"] .discover-label {
  color: var(--fitusion-light-text);
}

/* --- 4. SECTION 3: DISCOVER WHAT SETS US APART (4 CARDS) --- */
.fitusion-sets-apart-section {
  position: relative;
  padding: 6rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.fitusion-pillars-carousel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.75rem;
  margin-top: 3.5rem;
}

.fitusion-pillar-card {
  background: var(--fitusion-dark-surface);
  border: 1px solid var(--fitusion-dark-border);
  border-radius: 28px;
  padding: 2.25rem 1.8rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.35s var(--spring-ease);
}

.fitusion-pillar-card:hover {
  transform: translateY(-8px);
  border-color: rgba(206, 255, 26, 0.4);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(206, 255, 26, 0.15);
}

[data-theme="light"] .fitusion-pillar-card {
  background: var(--fitusion-light-surface);
  border: 1px solid var(--fitusion-light-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .fitusion-pillar-card:hover {
  border-color: var(--fitusion-light-lime);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
}

.pillar-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: rgba(206, 255, 26, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.75rem;
}

.pillar-card-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.85rem 0;
  color: var(--fitusion-white);
}

[data-theme="light"] .pillar-card-title {
  color: var(--fitusion-light-text);
}

.pillar-card-desc {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--fitusion-muted);
  margin: 0 0 2rem 0;
  flex-grow: 1;
}

.pillar-btn-plan {
  align-self: flex-start;
  background: var(--fitusion-lime);
  color: #08090A;
  border: none;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s var(--spring-ease);
}

.pillar-btn-plan:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px var(--fitusion-lime-glow);
}

.fitusion-carousel-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  margin-top: 3rem;
}

.dot-pill {
  width: 32px;
  height: 8px;
  border-radius: 9999px;
  background: var(--fitusion-lime);
}

.dot-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

[data-theme="light"] .dot-circle {
  background: rgba(0, 0, 0, 0.15);
}

/* --- 5. SECTION 4: TRAIN SMARTER, UNLEASH YOUR POTENTIAL (6 COURSES GRID) --- */
.fitusion-train-smarter-section {
  position: relative;
  padding: 6rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.fitusion-courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.25rem;
  margin-top: 3.5rem;
}

.fitusion-course-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.35s var(--spring-ease);
}

.fitusion-course-card:hover {
  transform: translateY(-6px);
}

.course-image-wrap {
  width: 100%;
  height: 330px;
  border-radius: 28px;
  position: relative;
  overflow: hidden;
  background: #11141A;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.course-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.2) brightness(0.95);
  transition: transform 0.5s var(--spring-ease);
}

.fitusion-course-card:hover .course-image-wrap img {
  transform: scale(1.06);
}

/* Diagonal Neon Lime Corner Accent Tabs */
.corner-tab-accent {
  position: absolute;
  width: 38px;
  height: 38px;
  background: var(--fitusion-lime);
  z-index: 5;
  transition: all 0.3s ease;
}

.corner-tab-accent.top-right {
  top: 0;
  right: 0;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

.corner-tab-accent.bottom-left {
  bottom: 0;
  left: 0;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
}

.course-card-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--fitusion-lime-soft);
  text-align: center;
  margin-top: 1.2rem;
  letter-spacing: -0.01em;
  transition: color 0.25s ease;
}

.fitusion-course-card:hover .course-card-title {
  color: var(--fitusion-lime);
}

[data-theme="light"] .course-card-title {
  color: var(--fitusion-light-lime);
}

/* --- 6. FOOTER --- */
.fitusion-landing-footer {
  border-top: 1px solid var(--fitusion-dark-border);
  padding: 5rem 4rem 3rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

[data-theme="light"] .fitusion-landing-footer {
  border-top: 1px solid var(--fitusion-light-border);
}

.footer-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 3.5rem;
}

.footer-brand .footer-logo {
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--fitusion-white);
}

[data-theme="light"] .footer-brand .footer-logo {
  color: var(--fitusion-light-text);
}

.footer-brand p {
  color: var(--fitusion-muted);
  max-width: 380px;
  font-size: 0.95rem;
  margin-top: 0.75rem;
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--fitusion-muted);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--fitusion-lime);
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 2rem;
  font-size: 0.85rem;
  color: var(--fitusion-muted);
}

[data-theme="light"] .footer-bottom {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* ==========================================================================
   AUTHENTICATION GATE PORTAL MODAL (#fitusionAuthModal)
   ========================================================================== */
.fitusion-auth-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.auth-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(8, 9, 10, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.auth-modal-card {
  position: relative;
  z-index: 2;
  background: #11141B;
  border: 1px solid rgba(206, 255, 26, 0.3);
  border-radius: 32px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75), 0 0 50px rgba(206, 255, 26, 0.15);
  animation: authModalSlideIn 0.4s var(--spring-ease) forwards;
}

[data-theme="light"] .auth-modal-card {
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
}

@keyframes authModalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: var(--fitusion-white);
  font-size: 1.6rem;
  line-height: 1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.auth-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

[data-theme="light"] .auth-modal-close {
  background: rgba(0, 0, 0, 0.06);
  color: var(--fitusion-light-text);
}

.auth-card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo-badge {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: rgba(206, 255, 26, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.auth-card-title {
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--fitusion-white);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

[data-theme="light"] .auth-card-title {
  color: var(--fitusion-light-text);
}

.auth-card-sub {
  font-size: 0.92rem;
  color: var(--fitusion-muted);
  line-height: 1.5;
  margin: 0;
}

.auth-input-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.auth-input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fitusion-white);
}

[data-theme="light"] .auth-input-group label {
  color: var(--fitusion-light-text);
}

.auth-input-field {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  color: var(--fitusion-white);
  font-family: var(--font-body);
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.auth-input-field:focus {
  border-color: var(--fitusion-lime);
  background: rgba(206, 255, 26, 0.05);
  box-shadow: 0 0 15px rgba(206, 255, 26, 0.2);
}

[data-theme="light"] .auth-input-field {
  background: #F8F9FA;
  border-color: rgba(0, 0, 0, 0.1);
  color: var(--fitusion-light-text);
}

.auth-btn-submit {
  width: 100%;
  background: var(--fitusion-lime);
  color: #08090A;
  border: none;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  padding: 0.95rem;
  border-radius: 14px;
  cursor: pointer;
  margin-top: 0.75rem;
  box-shadow: 0 0 25px var(--fitusion-lime-glow);
  transition: all 0.3s var(--spring-ease);
}

.auth-btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 35px var(--fitusion-lime);
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--fitusion-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="light"] .auth-divider::before,
[data-theme="light"] .auth-divider::after {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.auth-divider span {
  padding: 0 0.85rem;
}

.auth-btn-demo {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--fitusion-white);
  font-family: var(--font-body);
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.9rem;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s var(--spring-ease);
}

.auth-btn-demo:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--fitusion-lime);
  color: var(--fitusion-lime);
  transform: translateY(-2px);
}

[data-theme="light"] .auth-btn-demo {
  background: #F1F3F5;
  border-color: rgba(0, 0, 0, 0.15);
  color: var(--fitusion-light-text);
}

/* --- RESPONSIVE OPTIMIZATIONS --- */
@media (max-width: 1024px) {
  .fitusion-nav-header { padding: 1rem 2rem; }
  .fitusion-hero-section { padding: 2rem 2rem 3rem 2rem; }
  .fitusion-inspire-card { grid-template-columns: 1fr; padding: 2.5rem; }
  .fitusion-pillars-carousel { grid-template-columns: repeat(2, 1fr); }
  .fitusion-courses-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .fitusion-nav-links { display: none; }
  .fitusion-side-pager { display: none; }
  .fitusion-hero-heading { font-size: 2.6rem; }
  .fitusion-athlete-stage { height: 460px; }
  .fitusion-athlete-wrapper { width: 280px; height: 440px; }
  .card-top-left { top: 5%; left: 0; transform: scale(0.85); }
  .card-top-right { top: 8%; right: 0; transform: scale(0.85); }
  .card-bottom-left { bottom: 10%; left: 0; transform: scale(0.85); }
  .card-bottom-right { bottom: 12%; right: 0; transform: scale(0.85); }
  .fitusion-hero-bottom-bar { flex-direction: column; gap: 1.5rem; text-align: center; }
  .fitusion-pillars-carousel { grid-template-columns: 1fr; }
  .fitusion-courses-grid { grid-template-columns: 1fr; }
  .inspire-features-grid { grid-template-columns: 1fr; }
}
'''

with open('gym-app/public/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

pos = css.find('/* ==========================================================================\n   FITUSION')
if pos == -1:
    pos = css.find('/* --- DRIBBLE-INSPIRED CINEMATIC LANDING PAGE')
if pos == -1:
    pos = css.find('landing-cinematic-hero')
    if pos != -1:
        pos = css.rfind('/*', 0, pos)

if pos != -1:
    new_css = css[:pos] + css_content
else:
    new_css = css + '\n\n' + css_content

with open('gym-app/public/styles.css', 'w', encoding='utf-8') as f:
    f.write(new_css)

print('Successfully updated gym-app/public/styles.css with FiTusion styles!')
