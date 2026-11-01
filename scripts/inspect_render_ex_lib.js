const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function renderExerciseLibrary()');
console.log(js.substring(sIdx, sIdx + 1200));
