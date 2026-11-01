const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

['view-profile', 'view-customization'].forEach(v => {
  const sIdx = html.indexOf('id="' + v + '"');
  const eIdx = html.indexOf('</section>', sIdx);
  const sec = html.substring(sIdx, eIdx);
  console.log('=== ' + v + ' (first 300 chars) ===');
  console.log(sec.substring(0, 300));
});
