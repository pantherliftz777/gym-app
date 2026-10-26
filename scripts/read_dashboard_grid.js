const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const start = html.indexOf('<div class="dashboard-grid">');
const end = html.indexOf('<!-- DAILY TIP & HABIT SCIENCE', start);

console.log(html.substring(start, end));
