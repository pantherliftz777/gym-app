const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Insert <div class="sy-hero-top-bar"> right after <!-- TOP BAR INSIDE HERO -->
html = html.replace('<!-- TOP BAR INSIDE HERO -->', '<!-- TOP BAR INSIDE HERO -->\n          <div class="sy-hero-top-bar">');

const sIdx = html.indexOf('class="stronger-you-hero-card"');
const eIdx = html.indexOf('class="dash-image3-header-bar"');
const heroSlice = html.slice(sIdx, eIdx);

const divs = heroSlice.match(/<\/?div[^>]*>/g) || [];
let count = 0;
divs.forEach((d, i) => {
  if (d.startsWith('</')) count--;
  else count++;
});
console.log('Final div count after hero section with top-bar added:', count);
