const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function renderExerciseLibrary');
if (sIdx !== -1) {
  console.log(js.substring(sIdx, sIdx + 2000));
} else {
  console.log('renderExerciseLibrary not found');
}
