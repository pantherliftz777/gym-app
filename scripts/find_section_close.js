const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-today"');
const eIdx = html.indexOf('id="view-body-analysis"');

const between = html.slice(sIdx, eIdx);
const opens = (between.match(/<section/g) || []).length;
const closes = (between.match(/<\/section/g) || []).length;

console.log('Section opens:', opens);
console.log('Section closes:', closes);

// Where are </section> tags?
let pos = 0;
while ((pos = between.indexOf('</section>', pos)) !== -1) {
  console.log('Found </section> at char', pos, 'near:\n' + between.slice(pos - 100, pos + 50));
  pos += 10;
}
