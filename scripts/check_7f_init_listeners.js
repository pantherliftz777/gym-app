const fs = require('fs');
const code = fs.readFileSync('public/fitfuel.js', 'utf8');

const startIdx = code.indexOf('function initChallengeSetupListeners()');
const endIdx = code.indexOf('initChallengeSetupListeners();', startIdx);

console.log('initChallengeSetupListeners bounds:', startIdx, endIdx);
console.log(code.substring(startIdx, endIdx + 32));
