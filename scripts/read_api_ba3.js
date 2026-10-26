const fs = require('fs');
const js = fs.readFileSync('public/api.js', 'utf8');

const idx = js.indexOf('analyze4DBodyComposition');
console.log(js.substring(idx + 1500, idx + 3000));
