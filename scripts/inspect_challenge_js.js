const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Find occurrences of challenge-related functions and elements
const matches = [];
const lines = js.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('createChallengeBtn') || line.includes('openChallengeModal') || line.includes('renderChallenge') || line.includes('generateChallengePlanBtn') || line.includes('activeChallengePlan') || line.includes('openModal(')) {
    matches.push({ line: idx + 1, text: line.trim().slice(0, 120) });
  }
});
console.log('Found matches:', matches.length);
console.log(JSON.stringify(matches.slice(0, 30), null, 2));
