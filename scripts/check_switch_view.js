const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const start = js.indexOf('function switchView(');
console.log(js.substring(start, start + 800));
