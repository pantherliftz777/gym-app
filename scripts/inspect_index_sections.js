const fs = require('fs');
const html = fs.readFileSync('gym-app/public/index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('<section') || l.includes('site-header') || l.includes('site-footer')) {
    console.log(i + 1, l.trim().slice(0, 100));
  }
});
