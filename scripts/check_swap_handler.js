const fs = require('fs');
const code = fs.readFileSync('public/fitfuel.js', 'utf8');

const start = code.indexOf('swap-ex-trigger');
console.log(code.substring(start - 200, start + 2500));
