const fs = require('fs');
const exercises = JSON.parse(fs.readFileSync('public/data/exercises.json', 'utf8'));

console.log('Total exercises:', exercises.length);

const HOME_EQUIPMENT = new Set([
  'body weight', 'dumbbell', 'band', 'resistance band',
  'stability ball', 'medicine ball', 'bosu ball', 'roller', 'wheel roller'
]);

const FORBIDDEN_HOME = ['barbell', 'cable', 'machine', 'smith', 'sled', 'assisted', 'trap bar', 'ez barbell', 'ergometer', 'bike', 'elliptical'];

function isHomeFriendly(ex) {
  const eq = (ex.equipment || '').toLowerCase();
  const name = (ex.name || '').toLowerCase();
  for (const f of FORBIDDEN_HOME) {
    if (eq.includes(f) || name.includes(f)) return false;
  }
  return HOME_EQUIPMENT.has(eq) || eq.includes('body weight') || eq.includes('dumbbell') || eq.includes('band');
}

const homeCount = exercises.filter(isHomeFriendly).length;
console.log('Home friendly exercises count:', homeCount);
console.log('Gym exercises count:', exercises.length);

// Check by category for home exercises
const byCat = {};
exercises.filter(isHomeFriendly).forEach(e => {
  const c = e.category || 'other';
  byCat[c] = (byCat[c] || 0) + 1;
});
console.log('Home exercises by category:', byCat);
