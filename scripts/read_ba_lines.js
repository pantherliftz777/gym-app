const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const lines = js.split('\n');
console.log('--- Around 2321 ---');
console.log(lines.slice(2315, 2335).join('\n'));
console.log('--- Around 11639 ---');
console.log(lines.slice(11630, 11655).join('\n'));
