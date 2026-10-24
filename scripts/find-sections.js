const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

function find(term) {
  let idx = 0;
  console.log(`\n=== SEARCH: ${term} ===`);
  while ((idx = html.indexOf(term, idx)) !== -1) {
    console.log(`Found at ${idx}:`);
    console.log(html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 200)));
    idx += term.length + 50;
  }
}

find('Camera AI Posture & Form Checker');
find('id="view-');
find('id="view_');
find('class="view-');
