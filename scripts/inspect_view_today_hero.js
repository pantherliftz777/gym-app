const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('syBottomCardProgress');
console.log(html.substring(sIdx + 500, sIdx + 2500));
