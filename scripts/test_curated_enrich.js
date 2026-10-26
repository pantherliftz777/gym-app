const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/exercises.json'));
const fitfuelCode = fs.readFileSync('public/fitfuel.js', 'utf8');

// Extract curated exercises from EXERCISES_LIBRARY in fitfuel.js
const m = fitfuelCode.match(/let EXERCISES_LIBRARY = \[([\s\S]*?)\];/);
const names = [...fitfuelCode.matchAll(/name:\s*'([^']+)'/g)].map(x => x[1]).slice(0, 40);

const findBestMatch = (curName) => {
  const clean = curName.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
  const words = clean.split(/\s+/).filter(w => w.length > 2 && w !== 'flat');
  if (!words.length) return null;
  return data.find(d => {
    const dWords = d.name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/);
    return words.every(w => dWords.some(dw => dw.includes(w) || w.includes(dw)));
  });
};

let matchedCount = 0;
names.forEach(name => {
  const m = findBestMatch(name);
  if (m) {
    matchedCount++;
    console.log(`✓ ${name} -> ${m.name} (${m.gif})`);
  } else {
    console.log(`✗ ${name}`);
  }
});
console.log(`Matched ${matchedCount} / ${names.length} curated exercises to animated GIFs!`);
