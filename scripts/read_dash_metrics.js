const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const start = html.indexOf('<div class="dash-metrics-grid-v2" id="dashMetricsGridV2">');
const end = html.indexOf('<div class="dash-analytics-row-v2"', start);

console.log(html.substring(start, end));
