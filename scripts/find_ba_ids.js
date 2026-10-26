const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const s = html.indexOf('id="view-body-analysis"');
const e = html.indexOf('id="view-', s + 20);
const ba = html.slice(s, e);

const ids = [...ba.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
console.log('Last 30 IDs:', ids.slice(-30));
