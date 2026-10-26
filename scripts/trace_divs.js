const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const start = html.indexOf('id="view-today"');
const end = html.indexOf('dash-image3-header-bar');
const slice = html.slice(start, end);

const stack = [];
const regex = /<(\/)?div([^>]*)>/gi;
let m;
while ((m = regex.exec(slice)) !== null) {
  const isClose = !!m[1];
  const attrs = m[2];
  if (!isClose) {
    stack.push({ index: m.index, attrs: attrs.trim() });
  } else {
    if (stack.length === 0) {
      console.log('UNMATCHED CLOSING DIV at slice offset:', m.index);
      console.log(slice.slice(Math.max(0, m.index - 60), m.index + 60));
    } else {
      stack.pop();
    }
  }
}
console.log('Unclosed divs at end of slice:', stack.length);
if (stack.length > 0) {
  console.log('Last unclosed divs:', stack.slice(-3));
}
