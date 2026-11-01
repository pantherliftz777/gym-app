const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const lines = js.split('\n');

[5612, 5620, 5631, 6709, 6881, 6885, 6899, 6915, 7816].forEach(idx => {
  console.log(`--- Line ${idx} ---`);
  for (let i = Math.max(0, idx - 5); i <= Math.min(lines.length - 1, idx + 5); i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
});
