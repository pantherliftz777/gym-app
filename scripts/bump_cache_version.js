const fs = require('fs');

// 1. Update public/sw.js
let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/fitfuel-cache-v[0-9\-]+/g, 'fitfuel-cache-v7-4');
fs.writeFileSync('public/sw.js', sw, 'utf8');
console.log('sw.js updated with cache v7-4');

// 2. Update public/index.html
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(/styles\.css\?v=[0-9\.]+/g, 'styles.css?v=7.4.0');
html = html.replace(/fitfuel\.js\?v=[0-9\.]+/g, 'fitfuel.js?v=7.4.0');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html updated with asset versions v=7.4.0');
