const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

console.log(js.slice(335500, 337500));
