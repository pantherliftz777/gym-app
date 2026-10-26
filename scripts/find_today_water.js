const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const tIdx = html.indexOf('id="view-today"');
const endTodayIdx = html.indexOf('</section>', tIdx);
const todayHtml = html.slice(tIdx, endTodayIdx);

const matches = [];
const lines = todayHtml.split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('water') || l.includes('adjustWaterBtn') || l.includes('Hydration')) {
    matches.push({ line: i + 1, text: l.trim().slice(0, 100) });
  }
});
console.log('Water references in Today section:', matches.slice(0, 15));
