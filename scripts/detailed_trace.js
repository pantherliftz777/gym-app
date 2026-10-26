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
    stack.push({ index: m.index, tag: m[0] });
  } else {
    const popped = stack.pop();
    // Print each close and what it popped
  }
}
// If stack has 0 before the last close:
console.log('Final stack length:', stack.length);
