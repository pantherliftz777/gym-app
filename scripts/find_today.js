const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const start = html.indexOf('id="view-today"');
const nextView = html.indexOf('id="view-', start + 20);
console.log('view-today start line:', html.slice(0, start).split('\n').length);
console.log('next view line:', html.slice(0, nextView).split('\n').length);
console.log('Next view id:', html.slice(nextView, nextView + 40));
