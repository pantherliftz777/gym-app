const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'exercises.json'), 'utf8'));
console.log('Total exercises in exercises.json:', data.length);
console.log('Sample exercise 0:', data[0]);

const equipmentSet = new Set();
const categorySet = new Set();
const muscleSet = new Set();

data.forEach(ex => {
  if (ex.equipment) equipmentSet.add(ex.equipment);
  if (ex.category) categorySet.add(ex.category);
  if (ex.muscle) muscleSet.add(ex.muscle);
});

console.log('\nEquipment values in exercises.json:');
console.log(Array.from(equipmentSet).sort());

console.log('\nCategories in exercises.json:');
console.log(Array.from(categorySet).sort());

console.log('\nMuscles in exercises.json:');
console.log(Array.from(muscleSet).sort());
