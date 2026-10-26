const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const regex = /data-view="ai-coach"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Match at', m.index);
  console.log(html.slice(Math.max(0, m.index - 50), m.index + 120));
}
