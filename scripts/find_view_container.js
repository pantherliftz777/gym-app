const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-workouts"');
console.log('view-workouts context:');
console.log(html.slice(sIdx - 100, sIdx + 100));
