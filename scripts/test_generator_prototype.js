const fs = require('fs');
const exercisesData = JSON.parse(fs.readFileSync('public/data/exercises.json', 'utf8'));

// Build mapped library like fitfuel.js does
const EXERCISES_LIBRARY = exercisesData.map(ex => {
  let cat = 'Full Body';
  const m = (ex.muscle || ex.category || '').toLowerCase();
  if (m.includes('chest') || m.includes('pectoral')) cat = 'Chest';
  else if (m.includes('back') || m.includes('lat') || m.includes('trap')) cat = 'Back';
  else if (m.includes('shoulder') || m.includes('delt')) cat = 'Shoulders';
  else if (m.includes('bicep') || m.includes('tricep') || m.includes('forearm') || m.includes('arm')) cat = 'Arms';
  else if (m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('calf') || m.includes('leg')) cat = 'Legs';
  else if (m.includes('abs') || m.includes('oblique') || m.includes('core') || m.includes('waist')) cat = 'Core';
  return {
    name: ex.name,
    category: cat,
    sub: ex.muscle || ex.category || cat,
    equipment: ex.equipment || 'body weight',
    type: (ex.equipment || 'body weight').toUpperCase(),
    gif: ex.gif || '',
    instructions_en: ex.instructions_en || '',
    steps: ex.instructions_en || '',
    level: ex.level || 'beginner'
  };
});

const HOME_EQUIPMENT_KEYWORDS = [
  'body weight', 'dumbbell', 'band', 'resistance band',
  'stability ball', 'medicine ball', 'bosu ball', 'roller', 'wheel roller'
];
const FORBIDDEN_HOME_KEYWORDS = [
  'barbell', 'cable', 'machine', 'smith', 'sled', 'assisted', 'trap bar', 'ez barbell', 'ergometer', 'bike', 'elliptical'
];

function isHomeExercise(ex) {
  const eq = (ex.equipment || ex.type || '').toLowerCase();
  const name = (ex.name || '').toLowerCase();
  for (const f of FORBIDDEN_HOME_KEYWORDS) {
    if (eq.includes(f) || name.includes(f)) return false;
  }
  for (const kw of HOME_EQUIPMENT_KEYWORDS) {
    if (eq.includes(kw)) return true;
  }
  return false;
}

// Noise / passive stretch filter for active working sets
const PASSIVE_NOISE = [
  'stretch', 'toe touch', 'ankle circle', 'wrist circle', 'neck rotation',
  'balance board', 'assisted prone', 'assisted lying', 'foam roll', 'massage ball'
];
function isPassiveNoise(ex) {
  const n = (ex.name || '').toLowerCase();
  return PASSIVE_NOISE.some(term => n.includes(term));
}

// Key compound fitness keywords to prioritize
const COMPOUND_KEYWORDS = [
  'squat', 'bench press', 'deadlift', 'push-up', 'push up', 'pull-up', 'pull up',
  'overhead press', 'shoulder press', 'row', 'lunge', 'bicep curl', 'tricep',
  'dip', 'crunch', 'plank', 'burpee', 'mountain climber', 'glute bridge', 'hip thrust',
  'russian twist', 'leg raise', 'lateral raise', 'calf raise', 'step-up', 'clean'
];

function getExerciseScore(ex) {
  const n = (ex.name || '').toLowerCase();
  let score = 0;
  for (const kw of COMPOUND_KEYWORDS) {
    if (n.includes(kw)) {
      score += 10;
      break;
    }
  }
  if (ex.level === 'intermediate' || ex.level === 'beginner') score += 2;
  return score;
}

