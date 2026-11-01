const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('view-workouts');
console.log('view-workouts index in index.html:', sIdx);
if (sIdx !== -1) {
  console.log(html.substring(sIdx - 50, sIdx + 200));
}
