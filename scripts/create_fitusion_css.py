/* ==========================================================================
   FITUSION PURE DEDICATED LANDING STYLESHEET
   Reference: Dribbble Shot 25337726 (Fitness Website Design)
   ========================================================================== */

:root {
  --bg-dark: #08090A;
  --bg-dark-surface: #101217;
  --bg-dark-card: #14171F;
  --border-dark: rgba(255, 255, 255, 0.08);
  --lime: #CEFF1A;
  --lime-glow: rgba(206, 255, 26, 0.4);
  --lime-soft: #E2F885;
  --white: #FFFFFF;
  --muted: #8E95A2;
  --bg-light: #F8F9FA;
  --bg-light-surface: #FFFFFF;
  --bg-light-card: #F1F3F5;
  --border-light: rgba(0, 0, 0, 0.08);
  --text-light: #111827;
  --lime-light: #65A30D;
  --font-display: 'Syne', 'Outfit', sans-serif;
  --font-body: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  min-height: 100%;
  background-color: var(--bg-dark);
  color: var(--white);
  font-family: var(--font-body);
  overflow-x: hidden;
  transition: background-color 0.4s ease, color 0.4s ease;
}

[data-theme="light"] html,
[data-theme="light"] body {
  background-color: var(--bg-light);
  color: var(--text-light);
}

/* --- TOPBAR NAVIGATION --- */
.top-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 4rem;
  background: rgba(8, 9, 10, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-dark);
}

[data-theme="light"] .top-navbar {
  background: rgba(248, 249, 250, 0.92);
  border-bottom: 1px solid var(--border-light);
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  cursor: pointer;
}

.brand-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 0 10px var(--lime-glow));
}

.brand-title {
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--white);
}

[data-theme="light"] .brand-title {
  color: var(--text-light);
}

.brand-accent {
  color: var(--lime);
}

[data-theme="light"] .brand-accent {
  color: var(--lime-light);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2.75rem;
}

.nav-link {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.25s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--white);
}

[data-theme="light"] .nav-link:hover,
[data-theme="light"] .nav-link.active {
  color: var(--text-light);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Theme Toggle */
.theme-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-dark);
  padding: 0.55rem 1rem;
  border-radius: 9999px;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s var(--ease);
}

.theme-switcher:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--white);
  border-color: rgba(255, 255, 255, 0.2);
}

[data-theme="light"] .theme-switcher {
  background: rgba(0, 0, 0, 0.05);
  border-color: var(--border-light);
  color: var(--text-light);
}

.btn-pill {
  font-family: var(--font-body);
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.65rem 1.65rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s var(--ease);
}

.btn-contact {
  background: var(--lime);
  color: #08090A;
  border: none;
  box-shadow: 0 0 20px var(--lime-glow);
}

.btn-contact:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px var(--lime);
}

.btn-getstarted {
  background: transparent;
  color: var(--white);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.btn-getstarted:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--white);
  transform: translateY(-2px);
}

[data-theme="light"] .btn-getstarted {
  color: var(--text-light);
  border-color: rgba(0, 0, 0, 0.2);
}

/* --- HERO SECTION --- */
.hero-container {
  position: relative;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 4rem 3rem 4rem;
  overflow: hidden;
}

/* Side Pager Indicators */
.side-pager {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.35);
  user-select: none;
  z-index: 10;
}

.side-pager.prev { left: 3rem; }
.side-pager.next { right: 3rem; }

[data-theme="light"] .side-pager {
  color: rgba(0, 0, 0, 0.3);
}

/* VOLUMETRIC WHITE LIGHT CONE (EXPANDS ON LOAD & TRACKS CURSOR) */
.hero-volumetric-cone {
  position: absolute;
  top: 42%;
  left: 50%;
  width: 760px;
  height: 760px;
  pointer-events: none;
  z-index: 1;
  transform: translate(-50%, -50%) translate3d(var(--cone-x, 0px), var(--cone-y, 0px), 0) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg));
  transform-origin: center center;
  transition: transform 0.08s ease-out;
}

.cone-core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.6) 20%, rgba(255, 255, 255, 0.2) 45%, rgba(0, 0, 0, 0) 70%);
  filter: blur(55px);
  animation: coneIgnitionBloom 1.8s var(--ease) forwards;
}

.cone-radial-halo {
  position: absolute;
  inset: -15%;
  border-radius: 50%;
  background: conic-gradient(from 180deg at 50% 50%, rgba(0, 0, 0, 0) 0deg, rgba(255, 255, 255, 0.85) 55deg, rgba(206, 255, 26, 0.25) 90deg, rgba(0, 0, 0, 0) 140deg);
  filter: blur(75px);
  opacity: 0.9;
}

