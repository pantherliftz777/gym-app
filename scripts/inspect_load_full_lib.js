const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function loadFullExerciseLibrary');
if (sIdx !== -1) {
  console.log(js.slice(sIdx - 10, sIdx + 1600));
} else {
  // Let's search for async function
  const aIdx = js.indexOf('async function loadFullExerciseLibrary');
  console.log(js.slice(aIdx - 10, aIdx + 1600));
}
