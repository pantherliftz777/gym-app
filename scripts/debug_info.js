const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const viewMatches = html.match(/id=["']view-[^"']+["']/g);
console.log('Views found:', viewMatches);

const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const swViews = js.match(/case\s+['"][^'"]+['"]:/g);
console.log('Switch view cases:', swViews ? swViews.slice(0, 20) : 'none');
