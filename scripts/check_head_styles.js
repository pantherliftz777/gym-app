const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');
console.log('HEAD styles.css starts with:');
console.log(css.substring(0, 500));
