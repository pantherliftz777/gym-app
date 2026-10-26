const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('let setupMotive');
console.log('setupMotive index:', sIdx);
console.log(js.slice(Math.max(0, sIdx - 300), sIdx + 200));
