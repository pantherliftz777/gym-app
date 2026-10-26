const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const wIdx = html.indexOf('id="view-workouts"');
console.log(html.slice(wIdx - 300, wIdx));
