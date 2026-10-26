const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const oIdx = js.indexOf('function openModal');
if (oIdx !== -1) {
  console.log(js.slice(oIdx, oIdx + 800));
}
