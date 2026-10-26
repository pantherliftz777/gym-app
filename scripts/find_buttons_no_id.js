const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const btnRegex = /<button(?![^>]*id=)[^>]*>([\s\S]*?)<\/button>/gi;
let m;
const noIdButtons = [];

while ((m = btnRegex.exec(html)) !== null) {
  const tag = m[0].slice(0, m[0].indexOf('>') + 1);
  const text = m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  noIdButtons.push({ tag, text });
}

console.log(`Buttons without ID: ${noIdButtons.length}`);
noIdButtons.forEach((b, i) => {
  console.log(`${i+1}. "${b.text}" -> ${b.tag}`);
});
