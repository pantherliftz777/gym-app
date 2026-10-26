const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const pIdx = html.indexOf('class="page-content"');
console.log(html.slice(pIdx - 200, pIdx + 200));
