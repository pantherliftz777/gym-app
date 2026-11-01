const fs = require('fs');
const content = fs.readFileSync('scripts/index_7f516b9_utf8.html', 'utf8');

const asideStart = content.indexOf('<aside class="sidebar"');
const asideEnd = content.indexOf('</aside>', asideStart);
console.log('--- SIDEBAR IN 7f516b9 ---');
console.log(content.substring(asideStart, asideEnd + 10));
