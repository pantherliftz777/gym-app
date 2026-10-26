const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

console.log(JSON.stringify(js.slice(78610, 78670)));
