const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const targetViews = ['view-challenge', 'view-exercise-library', 'view-starting-load'];
targetViews.forEach(v => {
  const s = html.indexOf('id="' + v + '"');
  const e = html.indexOf('</nav>', s);
  console.log('=== ' + v + ' subnav ===');
  console.log(html.substring(s, e + 6));
});
