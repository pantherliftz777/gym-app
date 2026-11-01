const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
let currentView = 'none';
lines.forEach((l, idx) => {
  const vMatch = l.match(/id="(view-[^"]+)"/);
  if (vMatch) currentView = vMatch[1];
  if (l.includes('class="hub-subnav-bar"')) {
    console.log(`Line ${idx+1} in ${currentView}: ${l.trim()}`);
  }
});
