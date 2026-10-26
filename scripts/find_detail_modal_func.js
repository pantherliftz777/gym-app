const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function openExerciseDetailModal');
console.log('openExerciseDetailModal at:', sIdx);
if (sIdx !== -1) {
  console.log(js.slice(sIdx, sIdx + 500));
}