const MOTIVE_SPLITS = {
  fat: [
    { title: 'Full-Body Metabolic Torcher', focus: 'High Calorie Burn · Compound Movement · Core', targetGroups: ['Core', 'Legs', 'Chest', 'Full Body'] },
    { title: 'Core Shred & Waistline Sculpt', focus: 'Deep Abs · Obliques · Kinetic Endurance', targetGroups: ['Core'] },
    { title: 'Lower Body Calorie Blast', focus: 'Quads · Glutes · Hamstrings · Explosive Stamina', targetGroups: ['Legs'] },
    { title: 'Upper Body Tone & Cardio Metcon', focus: 'Chest · Back · Shoulders · High Cadence', targetGroups: ['Chest', 'Back', 'Shoulders', 'Arms'] },
    { title: 'Tabata & Plyometric Fat Burn', focus: 'Explosive Conditioning · Agility · Caloric Burn', targetGroups: ['Core', 'Legs'] },
    { title: 'Functional Athletic Shred', focus: 'Compound Full-Body Density · Core Armor', targetGroups: ['Chest', 'Back', 'Legs'] },
    { title: 'Active Recovery & Core Flush', focus: 'Active Mobility · Light Core · Decompression', targetGroups: ['Core'] }
  ],
  hypertrophy: [
    { title: 'Push Hypertrophy: Chest, Delts & Triceps', focus: 'Clavicular Chest · Front Delts · Tricep Mass', targetGroups: ['Chest', 'Shoulders', 'Arms'] },
    { title: 'Pull Hypertrophy: Lats, Traps & Biceps', focus: 'Lat Width · Upper Back Density · Bicep Peak', targetGroups: ['Back', 'Arms'] },
    { title: 'Quad Dominance & Calve Power', focus: 'Quad Sweep · Calves · Glute Stamina', targetGroups: ['Legs'] },
    { title: 'Shoulder Cannon & Core Stability', focus: 'Lateral Deltoids · Posterior Delts · Core Wall', targetGroups: ['Shoulders', 'Core'] },
    { title: 'Hamstring, Glute & Posterior Chain', focus: 'Hamstrings · Hip Hinge · Glute Hypertrophy', targetGroups: ['Legs', 'Back'] },
    { title: 'Upper Body Arnold Pump & Arms', focus: 'Chest & Back Superset · Biceps · Triceps', targetGroups: ['Arms', 'Chest', 'Back'] },
    { title: 'Active Deload & Functional Core', focus: 'Joint Flushes · Anti-Extension Core · Mobility', targetGroups: ['Core'] }
  ],
  strength: [
    { title: 'Heavy Compound Push & Power', focus: 'Max Force Chest · Tricep Lockout · Deltoid Power', targetGroups: ['Chest', 'Shoulders', 'Arms'] },
    { title: 'Posterior Pull & Heavy Lats', focus: 'Lat Drive · Spinal Erectors · Upper Back Force', targetGroups: ['Back', 'Arms'] },
    { title: 'Squat Dominance & Leg Drive', focus: 'Quadriceps Force · Glute Recruitment · Bracing', targetGroups: ['Legs'] },
    { title: 'Overhead Press & Core Power', focus: 'Strict Shoulder Press · Trap Drive · Deep Core', targetGroups: ['Shoulders', 'Core'] },
    { title: 'Explosive Kinetic Pull & Back', focus: 'Kinetic Drive · Heavy Rows · CNS Recruitment', targetGroups: ['Back', 'Legs', 'Chest'] },
    { title: 'Heavy Full-Body Neural Triad', focus: 'Compound Structural Integrity · Grip Power', targetGroups: ['Chest', 'Back', 'Legs'] },
    { title: 'CNS Decompression & Joint Recovery', focus: 'Joint Decompression · Light Core · Neural Reset', targetGroups: ['Core'] }
  ],
  tone: [
    { title: 'Total Body Functional Calibration', focus: 'Kinetic Balance · Posture · Lean Tone', targetGroups: ['Chest', 'Back', 'Legs'] },
    { title: 'Waistline Sculpt & Deep Core', focus: 'Transverse Abdominis · Obliques · Stability', targetGroups: ['Core'] },
    { title: 'Lower Body Lean Sculpt', focus: 'Leg Toning · Hip Balance · Glute Shape', targetGroups: ['Legs'] },
    { title: 'Upper Body Postural Alignment', focus: 'Scapular Retraction · Toned Arms & Shoulders', targetGroups: ['Back', 'Shoulders', 'Arms'] },
    { title: 'Athletic Agility & Stamina', focus: 'Cadence · Dynamic Balance · Stamina', targetGroups: ['Legs', 'Core'] },
    { title: 'Kinetic Flow & Full Body Tone', focus: 'Muscle Endurance · Flow Conditioning', targetGroups: ['Chest', 'Back', 'Core'] },
    { title: 'Deep Recovery & Structural Mobility', focus: 'Joint Longevity · Flexibility · Breathwork', targetGroups: ['Core'] }
  ]
};

function isPlyoOrHIITExercise(ex) {
  const n = (ex.name || '').toLowerCase();
  const cat = (ex.category || '').toLowerCase();
  return cat.includes('cardio') || n.includes('jump') || n.includes('burpee') || n.includes('hop') || n.includes('climber') || n.includes('jack') || n.includes('skater') || n.includes('twist') || n.includes('squat jump');
}

