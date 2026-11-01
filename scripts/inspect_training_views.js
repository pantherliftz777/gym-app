const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

function inspectView(id) {
  const s = html.indexOf('id="' + id + '"');
  const e = html.indexOf('</section>', s);
  console.log('=== ' + id + ' (total length: ' + (e - s) + ') ===');
  console.log(html.substring(s, s + 1000));
}

inspectView('view-workouts');
inspectView('view-exercise-library');
