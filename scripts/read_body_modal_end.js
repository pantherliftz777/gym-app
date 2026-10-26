const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const mStart = html.indexOf('id="bodyAnalysisModal"');
const nextModal = html.indexOf('<div class="modal-backdrop"', mStart + 20);
const mContent = html.substring(mStart, nextModal);

console.log('Length of modal content:', mContent.length);
console.log(mContent.slice(mContent.length - 1200));
