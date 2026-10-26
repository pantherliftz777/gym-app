const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('class="stronger-you-hero-card"');
console.log('stronger-you-hero-card at:', sIdx);
console.log(html.slice(sIdx + 30, sIdx + 1500));
