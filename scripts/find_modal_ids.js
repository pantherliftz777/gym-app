const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const mStart = html.indexOf('id="bodyAnalysisModal"');
const nextModal = html.indexOf('<!-- UNIVERSAL LIVE CAMERA VIEWFINDER MODAL', mStart);
const mContent = html.substring(mStart, nextModal);

// Find all elements with an ID inside bodyAnalysisModal
const idMatches = [...mContent.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
console.log('All IDs inside bodyAnalysisModal:', idMatches);
