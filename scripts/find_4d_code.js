const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const idx = js.indexOf('loadSample4DPhotosBtn');
console.log(js.substring(idx - 100, idx + 1200));
