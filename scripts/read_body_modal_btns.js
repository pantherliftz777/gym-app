const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const mStart = html.indexOf('id="bodyAnalysisModal"');
const mEnd = html.indexOf('</div>\n</div>\n', mStart + 1000);
const mContent = html.substring(mStart, mStart + 5000);

const btns = [...mContent.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)];
btns.forEach(b => console.log(b[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), b[0].match(/id="([^"]+)"/)?.[1]));
