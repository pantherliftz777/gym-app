const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-exercise-library"');
const eIdx = html.indexOf('</section>', sIdx);
console.log('--- view-exercise-library full content ---');
console.log(html.substring(sIdx, eIdx + 10));
