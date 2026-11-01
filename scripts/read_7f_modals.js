const fs = require('fs');
const code = fs.readFileSync('public/index.html', 'utf8');

const m1 = code.indexOf('id="challengeMotiveModal"');
const m2 = code.indexOf('id="challengePrefsModal"');
const m3 = code.indexOf('id="challengeDurationModal"');
const mEnd = code.indexOf('<!-- AVATAR OPTIONS MODAL');

console.log('m1:', m1, 'm2:', m2, 'm3:', m3, 'mEnd:', mEnd);
console.log('--- CHALLENGE MODALS IN 7f516b9 ---');
console.log(code.substring(m1 - 50, mEnd));
