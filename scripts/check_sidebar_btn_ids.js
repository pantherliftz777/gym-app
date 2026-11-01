const fs = require('fs');
['public/index.html', 'public/fitfuel.js', 'public/styles.css'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/sidebar[A-Za-z]+Btn/g);
  if (m) console.log(f, Array.from(new Set(m)));
});
