const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('BULLETPROOF GLOBAL EVENT DELEGATION');
console.log(js.slice(sIdx, sIdx + 1200));
