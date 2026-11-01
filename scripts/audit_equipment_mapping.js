const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'exercises.json'), 'utf8');
const exercises = JSON.parse(raw);

const eqCounts = {};
exercises.forEach(e => {
  const eq = e.equipment || 'none';
  eqCounts[eq] = (eqCounts[eq] || 0) + 1;
});

console.log('--- Equipment value counts in exercises.json ---');
Object.entries(eqCounts).sort((a,b) => b[1] - a[1]).forEach(([eq, count]) => {
  console.log(`${eq.padEnd(25)}: ${count}`);
});

console.log('\n--- Checking exercises with "bench" or "pull-up" or "rope" in name ---');
const benchEx = exercises.filter(e => e.name.toLowerCase().includes('bench'));
console.log('Exercises with "bench" in name:', benchEx.length);

const pullUpEx = exercises.filter(e => e.name.toLowerCase().includes('pull-up') || e.name.toLowerCase().includes('chin-up') || e.name.toLowerCase().includes('pullup'));
console.log('Exercises with "pull-up/chin-up" in name:', pullUpEx.length);

const ropeEx = exercises.filter(e => e.name.toLowerCase().includes('rope') || e.name.toLowerCase().includes('skip'));
console.log('Exercises with "rope/skip" in name:', ropeEx.length);
