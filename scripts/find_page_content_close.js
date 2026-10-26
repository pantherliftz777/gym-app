const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const pIdx = html.indexOf('class="page-content"');
const dIdx = html.indexOf('dash-image3-header-bar');
console.log('page-content at:', pIdx);
console.log('dash-image3-header-bar at:', dIdx);

// Look between pIdx and dIdx for closing tags:
const slice = html.slice(pIdx, dIdx);
console.log('Between page-content and dash-image3-header-bar:');
// Find where view-today is
console.log(slice.slice(slice.length - 300));
