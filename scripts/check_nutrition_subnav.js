const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

['view-food-log', 'view-my-foods'].forEach(v => {
  const sIdx = html.indexOf('id="' + v + '"');
  const eIdx = html.indexOf('</section>', sIdx);
  const sec = html.substring(sIdx, eIdx);
  const m = sec.match(/<nav class="hub-subnav-bar"[\s\S]*?<\/nav>/);
  console.log('=== ' + v + ' ===');
  console.log(m ? m[0] : 'None');
});
