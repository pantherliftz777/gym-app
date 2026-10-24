const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const actIdx = html.indexOf('id="view-activity"');
console.log('activity view snippet part 3:');
console.log(html.substring(actIdx + 5000, actIdx + 9000));
