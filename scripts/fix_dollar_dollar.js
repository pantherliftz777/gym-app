const fs = require('fs');

const jsPath = 'public/fitfuel.js';
let js = fs.readFileSync(jsPath, 'utf8');

js = js.replace("$('.view').forEach(v => {", "$$('.view').forEach(v => {");
fs.writeFileSync(jsPath, js, 'utf8');
console.log('Fixed $(".view") to $$(".view") in fitfuel.js');
