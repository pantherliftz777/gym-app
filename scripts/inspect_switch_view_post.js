const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('if (viewName === \'today\')');
console.log(js.slice(sIdx, sIdx + 800));
