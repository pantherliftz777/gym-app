const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const baStart = html.indexOf('id="view-body-analysis"');
const baEnd = html.indexOf('id="view-food-log"');
const baContent = html.substring(baStart, baEnd);

const regex = /<button\b([^>]*)>/gi;
let m;
const buttons = [];
while ((m = regex.exec(baContent)) !== null) {
  const attrs = m[1];
  const idMatch = attrs.match(/id="([^"]+)"/);
  const classMatch = attrs.match(/class="([^"]+)"/);
  const onclickMatch = attrs.match(/onclick="([^"]+)"/);
  buttons.push({
    id: idMatch ? idMatch[1] : null,
    cls: classMatch ? classMatch[1] : null,
    onclick: onclickMatch ? onclickMatch[1] : null,
    tag: m[0]
  });
}

console.log('Total button tags in Body Analysis:', buttons.length);
console.log(buttons);
