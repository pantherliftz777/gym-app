const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf("$$('.view')");
const singleIdx = js.indexOf("$('.view')");
console.log("$$('.view') at:", sIdx);
console.log("$('.view') at:", singleIdx);
if (singleIdx !== -1) {
  console.log(js.slice(singleIdx - 50, singleIdx + 150));
}
