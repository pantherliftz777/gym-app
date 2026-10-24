const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

function findModals() {
  const modalMatches = [...html.matchAll(/id="([^"]*modal[^"]*)"/gi)].map(m => m[1]);
  const drawerMatches = [...html.matchAll(/id="([^"]*drawer[^"]*)"/gi)].map(m => m[1]);
  console.log('Modals found:', modalMatches);
  console.log('Drawers found:', drawerMatches);
}

findModals();
