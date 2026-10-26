const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const mStart = html.indexOf('id="bodyAnalysisModal"');
const mEnd = html.indexOf('<!-- ================= EDIT PROFILE MODAL', mStart);
const mContent = html.substring(mStart + 2500, mEnd);

console.log(mContent);
