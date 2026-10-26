const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

console.log('swapExerciseModal in HTML:', html.includes('id="swapExerciseModal"'));
