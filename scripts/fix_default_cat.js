const fs = require('fs');
let s = fs.readFileSync('public/fitfuel.js', 'utf8');
s = s.replace(/let selectedExerciseCategory = 'Legs';\r?\nlet selectedSubMuscle = 'All Legs';/, "let selectedExerciseCategory = 'All';\r\nlet selectedSubMuscle = 'All Movements';\r\nlet selectedEquipmentFilter = 'All';");
fs.writeFileSync('public/fitfuel.js', s, 'utf8');
console.log('Replaced default selectedExerciseCategory successfully!');
