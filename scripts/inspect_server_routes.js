const fs = require('fs');

const serverCode = fs.readFileSync('server.js', 'utf8');
const rIdx = serverCode.indexOf('const routes = {');
const endIdx = serverCode.lastIndexOf('if (require.main === module)');
const sub = serverCode.substring(rIdx, endIdx);

const lines = sub.split('\n');
const routes = [];
lines.forEach((l, idx) => {
  const trimmed = l.trim();
  if (trimmed.startsWith("'") && trimmed.includes('/api/')) {
    const colon = trimmed.indexOf(':');
    if (colon > 0) {
      routes.push(trimmed.slice(1, colon).replace(/['"]+/g, '').trim());
    }
  }
});

console.log('Total API routes in server.js:', routes.length);
routes.forEach(r => console.log('  ' + r));
