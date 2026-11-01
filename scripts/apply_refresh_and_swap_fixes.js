const fs = require('fs');
let content = fs.readFileSync('public/fitfuel.js', 'utf8');

const target1 = `  if ($('#refreshTodayRoutineBtn')) {
    $('#refreshTodayRoutineBtn').onclick = () => {
      const freshExercises = buildDayByDayRoutines(activeChallengePlan.motive, 1, activeChallengePlan.userWeight, activeChallengePlan.userHeight)[0].exercises;
      activeChallengePlan.days[currentIdx].exercises = freshExercises;
      store.set('activeChallengePlan', activeChallengePlan);
      if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
      renderChallengeView();
      toast('Refreshed today’s exercises with new movements!');
    };
  }`;

const replace1 = `  if ($('#refreshTodayRoutineBtn')) {
    $('#refreshTodayRoutineBtn').onclick = () => {
      const freshRoutine = buildDayByDayRoutines(
        activeChallengePlan.motive,
        activeChallengePlan.durationDays || 15,
        activeChallengePlan.userWeight,
        activeChallengePlan.userHeight,
        activeChallengePlan.totalWorkoutMinutes || 45,
        activeChallengePlan.intensity || 'Moderate',
        activeChallengePlan.types || ['Gym']
      )[currentIdx];
      if (freshRoutine && freshRoutine.exercises) {
        activeChallengePlan.days[currentIdx].exercises = freshRoutine.exercises;
        activeChallengePlan.days[currentIdx].title = freshRoutine.title;
        activeChallengePlan.days[currentIdx].focus = freshRoutine.focus;
      }
      store.set('activeChallengePlan', activeChallengePlan);
      if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
      renderChallengeView();
      toast('Refreshed today’s exercises with new movements!');
    };
  }`;

const target2 = `    const q = filterQuery.toLowerCase().trim();
    const matches = EXERCISES_LIBRARY.filter(e => {
      if (e.name.toLowerCase() === currentEx.name.toLowerCase()) return false;
      if (q) return e.name.toLowerCase().includes(q) || (e.sub && e.sub.toLowerCase().includes(q));
      return (e.category && currentEx.category && e.category.toLowerCase() === currentEx.category.toLowerCase()) || true;
    }).slice(0, 20);`;

const replace2 = `    const q = filterQuery.toLowerCase().trim();
    const isHome = activeChallengePlan && activeChallengePlan.types && activeChallengePlan.types.includes('Home') && !activeChallengePlan.types.includes('Gym');
    let pool = EXERCISES_LIBRARY.filter(e => {
      if (e.name.toLowerCase() === currentEx.name.toLowerCase()) return false;
      if (isHome && !isHomeExercise(e)) return false;
      if (isPassiveNoise(e)) return false;
      return true;
    });
    if (q) {
      pool = pool.filter(e => e.name.toLowerCase().includes(q) || (e.sub && e.sub.toLowerCase().includes(q)) || (e.muscle && e.muscle.toLowerCase().includes(q)));
    } else {
      const targetGroup = getExerciseBiomechanicalGroup(currentEx);
      const sameGroup = pool.filter(e => getExerciseBiomechanicalGroup(e) === targetGroup);
      if (sameGroup.length >= 8) pool = sameGroup;
    }
    const matches = pool.slice(0, 25);`;

function multiReplace(str, t, r) {
  if (str.includes(t)) return str.replace(t, r);
  const tLf = t.replace(/\r\n/g, '\n');
  const rLf = r.replace(/\r\n/g, '\n');
  if (str.includes(tLf)) return str.replace(tLf, rLf);
  const tCrlf = t.replace(/\n/g, '\r\n');
  const rCrlf = r.replace(/\n/g, '\r\n');
  if (str.includes(tCrlf)) return str.replace(tCrlf, rCrlf);
  return str;
}

content = multiReplace(content, target1, replace1);
content = multiReplace(content, target2, replace2);

fs.writeFileSync('public/fitfuel.js', content, 'utf8');
console.log('Update check:');
console.log('Has freshRoutine:', content.includes('freshRoutine'));
console.log('Has sameGroup in swap:', content.includes('sameGroup.length >= 8'));
