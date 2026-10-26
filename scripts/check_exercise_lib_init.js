const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const eIdx = js.indexOf('EXERCISES_LIBRARY');
console.log(js.slice(eIdx - 50, eIdx + 600));
