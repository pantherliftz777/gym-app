const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const tagRegex = /<(div|span|article|section|li|a)\b([^>]*)>/gi;
let m;
const clickable = [];

while ((m = tagRegex.exec(html)) !== null) {
  const tag = m[1];
  const attrs = m[2];
  if (/role="button"|cursor\s*:\s*pointer|onclick=/i.test(attrs)) {
    const id = attrs.match(/id="([^"]+)"/)?.[1];
    const cls = attrs.match(/class="([^"]+)"/)?.[1];
    const onclick = attrs.match(/onclick="([^"]+)"/)?.[1];
    const isReferencedInJs = id ? js.includes(id) : (cls ? cls.split(' ').some(c => js.includes('.' + c)) : false);
    clickable.push({
      tag,
      id,
      cls,
      onclick,
      isReferencedInJs,
      raw: m[0]
    });
  }
}

console.log('Total clickable non-button elements:', clickable.length);
const unhandled = clickable.filter(c => !c.onclick && !c.isReferencedInJs);
console.log('Unhandled clickable non-button elements:', unhandled.length);
unhandled.forEach(u => console.log(u.tag, u.id, u.cls));
