const fs = require('fs');
let code = fs.readFileSync('public/fitfuel.js', 'utf8');

code = code.split("if (typeof showToast === 'function') showToast(").join("toast(");
code = code.split("showToast(").join("toast(");

if (!code.includes('window.showToast = toast;')) {
  code = 'window.showToast = typeof toast === "function" ? toast : console.log;\n' + code;
}

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
console.log('Replaced showToast with toast and exported window.showToast');
