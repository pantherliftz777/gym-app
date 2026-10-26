const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('let setupMotive =');
let depth = 0;
for (let i = sIdx; i >= 0; i--) {
  if (js[i] === '}') depth++;
  if (js[i] === '{') {
    depth--;
    if (depth === 0) {
      console.log('Enclosing opening brace at position:', i);
      console.log('Context:');
      console.log(js.slice(Math.max(0, i - 150), i + 50));
      break;
    }
  }
}
