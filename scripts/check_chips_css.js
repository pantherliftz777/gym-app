const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

const sIdx = css.indexOf('.workout-types-section');
if (sIdx !== -1) {
  console.log(css.substring(sIdx, sIdx + 1200));
} else {
  console.log('workout-types-section not found in styles.css');
}
