const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const tIdx = html.indexOf('id="view-today"');
const closeSectionIdx = html.indexOf('</section>', tIdx);
console.log('view-today tag length:', closeSectionIdx - tIdx);
console.log('Lines around closeSectionIdx:');
console.log(html.slice(closeSectionIdx - 100, closeSectionIdx + 200));
