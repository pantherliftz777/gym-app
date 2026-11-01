const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('<section class="view" id="view-workouts">');
console.log('sIdx:', sIdx);
console.log(html.substring(sIdx, sIdx + 1200));
