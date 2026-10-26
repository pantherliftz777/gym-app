const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const stack = [];
for (let i = 0; i < js.length; i++) {
  if (js[i] === '{') {
    stack.push(i);
  } else if (js[i] === '}') {
    stack.pop();
  }
}
console.log('Unclosed braces count:', stack.length);
stack.forEach(pos => {
  console.log('Unclosed brace at position:', pos);
  console.log(js.slice(Math.max(0, pos - 100), pos + 100));
  console.log('---');
});
