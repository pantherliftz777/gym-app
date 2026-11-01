const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

const sIdx = css.indexOf('.primary-nav');
if (sIdx !== -1) {
  console.log(css.substring(sIdx, sIdx + 1200));
}
