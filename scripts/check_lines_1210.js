const fs = require('fs');
const lines = fs.readFileSync('public/fitfuel.js', 'utf8').split('\n');

console.log(lines.slice(1210, 1260).join('\n'));
