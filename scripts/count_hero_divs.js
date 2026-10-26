const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('class="stronger-you-hero-card"');
const eIdx = html.indexOf('class="dash-image3-header-bar"');
const heroSlice = html.slice(sIdx, eIdx);

const divs = heroSlice.match(/<\/?div[^>]*>/g) || [];
let count = 0;
divs.forEach((d, i) => {
  if (d.startsWith('</')) count--;
  else count++;
  console.log(`${i+1}: count=${count} | ${d.slice(0, 50)}`);
});
console.log('Final div count after hero section:', count);
