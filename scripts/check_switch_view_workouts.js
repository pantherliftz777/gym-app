const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('if (viewName === \'workouts\') renderWorkouts();');
console.log('Found line at:', sIdx);
if (sIdx !== -1) {
  console.log(js.substring(sIdx - 100, sIdx + 200));
}
