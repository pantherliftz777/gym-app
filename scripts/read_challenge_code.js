const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const lines = js.split('\n');
console.log('=== Lines 6220 - 6300 ===');
console.log(lines.slice(6220, 6300).join('\n'));

console.log('=== Lines 11970 - 12060 ===');
console.log(lines.slice(11970, 12060).join('\n'));
