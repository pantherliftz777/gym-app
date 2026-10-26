const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const sIdx = js.indexOf('baTabWizardBtn');
const lineNo = js.slice(0, sIdx).split('\n').length;
console.log('baTabWizardBtn at line', lineNo);
const lines = js.split('\n');
console.log(lines.slice(lineNo - 10, lineNo + 80).join('\n'));
