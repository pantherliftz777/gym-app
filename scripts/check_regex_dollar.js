const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const regex = /(?<!\$)\$\('\.view'\)\.forEach/g;
console.log('Single dollar matches:', [...js.matchAll(regex)].length);
