const fs = require('fs');

const serverJs = fs.readFileSync('gym-app/server.js', 'utf8');

// Match table creates
const tableMatches = [...serverJs.matchAll(/CREATE TABLE IF NOT EXISTS ([a-zA-Z0-9_]+)/g)].map(m => m[1]);
console.log('Database Tables:', [...new Set(tableMatches)]);

// Match routes
const routeMatches = [...serverJs.matchAll(/req\.url(?: ===| \.startsWith\()\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('Routes in server.js:', [...new Set(routeMatches)]);

// Check beta-features.js
try {
  const betaJs = fs.readFileSync('gym-app/beta-features.js', 'utf8');
  const betaTables = [...betaJs.matchAll(/CREATE TABLE IF NOT EXISTS ([a-zA-Z0-9_]+)/g)].map(m => m[1]);
  console.log('Beta Tables:', [...new Set(betaTables)]);
  const betaRoutes = [...betaJs.matchAll(/(?:url\.pathname ===|path ===)\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  console.log('Beta Routes:', [...new Set(betaRoutes)]);
} catch (e) {
  console.log('beta-features error:', e.message);
}
