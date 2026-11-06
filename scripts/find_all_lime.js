const fs = require('fs');

const html = fs.readFileSync('gym-app/public/dashboard.html', 'utf8');

const matches = [...html.matchAll(/#CEFF1A|#ceff1a/gi)];
console.log('Total matches of #CEFF1A in dashboard.html:', matches.length);

const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (/#CEFF1A|#ceff1a/i.test(l)) {
    console.log(`Line ${idx + 1}: ${l.trim().slice(0, 120)}`);
  }
});
