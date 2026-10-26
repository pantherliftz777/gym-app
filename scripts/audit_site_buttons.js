const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Extract all buttons from HTML
const btnRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
let m;
const allButtons = [];

while ((m = btnRegex.exec(html)) !== null) {
  const attrs = m[1];
  const inner = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const idMatch = attrs.match(/id="([^"]+)"/);
  const classMatch = attrs.match(/class="([^"]+)"/);
  const onclickMatch = attrs.match(/onclick="([^"]+)"/);
  const dataClose = attrs.includes('data-close');
  const dataView = attrs.match(/data-view="([^"]+)"/);
  const dataModal = attrs.match(/data-modal="([^"]+)"/);

  const id = idMatch ? idMatch[1] : null;
  const cls = classMatch ? classMatch[1] : '';
  const onclick = onclickMatch ? onclickMatch[1] : null;

  allButtons.push({
    id,
    cls,
    inner: inner.slice(0, 30),
    onclick,
    dataClose,
    dataView: dataView ? dataView[1] : null,
    dataModal: dataModal ? dataModal[1] : null
  });
}

console.log('Total <button> elements in HTML:', allButtons.length);

const unhandled = [];
allButtons.forEach(b => {
  // If it has onclick, data-close, data-view, data-modal, it's handled declaratively
  if (b.onclick || b.dataClose || b.dataView || b.dataModal) return;

  // If it has an ID, check if fitfuel.js references it
  if (b.id) {
    const isReferenced = js.includes(b.id);
    if (!isReferenced) {
      unhandled.push({ ...b, reason: 'ID not referenced in fitfuel.js' });
    }
  } else {
    // Has no ID. Check if class is handled
    const classes = b.cls.split(' ').filter(Boolean);
    const anyClassHandled = classes.some(c => js.includes('.' + c));
    if (!anyClassHandled) {
      unhandled.push({ ...b, reason: 'No ID and no class listener' });
    }
  }
});

console.log('Unhandled buttons count:', unhandled.length);
console.log('Sample unhandled buttons:', unhandled.slice(0, 30));
