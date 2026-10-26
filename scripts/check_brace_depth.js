const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('let setupMotive =');
// Scan backward to find if we are inside a function
let balance = 0;
for (let i = 0; i < sIdx; i++) {
  if (js[i] === '{') balance++;
  if (js[i] === '}') balance--;
}
console.log('Brace depth at setupMotive:', balance);

// Check brace depth at the end of the file where delegation was appended
console.log('Brace depth at file end:', balance);
let endBalance = 0;
for (let i = 0; i < js.length; i++) {
  if (js[i] === '{') endBalance++;
  if (js[i] === '}') endBalance--;
}
console.log('Brace depth at very end of file:', endBalance);
