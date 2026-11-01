const fs = require('fs');
const content = fs.readFileSync('scripts/index_7f516b9_utf8.html', 'utf8');

const vTodayStart = content.indexOf('id="view-today"');
const vTodayEnd = content.indexOf('id="view-ai-coach"', vTodayStart);
console.log('--- ENTIRE VIEW-TODAY IN 7f516b9 ---');
console.log(content.substring(vTodayStart, vTodayEnd));
