const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-food-log"');
console.log(html.substring(sIdx + 500, sIdx + 3000));
