const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const elsePos = js.indexOf('} else {');
console.log('elsePos:', elsePos);

let depth = 0;
for (let i = elsePos + 7; i < js.length; i++) {
  if (js[i] === '{') depth++;
  if (js[i] === '}') {
    depth--;
    if (depth === 0) {
      console.log('Closing brace of else block at position:', i);
      console.log(js.slice(i - 100, i + 100));
      break;
    }
  }
}
console.log('Final depth at end of file:', depth);
