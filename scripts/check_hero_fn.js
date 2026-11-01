const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const lines = js.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('syStartJourneyBtn') || l.includes('syAthleteHeroImg') || l.includes('initInteractiveHeroAndAppButtons')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
