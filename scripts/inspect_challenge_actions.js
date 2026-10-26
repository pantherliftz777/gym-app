const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

console.log(js.slice(331500, 333500));
