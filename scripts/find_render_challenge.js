const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const startIdx = js.indexOf('function renderChallengeView');
if (startIdx !== -1) {
  console.log(js.slice(startIdx, startIdx + 3000));
} else {
  console.log('renderChallengeView not found');
}
