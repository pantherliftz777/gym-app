const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

const viewMatches = [];
lines.forEach((l, idx) => {
  const m = l.match(/<section[^>]+id="(view-[^"]+)"/);
  if (m) viewMatches.push({ line: idx + 1, view: m[1] });
});
console.log(viewMatches);
