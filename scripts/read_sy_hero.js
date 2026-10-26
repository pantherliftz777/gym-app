const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const start = html.indexOf('<div class="sy-athlete-hero"');
const end = html.indexOf('<div class="dash-body-category-card"', start);

console.log(html.substring(start, end));
