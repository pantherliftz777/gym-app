const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
console.log(html.slice(18700, 18900));
