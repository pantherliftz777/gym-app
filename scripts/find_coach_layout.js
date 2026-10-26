const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const tIdx = html.indexOf('id="view-today"');
console.log('view-today start:', tIdx);
const endTodayIdx = html.indexOf('</section>', tIdx);
console.log('view-today end:', endTodayIdx);

const cIdx = html.indexOf('id="view-ai-coach"');
console.log('view-ai-coach start:', cIdx);
console.log('Context before view-ai-coach:');
console.log(html.slice(cIdx - 200, cIdx));
