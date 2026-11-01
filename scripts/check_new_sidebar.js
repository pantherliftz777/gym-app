const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('<nav class="primary-nav"');
const eIdx = html.indexOf('</nav>', sIdx);
console.log(html.substring(sIdx, eIdx + 6));
