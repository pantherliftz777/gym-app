const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const idx = js.indexOf('function executeBodyTransformationAnalysis(');
console.log(js.substring(idx, idx + 1800));
