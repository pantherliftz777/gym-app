const fs = require('fs');

function extractVars(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(/--[a-zA-Z0-9_-]+:\s*[^;]+;/g);
  return matches ? matches.map(m => m.trim()) : [];
}

const landingVars = extractVars('gym-app/public/styles.css');
console.log('Landing CSS vars count:', landingVars.length);
console.log('Sample Landing vars:', landingVars.slice(0, 25));

const dashVars = extractVars('gym-app/public/dashboard-styles.css');
console.log('Dashboard CSS vars count:', dashVars.length);
console.log('Sample Dashboard vars:', dashVars.slice(0, 25));
