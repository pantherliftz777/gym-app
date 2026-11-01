const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const syMatches = js.match(/sy[A-Za-z0-9]+/g) || [];
console.log('sy matches in fitfuel.js:', Array.from(new Set(syMatches)));
