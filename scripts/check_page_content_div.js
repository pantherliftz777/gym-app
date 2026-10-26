const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const pcIdx = html.indexOf('class="page-content"');
const endPcIdx = html.indexOf('</div>', pcIdx);
const wIdx = html.indexOf('id="view-workouts"');

console.log('page-content start:', pcIdx);
console.log('page-content first closing div:', endPcIdx);
console.log('view-workouts index:', wIdx);
console.log('Is view-workouts after first closing div?', wIdx > endPcIdx);
