const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const idx = js.indexOf("fetch('/api/body-scan/analyze'");
console.log(js.substring(idx, idx + 1500));
