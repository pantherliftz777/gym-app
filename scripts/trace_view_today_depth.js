const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('id="view-today"');
const dgIdx = html.indexOf('class="dashboard-grid"');
const slice = html.slice(sIdx, dgIdx);

// Count tags
const tokens = slice.match(/<\/?([a-zA-Z0-9\-]+)[^>]*>/g) || [];
let depth = 0;
const stack = [];

tokens.forEach(t => {
  const isClose = t.startsWith('</');
  const isSelf = t.endsWith('/>') || t.includes('<img') || t.includes('<input') || t.includes('<br') || t.includes('<hr');
  const tagMatch = t.match(/<\/?([a-zA-Z0-9\-]+)/);
  const tag = tagMatch ? tagMatch[1].toLowerCase() : '';

  if (isSelf) return;

  if (isClose) {
    depth--;
    const last = stack.pop();
    if (depth < 1) {
      console.log('DEPTH DROPPED BELOW 1 AT:', t, 'expected:', last);
    }
  } else {
    depth++;
    stack.push(tag);
  }
});

console.log('Final depth before dashboard-grid:', depth);
console.log('Stack remaining:', stack);
