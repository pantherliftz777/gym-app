const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const matches = [...js.matchAll(/function\s+(addWater|updateWater|logWater|renderWater)[^{]*\{/g)];
console.log('Water functions:');
matches.forEach(m => console.log(m[0]));

const idx = js.indexOf('resetWaterBtn');
console.log('\nAround resetWaterBtn:');
console.log(js.substring(idx - 100, idx + 800));
