const fs = require('fs');
const code = fs.readFileSync('public/fitfuel.js', 'utf8');

const start = code.indexOf('function buildDayByDayRoutines');
console.log(code.substring(start, start + 4000));
