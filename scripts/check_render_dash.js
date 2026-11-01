const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const lines = js.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('renderDashboard(') || l.includes('function renderDashboard')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
