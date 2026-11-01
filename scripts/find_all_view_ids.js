const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const matches = [];
let re = /id="view-[^"]+"/g;
let m;
while ((m = re.exec(html)) !== null) {
  matches.push(m[0]);
}
console.log('All view IDs in index.html:', matches);
