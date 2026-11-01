const fs = require('fs');
const exercisesData = JSON.parse(fs.readFileSync('public/data/exercises.json', 'utf8'));

const MUSCLE_MAP = {
  push: new Set(['pectorals', 'delts', 'triceps', 'serratus anterior']),
  pull: new Set(['lats', 'upper back', 'traps', 'biceps', 'forearms']),
  legs: new Set(['quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors']),
  core: new Set(['abs', 'spine']),
  cardio: new Set(['cardiovascular system'])
};

function getExerciseBiomechanicalGroup(ex) {
  const m = (ex.muscle || '').toLowerCase();
  for (const [group, set] of Object.entries(MUSCLE_MAP)) {
    if (set.has(m)) return group;
  }
  const cat = (ex.category || '').toLowerCase();
  if (cat.includes('chest') || cat.includes('shoulder')) return 'push';
  if (cat.includes('back')) return 'pull';
  if (cat.includes('leg')) return 'legs';
  if (cat.includes('waist')) return 'core';
  if (cat.includes('cardio')) return 'cardio';
  return 'push';
}

console.log('Biomechanical groups test:');
const counts = {};
exercisesData.forEach(e => {
  const g = getExerciseBiomechanicalGroup(e);
  counts[g] = (counts[g] || 0) + 1;
});
console.log(counts);
