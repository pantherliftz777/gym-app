const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('if (viewName === \'exercise-library\')');
console.log(js.substring(sIdx - 100, sIdx + 400));
