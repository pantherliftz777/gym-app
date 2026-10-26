const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const vIdx = html.indexOf('class="view');
console.log('Parent of view:');
console.log(html.slice(Math.max(0, vIdx - 200), vIdx + 100));
