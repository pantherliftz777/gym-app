const fs = require('fs');
let css = fs.readFileSync('public/styles.css', 'utf8');

// Ensure matching padding-top on both .sidebar and html.sidebar-collapsed .sidebar
css = css.replace(
  /\.sidebar \{[\s\S]*?padding: 18px 14px 24px !important;/g,
  `.sidebar {\n  padding: 24px 14px 24px !important;`
);

css = css.replace(
  /html\.sidebar-collapsed \.sidebar \{[\s\S]*?padding: 18px 8px 24px !important;/g,
  `html.sidebar-collapsed .sidebar {\n  padding: 24px 8px 24px !important;`
);

fs.writeFileSync('public/styles.css', css, 'utf8');
console.log('✔ Updated .sidebar padding in styles.css to ensure identical vertical position');
