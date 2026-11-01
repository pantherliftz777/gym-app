const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function switchView(');
if (sIdx !== -1) {
  console.log(js.substring(sIdx, sIdx + 1200));
} else {
  console.log('function switchView not found');
}
