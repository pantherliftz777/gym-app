const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const pIdx = html.indexOf('class="page-content"');
const dIdx = html.indexOf('dash-image3-header-bar');
const slice = html.slice(pIdx, dIdx);

let divDepth = 0;
const tagRegex = /<\/?([a-zA-Z0-9-]+)(?:\s+[^>]*?)?>/g;
let match;
while ((match = tagRegex.exec(slice)) !== null) {
  const full = match[0];
  const tagName = match[1].toLowerCase();
  const isClosing = full.startsWith('</');
  const isSelfClosing = full.endsWith('/>') || ['img', 'br', 'hr', 'input', 'path', 'circle', 'line', 'polygon', 'polyline', 'rect'].includes(tagName);

  if (tagName === 'div') {
    if (isClosing) {
      divDepth--;
      if (divDepth < 0) {
        console.log('EXTRA CLOSING DIV at index:', pIdx + match.index);
        console.log(slice.slice(Math.max(0, match.index - 50), match.index + 50));
      }
    } else if (!isSelfClosing) {
      divDepth++;
    }
  }
}
console.log('Final divDepth before dash-image3-header-bar:', divDepth);
