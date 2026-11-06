const fs = require('fs');
const js = fs.readFileSync('gym-app/public/fitfuel.js', 'utf8');

const idx = js.indexOf('function renderAdminView');
if (idx !== -1) {
  console.log(js.slice(idx, idx + 800));
} else {
  console.log('function renderAdminView not found');
}
