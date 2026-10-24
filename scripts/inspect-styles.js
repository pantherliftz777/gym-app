const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

function extractRule(selector) {
  const regex = new RegExp(`(?:^|\\})([^{}]*${selector}[^{}]*)\\{([^}]+)\\}`, 'g');
  let match;
  console.log(`\n================= CSS RULES FOR: ${selector} =================`);
  while ((match = regex.exec(css)) !== null) {
    console.log(match[1].trim() + ' {\n  ' + match[2].trim().replace(/;/g, ';\n  ') + '\n}');
  }
}

extractRule('\\.app-shell');
extractRule('\\.main-area');
extractRule('\\.topbar');
extractRule('\\.topbar-controls-row');
extractRule('\\.header-weather-badge');
extractRule('\\.stronger-you-hero-card');
extractRule('\\.ai-coach-page-layout');
extractRule('\\.posture-grid');
