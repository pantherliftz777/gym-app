const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const mStart = html.indexOf('id="bodyAnalysisModal"');
const mEnd = html.indexOf('</div>\n</div>\n', mStart);
const mContent = html.substring(mStart, mStart + 3500);

console.log(mContent);
