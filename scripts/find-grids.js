const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

function findPatterns(pattern, desc) {
  const regex = new RegExp(pattern, 'g');
  let match;
  console.log(`\n=== ${desc} ===`);
  const found = [];
  while ((match = regex.exec(css)) !== null) {
    const idx = match.index;
    const start = Math.max(0, idx - 80);
    const end = Math.min(css.length, idx + 120);
    const snippet = css.substring(start, end).replace(/\n/g, ' ');
    found.push(snippet);
  }
  console.log(`Found ${found.length} matches:`);
  found.slice(0, 30).forEach((f, i) => console.log(`[${i+1}] ${f}`));
}

findPatterns('grid-template-columns:\\s*[^;]+', 'Grid template columns');
findPatterns('min-width:\\s*\\d{3,}px', 'Fixed min-widths >= 100px');
