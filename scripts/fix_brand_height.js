const fs = require('fs');
let css = fs.readFileSync('public/styles.css', 'utf8');

css = css.replace(
  /\.sidebar \.brand \{[\s\S]*?padding: 4px 6px 10px !important;[\s\S]*?\}/,
  `.sidebar .brand {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 4px 6px 10px !important;
  flex-shrink: 0 !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  box-sizing: border-box !important;
  transition: all 0.2s ease !important;
}`
);

css = css.replace(
  /html\.sidebar-collapsed \.sidebar \.brand \{[\s\S]*?\}/,
  `html.sidebar-collapsed .sidebar .brand {
  justify-content: center !important;
  padding: 4px 0 10px !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  box-sizing: border-box !important;
}`
);

fs.writeFileSync('public/styles.css', css, 'utf8');
console.log('✔ Updated .sidebar .brand and html.sidebar-collapsed .sidebar .brand in styles.css');
