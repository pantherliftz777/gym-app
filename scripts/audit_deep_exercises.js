const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'exercises.json'), 'utf8');
const exercises = JSON.parse(raw);

// Check exercises where equipment is "body weight"
const bwWithEquipment = [];
exercises.forEach(e => {
  const eq = (e.equipment || '').toLowerCase();
  const name = (e.name || '').toLowerCase();
  const instr = (e.instructions_en || '').toLowerCase();

  if (eq === 'body weight') {
    if (name.includes('pull-up') || name.includes('chin-up') || name.includes('pullup') || name.includes('chinup')) {
      bwWithEquipment.push({ id: e.id, name: e.name, needed: 'Pull-up Bar' });
    } else if (name.includes('bench dip') || (name.includes('dip') && !name.includes('shrug') && instr.includes('bench'))) {
      bwWithEquipment.push({ id: e.id, name: e.name, needed: 'Bench or Chair' });
    } else if (name.includes('chair') || instr.includes('chair')) {
      bwWithEquipment.push({ id: e.id, name: e.name, needed: 'Chair' });
    } else if (name.includes('jump rope') || name.includes('skipping')) {
      bwWithEquipment.push({ id: e.id, name: e.name, needed: 'Skipping Rope' });
    }
  }
});

console.log('Bodyweight exercises requiring additional apparatus:', bwWithEquipment.length);
bwWithEquipment.slice(0, 20).forEach(x => console.log(`  - [${x.needed}] ${x.name}`));

// Check exercises with "bench"
const benchExercises = [];
exercises.forEach(e => {
  const name = e.name.toLowerCase();
  const instr = (e.instructions_en || '').toLowerCase();
  if (name.includes('bench') && !name.includes('bench dip')) {
    benchExercises.push({ id: e.id, name: e.name, eq: e.equipment });
  }
});
console.log('\nExercises requiring Bench (excluding bench dip):', benchExercises.length);
benchExercises.slice(0, 15).forEach(x => console.log(`  - [${x.eq}] ${x.name}`));
