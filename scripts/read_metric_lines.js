const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const lines = js.split('\n');
lines.forEach((l, i) => {
  if (l.includes('metricV2CalVal')) {
    console.log(`Line ${i}:`, l.trim());
  }
});
