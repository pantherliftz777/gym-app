const fs = require('fs');
const lines = fs.readFileSync('public/fitfuel.js', 'utf8').split('\n');

console.log(lines.slice(5670, 5700).join('\n'));
