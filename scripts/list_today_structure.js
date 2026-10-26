const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const todayStart = html.indexOf('id="view-today"');
const todayEnd = html.indexOf('id="view-body-analysis"');
const todayContent = html.substring(todayStart, todayEnd);

// Find headings, panels, and major sections
const regex = /<(div|article|section)\s+[^>]*class="([^"]*)"[^>]*id="([^"]*)"|<h[234][^>]*>(.*?)<\/h[234]>/gi;
let m;
const items = [];
while ((m = regex.exec(todayContent)) !== null) {
  if (m[4]) {
    items.push({ type: 'heading', text: m[4].replace(/<[^>]+>/g, '').trim() });
  } else {
    items.push({ type: 'container', tag: m[1], class: m[2], id: m[3] });
  }
}
console.log(items.filter(x => x.type === 'heading' || (x.id && !x.id.startsWith('sy') && !x.id.startsWith('water'))));
