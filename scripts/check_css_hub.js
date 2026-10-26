const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

console.log('hub-segmented-control in CSS:', css.includes('hub-segmented-control'));
