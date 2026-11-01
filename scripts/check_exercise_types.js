const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Extract all 'type:' values in EXERCISES_LIBRARY
const types = new Set();
const typeMatches = js.matchAll(/type:\s*['"]([^'"]+)['"]/g);
for (const tm of typeMatches) {
  types.add(tm[1]);
}
console.log('Exercise types found in JS:', Array.from(types).slice(0, 30));
