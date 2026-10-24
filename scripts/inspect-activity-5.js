const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const actIdx = html.indexOf('id="view-activity"');
console.log('activity view snippet part 5:');
console.log(html.substring(actIdx + 13000, actIdx + 17000));
