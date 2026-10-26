const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Find all buttons in index.html
const btnRegex = /<button[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/button>/gi;
let m;
const unreferenced = [];
const referenced = [];

while ((m = btnRegex.exec(html)) !== null) {
  const id = m[1];
  const text = m[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  if (!js.includes(id)) {
    unreferenced.push({ id, text });
  } else {
    referenced.push({ id, text });
  }
}

console.log(`Total buttons with ID in index.html: ${unreferenced.length + referenced.length}`);
console.log(`Referenced in fitfuel.js: ${referenced.length}`);
console.log(`UNREFERENCED in fitfuel.js: ${unreferenced.length}`);
console.log('Unreferenced buttons:');
unreferenced.forEach(u => console.log(`  - [${u.id}] "${u.text}"`));
