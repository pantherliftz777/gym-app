const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const lines = html.split('\n');
console.log(lines.slice(2715, 2735).join('\n'));
