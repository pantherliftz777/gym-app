const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('planWorkoutTitle');
console.log('planWorkoutTitle found at:', sIdx);
if (sIdx !== -1) {
  // Find which section it is in
  const prevSec = html.lastIndexOf('<section', sIdx);
  console.log(html.substring(prevSec, prevSec + 100));
}
