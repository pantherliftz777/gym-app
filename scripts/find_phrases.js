const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n').slice(277, 1445);
lines.forEach((l, i) => {
  const lineNo = i + 278;
  const lower = l.toLowerCase();
  if (lower.includes('fuel') || lower.includes('nutrition')) {
    console.log(`${lineNo}: ${l.trim().slice(0, 100)}`);
  }
});
