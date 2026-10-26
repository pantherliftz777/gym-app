const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const mIdx = html.indexOf('class="main-content"');
console.log('main-content at:', mIdx);
const pIdx = html.indexOf('class="page-content"');
console.log('page-content at:', pIdx);
console.log('main-content context:', html.slice(mIdx - 50, mIdx + 200));
