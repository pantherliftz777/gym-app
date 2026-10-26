const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const idx = html.indexOf('sy-bcard-wave');
console.log('Context with JSON:');
console.log(JSON.stringify(html.slice(idx + 50, idx + 450)));
