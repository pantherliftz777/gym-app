const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const dIdx = html.indexOf('dash-image3-header-bar');
console.log(JSON.stringify(html.slice(dIdx - 300, dIdx)));
