const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../public/fitfuel.js');
let js = fs.readFileSync(jsPath, 'utf8');

js = js.replace(
  "return localStorage.getItem('fitfuel_theme') || 'system';",
  "return localStorage.getItem('fitfuel_theme') || 'light';"
);

js = js.replace(
  "const effectiveTheme = themeChoice === 'system' ? (prefersDark ? 'dark' : 'light') : themeChoice;",
  "const effectiveTheme = themeChoice === 'dark' ? 'dark' : 'light';"
);

fs.writeFileSync(jsPath, js, 'utf8');
console.log('fitfuel.js default theme set to light!');
