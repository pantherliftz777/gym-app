const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const startIdx = html.indexOf('id="challengeMotiveModal"');
if (startIdx !== -1) {
  console.log(html.slice(startIdx - 50, startIdx + 3500));
}
