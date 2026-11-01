const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(/styles\.css\?v=[^\"]+/g, 'styles.css?v=7.8.0');
html = html.replace(/fitfuel\.js\?v=[^\"]+/g, 'fitfuel.js?v=7.8.0');
html = html.replace(/hero-carousel\.js\?v=[^\"]+/g, 'hero-carousel.js?v=7.8.0');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✔ Updated index.html version queries to 7.8.0');
