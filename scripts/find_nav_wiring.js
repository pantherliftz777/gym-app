const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

let pos = 0;
while ((pos = js.indexOf('.primary-nav', pos)) !== -1) {
  console.log('Match at', pos);
  console.log(js.slice(pos - 50, pos + 250));
  pos += 12;
}
