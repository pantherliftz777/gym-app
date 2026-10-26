const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const lines = js.split('\n');
console.log(lines.slice(2310, 2340).join('\n'));
