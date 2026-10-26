const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('class="stronger-you-hero-card"');
let depth = 0;
for (let i = sIdx; i < html.length; i++) {
  if (html.slice(i, i + 4) === '<div') depth++;
  if (html.slice(i, i + 6) === '</div>') {
    depth--;
    if (depth === 0) {
      console.log('stronger-you-hero-card closes at:', i);
      console.log('After it:');
      console.log(html.slice(i, i + 400));
      break;
    }
  }
}
