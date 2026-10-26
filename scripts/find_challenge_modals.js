const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const modals = [];
const regex = /id="(challenge[A-Za-z0-9_-]*Modal)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  modals.push(m[1]);
}
console.log('Challenge modals in HTML:', modals);
