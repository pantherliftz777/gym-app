const fs = require('fs');
const content = fs.readFileSync('public/fitfuel.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderAiCoachView') || l.includes("'ai-coach'")) {
    console.log((i + 1) + ': ' + l.trim().slice(0, 100));
  }
});
