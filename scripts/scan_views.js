const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const views = [];
const regex = /id="view-([^"]+)"/g;
let match;
while ((match = regex.exec(html)) !== null) {
  views.push(match[1]);
}
console.log('Views found:', JSON.stringify(views, null, 2));
