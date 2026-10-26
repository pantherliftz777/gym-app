const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

console.log(js.slice(0, 1000));
