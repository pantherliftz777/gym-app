const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');
console.log('Total css length:', css.length);
console.log(css.slice(css.length - 800));
