const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../public/fitfuel.js');
let js = fs.readFileSync(jsPath, 'utf8');

js = js.replace("let activeView = 'today';", "let activeView = 'landing';");
fs.writeFileSync(jsPath, js, 'utf8');
console.log('activeView set to landing by default!');
