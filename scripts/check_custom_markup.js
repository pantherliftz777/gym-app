const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-customization"');
console.log(html.substring(sIdx - 50, sIdx + 400));
