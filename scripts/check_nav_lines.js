const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const lines = js.split('\n');

console.log('--- Lines 1545-1570 ---');
console.log(lines.slice(1545, 1570).join('\n'));

console.log('--- Lines 9665-9685 ---');
console.log(lines.slice(9665, 9685).join('\n'));
