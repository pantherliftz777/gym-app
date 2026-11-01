const fs = require('fs');
const code = fs.readFileSync('public/fitfuel.js', 'utf8');

const start = code.indexOf('TODAY\'S SCHEDULED ROUTINE');
console.log(code.substring(start - 200, start + 3500));
