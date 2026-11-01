const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const pStart = html.indexOf('id="challengePrefsModal"');
const pEnd = html.indexOf('id="challengeDurationModal"');
console.log('=== challengePrefsModal FULL ===');
console.log(html.substring(pStart, pEnd));

const dEnd = html.indexOf('<!-- ================= AVATAR SELECTION MODAL', pEnd);
console.log('=== challengeDurationModal FULL ===');
console.log(html.substring(pEnd, dEnd !== -1 ? dEnd : pEnd + 4000));
