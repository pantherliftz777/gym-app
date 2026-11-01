const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8').split('\n');
html.forEach((l, i) => {
  if (l.includes('id="view-')) console.log(i + 1, l.trim());
});
