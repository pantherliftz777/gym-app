const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const dIdx = js.indexOf('/* ================= BULLETPROOF GLOBAL EVENT DELEGATION');
console.log(js.slice(dIdx - 300, dIdx + 50));
