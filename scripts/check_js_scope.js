const fs = require('fs');
const lines = fs.readFileSync('public/fitfuel.js', 'utf8').split('\n');

console.log('Top 15 lines:');
console.log(lines.slice(0, 15).join('\n'));
console.log('Bottom 20 lines:');
console.log(lines.slice(lines.length - 20).join('\n'));
