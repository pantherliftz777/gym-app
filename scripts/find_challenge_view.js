const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const startIdx = html.indexOf('id="view-challenge"');
if (startIdx !== -1) {
  console.log(html.slice(startIdx, startIdx + 2500));
} else {
  console.log('view-challenge not found');
}