function buildDayByDayRoutinesTest(motive, durationDays, w, h, targetMinutes = 45, intensity = 'Moderate', workoutTypes = ['Gym']) {
  const mLower = (motive || '').toLowerCase();
  let motiveKey = 'fat';
  if (mLower.includes('muscle') || mLower.includes('hypertrophy')) motiveKey = 'hypertrophy';
  else if (mLower.includes('strength') || mLower.includes('power')) motiveKey = 'strength';
  else if (mLower.includes('tone') || mLower.includes('maintain')) motiveKey = 'tone';

  const isHome = workoutTypes.includes('Home') && !workoutTypes.includes('Gym');
  const isHIIT = workoutTypes.includes('HIIT');
  const isCardio = workoutTypes.includes('Cardio');
  const isStretching = workoutTypes.includes('Stretching');

  // Exercise counts by duration
  let baseCount = 5;
  if (targetMinutes <= 20) baseCount = 3;
  else if (targetMinutes <= 35) baseCount = 4;
  else if (targetMinutes <= 45) baseCount = 5;
  else baseCount = 7;

  // Reps & Sets by Intensity & Motive
  let sets = 3;
  let restSec = 50;
  let repsScheme = '10–12 reps';

  if (motiveKey === 'strength') {
    if (intensity === 'Hard') { sets = 4; restSec = 75; repsScheme = '4–6 heavy reps'; }
    else if (intensity === 'Mild') { sets = 2; restSec = 75; repsScheme = '8–10 controlled reps'; }
    else { sets = 3; restSec = 60; repsScheme = '6–8 power reps'; }
  } else if (motiveKey === 'fat') {
    if (intensity === 'Hard') { sets = 4; restSec = 35; repsScheme = '16–20 reps (max burn)'; }
    else if (intensity === 'Mild') { sets = 2; restSec = 60; repsScheme = '12–14 reps'; }
    else { sets = 3; restSec = 45; repsScheme = '14–16 reps'; }
  } else if (motiveKey === 'hypertrophy') {
    if (intensity === 'Hard') { sets = 4; restSec = 45; repsScheme = '10–12 reps (near failure)'; }
    else if (intensity === 'Mild') { sets = 2; restSec = 70; repsScheme = '10–12 smooth reps'; }
    else { sets = 3; restSec = 60; repsScheme = '8–12 reps'; }
  } else { // tone
    if (intensity === 'Hard') { sets = 4; restSec = 40; repsScheme = '14–16 reps'; }
    else if (intensity === 'Mild') { sets = 2; restSec = 60; repsScheme = '10–12 reps'; }
    else { sets = 3; restSec = 50; repsScheme = '12–15 reps'; }
  }

  // Pre-filter candidate exercises pool based on environment (Home vs Gym)
  const availablePool = EXERCISES_LIBRARY.filter(ex => {
    if (isHome && !isHomeExercise(ex)) return false;
    if (isPassiveNoise(ex)) return false;
    return true;
  });

  const templates = MOTIVE_SPLITS[motiveKey];
  const days = [];

  for (let i = 1; i <= durationDays; i++) {
    const t = templates[(i - 1) % templates.length];
    const envPrefix = isHome ? 'Home ' : '';
    const dayTitle = `Day ${i}: ${envPrefix}${t.title}`;
    const dayFocus = t.focus + (isHome ? ' · Home Equipment' : ' · Gym Equipment');

    // Filter candidate exercises for this day's targeted groups
    let dayPool = availablePool.filter(ex => {
      return t.targetGroups.some(tg => ex.category.toLowerCase().includes(tg.toLowerCase()));
    });
    if (dayPool.length < baseCount) dayPool = availablePool;

    // Sort exercises to prioritize compound/foundational movements first, then sub-order
    dayPool.sort((a, b) => getExerciseScore(b) - getExerciseScore(a));

    // If HIIT is selected, ensure we inject 1 HIIT/plyo exercise
    let hiitPool = availablePool.filter(isPlyoOrHIITExercise);
    if (!hiitPool.length) hiitPool = dayPool;

    // Pick unique exercises for this day
    const mainCount = isStretching ? Math.max(2, baseCount - 1) : baseCount;
    const dayExercises = [];
    const usedNames = new Set();

    // If HIIT or Cardio is requested, designate the middle slot as an explosive/cardio interval
    const hiitSlotIndex = (isHIIT || isCardio) ? Math.floor(mainCount / 2) : -1;

    // Stagger starting offset by day number so consecutive days get fresh exercises
    const offset = ((i - 1) * 2) % Math.max(1, dayPool.length - mainCount);

    for (let slot = 0; slot < mainCount; slot++) {
      let candidate = null;
      const isThisHiitSlot = (slot === hiitSlotIndex);
      const activePool = isThisHiitSlot ? hiitPool : dayPool;

      for (let attempt = 0; attempt < activePool.length; attempt++) {
        const idx = (offset + slot + attempt) % activePool.length;
        const testEx = activePool[idx];
        if (!usedNames.has(testEx.name.toLowerCase())) {
          candidate = testEx;
          break;
        }
      }
      if (!candidate) candidate = activePool[slot % activePool.length];
      usedNames.add(candidate.name.toLowerCase());

      const isCandidatePlyo = isPlyoOrHIITExercise(candidate);
      dayExercises.push({
        name: candidate.name,
        subMuscle: candidate.sub || candidate.category,
        category: candidate.category,
        equipment: candidate.equipment,
        sets: sets,
        reps: isCandidatePlyo ? '45s interval or 20 reps' : repsScheme,
        durationSec: 45,
        restSec: isCandidatePlyo ? Math.min(restSec, 35) : restSec,
        tip: candidate.steps || 'Maintain strict form, core locked, and full controlled range of motion.'
      });
    }

    // Add stretching mobility move if requested
    if (isStretching) {
      const stretches = [
        { name: "World's Greatest Stretch & Thoracic Opener", tip: "Lunge forward, plant opposite hand, and rotate chest skyward to open hip flexors and thoracic spine." },
        { name: "Cat-Cow & Deep Hip Flexor Release", tip: "Arch and round spine with deep breathing, transitioning into a kneeling hip flexor stretch." },
        { name: "Pigeon Pose & Deep Piriformis Release", tip: "Square hips to floor, lengthen through crown, and sink gently into the glute stretch." },
        { name: "Downward Dog into Cobra Decompression Flow", tip: "Drive heels down and press chest to thighs, then smoothly glide into cobra to decompress lumbar spine." }
      ];
      const stretch = stretches[(i - 1) % stretches.length];
      dayExercises.push({
        name: stretch.name,
        subMuscle: "Mobility & Cooldown",
        category: "Stretching",
        equipment: "body weight",
        sets: 2,
        reps: "45s hold each side",
        durationSec: 45,
        restSec: 30,
        tip: stretch.tip
      });
    }

    days.push({
      dayNumber: i,
      title: dayTitle,
      focus: dayFocus,
      intensity: `${intensity} · ${targetMinutes}m Session`,
      estDuration: `${targetMinutes} min`,
      completed: false,
      completedAt: null,
      exercises: dayExercises
    });
  }

  return days;
}

