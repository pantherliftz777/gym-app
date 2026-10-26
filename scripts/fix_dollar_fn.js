const fs = require('fs');

const jsPath = 'public/fitfuel.js';
let js = fs.readFileSync(jsPath, 'utf8');

js = js.replace("$('.view').forEach", () => "$$('.view').forEach");
fs.writeFileSync(jsPath, js, 'utf8');

const verifyJs = fs.readFileSync(jsPath, 'utf8');
console.log('Includes $$(\x27.view\x27).forEach:', verifyJs.includes("$$('.view').forEach"));
console.log('Includes $(\x27.view\x27).forEach:', verifyJs.includes("$('.view').forEach"));
