const fs = require('fs');
const path = require('path');

// 1. Update sw.js
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const CACHE_NAME = 'fitfuel-cache-[^']+';/, "const CACHE_NAME = 'fitfuel-cache-v9.0.0-production';");

if (!sw.includes("'/dashboard.html'")) {
  sw = sw.replace("'/styles.css',", "'/dashboard.html',\n  '/styles.css',\n  '/dashboard-styles.css',");
}
if (!sw.includes("'/modules/landing-controller.js'")) {
  sw = sw.replace("'/modules/hero-carousel.js',", "'/modules/hero-carousel.js',\n  '/modules/landing-controller.js',");
}
fs.writeFileSync(swPath, sw, 'utf8');
console.log('sw.js successfully updated.');

// 2. Update dashboard.html
const dashHtmlPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let dashHtml = fs.readFileSync(dashHtmlPath, 'utf8');

// Ensure dashboard-styles.css is linked in head
if (!dashHtml.includes('dashboard-styles.css')) {
  dashHtml = dashHtml.replace(
    '<link rel="stylesheet" href="styles.css?v=8.1.0">',
    '<link rel="stylesheet" href="/dashboard-styles.css?v=9.0.0">\n  <link rel="stylesheet" href="/styles.css?v=9.0.0">'
  );
}

// Fix the unsized SVG logo icon in view-landing line ~352
dashHtml = dashHtml.replace(
  '<svg class="fitusion-logo-icon" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">',
  '<svg class="fitusion-logo-icon" width="28" height="28" style="width:28px;height:28px;max-width:28px;max-height:28px;flex:none;" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">'
);

// Fix brand name in landing view header if it says FiTusion
dashHtml = dashHtml.replace(
  '<span class="fitusion-brand-text">Fi<span class="fitusion-brand-accent">Tusion</span></span>',
  '<span class="fitusion-brand-text">Fit<span class="fitusion-brand-accent">Fuel</span></span>'
);

// Ensure #view-today is active by default
dashHtml = dashHtml.replace(
  '<section class="view" id="view-today">',
  '<section class="view active" id="view-today">'
);

// Also check if view-landing had active
dashHtml = dashHtml.replace(
  'section class="view fitusion-landing-container active"',
  'section class="view fitusion-landing-container"'
);

fs.writeFileSync(dashHtmlPath, dashHtml, 'utf8');
console.log('dashboard.html successfully updated.');
