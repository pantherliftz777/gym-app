const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace('<!-- TOP BAR INSIDE HERO -->', '<!-- TOP BAR INSIDE HERO -->\n          <div class="sy-hero-top-bar">');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Added <div class="sy-hero-top-bar"> to index.html');
