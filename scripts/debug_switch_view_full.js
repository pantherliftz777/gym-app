const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function switchView(viewName)');
console.log(js.slice(sIdx, sIdx + 1200));
