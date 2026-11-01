const fs = require('fs');
const code = fs.readFileSync('public/index.html', 'utf8');
const start = code.indexOf('id="view-today"');
console.log(code.substring(start, start + 3000));
