const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const posIdx = html.indexOf('id="view-posture"');
console.log('posture view snippet:');
console.log(html.substring(posIdx, posIdx + 3000));
