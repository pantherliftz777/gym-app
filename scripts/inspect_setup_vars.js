const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('setupMotive =');
console.log(js.slice(sIdx - 150, sIdx + 500));
