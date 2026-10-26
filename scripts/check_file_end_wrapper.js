const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const dIdx = js.indexOf('/* ================= BULLETPROOF GLOBAL EVENT DELEGATION');
console.log('Code right before delegation block:');
console.log(js.slice(dIdx - 200, dIdx));
