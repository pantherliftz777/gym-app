const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const lines = js.split('\n');

for (let i = 3630; i < 3810; i++) {
  const l = lines[i];
  if (l && l.includes("$('#") && !l.includes("if (") && !l.includes("?.")) {
    console.log((i+1) + ': ' + l.trim());
  }
}
