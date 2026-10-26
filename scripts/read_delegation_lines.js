const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const lines = js.split('\n');
console.log(lines.slice(10200, 10310).join('\n'));
