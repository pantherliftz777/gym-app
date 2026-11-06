const fs = require('fs');
const content = fs.readFileSync('gym-app/public/dashboard-styles.css', 'utf8');

const rootMatch = content.match(/:root\s*\{([^}]+)\}/);
if (rootMatch) {
  console.log(':root vars:', rootMatch[1].split('\n').filter(l => l.includes('--')).slice(0, 30).join('\n'));
} else {
  console.log('No :root block found, looking for theme rules:');
  const themeMatches = content.match(/--(bg|surface|accent|primary|text)[a-zA-Z0-9_-]*:\s*[^;]+;/g);
  console.log('Theme vars found:', themeMatches ? [...new Set(themeMatches)] : 'none');
}
