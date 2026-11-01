const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

const sIdx = css.indexOf('.topbar{');
if (sIdx !== -1) {
  console.log(css.substring(sIdx, sIdx + 500));
} else {
  const m = css.match(/\.topbar\s*\{[^}]+\}/);
  console.log(m ? m[0] : '.topbar style not found');
}
