const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const matches = [];
let re = /function renderExerciseLibrary\s*\(/g;
let m;
while ((m = re.exec(js)) !== null) {
  matches.push(m.index);
}
console.log('renderExerciseLibrary occurrences at indices:', matches);
