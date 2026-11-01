const fs = require('fs');

let js = fs.readFileSync('public/fitfuel.js', 'utf8');

const target = "if (viewName === 'today') { renderDashboard(); renderDailyTip(); if (typeof initInteractiveHeroAndAppButtons === 'function') initInteractiveHeroAndAppButtons(); }";
const replacement = `if (viewName === 'today') {
    renderDashboard();
    renderDailyTip();
    if (typeof initFitFuelHeroCarousel === 'function') initFitFuelHeroCarousel();
    if (window.fitfuelHeroCarousel) window.fitfuelHeroCarousel.startAutoplay();
  } else {
    if (window.fitfuelHeroCarousel) window.fitfuelHeroCarousel.stopAutoplay();
  }`.replace(/\n/g, '\r\n');

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync('public/fitfuel.js', js, 'utf8');
  console.log('✔ Updated viewName === today handling in public/fitfuel.js');
} else {
  console.error('Target not found in fitfuel.js');
}
