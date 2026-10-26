const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'public', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Line 9139 lavender replacement
css = css.replace(
  'linear-gradient(135deg, rgba(240, 249, 255, 0.96) 0%, rgba(245, 243, 255, 0.94) 100%) !important;',
  'linear-gradient(135deg, rgba(240, 249, 255, 0.96) 0%, rgba(240, 253, 250, 0.95) 100%) !important;'
);

// 2. Body background explicit binding for light and dark
const targetBody = `body {
  background-color: var(--glass-canvas-bg) !important;
  background-image: var(--glass-canvas-mesh) !important;
  background-attachment: fixed !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  color: var(--glass-text-primary) !important;
  transition: background 0.3s ease, color 0.3s ease;
}`;

const replacementBody = `body {
  background-color: var(--glass-canvas-bg) !important;
  background-image: var(--glass-canvas-mesh) !important;
  background-attachment: fixed !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  color: var(--glass-text-primary) !important;
  transition: background 0.3s ease, color 0.3s ease;
}

html:not(.dark) body, [data-theme="light"] body {
  background-color: #f8fafc !important;
  background-image: var(--glass-canvas-mesh) !important;
  color: #0f172a !important;
}

html.dark body, [data-theme="dark"] body {
  background-color: #080c14 !important;
  background-image: var(--glass-canvas-mesh) !important;
  color: #f8fafc !important;
}`;

if (css.includes(targetBody)) {
  css = css.replace(targetBody, replacementBody);
  console.log('Successfully added explicit body theme bindings');
} else {
  console.log('Warning: targetBody exact match not found');
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Updated public/styles.css successfully');
