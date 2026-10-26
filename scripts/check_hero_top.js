const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('class="stronger-you-hero-card"');
console.log(html.slice(sIdx - 100, sIdx + 500));
