const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const startIdx = html.indexOf('id="challengeDurationModal"');
if (startIdx !== -1) {
  console.log(html.slice(startIdx, startIdx + 3000));
}