console.log('\n================ TEST 1: Home + Burn Fat + 20min + Hard + HIIT ================');
const t1 = buildDayByDayRoutinesTest('Burn Fat & Lean Out', 3, 70, 175, 20, 'Hard', ['Home', 'HIIT']);
t1.forEach(d => {
  console.log(`\n${d.title} [${d.intensity}]`);
  console.log(`Focus: ${d.focus}`);
  d.exercises.forEach((e, idx) => console.log(`  ${idx+1}. ${e.name} [${e.equipment}] (${e.category}) - ${e.sets} sets x ${e.reps}, Rest: ${e.restSec}s`));
});

console.log('\n================ TEST 2: Gym + Raw Strength + 60min + Hard ================');
const t2 = buildDayByDayRoutinesTest('Raw Strength & Power', 3, 85, 182, 60, 'Hard', ['Gym']);
t2.forEach(d => {
  console.log(`\n${d.title} [${d.intensity}]`);
  console.log(`Focus: ${d.focus}`);
  d.exercises.forEach((e, idx) => console.log(`  ${idx+1}. ${e.name} [${e.equipment}] (${e.category}) - ${e.sets} sets x ${e.reps}, Rest: ${e.restSec}s`));
});

console.log('\n================ TEST 3: Gym + Hypertrophy + 45min + Moderate + Stretching ================');
const t3 = buildDayByDayRoutinesTest('Build Muscle & Hypertrophy', 3, 78, 178, 45, 'Moderate', ['Gym', 'Stretching']);
t3.forEach(d => {
  console.log(`\n${d.title} [${d.intensity}]`);
  console.log(`Focus: ${d.focus}`);
  d.exercises.forEach((e, idx) => console.log(`  ${idx+1}. ${e.name} [${e.equipment}] (${e.category}) - ${e.sets} sets x ${e.reps}, Rest: ${e.restSec}s`));
});
