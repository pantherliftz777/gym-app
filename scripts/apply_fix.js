const fs = require('fs');

let js = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. Add MUSCLE_GROUPS at top level right after selectedSubMuscle = 'All Legs';
const topTarget = "let selectedSubMuscle = 'All Legs';";
const topReplacement = `let selectedSubMuscle = 'All Legs';

const MUSCLE_GROUPS = {
  Chest: ['All Chest', 'Upper chest', 'Mid chest', 'Lower chest'],
  Back: ['All Back', 'Lats', 'Upper back & Traps', 'Lower back'],
  Shoulders: ['All Shoulders', 'Front delts', 'Side delts', 'Rear delts'],
  Arms: ['All Arms', 'Biceps', 'Triceps', 'Forearms'],
  Legs: ['All Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Core: ['All Core', 'Upper abs', 'Lower abs', 'Obliques'],
  Cardio: ['All Cardio', 'Bodyweight Cardio', 'High Intensity & Plyo', 'Cardio Machines & Gear'],
  'Full Body': ['All Full Body', 'Compound Strength', 'Conditioning']
};
window.MUSCLE_GROUPS = MUSCLE_GROUPS;`;

if (!js.includes('window.MUSCLE_GROUPS = MUSCLE_GROUPS;')) {
  js = js.replace(topTarget, topReplacement);
  console.log('✔ Added MUSCLE_GROUPS at top level');
} else {
  console.log('MUSCLE_GROUPS already at top level');
}

// 2. Wrap switchWorkoutPlanBtn and markWorkoutDoneBtn in `if`
const oldButtons = `$('#switchWorkoutPlanBtn').onclick = () => {
  activeWorkoutIdx++;
  renderWorkouts();
  renderDashboard();
  toast('Switched workout routine');
};

$('#markWorkoutDoneBtn').onclick = () => {
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  workoutsDone.push({ name: wo.name, date: today(), at: Date.now() });
  store.set('workoutsDone', workoutsDone);
  recordDailyActivity('workout');
  soundFX.victoryCelebration();
  renderDashboard();
  toast(\`Great job! Completed \${wo.name}\`);
};`;

const safeButtons = `if ($('#switchWorkoutPlanBtn')) {
  $('#switchWorkoutPlanBtn').onclick = () => {
    activeWorkoutIdx++;
    renderWorkouts();
    renderDashboard();
    toast('Switched workout routine');
  };
}

if ($('#markWorkoutDoneBtn')) {
  $('#markWorkoutDoneBtn').onclick = () => {
    const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
    workoutsDone.push({ name: wo.name, date: today(), at: Date.now() });
    store.set('workoutsDone', workoutsDone);
    recordDailyActivity('workout');
    soundFX.victoryCelebration();
    renderDashboard();
    toast(\`Great job! Completed \${wo.name}\`);
  };
}`;

if (js.includes(oldButtons.replace(/\n/g, '\r\n'))) {
  js = js.replace(oldButtons.replace(/\n/g, '\r\n'), safeButtons.replace(/\n/g, '\r\n'));
  console.log('✔ Wrapped workout buttons safely (CRLF)');
} else if (js.includes(oldButtons)) {
  js = js.replace(oldButtons, safeButtons);
  console.log('✔ Wrapped workout buttons safely (LF)');
} else {
  console.log('Buttons already wrapped or not found');
}

// 3. Remove duplicate declaration of MUSCLE_GROUPS around line 3806 if present
const dupMuscleGroups = `const MUSCLE_GROUPS = {
  Chest: ['All Chest', 'Upper chest', 'Mid chest', 'Lower chest'],
  Back: ['All Back', 'Lats', 'Upper back & Traps', 'Lower back'],
  Shoulders: ['All Shoulders', 'Front delts', 'Side delts', 'Rear delts'],
  Arms: ['All Arms', 'Biceps', 'Triceps', 'Forearms'],
  Legs: ['All Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Core: ['All Core', 'Upper abs', 'Lower abs', 'Obliques'],
  Cardio: ['All Cardio', 'Bodyweight Cardio', 'High Intensity & Plyo', 'Cardio Machines & Gear'],
  'Full Body': ['All Full Body', 'Compound Strength', 'Conditioning']
};`;

// Replace second occurrence only
const firstIdx = js.indexOf('const MUSCLE_GROUPS = {');
const secondIdx = js.indexOf('const MUSCLE_GROUPS = {', firstIdx + 20);
if (secondIdx !== -1) {
  const before = js.substring(0, secondIdx);
  const after = js.substring(secondIdx);
  const replacedAfter = after.replace(
    dupMuscleGroups.replace(/\n/g, '\r\n'),
    '// MUSCLE_GROUPS initialized at top level'
  ).replace(
    dupMuscleGroups,
    '// MUSCLE_GROUPS initialized at top level'
  );
  js = before + replacedAfter;
  console.log('✔ Removed duplicate MUSCLE_GROUPS definition');
}

fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('Done updating public/fitfuel.js');
