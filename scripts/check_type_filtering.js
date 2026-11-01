const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('if (typeof selectedWorkoutTypes !== \'undefined\'');
console.log(js.substring(sIdx, sIdx + 2000));
