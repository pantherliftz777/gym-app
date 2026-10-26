const fs = require('fs');
const files = ['public/api.js', 'public/algo.js', 'public/fitfuel.js'];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`${f} has analyze4DBodyComposition:`, content.includes('analyze4DBodyComposition'));
});
