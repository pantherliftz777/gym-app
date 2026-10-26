const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const arIdx = html.indexOf('id="dashAnalyticsRowV2"');
console.log('Analytics row slice:');
console.log(JSON.stringify(html.substring(arIdx - 20, arIdx + 120)));

const dgIdx = html.indexOf('class="dashboard-grid"');
console.log('Dashboard grid slice:');
console.log(JSON.stringify(html.substring(dgIdx - 20, dgIdx + 120)));
