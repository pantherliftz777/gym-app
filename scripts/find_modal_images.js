const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const mStart = html.indexOf('id="bodyAnalysisModal"');
const mContent = html.substring(mStart, mStart + 4000);
const imgMatches = [...mContent.matchAll(/<img[^>]*>/gi)];
console.log('Images in bodyAnalysisModal:');
imgMatches.forEach(m => console.log(m[0]));
