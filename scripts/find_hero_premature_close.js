const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('class="stronger-you-hero-card"');
const eIdx = html.indexOf('sy-bottom-features-grid');
const slice = html.slice(sIdx, eIdx);

const stack = [];
const regex = /<(\/)?div([^>]*)>/gi;
let m;
while ((m = regex.exec(slice)) !== null) {
  if (!m[1]) {
    stack.push({ tag: m[0].slice(0, 50), idx: m.index });
  } else {
    const popped = stack.pop();
    if (stack.length === 0) {
      console.log('stronger-you-hero-card was CLOSED at slice offset:', m.index);
      console.log(slice.slice(Math.max(0, m.index - 80), m.index + 80));
    }
  }
}
console.log('Stack length before bottom features grid:', stack.length);
