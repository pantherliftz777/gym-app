const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const lines = js.split('\n');

console.log(lines.slice(9365, 9440).join('\n'));
