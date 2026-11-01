const fs = require('fs');
const path = require('path');

const jsContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'fitfuel.js'), 'utf8');

const startIdx = jsContent.indexOf('const EXERCISES_LIBRARY = [');
const endIdx = jsContent.indexOf('];\r\n\r\n// Pre-populate gif field');
const endIdxLF = jsContent.indexOf('];\n\n// Pre-populate gif field');
const actualEnd = endIdx !== -1 ? endIdx : endIdxLF;
const initialLibCode = jsContent.slice(startIdx, actualEnd + 2);

let EXERCISES_LIBRARY = null;
eval(initialLibCode.replace('const EXERCISES_LIBRARY =', 'EXERCISES_LIBRARY ='));
console.log('Initial hand-crafted EXERCISES_LIBRARY count:', EXERCISES_LIBRARY.length);

const exercisesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'exercises.json'), 'utf8'));

const existingNames = new Set(EXERCISES_LIBRARY.map(e => e.name.toLowerCase().trim()));
let addedCount = 0;
for (const ex of exercisesJson) {
  if (!ex.name || existingNames.has(ex.name.toLowerCase().trim())) continue;
  existingNames.add(ex.name.toLowerCase().trim());
  addedCount++;
  EXERCISES_LIBRARY.push({
    name: ex.name,
    category: ex.category,
    sub: ex.muscle,
    type: (ex.equipment || 'body weight').toUpperCase(),
    equipment: ex.equipment || 'body weight'
  });
}

console.log('Added from exercises.json:', addedCount);
console.log('Combined EXERCISES_LIBRARY count:', EXERCISES_LIBRARY.length);
