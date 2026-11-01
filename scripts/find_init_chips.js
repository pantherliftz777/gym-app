const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function initWorkoutTypeChips');
if (sIdx !== -1) {
  console.log(js.substring(sIdx, sIdx + 1500));
} else {
  console.log('initWorkoutTypeChips not found');
}
