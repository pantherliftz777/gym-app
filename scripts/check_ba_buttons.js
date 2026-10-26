const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const baStart = html.indexOf('id="view-body-analysis"');
const baEnd = html.indexOf('id="view-food-log"');
const baContent = html.substring(baStart, baEnd);

const buttonRegex = /<(button|a)\b[^>]*?(id="([^"]+)"|class="([^"]+)")?[^>]*>(.*?)<\/\1>/gi;
let m;
const buttons = [];
while ((m = buttonRegex.exec(baContent)) !== null) {
  const tag = m[1];
  const idMatch = m[0].match(/id="([^"]+)"/);
  const classMatch = m[0].match(/class="([^"]+)"/);
  const onclickMatch = m[0].match(/onclick="([^"]+)"/);
  const id = idMatch ? idMatch[1] : null;
  const cls = classMatch ? classMatch[1] : null;
  const text = m[5].replace(/<[^>]+>/g, '').trim();

  let hasJsHandler = false;
  if (id) {
    if (js.includes(`'#${id}'`) || js.includes(`"#${id}"`) || js.includes(`document.getElementById('${id}')`) || js.includes(`getElementById("${id}")`)) {
      hasJsHandler = true;
    }
  }

  buttons.push({
    id,
    cls,
    text: text.slice(0, 40),
    onclick: onclickMatch ? onclickMatch[1] : null,
    hasJsHandler
  });
}

console.log('Body Analysis buttons count:', buttons.length);
console.log('Body Analysis buttons:', buttons);
