const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');
const lines = css.split('\n');
console.log(lines.slice(35, 45).join('\n'));
