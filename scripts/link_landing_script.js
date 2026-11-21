const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../public/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const target = '<script src="modules/hero-carousel.js?v=8.1.0"></script>';
const replacement = '<script src="modules/hero-carousel.js?v=8.1.0"></script>\n<script src="modules/landing-controller.js?v=8.2.0"></script>';

if (!html.includes('modules/landing-controller.js')) {
  html = html.replace(target, replacement);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('landing-controller.js linked in index.html!');
} else {
  console.log('Already linked');
}
