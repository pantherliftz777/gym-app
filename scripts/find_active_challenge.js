const fs = require('fs');
const code = fs.readFileSync('public/fitfuel.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('activeChallengePlan', idx)) !== -1) {
  console.log('line', code.substring(0, idx).split('\n').length, code.substring(idx - 10, idx + 40));
  idx += 'activeChallengePlan'.length;
}
