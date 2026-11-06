const fs = require('fs');
const content = fs.readFileSync('gym-app/server.js', 'utf8');

console.log('--- TABLES SEARCH ---');
const createMatches = content.match(/CREATE TABLE[^;`"]+/gi);
if (createMatches) {
  createMatches.forEach(m => console.log(m.trim()));
}

console.log('--- ALL FROM / INTO / UPDATE TABLES ---');
const fromMatches = content.match(/\b(FROM|INTO|UPDATE)\s+([a-zA-Z0-9_]+)/gi);
if (fromMatches) {
  const tables = [...new Set(fromMatches.map(m => m.split(/\s+/)[1].toLowerCase()))];
  console.log('Tables found in queries:', tables);
}

console.log('--- ROUTES COUNT & EXAMPLES ---');
const routeLines = content.split('\n').filter(line => line.includes("routes['") || line.includes('routes["'));
console.log('Total routes count:', routeLines.length);
routeLines.forEach(l => console.log(l.trim().substring(0, 100)));
