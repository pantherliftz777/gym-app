const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('async function loadFullExerciseLibrary');
console.log(js.slice(sIdx + 3000, sIdx + 4500));
