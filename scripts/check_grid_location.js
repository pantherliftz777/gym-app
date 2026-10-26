const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const vtIdx = html.indexOf('id="view-today"');
const dgIdx = html.indexOf('class="dashboard-grid"');
const nextViewIdx = html.indexOf('id="view-body-analysis"');

console.log('view-today index:', vtIdx);
console.log('dashboard-grid index:', dgIdx);
console.log('view-body-analysis index:', nextViewIdx);
console.log('Is dashboard-grid between view-today and view-body-analysis?', dgIdx > vtIdx && dgIdx < nextViewIdx);
