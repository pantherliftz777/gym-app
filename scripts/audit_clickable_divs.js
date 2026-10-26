const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const divRegex = /<(div|span|article)\b([^>]*?)>(.*?)<\/\1>/gi;
let m;
const clickableDivs = [];

while ((m = divRegex.exec(html)) !== null) {
  const attrs = m[2];
  if (/role="button"|cursor:\s*pointer|onclick=/i.test(attrs)) {
    const id = attrs.match(/id="([^"]+)"/)?.[1];
    const cls = attrs.match(/class="([^"]+)"/)?.[1];
    const onclick = attrs.match(/onclick="([^"]+)"/)?.[1];
    const isReferencedInJs = id ? js.includes(id) : (cls ? cls.split(' ').some(c => js.includes('.' + c)) : false);
    clickableDivs.push({
      tag: m[1],
      id,
      cls,
      onclick,
      isReferencedInJs
    });
  }
}

console.log('Total clickable divs/spans:', clickableDivs.length);
const unhandledDivs = clickableDivs.filter(d => !d.onclick && !d.isReferencedInJs);
console.log('Unhandled clickable divs/spans:', unhandledDivs.length);
console.log(unhandledDivs);
