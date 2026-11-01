const fs = require('fs');
const sw = fs.readFileSync('public/sw.js', 'utf8');

const sIdx = sw.indexOf('STATIC_ASSETS');
console.log(sw.substring(sIdx, sIdx + 600));
