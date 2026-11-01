const { execSync } = require('child_process');
const fs = require('fs');

const html7f = execSync('git show 7f516b9:public/index.html', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
fs.writeFileSync('scripts/index_7f516b9_utf8.html', html7f, 'utf8');

const vTodayIdx = html7f.indexOf('id="view-today"');
console.log('--- VIEW-TODAY IN 7f516b9 ---');
console.log(html7f.substring(vTodayIdx, vTodayIdx + 1500));
