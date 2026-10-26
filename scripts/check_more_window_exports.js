const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

console.log('window.openExerciseDetailModal:', js.includes('window.openExerciseDetailModal'));
console.log('window.openSwapExerciseModal:', js.includes('window.openSwapExerciseModal'));
console.log('window.startWorkoutSession:', js.includes('window.startWorkoutSession'));
