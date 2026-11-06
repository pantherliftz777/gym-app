const fs = require('fs');
const content = fs.readFileSync('gym-app/public/dashboard.html', 'utf8');

const regex = /<section[^>]*class=["'][^"']*view[^"']*["'][^>]*id=["']([^"']+)["']/gi;
let match;
const views = [];
while ((match = regex.exec(content)) !== null) {
  views.push(match[1]);
}
console.log('Total views in dashboard.html:', views.length);
console.log('View IDs:', views);
