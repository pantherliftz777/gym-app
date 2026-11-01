const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

const lines = css.split('\n');
const syLines = [];
lines.forEach((l, idx) => {
  if (l.includes('.sy-') || l.includes('stronger-you')) {
    syLines.push((idx + 1) + ': ' + l.trim());
  }
});
console.log('Total sy CSS lines:', syLines.length);
console.log(syLines.slice(0, 30).join('\n'));
