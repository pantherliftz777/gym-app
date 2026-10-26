const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('Step 2: Intensity Selection');
console.log(js.slice(sIdx, sIdx + 1500));
