const fs = require('fs');
const html = fs.readFileSync('gym-app/public/dashboard.html', 'utf8');

const linkMatches = [...html.matchAll(/<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(m => m[0]);
console.log('Stylesheets in dashboard.html:', linkMatches);

const scriptMatches = [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('Scripts in dashboard.html:');
scriptMatches.forEach(s => console.log(' -', s));
