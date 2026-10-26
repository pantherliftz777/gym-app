const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const regex = /\$\('[^']+'\)\.forEach/g;
let m;
const badSelectors = [];
while ((m = regex.exec(js)) !== null) {
  badSelectors.push(m[0]);
}
console.log('Bad selectors:', badSelectors);
