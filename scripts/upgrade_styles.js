const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Remove purple-to-blue gradient text
css = css.replace(
  /\.sy-gradient-glow\s*\{[^}]+\}/,
  `.sy-gradient-glow {
  color: var(--ff-text-primary, #ffffff);
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: initial;
  text-shadow: none;
}`
);

// 2. Remove gradient mint text
css = css.replace(
  /\.gradient-mint-text\s*\{[^}]+\}/,
  `.gradient-mint-text {
  color: #10B981;
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: initial;
}`
);

// 3. Add Anti-Slop, Typography & VengeanceUI micro-interactions
const antiSlopStyles = `
/* ==========================================================================
   FITFUEL ANTI-SLOP & VENGEANCEUI ENHANCEMENTS
   Strictly adheres to Anti-AI design heuristics:
   1. Flat solid high-conviction brand typography (no gradient text)
   2. Distinct heading font pairing (Syne + Plus Jakarta Sans)
   3. Intentional hierarchy & varying card proportions
   4. Smooth VengeanceUI spring eases (cubic-bezier)
   5. Touch-optimized 44px+ mobile tap targets
   ========================================================================== */

:root {
  --font-heading: 'Syne', 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
  --ff-ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ff-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Distinct athletic heading typography */
h1, h2, h3, h4,
.brand-logo,
.landing-hero-headline,
.hero-title,
.sy-headline,
.hero-stat-number,
.stat-value,
.metric-value,
.section-title {
  font-family: var(--font-heading) !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
}

/* VengeanceUI-style spring micro-interactions on interactive elements */
button,
.btn,
.solid-button,
.outline-button,
.date-pill-btn,
.metric-card-v2,
.nav-link,
.hub-subnav-btn,
.mobile-nav-btn {
  transition: transform 0.22s var(--ff-ease-spring),
              box-shadow 0.22s var(--ff-ease-spring),
              background-color 0.18s ease,
              border-color 0.18s ease,
              color 0.18s ease !important;
}

button:hover,
.btn:hover,
.solid-button:hover,
.outline-button:hover,
.date-pill-btn:hover {
  transform: translateY(-1.5px);
}

button:active,
.btn:active,
.solid-button:active,
.outline-button:active,
.date-pill-btn:active,
.mobile-nav-btn:active {
  transform: scale(0.97) !important;
}

/* Eliminate unprompted oversaturated neon glows */
.panel, .card, .metric-card-v2, .stat-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18) !important;
}

/* Dynamic visual hierarchy: lead card distinction */
.metric-card-v2:first-child,
.dash-metrics-grid-v2 > .metric-card-v2:first-child {
  border-color: rgba(56, 189, 248, 0.35) !important;
  background: rgba(15, 23, 42, 0.75) !important;
}

/* Mobile tap target compliance (minimum 44x44px touch targets) */
@media (max-width: 768px) {
  .mobile-nav-btn {
    min-width: 48px !important;
    min-height: 48px !important;
  }
  .icon-button {
    min-width: 44px !important;
    min-height: 44px !important;
  }
  .date-pill-btn {
    min-height: 36px !important;
    padding: 8px 16px !important;
  }
}
`;

if (!css.includes('FITFUEL ANTI-SLOP & VENGEANCEUI ENHANCEMENTS')) {
  css += '\n' + antiSlopStyles;
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully upgraded styles.css with Anti-Slop & VengeanceUI rules!');
