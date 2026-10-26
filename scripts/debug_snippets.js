const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function switchView(viewName)');
console.log('switchView snippet:');
console.log(JSON.stringify(js.slice(sIdx, sIdx + 450)));

const cIdx = js.indexOf('function closeModal(selector)');
console.log('closeModal snippet:');
console.log(JSON.stringify(js.slice(cIdx, cIdx + 700)));
