const fs = require('fs');

const serverJs = fs.readFileSync('gym-app/server.js', 'utf8');
const lines = serverJs.split('\n');

const routeKeys = [];
for (let i = 307; i < 2580; i++) {
  const line = lines[i];
  const match = line.match(/^\s*['"]([A-Z]+ \/api\/[^'"]+)['"]\s*:/);
  if (match) {
    routeKeys.push(match[1]);
  }
}
console.log('Total routes found:', routeKeys.length);
console.log(routeKeys);
