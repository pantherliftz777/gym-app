const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const mIdx = js.indexOf('function openModal(');
console.log(js.slice(mIdx - 50, mIdx + 700));
