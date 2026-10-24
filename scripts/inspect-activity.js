const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const actIdx = html.indexOf('id="view-activity"');
console.log('activity view snippet:');
console.log(html.substring(actIdx, actIdx + 2500));
