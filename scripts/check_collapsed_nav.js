const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

const lines = css.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('.sidebar-collapsed') && (l.includes('nav') || l.includes('link') || l.includes('label'))) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
