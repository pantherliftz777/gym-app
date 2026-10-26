const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('sy-hero-bottom-cards');
const eIdx = html.indexOf('dash-image3-header-bar');
const slice = html.slice(sIdx, eIdx);

const stack = [];
const regex = /<(\/)?div([^>]*)>/gi;
let m;
while ((m = regex.exec(slice)) !== null) {
  if (!m[1]) {
    stack.push(m[0].slice(0, 40));
  } else {
    stack.pop();
    console.log('Closed one, remaining stack depth in bottom-cards:', stack.length);
  }
}
