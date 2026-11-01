const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const matches = [];
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('<header') || l.includes('class="topbar"') || l.includes('class="main-header"')) {
    matches.push((idx + 1) + ': ' + l.trim());
  }
});
console.log(matches.join('\n'));
