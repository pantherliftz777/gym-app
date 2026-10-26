const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const idx = js.indexOf('#waterCups');
console.log(js.substring(idx - 100, idx + 1200));
