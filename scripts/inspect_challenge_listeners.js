const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const startIdx = js.indexOf('setupChallengeEventListeners');
if (startIdx !== -1) {
  console.log(js.slice(startIdx, startIdx + 3000));
} else {
  // Let's search for generateChallengePlanBtn
  const gIdx = js.indexOf('generateChallengePlanBtn');
  console.log('generateChallengePlanBtn index:', gIdx);
  if (gIdx !== -1) {
    console.log(js.slice(gIdx - 200, gIdx + 1500));
  }
}
