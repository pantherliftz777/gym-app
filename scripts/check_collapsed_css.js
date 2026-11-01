const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

const sIdx = css.indexOf('.sidebar-collapsed');
if (sIdx !== -1) {
  console.log(css.substring(sIdx, sIdx + 1000));
}
