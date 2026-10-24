const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

css = css.replace('transform: translateY(16px) scale(0.96);', 'transform: translateY(16px);');
css = css.replace('transform: translateY(0) scale(1);', 'transform: translateY(0);');

fs.writeFileSync('public/styles.css', css, 'utf8');
console.log('Removed scale(0.96) so closed panel is 1:1 scale');
