const fs = require('fs');
const html = fs.readFileSync('gym-app/public/index.html', 'utf8');

const regex = /<section[^>]*id="([^"]+)"[^>]*>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Section ID:', m[1], 'at index', m.index);
}
