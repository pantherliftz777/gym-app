const fs = require('fs');
const content = fs.readFileSync('gym-app/public/fitfuel.js', 'utf8');

const storageMatches = content.match(/localStorage\.(getItem|setItem|removeItem)\(['"]([^'"]+)['"]/g);
console.log('localStorage keys in fitfuel.js:');
const keys = new Set();
if (storageMatches) {
  storageMatches.forEach(m => {
    const k = m.match(/['"]([^'"]+)['"]/);
    if (k) keys.add(k[1]);
  });
}
console.log(Array.from(keys));

const idbMatches = content.match(/indexedDB\.open\(['"]([^'"]+)['"]/g);
console.log('IndexedDB in fitfuel.js:', idbMatches);
