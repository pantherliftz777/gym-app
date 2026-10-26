const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const dIdx = js.indexOf('/* ================= BULLETPROOF GLOBAL EVENT DELEGATION');
const endPos = js.lastIndexOf('});', dIdx);

let depth = 0;
for (let i = endPos; i >= 0; i--) {
  if (js[i] === '}') depth++;
  if (js[i] === '{') {
    depth--;
    if (depth === 0) {
      console.log('Matching opening brace at position:', i);
      console.log('Context:');
      console.log(js.slice(Math.max(0, i - 150), i + 50));
      break;
    }
  }
}
