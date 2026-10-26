const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const startIdx = js.indexOf('<!-- Action Button Controls -->');
console.log(js.slice(startIdx, startIdx + 5000));
