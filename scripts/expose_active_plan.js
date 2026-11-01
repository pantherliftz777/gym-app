const fs = require('fs');
let code = fs.readFileSync('public/fitfuel.js', 'utf8');

code = code.replace(
  "activeChallengePlan = newChallenge;\n  store.set('activeChallengePlan', activeChallengePlan);",
  "activeChallengePlan = newChallenge;\n  window.activeChallengePlan = newChallenge;\n  store.set('activeChallengePlan', activeChallengePlan);"
);

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
console.log('Exposed window.activeChallengePlan in fitfuel.js');
