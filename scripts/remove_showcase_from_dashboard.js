const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let html = fs.readFileSync(dashPath, 'utf8');

// 1. Remove Showcase button from primary-nav
const showcaseBtnRegex = /<!-- 0\. SHOWCASE \/ LANDING -->\s*<button class="nav-link selected" data-view="landing"[\s\S]*?<\/button>\s*/;
if (showcaseBtnRegex.test(html)) {
  html = html.replace(showcaseBtnRegex, '');
  console.log('Removed Showcase button from navigation');
} else {
  // Fallback search
  const btnStart = html.indexOf('data-view="landing"');
  if (btnStart !== -1) {
    const opening = html.lastIndexOf('<button', btnStart);
    const closing = html.indexOf('</button>', btnStart) + '</button>'.length;
    html = html.slice(0, opening) + html.slice(closing);
    console.log('Removed Showcase button via fallback');
  }
}

// Ensure Overview (today) has selected class
html = html.replace(
  '<button class="nav-link" data-view="today" data-section="overview" title="Overview">',
  '<button class="nav-link selected" data-view="today" data-section="overview" title="Overview">'
);

// 2. Remove the duplicate #view-landing section completely
const viewLandingStart = html.indexOf('<!-- ================= VIEW 0: CINEMATIC DRIBBBLE LANDING SHOWCASE ================= -->');
const viewTodayStart = html.indexOf('<!-- ================= VIEW 1: TODAY ================= -->');

if (viewLandingStart !== -1 && viewTodayStart !== -1 && viewTodayStart > viewLandingStart) {
  html = html.slice(0, viewLandingStart) + html.slice(viewTodayStart);
  console.log('Removed duplicate #view-landing section from dashboard.html');
} else {
  console.log('view-landing bounds not matched:', viewLandingStart, viewTodayStart);
}

fs.writeFileSync(dashPath, html, 'utf8');
console.log('dashboard.html saved.');
