const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Find EXERCISES_LIBRARY sample entries
const m = js.match(/const EXERCISES_LIBRARY = \[([\s\S]*?)\];/);
if (m) {
  const sample = m[1].slice(0, 1500);
  console.log('Sample EXERCISES_LIBRARY:');
  console.log(sample);
}
