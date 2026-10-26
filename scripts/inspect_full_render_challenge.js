const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const startIdx = js.indexOf('function renderChallengeView()');
const endIdx = js.indexOf('function generateAIChallengePlan');
console.log('renderChallengeView length:', endIdx - startIdx);
console.log(js.slice(startIdx, Math.min(startIdx + 5000, endIdx)));
