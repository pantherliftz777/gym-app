const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const actIdx = html.indexOf('id="view-activity"');
console.log('activity view snippet part 2:');
console.log(html.substring(actIdx + 2000, actIdx + 5000));
