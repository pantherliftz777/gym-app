const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const start = html.indexOf('<div class="dash-analytics-row-v2" id="dashAnalyticsRowV2">');
const end = html.indexOf('<!-- DASHBOARD BOTTOM GRID', start);
console.log(html.substring(start, end));
