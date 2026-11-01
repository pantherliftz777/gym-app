const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const lines = js.split('\n');

const html = fs.readFileSync('public/index.html', 'utf8');

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  // Look for direct onclick/onchange/oninput on $('#something') at root level (indentation 0)
  if (/^\$\(['"]#([\w-]+)['"]\)\.on\w+\s*=/.test(l.trim())) {
    const idMatch = l.match(/\$\(['"]#([\w-]+)['"]\)/);
    if (idMatch) {
      const id = idMatch[1];
      const inHtml = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
      if (!inHtml) {
        console.log(`Line ${i+1}: missing #${id} in HTML: ${l.trim()}`);
      }
    }
  }
}
