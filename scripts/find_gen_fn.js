const fs = require('fs');
const code = fs.readFileSync('public/fitfuel.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('generateAIChallengePlan', idx)) !== -1) {
  const line = code.substring(0, idx).split('\n').length;
  console.log('generateAIChallengePlan at line', line, code.substring(idx - 20, idx + 40));
  idx += 'generateAIChallengePlan'.length;
}
