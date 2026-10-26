const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="slot-front"');
console.log(html.substring(sIdx - 100, sIdx + 1200));
