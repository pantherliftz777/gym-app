const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const pIdx = html.indexOf('class="page-content"');
console.log('page-content index:', pIdx);

// Check if all .view sections are inside .page-content or where page-content is closed
const viewIndices = [...html.matchAll(/id="view-[^"]+"/g)].map(m => ({ id: m[0], index: m.index }));
console.log('Total views in HTML:', viewIndices.length);

// Also check the CSS rule:
// If we add:
// .view { display: none; }
// .view.active { display: block; }
// That guarantees ANY view everywhere is hidden unless active!
