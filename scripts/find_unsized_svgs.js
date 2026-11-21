const fs = require('fs');

const html = fs.readFileSync('gym-app/public/dashboard.html', 'utf8');

const svgMatches = [...html.matchAll(/<svg([^>]*)>/gi)];
console.log('Total SVG tags in dashboard.html:', svgMatches.length);

const unsizedSvgs = [];
svgMatches.forEach((m, idx) => {
  const attrs = m[1];
  const hasWidth = /width=["']?\d+/i.test(attrs);
  const hasHeight = /height=["']?\d+/i.test(attrs);
  if (!hasWidth || !hasHeight) {
    unsizedSvgs.push({ index: idx, snippet: m[0].slice(0, 100) });
  }
});

console.log('Unsized SVGs count:', unsizedSvgs.length);
unsizedSvgs.forEach(u => console.log(' -', u));
