const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-today"');
const eIdx = html.indexOf('</section>', sIdx);
const todayHtml = html.substring(sIdx, eIdx);

// Find top-level class names or comments inside view-today
const lines = todayHtml.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('class=') && (l.startsWith('        <') || l.startsWith('      <'))) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
