const fs = require('fs');
const code = fs.readFileSync('public/fitfuel.js', 'utf8');

['chTimeOptionsList', 'chIntensityOptionsList', 'durationOptionsList', 'proceedToDurationBtn', 'generateChallengePlanBtn'].forEach(k => {
  let idx = 0;
  let matches = [];
  while ((idx = code.indexOf(k, idx)) !== -1) {
    matches.push(code.substring(0, idx).split('\n').length);
    idx += k.length;
  }
  console.log(k, 'found at lines:', matches);
});
