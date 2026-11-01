const fs = require('fs');
['public/index.html', 'public/styles.css', 'public/fitfuel.js'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('hero-carousel')) console.log('Found in', f);
});
