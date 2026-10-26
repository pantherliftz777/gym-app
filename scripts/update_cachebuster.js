const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace('fitfuel.js?v=5.7.0', 'fitfuel.js?v=5.8.0');
html = html.replace('styles.css?v=5.7.0', 'styles.css?v=5.8.0');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Updated cachebuster version to 5.8.0 in index.html');
