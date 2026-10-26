const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

let pos = 0;
while ((pos = js.indexOf("$('.view').forEach", pos)) !== -1) {
  console.log('Match at', pos);
  console.log(js.slice(pos - 30, pos + 80));
  pos += 18;
}
