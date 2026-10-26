const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

const navIdx = css.indexOf('.primary-nav');
console.log('primary-nav at:', navIdx);
if (navIdx !== -1) {
  console.log(css.slice(navIdx - 100, navIdx + 600));
}
