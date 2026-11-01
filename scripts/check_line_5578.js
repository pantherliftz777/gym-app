const fs = require('fs');
const lines = fs.readFileSync('public/fitfuel.js', 'utf8').split('\n');

console.log(lines.slice(5570, 5590).join('\n'));
