const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const regex = /<section\b[^>]*class="[^"]*\bview\b[^"]*"[^>]*id="([^"]+)"[^>]*>/gi;
let match;
const views = [];
while ((match = regex.exec(html)) !== null) {
  views.push({ id: match[1], index: match.index });
}

console.log('Found views:', views);
