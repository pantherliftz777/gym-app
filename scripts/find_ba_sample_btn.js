const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const idx = html.indexOf('id="baLoadSamplePhotosBtn"');
console.log(html.substring(idx - 150, idx + 450));
