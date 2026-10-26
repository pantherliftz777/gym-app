const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const mStart = html.indexOf('id="bodyAnalysisModal"');
const nextModal = html.indexOf('<!-- UNIVERSAL LIVE CAMERA VIEWFINDER MODAL', mStart);
const mContent = html.substring(mStart, nextModal);

const btnRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
let m;
while ((m = btnRegex.exec(mContent)) !== null) {
  const id = m[1].match(/id="([^"]+)"/)?.[1];
  const cls = m[1].match(/class="([^"]+)"/)?.[1];
  const text = m[2].replace(/<[^>]+>/g, '').trim();
  console.log({ id, cls, text });
}
