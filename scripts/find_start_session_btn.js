const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('startActiveSessionBtn');
if (sIdx !== -1) {
  console.log(js.slice(sIdx - 100, sIdx + 1500));
} else {
  console.log('startActiveSessionBtn not found');
}
