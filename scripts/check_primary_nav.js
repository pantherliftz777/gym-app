const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const lines = js.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('primary-nav')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
