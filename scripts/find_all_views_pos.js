const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const regex = /<section class="view[^"]*" id="view-([^"]+)">/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Found view:', m[1], 'at position:', m.index);
}