.cone-ambient-dust {
  position: absolute;
  inset: -35%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(206, 255, 26, 0.1) 40%, rgba(0, 0, 0, 0) 75%);
  filter: blur(110px);
}

[data-theme="light"] .cone-core {
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(245, 235, 205, 0.85) 25%, rgba(206, 255, 26, 0.2) 50%, rgba(255, 255, 255, 0) 70%);
}

[data-theme="light"] .cone-radial-halo {
  background: conic-gradient(from 180deg at 50% 50%, rgba(255, 255, 255, 0) 0deg, rgba(255, 245, 220, 0.9) 55deg, rgba(163, 230, 53, 0.35) 90deg, rgba(255, 255, 255, 0) 140deg);
}

@keyframes coneIgnitionBloom {
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
    filter: blur(55px);
  }
}

/* Giant Hero Heading */
.hero-typography {
  text-align: center;
  position: relative;
  z-index: 2;
  margin-top: 1rem;
  margin-bottom: -3.5rem;
  pointer-events: none;
}

.hero-heading {
  font-family: var(--font-display);
  font-size: clamp(3rem, 6.8vw, 6.2rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0;
  text-transform: capitalize;
}

.word-white {
  color: var(--white);
}

[data-theme="light"] .word-white {
  color: var(--text-light);
}

.word-lime {
  color: var(--lime-soft);
}

[data-theme="light"] .word-lime {
  color: var(--lime-light);
}

/* ATHLETE STAGE & FLOATING METRIC CARDS */
.athlete-stage {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 900px;
  height: 590px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.athlete-wrapper {
  position: relative;
  z-index: 3;
  width: 360px;
  height: 580px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.athlete-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: contrast(1.15) brightness(1.05);
  pointer-events: none;
  user-select: none;
}

/* Floating Squircle Metric Cards */
.metric-badge {
  position: absolute;
  z-index: 4;
  background: rgba(20, 23, 31, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 1.1rem 1.4rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  transition: transform 0.35s var(--ease), border-color 0.35s ease, box-shadow 0.35s ease;
  user-select: none;
}

.metric-badge:hover {
  transform: translateY(-5px) scale(1.04);
  border-color: var(--lime);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 25px var(--lime-glow);
}

[data-theme="light"] .metric-badge {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
}

.badge-top-left {
  top: 15%;
  left: 8%;
}

.badge-top-right {
  top: 18%;
  right: 8%;
}

.badge-bottom-left {
  bottom: 20%;
  left: 6%;
}

.badge-bottom-right {
  bottom: 22%;
  right: 6%;
}

.badge-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(206, 255, 26, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-info {
  display: flex;
  flex-direction: column;
}

.badge-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--muted);
}

.badge-value {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--white);
  line-height: 1.1;
}

[data-theme="light"] .badge-value {
  color: var(--text-light);
}

/* Bottom Hero Row: Social Proof + CTA */
.hero-bottom-row {
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

.social-proof {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.proof-avatars {
  width: 120px;
  height: auto;
  object-fit: contain;
}

.proof-text {
  display: flex;
  flex-direction: column;
}

.proof-count {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--white);
  line-height: 1.1;
}

[data-theme="light"] .proof-count {
  color: var(--text-light);
}

.proof-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--muted);
}

.cta-start-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--lime);
  color: #08090A;
  border: none;
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 700;
  padding: 0.95rem 2.2rem;
  border-radius: 9999px;
  cursor: pointer;
  box-shadow: 0 0 30px var(--lime-glow);
  transition: all 0.3s var(--ease);
}

.cta-start-btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 0 45px var(--lime);
}

.cta-start-btn .carets {
  font-size: 1.15rem;
  letter-spacing: -0.1em;
  transition: transform 0.25s ease;
}

.cta-start-btn:hover .carets {
  transform: translateX(4px);
}

/* Sponsor Logos Bar */
.sponsors-bar {
  width: 100%;
  max-width: 1100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3.5rem 1rem 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 4rem;
}

.sponsor-item {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.45);
  transition: color 0.3s ease;
}

.sponsor-item:hover {
  color: var(--white);
}

[data-theme="light"] .sponsor-item {
  color: rgba(0, 0, 0, 0.35);
}

[data-theme="light"] .sponsor-item:hover {
  color: var(--text-light);
}

