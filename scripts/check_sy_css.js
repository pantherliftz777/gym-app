const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

const sIdx = css.indexOf('.stronger-you-hero-card');
if (sIdx !== -1) {
  console.log('stronger-you-hero-card found at:', sIdx);
  // Find where it ends or spans
  console.log(css.substring(sIdx, sIdx + 1500));
} else {
  console.log('stronger-you-hero-card not found in styles.css');
}
