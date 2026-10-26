const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf("$$('.page-content .view')");
console.log('$$(\'.page-content .view\') at:', sIdx);
if (sIdx !== -1) {
  console.log(js.slice(sIdx - 50, sIdx + 150));
}