/* --- SECTION 2: INSPIRED TO INSPIRE YOUR BEST SELF --- */
.inspire-section {
  position: relative;
  padding: 6.5rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-head {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 4.8vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 1rem 0;
  color: var(--white);
}

[data-theme="light"] .section-title {
  color: var(--text-light);
}

.section-sub {
  font-size: 1.05rem;
  color: var(--muted);
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.55;
}

.inspire-card {
  background: var(--bg-dark-surface);
  border: 1px solid var(--border-dark);
  border-radius: 36px;
  padding: 3.5rem 4rem;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  align-items: center;
  gap: 3rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

/* Ambient Volumetric Pulse on Cards */
.inspire-card::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -20%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(206, 255, 26, 0.1) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  animation: ambientLuminousPulse 8s infinite alternate ease-in-out;
}

@keyframes ambientLuminousPulse {
  0% { opacity: 0.35; transform: scale(0.9); }
  100% { opacity: 0.85; transform: scale(1.15); }
}

[data-theme="light"] .inspire-card {
  background: var(--bg-light-surface);
  border: 1px solid var(--border-light);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.05);
}

.features-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem 1.5rem;
}

.feature-pill-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--white);
}

[data-theme="light"] .feature-pill-item {
  color: var(--text-light);
}

.feature-badge-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(206, 255, 26, 0.12);
  border: 1px solid rgba(206, 255, 26, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.inspire-visual {
  width: 100%;
  height: 330px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}

.inspire-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.15);
  border-radius: 24px;
}

.discover-divider {
  text-align: center;
  margin-top: 4rem;
}

.discover-btn {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--white);
  text-decoration: none;
}

[data-theme="light"] .discover-btn {
  color: var(--text-light);
}

/* --- SECTION 3: DISCOVER WHAT SETS US APART (4 CARDS) --- */
.sets-apart-section {
  position: relative;
  padding: 6.5rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.75rem;
  margin-top: 3.5rem;
}

.pillar-box {
  background: var(--bg-dark-surface);
  border: 1px solid var(--border-dark);
  border-radius: 28px;
  padding: 2.25rem 1.8rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.35s var(--ease);
}

.pillar-box:hover {
  transform: translateY(-8px);
  border-color: rgba(206, 255, 26, 0.4);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(206, 255, 26, 0.15);
}

[data-theme="light"] .pillar-box {
  background: var(--bg-light-surface);
  border: 1px solid var(--border-light);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .pillar-box:hover {
  border-color: var(--lime-light);
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

.pillar-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.85rem 0;
  color: var(--white);
}

[data-theme="light"] .pillar-title {
  color: var(--text-light);
}

.pillar-desc {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
  margin: 0 0 2rem 0;
  flex-grow: 1;
}

.btn-see-plan {
  align-self: flex-start;
  background: var(--lime);
  color: #08090A;
  border: none;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s var(--ease);
}

.btn-see-plan:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px var(--lime-glow);
}

.carousel-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  margin-top: 3rem;
}

.dot-bar {
  width: 32px;
  height: 8px;
  border-radius: 9999px;
  background: var(--lime);
}

.dot-unit {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

[data-theme="light"] .dot-unit {
  background: rgba(0, 0, 0, 0.15);
}

/* --- SECTION 4: TRAIN SMARTER, UNLEASH YOUR POTENTIAL (6 COURSES GRID) --- */
.train-smarter-section {
  position: relative;
  padding: 6.5rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.25rem;
  margin-top: 3.5rem;
}

.course-box {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.35s var(--ease);
}

.course-box:hover {
  transform: translateY(-6px);
}

.course-poster-wrap {
  width: 100%;
  height: 330px;
  border-radius: 28px;
  position: relative;
  overflow: hidden;
  background: #11141A;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.course-poster-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.2) brightness(0.95);
  transition: transform 0.5s var(--ease);
}

.course-box:hover .course-poster-wrap img {
  transform: scale(1.06);
}

/* Diagonal Neon Lime Corner Accent Tabs */
.corner-tab {
  position: absolute;
  width: 38px;
  height: 38px;
  background: var(--lime);
  z-index: 5;
}

.corner-tab.top-right {
  top: 0;
  right: 0;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

.corner-tab.bottom-left {
  bottom: 0;
  left: 0;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
}

.course-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--lime-soft);
  text-align: center;
  margin-top: 1.2rem;
  letter-spacing: -0.01em;
  transition: color 0.25s ease;
}

.course-box:hover .course-title {
  color: var(--lime);
}

