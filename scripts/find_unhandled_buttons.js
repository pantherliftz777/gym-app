const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('date-pill-btn') || l.includes('Imperial')) {
    console.log(`Line ${i}:`, l.trim());
  }
});
