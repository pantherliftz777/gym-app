const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

function searchCss(term) {
  let idx = 0;
  console.log(`\n=== RULES FOR: ${term} ===`);
  while ((idx = css.indexOf(term, idx)) !== -1) {
    const start = Math.max(0, idx - 40);
    const end = Math.min(css.length, idx + 250);
    console.log(css.substring(start, end));
    idx += term.length + 30;
  }
}

searchCss('posture-layout-grid');
searchCss('posture-controls-bar');
searchCss('posture-viewport-card');