[data-theme="light"] .course-title {
  color: var(--lime-light);
}

/* --- FOOTER --- */
.site-footer {
  border-top: 1px solid var(--border-dark);
  padding: 5rem 4rem 3rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

[data-theme="light"] .site-footer {
  border-top: 1px solid var(--border-light);
}

.footer-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 3.5rem;
}

.footer-brand .footer-title {
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--white);
}

[data-theme="light"] .footer-brand .footer-title {
  color: var(--text-light);
}

.footer-brand p {
  color: var(--muted);
  max-width: 380px;
  font-size: 0.95rem;
  margin-top: 0.75rem;
  line-height: 1.5;
}

.footer-nav {
  display: flex;
  gap: 2rem;
}

.footer-nav a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-nav a:hover {
  color: var(--lime);
}

.footer-sub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 2rem;
  font-size: 0.85rem;
  color: var(--muted);
}

[data-theme="light"] .footer-sub {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* --- AUTH MODAL --- */
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.auth-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(8, 9, 10, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.auth-window {
  position: relative;
  z-index: 2;
  background: #11141B;
  border: 1px solid rgba(206, 255, 26, 0.3);
  border-radius: 32px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75), 0 0 50px rgba(206, 255, 26, 0.15);
  animation: authSlideUp 0.4s var(--ease) forwards;
}

[data-theme="light"] .auth-window {
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
}

@keyframes authSlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.auth-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: var(--white);
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

.auth-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

[data-theme="light"] .auth-close-btn {
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-light);
}

.auth-head {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-brand-badge {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: rgba(206, 255, 26, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.auth-window-title {
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--white);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

[data-theme="light"] .auth-window-title {
  color: var(--text-light);
}

.auth-window-desc {
  font-size: 0.92rem;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

.form-row {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-row label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--white);
}

[data-theme="light"] .form-row label {
  color: var(--text-light);
}

.form-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  color: var(--white);
  font-family: var(--font-body);
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--lime);
  background: rgba(206, 255, 26, 0.05);
  box-shadow: 0 0 15px rgba(206, 255, 26, 0.2);
}

[data-theme="light"] .form-input {
  background: #F8F9FA;
  border-color: rgba(0, 0, 0, 0.1);
  color: var(--text-light);
}

.btn-auth-submit {
  width: 100%;
  background: var(--lime);
  color: #08090A;
  border: none;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  padding: 0.95rem;
  border-radius: 14px;
  cursor: pointer;
  margin-top: 0.75rem;
  box-shadow: 0 0 25px var(--lime-glow);
  transition: all 0.3s var(--ease);
}

.btn-auth-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 35px var(--lime);
}

.auth-split {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.auth-split::before,
.auth-split::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="light"] .auth-split::before,
[data-theme="light"] .auth-split::after {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.auth-split span {
  padding: 0 0.85rem;
}

.btn-auth-demo {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--white);
  font-family: var(--font-body);
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.9rem;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s var(--ease);
}

.btn-auth-demo:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--lime);
  color: var(--lime);
  transform: translateY(-2px);
}

[data-theme="light"] .btn-auth-demo {
  background: #F1F3F5;
  border-color: rgba(0, 0, 0, 0.15);
  color: var(--text-light);
}

/* --- RESPONSIVE OPTIMIZATIONS --- */
@media (max-width: 1024px) {
  .top-navbar { padding: 1rem 2rem; }
  .hero-container { padding: 2rem 2rem 3rem 2rem; }
  .inspire-card { grid-template-columns: 1fr; padding: 2.5rem; }
  .pillars-grid { grid-template-columns: repeat(2, 1fr); }
  .courses-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .side-pager { display: none; }
  .hero-heading { font-size: 2.6rem; }
  .athlete-stage { height: 460px; }
  .athlete-wrapper { width: 280px; height: 440px; }
  .badge-top-left { top: 5%; left: 0; transform: scale(0.85); }
  .badge-top-right { top: 8%; right: 0; transform: scale(0.85); }
  .badge-bottom-left { bottom: 10%; left: 0; transform: scale(0.85); }
  .badge-bottom-right { bottom: 12%; right: 0; transform: scale(0.85); }
  .hero-bottom-row { flex-direction: column; gap: 1.5rem; text-align: center; }
  .pillars-grid { grid-template-columns: 1fr; }
  .courses-grid { grid-template-columns: 1fr; }
  .features-col-grid { grid-template-columns: 1fr; }
}
'''

with open('gym-app/public/fitusion-landing.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print('fitusion-landing.css created!')
