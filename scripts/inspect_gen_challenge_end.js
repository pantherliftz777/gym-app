const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('switchView(\'challenge\');');
console.log(js.slice(sIdx, sIdx + 500));
