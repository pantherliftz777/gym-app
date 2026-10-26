const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const startIdx = html.indexOf('id="challengePrefsModal"');
if (startIdx !== -1) {
  console.log(html.slice(startIdx, startIdx + 3500));
}
