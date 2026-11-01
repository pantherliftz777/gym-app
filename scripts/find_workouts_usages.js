const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const lines = js.split('\n');
lines.forEach((l, idx) => {
  if (l.includes("switchView('workouts')") || l.includes('view-workouts') || l.includes('data-view="workouts"') || l.includes('data-hubview="workouts"')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
