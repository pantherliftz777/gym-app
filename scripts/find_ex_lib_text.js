const fs = require('fs');

['public/index.html', 'public/fitfuel.js'].forEach(file => {
  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, idx) => {
    if (/exercise library/i.test(l)) {
      console.log(`${file}:${idx + 1}: ${l.trim().substring(0, 100)}`);
    }
  });
});
