const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const masterLandingCss = `
/* ==========================================================================
   FITFUEL DRIBBBLE-INSPIRED CINEMATIC LANDING PAGE (LIGHT & DARK MODES)
   Reference: Dribbble Shot 25337726 (Fitness Website Design)
   - Features: Volumetric cinematic light cone, cursor-reactive tracking,
     VengeanceUI spring motion, Skiper UI link reveals, 4-pillar performance grid.
   ========================================================================== */

/* 1. CINEMATIC HERO CONTAINER */
.landing-cinematic-hero {
  position: relative;
  width: 100%;
  min-height: 86vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border-radius: 24px;
  margin-bottom: 40px;
  box-sizing: border-box;
  padding: 24px 36px 40px;
  background: var(--landing-hero-bg);
  border: 1px solid var(--landing-hero-border);
  transition: background 0.4s ease, border-color 0.4s ease;
}

/* 2. THE VOLUMETRIC LIGHT CONE (EXPANDS ON LOAD & TRACKS CURSOR) */
.hero-light-cone {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.cone-core {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at var(--cursor-x, 70%) var(--cursor-y, 45%),
    var(--cone-core-color, rgba(255, 255, 255, 0.85)) 0%,
    var(--cone-mid-color, rgba(255, 255, 255, 0.45)) 18%,
    var(--cone-outer-color, rgba(56, 189, 248, 0.15)) 42%,
    transparent 68%
  );
  filter: blur(45px);
  animation: cinematicConeIgnition 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity, background;
  transform: perspective(1000px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg));
  transition: transform 0.18s cubic-bezier(0.1, 0.9, 0.2, 1);
}

.cone-radial-flare {
  position: absolute;
  top: 15%;
  left: var(--cursor-x, 70%);
  width: 500px;
  height: 500px;
  transform: translate(-50%, -20%) scale(1.1);
  background: conic-gradient(
    from 180deg at 50% 50%,
    transparent 0deg,
    var(--cone-flare-color, rgba(255, 255, 255, 0.6)) 60deg,
    var(--cone-flare-accent, rgba(56, 189, 248, 0.35)) 90deg,
    transparent 140deg
  );
  filter: blur(60px);
  opacity: 0.65;
  animation: flareSubtlePulse 6s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes cinematicConeIgnition {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(40px);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.15) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes flareSubtlePulse {
  0% {
    opacity: 0.45;
    transform: translate(-50%, -20%) scale(0.96);
  }
  100% {
    opacity: 0.75;
    transform: translate(-50%, -20%) scale(1.08);
  }
}

/* 3. LANDING TOPBAR */
.landing-nav-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 24px;
}

.landing-brand-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.landing-brand-beacon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--brand-beacon-color, #10b981);
  box-shadow: 0 0 12px var(--brand-beacon-color, #10b981);
  animation: beaconBlink 2.2s ease-in-out infinite;
}

@keyframes beaconBlink {
  0%, 100% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.2); }
}

.landing-brand-text {
  font-family: var(--font-luxury, 'Cormorant Garamond', serif);
  font-size: 1.55rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--ff-text-primary);
}

.landing-brand-badge {
  font-family: var(--font-light-body);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--badge-bg);
  color: var(--badge-color);
  border: 1px solid var(--badge-border);
}

/* SKIPER UI (skiper40 / CssLink) ANIMATED LINKS */
.landing-nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.landing-nav-link.skiper-link {
  position: relative;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--ff-text-secondary);
  padding: 6px 2px;
  transition: color 0.2s ease;
}

.landing-nav-link.skiper-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--nav-underline-color, #0f172a);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-nav-link.skiper-link:hover {
  color: var(--ff-text-primary);
}

.landing-nav-link.skiper-link:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

.landing-nav-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* INSTANT THEME SWITCHER */
.landing-theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 99px;
  border: 1px solid var(--theme-toggle-border);
  background: var(--theme-toggle-bg);
  color: var(--ff-text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-theme-toggle-btn:hover {
  transform: translateY(-1.5px);
  border-color: var(--theme-toggle-border-hover);
}

.landing-theme-toggle-btn:active {
  transform: scale(0.97);
}

/* VENGEANCEUI LAUNCH BUTTON */
.landing-launch-app-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border-radius: 99px;
  background: var(--launch-btn-bg);
  color: var(--launch-btn-color);
  border: 1px solid var(--launch-btn-border);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--launch-btn-shadow);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-launch-app-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--launch-btn-shadow-hover);
}

.landing-launch-app-btn:active {
  transform: scale(0.97);
}

/* 4. HERO ASYMMETRICAL EDITORIAL GRID */
.landing-hero-grid {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  align-items: center;
  gap: 36px;
  min-height: 64vh;
}

.hero-left-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 12px;
}

.hero-kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  border-radius: 99px;
  background: var(--kicker-pill-bg);
  border: 1px solid var(--kicker-pill-border);
  color: var(--kicker-pill-color);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 18px;
  width: fit-content;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.hero-editorial-title {
  font-family: var(--font-luxury, 'Cormorant Garamond', serif) !important;
  font-size: clamp(2.4rem, 4.4vw, 3.8rem) !important;
  font-weight: 700 !important;
  line-height: 1.08 !important;
  letter-spacing: -0.025em !important;
  color: var(--ff-text-primary) !important;
  margin: 0 0 18px 0 !important;
}

.hero-title-accent {
  font-style: italic;
  color: var(--hero-accent-color);
}

.hero-editorial-sub {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--ff-text-secondary);
  max-width: 520px;
  margin: 0 0 28px 0;
  font-weight: 300;
}

.hero-btn-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 34px;
  flex-wrap: wrap;
}

.hero-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 28px;
  border-radius: 99px;
  background: var(--hero-btn-primary-bg);
  color: var(--hero-btn-primary-color);
  border: 1px solid var(--hero-btn-primary-border);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--hero-btn-primary-shadow);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--hero-btn-primary-shadow-hover);
}

.hero-btn-primary:active {
  transform: scale(0.97);
}

.hero-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: 99px;
  background: var(--hero-btn-sec-bg);
  color: var(--hero-btn-sec-color);
  border: 1px solid var(--hero-btn-sec-border);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-btn-secondary:hover {
  transform: translateY(-2px);
  border-color: var(--hero-btn-sec-border-hover);
}

.hero-editorial-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--stats-divider-color);
}

.hero-stat-block {
  display: flex;
  flex-direction: column;
}

.hero-stat-digit {
  font-family: var(--font-luxury, 'Cormorant Garamond', serif);
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--ff-text-primary);
  line-height: 1.1;
}

.hero-stat-caption {
  font-size: 0.74rem;
  color: var(--ff-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 3px;
}

.hero-stat-divider {
  width: 1px;
  height: 32px;
  background: var(--stats-divider-color);
}

/* 5. RIGHT COLUMN: ATHLETE IMAGE WITH RIM LIGHT */
.hero-right-col {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 520px;
}

.athlete-display-frame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.athlete-hero-cutout {
  position: relative;
  z-index: 3;
  max-height: 560px;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 20px 45px var(--athlete-shadow-color));
  transform: translateZ(0);
  pointer-events: none;
}

/* FLOATING INTERACTIVE METRIC CHIPS */
.athlete-floating-chip {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 14px;
  background: var(--chip-bg);
  border: 1px solid var(--chip-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  animation: floatChip 5s ease-in-out infinite alternate;
}

.chip-top-right {
  top: 14%;
  right: -5px;
  animation-delay: 0.5s;
}

.chip-bottom-left {
  bottom: 12%;
  left: 0;
  animation-delay: 1.5s;
}

@keyframes floatChip {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-10px); }
}

.chip-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--chip-icon-bg);
  color: var(--chip-icon-color);
  flex-shrink: 0;
}

.chip-content {
  display: flex;
  flex-direction: column;
}

.chip-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ff-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chip-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ff-text-primary);
}

/* 6. SECTION HEADINGS & WRAPPERS */
.landing-section-wrap {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto 60px;
  padding: 0 12px;
  box-sizing: border-box;
}

.landing-section-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 36px;
}

.landing-section-kicker {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--kicker-pill-color);
  text-transform: uppercase;
  margin-bottom: 8px;
  display: block;
}

.landing-section-title {
  font-family: var(--font-luxury, 'Cormorant Garamond', serif) !important;
  font-size: clamp(1.8rem, 3.2vw, 2.6rem) !important;
  font-weight: 700 !important;
  color: var(--ff-text-primary) !important;
  letter-spacing: -0.02em !important;
  margin: 0 0 12px 0 !important;
}

.landing-section-subtitle {
  font-size: 0.96rem;
  color: var(--ff-text-secondary);
  line-height: 1.6;
  margin: 0;
  font-weight: 300;
}

/* 7. FOUR-PILLAR ASYMMETRICAL FEATURE MATRIX WITH AMBIENT VOLUMETRIC LIGHT */
.landing-feature-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.luminous-feature-card {
  position: relative;
  overflow: hidden;
  padding: 30px 32px;
  border-radius: 18px;
  background: var(--card-luminous-bg);
  border: 1px solid var(--card-luminous-border);
  box-shadow: var(--card-luminous-shadow);
  cursor: pointer;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.28s ease;
}

.card-lead {
  grid-row: span 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* AMBIENT VOLUMETRIC LIGHT BEAM (ANIMATED EVERYWHERE IN WEB) */
.card-ambient-beam {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: var(--card-beam-glow, rgba(255, 255, 255, 0.12));
  filter: blur(45px);
  pointer-events: none;
  animation: ambientLuminousPulse 7s ease-in-out infinite alternate;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

@keyframes ambientLuminousPulse {
  0% { opacity: 0.25; transform: scale(0.9) translate(0, 0); }
  50% { opacity: 0.55; transform: scale(1.15) translate(-10px, 10px); }
  100% { opacity: 0.3; transform: scale(0.95) translate(0, 0); }
}

.luminous-feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--card-luminous-border-hover);
  box-shadow: var(--card-luminous-shadow-hover);
}

.luminous-feature-card:hover .card-ambient-beam {
  opacity: 0.75;
  transform: scale(1.3);
}

.card-top-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-icon-bg);
  color: var(--card-icon-color);
  margin-bottom: 18px;
}

.card-pill {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--kicker-pill-color);
  text-transform: uppercase;
  margin-bottom: 6px;
  display: inline-block;
}

.card-headline {
  font-family: var(--font-luxury, 'Cormorant Garamond', serif);
  font-size: 1.45rem;
  font-weight: 600;
  color: var(--ff-text-primary);
  margin: 0 0 10px 0;
  line-height: 1.25;
}

.card-desc {
  font-size: 0.88rem;
  color: var(--ff-text-secondary);
  line-height: 1.55;
  margin: 0 0 18px 0;
  font-weight: 300;
}

.card-action-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--card-action-color);
  transition: gap 0.2s ease;
}

.luminous-feature-card:hover .card-action-link {
  gap: 10px;
}

/* 8. 512x512 SHOWCASE BOX */
.landing-showcase-box {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 36px;
  padding: 40px;
  border-radius: 22px;
  background: var(--card-luminous-bg);
  border: 1px solid var(--card-luminous-border);
  box-shadow: var(--card-luminous-shadow);
}

.showcase-title {
  font-family: var(--font-luxury, 'Cormorant Garamond', serif);
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--ff-text-primary);
  margin: 6px 0 14px 0;
}

.showcase-sub {
  font-size: 0.94rem;
  color: var(--ff-text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  font-weight: 300;
}

.showcase-badges-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.showcase-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--ff-text-primary);
}

.showcase-badge svg {
  color: #10b981;
}

.vector-frame-card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: var(--vector-card-bg);
  border: 1px solid var(--card-luminous-border);
  padding: 24px;
  text-align: center;
}

.showcase-vector-img {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
}

.vector-caption-bar {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 14px;
}

.caption-exercise {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ff-text-primary);
}

.caption-state {
  font-size: 0.76rem;
  color: var(--ff-text-muted);
}

/* 9. PRICING TIERS */
.pricing-tiers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.pricing-tier-card {
  position: relative;
  overflow: hidden;
  padding: 34px 28px;
  border-radius: 20px;
  background: var(--card-luminous-bg);
  border: 1px solid var(--card-luminous-border);
  box-shadow: var(--card-luminous-shadow);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.pricing-tier-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-luminous-shadow-hover);
}

.tier-pro-highlight {
  border-color: var(--tier-highlight-border) !important;
  box-shadow: 0 16px 45px -8px var(--tier-highlight-shadow) !important;
}

.tier-popular-pill {
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 99px;
  background: var(--kicker-pill-color);
  color: #fff;
}

.tier-name {
  font-family: var(--font-luxury, 'Cormorant Garamond', serif);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ff-text-primary);
  margin-bottom: 6px;
}

.tier-price {
  font-size: 2.2rem;
  font-weight: 300;
  color: var(--ff-text-primary);
  margin-bottom: 12px;
}

.tier-price span {
  font-size: 0.88rem;
  color: var(--ff-text-muted);
}

.tier-sub {
  font-size: 0.84rem;
  color: var(--ff-text-secondary);
  line-height: 1.5;
  margin-bottom: 22px;
}

.tier-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tier-features-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--ff-text-secondary);
}

.tier-features-list li svg {
  color: #10b981;
  flex-shrink: 0;
}

.tier-cta-btn {
  width: 100%;
  padding: 12px 18px;
  border-radius: 99px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.tier-cta-btn.primary {
  background: var(--hero-btn-primary-bg);
  color: var(--hero-btn-primary-color);
  border: 1px solid var(--hero-btn-primary-border);
}

.tier-cta-btn.secondary {
  background: var(--hero-btn-sec-bg);
  color: var(--hero-btn-sec-color);
  border: 1px solid var(--hero-btn-sec-border);
}

.tier-cta-btn:hover {
  transform: translateY(-2px);
}

/* 10. FINAL CTA */
.final-cta-card {
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 50px 30px;
  border-radius: 24px;
  background: var(--card-luminous-bg);
  border: 1px solid var(--card-luminous-border);
  box-shadow: var(--card-luminous-shadow-hover);
}

.final-cta-title {
  font-family: var(--font-luxury, 'Cormorant Garamond', serif);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--ff-text-primary);
  margin: 0 0 10px 0;
}

.final-cta-sub {
  font-size: 0.98rem;
  color: var(--ff-text-secondary);
  max-width: 500px;
  margin: 0 auto;
}

/* 11. FOOTER */
.landing-footer {
  border-top: 1px solid var(--card-luminous-border);
  padding: 40px 12px 24px;
  margin-top: 40px;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 30px;
}

.footer-brand-side {
  max-width: 320px;
}

.footer-brand-desc {
  font-size: 0.84rem;
  color: var(--ff-text-secondary);
  line-height: 1.5;
  margin: 8px 0 14px 0;
}

.footer-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 99px;
  background: var(--badge-bg);
  border: 1px solid var(--badge-border);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ff-text-primary);
}

.status-green-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.footer-links-side {
  display: flex;
  gap: 48px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ff-text-muted);
  margin-bottom: 4px;
}

.footer-link,
.footer-text-btn {
  font-size: 0.82rem;
  color: var(--ff-text-secondary);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  transition: color 0.18s ease;
}

.footer-link:hover,
.footer-text-btn:hover {
  color: var(--ff-text-primary);
}

.footer-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--stats-divider-color);
  font-size: 0.74rem;
  color: var(--ff-text-muted);
}

/* ==========================================================================
   THEME SPECIFIC OVERRIDES (DARK MODE vs LIGHT MODE)
   ========================================================================== */

/* DARK THEME (DRIBBBLE SHOT REFERENCE: JET BLACK & CINEMATIC WHITE CONE) */
html[data-theme="dark"],
body.dark {
  --landing-hero-bg: radial-gradient(circle at 75% 40%, rgba(30, 41, 59, 0.45) 0%, #07090e 70%);
  --landing-hero-border: rgba(255, 255, 255, 0.1);

  /* WHITE CINEMATIC CONE */
  --cone-core-color: rgba(255, 255, 255, 0.92);
  --cone-mid-color: rgba(255, 255, 255, 0.48);
  --cone-outer-color: rgba(186, 230, 253, 0.18);
  --cone-flare-color: rgba(255, 255, 255, 0.65);
  --cone-flare-accent: rgba(56, 189, 248, 0.35);

  --brand-beacon-color: #38bdf8;
  --badge-bg: rgba(56, 189, 248, 0.12);
  --badge-color: #38bdf8;
  --badge-border: rgba(56, 189, 248, 0.25);
  --nav-underline-color: #ffffff;

  --theme-toggle-bg: rgba(255, 255, 255, 0.08);
  --theme-toggle-border: rgba(255, 255, 255, 0.15);
  --theme-toggle-border-hover: rgba(255, 255, 255, 0.35);

  --launch-btn-bg: #ffffff;
  --launch-btn-color: #07090e;
  --launch-btn-border: #ffffff;
  --launch-btn-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
  --launch-btn-shadow-hover: 0 8px 30px rgba(255, 255, 255, 0.35);

  --kicker-pill-bg: rgba(56, 189, 248, 0.1);
  --kicker-pill-border: rgba(56, 189, 248, 0.25);
  --kicker-pill-color: #38bdf8;
  --hero-accent-color: #e0f2fe;

  --hero-btn-primary-bg: #ffffff;
  --hero-btn-primary-color: #07090e;
  --hero-btn-primary-border: #ffffff;
  --hero-btn-primary-shadow: 0 6px 25px rgba(255, 255, 255, 0.25);
  --hero-btn-primary-shadow-hover: 0 10px 35px rgba(255, 255, 255, 0.4);

  --hero-btn-sec-bg: rgba(255, 255, 255, 0.07);
  --hero-btn-sec-color: #ffffff;
  --hero-btn-sec-border: rgba(255, 255, 255, 0.18);
  --hero-btn-sec-border-hover: rgba(255, 255, 255, 0.4);

  --stats-divider-color: rgba(255, 255, 255, 0.1);
  --athlete-shadow-color: rgba(0, 0, 0, 0.8);

  --chip-bg: rgba(15, 23, 42, 0.78);
  --chip-border: rgba(255, 255, 255, 0.18);
  --chip-icon-bg: rgba(56, 189, 248, 0.15);
  --chip-icon-color: #38bdf8;

  --card-luminous-bg: rgba(15, 23, 42, 0.72);
  --card-luminous-border: rgba(255, 255, 255, 0.1);
  --card-luminous-border-hover: rgba(255, 255, 255, 0.25);
  --card-luminous-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  --card-luminous-shadow-hover: 0 16px 45px rgba(0, 0, 0, 0.6);
  --card-beam-glow: rgba(255, 255, 255, 0.15);
  --card-icon-bg: rgba(56, 189, 248, 0.14);
  --card-icon-color: #38bdf8;
  --card-action-color: #38bdf8;

  --vector-card-bg: rgba(11, 15, 25, 0.85);
  --tier-highlight-border: rgba(56, 189, 248, 0.5);
  --tier-highlight-shadow: rgba(56, 189, 248, 0.25);
}

html[data-theme="dark"] .sun-icon { display: block !important; }
html[data-theme="dark"] .moon-icon { display: none !important; }

/* LIGHT THEME (OUR MIND'S LUXURY RESORT & WELLNESS EDITORIAL) */
html[data-theme="light"],
body:not(.dark) {
  --landing-hero-bg: radial-gradient(circle at 75% 35%, rgba(220, 195, 145, 0.2) 0%, #ffffff 65%);
  --landing-hero-border: rgba(15, 23, 42, 0.08);

  /* SUNNY WARM CHAMPAGNE LIGHT CONE */
  --cone-core-color: rgba(255, 255, 255, 0.98);
  --cone-mid-color: rgba(220, 195, 145, 0.55);
  --cone-outer-color: rgba(212, 175, 55, 0.16);
  --cone-flare-color: rgba(255, 255, 255, 0.85);
  --cone-flare-accent: rgba(220, 195, 145, 0.4);

  --brand-beacon-color: #0d9488;
  --badge-bg: rgba(13, 148, 136, 0.08);
  --badge-color: #0d9488;
  --badge-border: rgba(13, 148, 136, 0.2);
  --nav-underline-color: #0f172a;

  --theme-toggle-bg: rgba(15, 23, 42, 0.04);
  --theme-toggle-border: rgba(15, 23, 42, 0.08);
  --theme-toggle-border-hover: rgba(15, 23, 42, 0.2);

  --launch-btn-bg: #0f172a;
  --launch-btn-color: #ffffff;
  --launch-btn-border: #0f172a;
  --launch-btn-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
  --launch-btn-shadow-hover: 0 8px 24px rgba(15, 23, 42, 0.2);

  --kicker-pill-bg: rgba(13, 148, 136, 0.08);
  --kicker-pill-border: rgba(13, 148, 136, 0.2);
  --kicker-pill-color: #0d9488;
  --hero-accent-color: #b09164;

  --hero-btn-primary-bg: #0f172a;
  --hero-btn-primary-color: #ffffff;
  --hero-btn-primary-border: #0f172a;
  --hero-btn-primary-shadow: 0 6px 20px rgba(15, 23, 42, 0.14);
  --hero-btn-primary-shadow-hover: 0 10px 28px rgba(15, 23, 42, 0.25);

  --hero-btn-sec-bg: rgba(255, 255, 255, 0.9);
  --hero-btn-sec-color: #0f172a;
  --hero-btn-sec-border: rgba(15, 23, 42, 0.12);
  --hero-btn-sec-border-hover: rgba(15, 23, 42, 0.3);

  --stats-divider-color: rgba(15, 23, 42, 0.08);
  --athlete-shadow-color: rgba(15, 23, 42, 0.15);

  --chip-bg: rgba(255, 255, 255, 0.92);
  --chip-border: rgba(15, 23, 42, 0.08);
  --chip-icon-bg: rgba(13, 148, 136, 0.1);
  --chip-icon-color: #0d9488;

  --card-luminous-bg: rgba(255, 255, 255, 0.94);
  --card-luminous-border: rgba(15, 23, 42, 0.07);
  --card-luminous-border-hover: rgba(15, 23, 42, 0.18);
  --card-luminous-shadow: 0 6px 25px rgba(15, 23, 42, 0.04);
  --card-luminous-shadow-hover: 0 14px 40px rgba(15, 23, 42, 0.08);
  --card-beam-glow: rgba(220, 195, 145, 0.25);
  --card-icon-bg: rgba(15, 23, 42, 0.04);
  --card-icon-color: #0f172a;
  --card-action-color: #0f172a;

  --vector-card-bg: #f8fafc;
  --tier-highlight-border: rgba(197, 168, 128, 0.6);
  --tier-highlight-shadow: rgba(197, 168, 128, 0.18);
}

html[data-theme="light"] .sun-icon { display: none !important; }
html[data-theme="light"] .moon-icon { display: block !important; }

/* 12. RESPONSIVE DESIGN */
@media (max-width: 900px) {
  .landing-hero-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .hero-right-col {
    min-height: 420px;
  }
  .athlete-hero-cutout {
    max-height: 440px;
  }
  .landing-feature-grid {
    grid-template-columns: 1fr;
  }
  .card-lead {
    grid-row: auto;
  }
  .landing-showcase-box {
    grid-template-columns: 1fr;
  }
  .pricing-tiers-grid {
    grid-template-columns: 1fr;
  }
  .landing-nav-links {
    display: none;
  }
}
`;

if (!css.includes('FITFUEL DRIBBBLE-INSPIRED CINEMATIC LANDING PAGE')) {
  css += '\n' + masterLandingCss;
} else {
  css = css.split('/* FITFUEL DRIBBBLE-INSPIRED CINEMATIC LANDING PAGE')[0] + masterLandingCss;
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully appended master landing styles to styles.css!');
