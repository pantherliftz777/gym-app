const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

css = css.replace(
  /button:not\(\.floating-ai-tooltip-close\) \{\s*min-height: 44px;\s*box-sizing: border-box;\s*\}/g,
  `button:not(.floating-ai-tooltip-close) {
    min-height: 44px !important;
    box-sizing: border-box !important;
  }`
);

css = css.replace(
  /\.solid-button,\s*\.outline-button,\s*\.filter-pill,\s*\.ba-step-item,\s*\.ba-step-actions button,\s*button:not\(\.floating-ai-tooltip-close\)\s*\{\s*min-height: 44px;\s*box-sizing: border-box;\s*\}/g,
  `.solid-button,
  .outline-button,
  .filter-pill,
  .ba-step-item,
  .ba-step-actions button,
  button:not(.floating-ai-tooltip-close) {
    min-height: 44px !important;
    box-sizing: border-box !important;
  }`
);

fs.writeFileSync('public/styles.css', css, 'utf8');
console.log('Added !important to 44px min-height rule');
