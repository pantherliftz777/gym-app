const fs = require('fs');
const content = fs.readFileSync('gym-app/public/dashboard-styles.css', 'utf8');

const darkMatch = content.match(/\.dark\s*\{([^}]+)\}/);
if (darkMatch) {
  console.log('.dark vars:', darkMatch[1].split('\n').filter(l => l.includes('--')).slice(0, 30).join('\n'));
}
