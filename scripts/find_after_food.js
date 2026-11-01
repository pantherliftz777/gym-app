const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-food-log"');
const endFood = html.indexOf('</section>', sIdx);
console.log('After view-food-log:');
console.log(html.substring(endFood, endFood + 500));
