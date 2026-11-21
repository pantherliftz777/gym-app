const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const luxuryLightCss = `
/* ==========================================================================
   FITFUEL LUXURY EDITORIAL LIGHT THEME & SKIPER UI / VENGEANCEUI FRONTEND
   - Aesthetic: Luxury Wellness & High-Performance Strength
   - Typography: Cormorant Garamond (Luxury Serif) + Light Plus Jakarta Sans
   - Skiper UI: skiper40 (CssLink) animated underline micro-interactions
   - VengeanceUI: Tactile spring button physics, subtle ambient elevation
   - Anti-Slop: Zero gradient text, intentional asymmetrical hierarchy, no neon glow
   ========================================================================== */

:root,
html[data-theme="light"],
body:not(.dark) {
  /* Luxury Alabaster & Chalk Light Palette */
  --ff-canvas-bg: #f8f9fa;
  --ff-canvas-gradient:
    radial-gradient(circle at 10% 12%, rgba(212, 175, 55, 0.05) 0%, transparent 45%),
    radial-gradient(circle at 90% 15%, rgba(13, 148, 136, 0.04) 0%, transparent 45%),
    linear-gradient(180deg, #ffffff 0%, #f8f9fb 50%, #f4f5f8 100%);

  /* Deep Luxury Slate & Obsidian Typography */
  --ff-text-primary: #0f172a;
  --ff-text-secondary: #475569;
  --ff-text-muted: #64748b;

  /* Refined Luxury Accents (Champagne Gold, Deep Forest Teal, Obsidian) */
  --ff-gold: #c5a880;
  --ff-gold-hover: #b09164;
  --ff-teal: #0d9488;
  --ff-emerald: #10b981;
  --ff-blue: #1e3a8a;
  --ff-accent: #0f172a;

  /* Frosted Alabaster Glass Surfaces */
  --ff-glass-bg: rgba(255, 255, 255, 0.88);
  --ff-glass-bg-hover: rgba(255, 255, 255, 0.96);
  --ff-glass-bg-elevated: #ffffff;
  --ff-glass-bg-subtle: rgba(248, 250, 252, 0.75);
  --ff-glass-border: rgba(15, 23, 42, 0.07);
  --ff-glass-border-subtle: rgba(15, 23, 42, 0.04);
  --ff-glass-border-highlight: rgba(197, 168, 128, 0.35);

  /* Subtle Luxury Shadows (Zero Harsh Neon Glow) */
  --ff-glass-shadow:
    0 4px 20px -2px rgba(15, 23, 42, 0.04),
    0 1px 3px rgba(15, 23, 42, 0.02);
  --ff-glass-shadow-lg:
    0 20px 45px -12px rgba(15, 23, 42, 0.08),
    0 1px 2px rgba(15, 23, 42, 0.03);

  /* Luxury Font Family Variables */
  --font-luxury: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --font-light-body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --glass-font-family: var(--font-light-body);
}

/* Base Body Styling */
body {
  background: var(--ff-canvas-bg) !important;
  color: var(--ff-text-primary) !important;
  font-family: var(--font-light-body) !important;
  font-weight: 300 !important;
  line-height: 1.6 !important;
  letter-spacing: -0.01em !important;
  -webkit-font-smoothing: antialiased;
}

/* Luxury Editorial Headings (Anti-Slop: Distinct Type Personality) */
h1, h2, h3, h4,
.brand-logo,
.landing-hero-headline,
.hero-title,
.sy-headline,
.section-title,
.view-title,
#dashImage3Greeting {
  font-family: var(--font-luxury) !important;
  font-weight: 600 !important;
  letter-spacing: -0.02em !important;
  color: var(--ff-text-primary) !important;
  text-transform: none !important;
}

h1, .landing-hero-headline, #dashImage3Greeting {
  font-size: 2.25rem !important;
  line-height: 1.15 !important;
}

h2, .view-title {
  font-size: 1.85rem !important;
  line-height: 1.25 !important;
}

h3 {
  font-size: 1.35rem !important;
  line-height: 1.3 !important;
}

/* Anti-Slop: Flat Solid Colors for Headings (NO gradient text) */
.sy-gradient-glow,
.gradient-mint-text,
.gradient-text,
h1, h2, h3, h4 {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: initial !important;
  color: var(--ff-text-primary) !important;
  text-shadow: none !important;
}

/* Light Font Body & Numerical Display */
p, span, div, li, input, select, textarea {
  font-family: var(--font-light-body);
  font-weight: 300;
}

strong, b, .font-semibold, .font-bold {
  font-weight: 600;
}

.metric-value, .stat-value, .hero-stat-number {
  font-family: var(--font-light-body) !important;
  font-weight: 300 !important;
  letter-spacing: -0.03em !important;
  color: var(--ff-text-primary) !important;
}

/* ==========================================================================
   SKIPER UI (skiper40 / CssLink) MICRO-INTERACTIONS
   Lightweight, CSS-only animated link underline transitions
   ========================================================================== */

.nav-link,
.hub-subnav-btn,
.skiper-link {
  position: relative !important;
  text-decoration: none !important;
  overflow: hidden !important;
}

/* Skiper 40 Link001: Left-to-right animated reveal */
.nav-link::after,
.hub-subnav-btn::after {
  content: '' !important;
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 2px !important;
  background-color: var(--ff-accent, #0f172a) !important;
  transform: scaleX(0) !important;
  transform-origin: bottom right !important;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.nav-link:hover::after,
.hub-subnav-btn:hover::after,
.nav-link.selected::after,
.hub-subnav-btn.active::after {
  transform: scaleX(1) !important;
  transform-origin: bottom left !important;
}

.nav-link.selected,
.hub-subnav-btn.active {
  background: rgba(15, 23, 42, 0.04) !important;
  color: var(--ff-text-primary) !important;
  font-weight: 500 !important;
}

/* ==========================================================================
   VENGEANCEUI TACTILE SPRING BUTTONS & CLEAN CARDS
   ========================================================================== */

button,
.btn,
.solid-button,
.outline-button,
.date-pill-btn,
.icon-button {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.18s ease !important;
  cursor: pointer !important;
}

button:hover,
.btn:hover,
.solid-button:hover,
.outline-button:hover,
.date-pill-btn:hover {
  transform: translateY(-1.5px) !important;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08) !important;
}

button:active,
.btn:active,
.solid-button:active,
.outline-button:active,
.date-pill-btn:active {
  transform: scale(0.97) !important;
}

/* Luxury Solid Buttons: High-Contrast Obsidian */
.solid-button,
#dashImage3Greeting + div button,
.date-pill-btn.active,
#closedBetaAdminShortcutBtn {
  background: #0f172a !important;
  color: #ffffff !important;
  border: 1px solid #0f172a !important;
  font-weight: 500 !important;
  letter-spacing: 0.02em !important;
}

/* Clean Panels and Cards (Zero Neon Glow, Soft Ambient Elevation) */
.panel,
.card,
.metric-card-v2,
.stat-card,
.glass-card,
.sidebar,
.topbar {
  background: var(--ff-glass-bg) !important;
  border: 1px solid var(--ff-glass-border) !important;
  box-shadow: var(--ff-glass-shadow) !important;
  border-radius: 14px !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
}

/* Subtle Specular Highlight for Cards */
.metric-card-v2:hover,
.panel:hover {
  border-color: rgba(15, 23, 42, 0.14) !important;
  box-shadow: var(--ff-glass-shadow-lg) !important;
}

/* Sidebar Luxury Styling */
.sidebar {
  background: #ffffff !important;
  border-right: 1px solid rgba(15, 23, 42, 0.06) !important;
}

.sidebar .brand {
  font-family: var(--font-luxury) !important;
  font-size: 1.45rem !important;
  letter-spacing: 0.02em !important;
  color: #0f172a !important;
}

/* Mobile Bottom Navigation in Luxury Light */
.mobile-bottom-nav {
  background: rgba(255, 255, 255, 0.94) !important;
  border-top: 1px solid rgba(15, 23, 42, 0.08) !important;
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.05) !important;
}

.mobile-nav-btn {
  color: #64748b !important;
}

.mobile-nav-btn.active {
  color: #0f172a !important;
  font-weight: 600 !important;
}
`;

// Append or update the luxury light theme block
const marker = '/* FITFUEL LUXURY EDITORIAL LIGHT THEME & SKIPER UI / VENGEANCEUI FRONTEND */';
if (css.includes(marker)) {
  css = css.split(marker)[0] + marker + '\n' + luxuryLightCss;
} else {
  css += '\n' + marker + '\n' + luxuryLightCss;
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Luxury Light Theme with Skiper UI & VengeanceUI applied successfully!');
