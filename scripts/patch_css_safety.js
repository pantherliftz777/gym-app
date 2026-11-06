const fs = require('fs');
const path = require('path');

const safetyCss = `
/* ================= CSS VIEW ISOLATION & LOGO SAFETY FIX ================= */
.fitusion-logo-icon,
svg.fitusion-logo-icon {
  width: 28px !important;
  height: 28px !important;
  max-width: 28px !important;
  max-height: 28px !important;
  flex: none !important;
}

.page-content > .view {
  display: none !important;
}

.page-content > .view.active {
  display: block !important;
}

/* Ensure landing view respects active class */
#view-landing:not(.active) {
  display: none !important;
}
#view-landing.active {
  display: block !important;
}
`;

// Append to dashboard-styles.css if not already present
const dashCssPath = path.join(__dirname, '..', 'public', 'dashboard-styles.css');
let dashCss = fs.readFileSync(dashCssPath, 'utf8');
if (!dashCss.includes('CSS VIEW ISOLATION & LOGO SAFETY FIX')) {
  dashCss += '\n' + safetyCss;
  fs.writeFileSync(dashCssPath, dashCss, 'utf8');
  console.log('Appended safety CSS to dashboard-styles.css');
}

// Append to styles.css as well
const stylesCssPath = path.join(__dirname, '..', 'public', 'styles.css');
let stylesCss = fs.readFileSync(stylesCssPath, 'utf8');
if (!stylesCss.includes('CSS VIEW ISOLATION & LOGO SAFETY FIX')) {
  stylesCss += '\n' + safetyCss;
  fs.writeFileSync(stylesCssPath, stylesCss, 'utf8');
  console.log('Appended safety CSS to styles.css');
}

// Also check fitfuel.js switchView to make sure when switching views, classes are toggled correctly
const fitfuelJsPath = path.join(__dirname, '..', 'public', 'fitfuel.js');
let fitfuelJs = fs.readFileSync(fitfuelJsPath, 'utf8');
console.log('fitfuel.js length:', fitfuelJs.length);
