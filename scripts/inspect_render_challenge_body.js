const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const startIdx = js.indexOf('function renderChallengeView()');
console.log('startIdx:', startIdx);
console.log(js.slice(startIdx, startIdx + 4500));
