const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('<div class="stronger-you-hero-card">');
const eMarker = '<!-- IMAGE 3: TOP GREETING & DATE FILTER BAR -->';
const eIdx = html.indexOf(eMarker);

console.log('sIdx:', sIdx);
console.log('eIdx:', eIdx);
console.log('Length of stronger-you-hero-card block:', eIdx - sIdx);
console.log('--- Last 200 chars before eMarker ---');
console.log(html.substring(eIdx - 200, eIdx));
