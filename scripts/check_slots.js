const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

console.log('Does #slot-front exist in index.html?', html.includes('id="slot-front"'));
console.log('Does #slot-back exist in index.html?', html.includes('id="slot-back"'));
console.log('Does #slot-left exist in index.html?', html.includes('id="slot-left"'));
console.log('Does #slot-right exist in index.html?', html.includes('id="slot-right"'));
