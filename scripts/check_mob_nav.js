const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('mobNavExercises');
console.log(html.substring(sIdx, sIdx + 500));
