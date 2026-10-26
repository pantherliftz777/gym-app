const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('let setupMotive =');
console.log(js.slice(sIdx - 100, sIdx + 400));
