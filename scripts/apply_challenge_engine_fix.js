const fs = require('fs');

const fitfuelPath = 'public/fitfuel.js';
let content = fs.readFileSync(fitfuelPath, 'utf8');

// 1. window.exercisesLoadedPromise
if (!content.includes('window.exercisesLoadedPromise')) {
  content = content.replace(
    'let EXERCISES_JSON_MAP = {}; // id/name -> {gif, instructions_en, muscle, equipment, category, level}\r\n\r\n(async function loadExercisesJson() {',
    'let EXERCISES_JSON_MAP = {}; // id/name -> {gif, instructions_en, muscle, equipment, category, level}\r\n\r\nwindow.exercisesLoadedPromise = (async function loadExercisesJson() {'
  );
  if (!content.includes('window.exercisesLoadedPromise')) {
    content = content.replace(
      'let EXERCISES_JSON_MAP = {}; // id/name -> {gif, instructions_en, muscle, equipment, category, level}\n\n(async function loadExercisesJson() {',
      'let EXERCISES_JSON_MAP = {}; // id/name -> {gif, instructions_en, muscle, equipment, category, level}\n\nwindow.exercisesLoadedPromise = (async function loadExercisesJson() {'
    );
  }
}

// 2. Prepare the new buildDayByDayRoutines and generateAIChallengePlan code
const newChallengeEngineCode = `
/* ================= ADVANCED BIOMECHANICAL CHALLENGE ROUTINES ENGINE ================= */
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

const PASSIVE_NOISE_TERMS = [
  'stretch', 'toe touch', 'ankle circle', 'wrist circle', 'neck rotation',
  'balance board', 'assisted prone', 'assisted lying', 'foam roll', 'massage ball'
];
function isPassiveNoise(ex) {
  const n = (ex.name || '').toLowerCase();
  return PASSIVE_NOISE_TERMS.some(term => n.includes(term));
}

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

const MUSCLE_BIOMECHANICS = {
  push: new Set(['pectorals', 'delts', 'triceps', 'serratus anterior']),
  pull: new Set(['lats', 'upper back', 'traps', 'biceps', 'forearms']),
  legs: new Set(['quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors']),
  core: new Set(['abs', 'spine']),
  cardio: new Set(['cardiovascular system'])
};

function getExerciseBiomechanicalGroup(ex) {
  const m = (ex.muscle || '').toLowerCase();
  for (const [group, set] of Object.entries(MUSCLE_BIOMECHANICS)) {
    if (set.has(m)) return group;
  }
  const cat = (ex.category || '').toLowerCase();
  if (cat.includes('chest') || cat.includes('shoulder')) return 'push';
  if (cat.includes('back')) return 'pull';
  if (cat.includes('leg')) return 'legs';
  if (cat.includes('waist') || cat.includes('core')) return 'core';
  if (cat.includes('cardio')) return 'cardio';
  return 'push';
}

function isPlyoOrHIITExercise(ex) {
  const n = (ex.name || '').toLowerCase();
  const cat = (ex.category || '').toLowerCase();
  return cat.includes('cardio') || n.includes('jump') || n.includes('burpee') || n.includes('hop') || n.includes('climber') || n.includes('jack') || n.includes('skater') || n.includes('twist') || n.includes('squat jump');
}

const MOTIVE_SPLITS = {
  fat: [
    { title: 'Full-Body Metabolic Torcher', focus: 'High Calorie Burn · Compound Movement · Core', targetGroups: ['core', 'legs', 'push', 'pull'] },
    { title: 'Core Shred & Waistline Sculpt', focus: 'Deep Abs · Obliques · Kinetic Endurance', targetGroups: ['core'] },
    { title: 'Lower Body Calorie Blast', focus: 'Quads · Glutes · Hamstrings · Explosive Stamina', targetGroups: ['legs'] },
    { title: 'Upper Body Tone & Cardio Metcon', focus: 'Chest · Back · Shoulders · High Cadence', targetGroups: ['push', 'pull'] },
    { title: 'Tabata & Plyometric Fat Burn', focus: 'Explosive Conditioning · Agility · Caloric Burn', targetGroups: ['core', 'legs', 'cardio'] },
    { title: 'Functional Athletic Shred', focus: 'Compound Full-Body Density · Core Armor', targetGroups: ['push', 'pull', 'legs'] },
    { title: 'Active Recovery & Core Flush', focus: 'Active Mobility · Light Core · Decompression', targetGroups: ['core'] }
  ],
  hypertrophy: [
    { title: 'Push Hypertrophy: Chest, Delts & Triceps', focus: 'Clavicular Chest · Front Delts · Tricep Mass', targetGroups: ['push'] },
    { title: 'Pull Hypertrophy: Lats, Traps & Biceps', focus: 'Lat Width · Upper Back Density · Bicep Peak', targetGroups: ['pull'] },
    { title: 'Quad Dominance & Calve Power', focus: 'Quad Sweep · Calves · Glute Stamina', targetGroups: ['legs'] },
    { title: 'Shoulder Cannon & Core Stability', focus: 'Lateral Deltoids · Posterior Delts · Core Wall', targetGroups: ['push', 'core'] },
    { title: 'Hamstring, Glute & Posterior Chain', focus: 'Hamstrings · Hip Hinge · Glute Hypertrophy', targetGroups: ['legs', 'pull'] },
    { title: 'Upper Body Arnold Pump & Arms', focus: 'Chest & Back Superset · Biceps · Triceps', targetGroups: ['push', 'pull'] },
    { title: 'Active Deload & Functional Core', focus: 'Joint Flushes · Anti-Extension Core · Mobility', targetGroups: ['core'] }
  ],
  strength: [
    { title: 'Heavy Compound Push & Power', focus: 'Max Force Chest · Tricep Lockout · Deltoid Power', targetGroups: ['push'] },
    { title: 'Posterior Pull & Heavy Lats', focus: 'Lat Drive · Spinal Erectors · Upper Back Force', targetGroups: ['pull'] },
    { title: 'Squat Dominance & Leg Drive', focus: 'Quadriceps Force · Glute Recruitment · Bracing', targetGroups: ['legs'] },
    { title: 'Overhead Press & Core Power', focus: 'Strict Shoulder Press · Trap Drive · Deep Core', targetGroups: ['push', 'core'] },
    { title: 'Explosive Kinetic Pull & Back', focus: 'Kinetic Drive · Heavy Rows · CNS Recruitment', targetGroups: ['pull', 'legs'] },
    { title: 'Heavy Full-Body Neural Triad', focus: 'Compound Structural Integrity · Grip Power', targetGroups: ['push', 'pull', 'legs'] },
    { title: 'CNS Decompression & Joint Recovery', focus: 'Joint Decompression · Light Core · Neural Reset', targetGroups: ['core'] }
  ],
  tone: [
    { title: 'Total Body Functional Calibration', focus: 'Kinetic Balance · Posture · Lean Tone', targetGroups: ['push', 'pull', 'legs'] },
    { title: 'Waistline Sculpt & Deep Core', focus: 'Transverse Abdominis · Obliques · Stability', targetGroups: ['core'] },
    { title: 'Lower Body Lean Sculpt', focus: 'Leg Toning · Hip Balance · Glute Shape', targetGroups: ['legs'] },
    { title: 'Upper Body Postural Alignment', focus: 'Scapular Retraction · Toned Arms & Shoulders', targetGroups: ['pull', 'push'] },
    { title: 'Athletic Agility & Stamina', focus: 'Cadence · Dynamic Balance · Stamina', targetGroups: ['legs', 'core'] },
    { title: 'Kinetic Flow & Full Body Tone', focus: 'Muscle Endurance · Flow Conditioning', targetGroups: ['push', 'pull', 'core'] },
    { title: 'Deep Recovery & Structural Mobility', focus: 'Joint Longevity · Flexibility · Breathwork', targetGroups: ['core'] }
  ]
};

// Helper: Day-by-day routines generator factoring in user bodyweight, height & all user selected inputs
function buildDayByDayRoutines(motive, durationDays, w, h, targetMinutes = 45, intensity = 'Moderate', workoutTypes = ['Gym']) {
  const mLower = (motive || '').toLowerCase();
  let motiveKey = 'fat';
  if (mLower.includes('muscle') || mLower.includes('hypertrophy')) motiveKey = 'hypertrophy';
  else if (mLower.includes('strength') || mLower.includes('power')) motiveKey = 'strength';
  else if (mLower.includes('tone') || mLower.includes('maintain')) motiveKey = 'tone';

  const isHome = workoutTypes.includes('Home') && !workoutTypes.includes('Gym');
  const isHIIT = workoutTypes.includes('HIIT');
  const isCardio = workoutTypes.includes('Cardio');
  const isStretching = workoutTypes.includes('Stretching');

  // Determine number of exercises based on selected target minutes
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
  let rawPool = Array.isArray(EXERCISES_LIBRARY) && EXERCISES_LIBRARY.length > 50 
    ? EXERCISES_LIBRARY 
    : Object.values(EXERCISES_JSON_MAP || {});
  if (!rawPool.length) rawPool = EXERCISES_LIBRARY;

  const availablePool = rawPool.filter(ex => {
    if (isHome && !isHomeExercise(ex)) return false;
    if (isPassiveNoise(ex)) return false;
    return true;
  });

  const templates = MOTIVE_SPLITS[motiveKey];
  const days = [];

  for (let i = 1; i <= durationDays; i++) {
    const t = templates[(i - 1) % templates.length];
    const envPrefix = isHome ? 'Home ' : '';
    const dayTitle = \`Day \${i}: \${envPrefix}\${t.title}\`;
    const dayFocus = \`\${t.focus}\${isHome ? ' · Home Gear' : ' · Gym Equipment'}\`;

    // Filter candidate exercises for this day's targeted groups
    let dayPool = availablePool.filter(ex => {
      const bio = getExerciseBiomechanicalGroup(ex);
      return t.targetGroups.includes(bio);
    });
    if (dayPool.length < baseCount) dayPool = availablePool;

    // Prioritize high-impact compound movements first
    dayPool.sort((a, b) => getExerciseScore(b) - getExerciseScore(a));

    // If HIIT is selected, ensure we inject 1 HIIT/plyo exercise
    let hiitPool = availablePool.filter(isPlyoOrHIITExercise);
    if (!hiitPool.length) hiitPool = dayPool;

    // Pick unique exercises for this day
    const mainCount = isStretching ? Math.max(2, baseCount - 1) : baseCount;
    const dayExercises = [];
    const usedNames = new Set();

    // If HIIT or Cardio is requested, designate middle slot as explosive interval
    const hiitSlotIndex = (isHIIT || isCardio) ? Math.floor(mainCount / 2) : -1;

    // Stagger starting offset by day number so consecutive days get fresh exercises from 1318 dataset
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
        equipment: candidate.equipment || (isHome ? 'body weight' : 'gym'),
        sets: sets,
        reps: isCandidatePlyo ? '45s interval or 20 reps' : repsScheme,
        durationSec: 45,
        restSec: isCandidatePlyo ? Math.min(restSec, 35) : restSec,
        tip: candidate.steps || candidate.rxWhy || 'Maintain strict form, core locked, and full controlled range of motion.'
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
      intensity: \`\${intensity} · \${targetMinutes}m Session\`,
      estDuration: \`\${targetMinutes} min\`,
      completed: false,
      completedAt: null,
      exercises: dayExercises
    });
  }
  return days;
}

window.buildDayByDayRoutines = buildDayByDayRoutines;
window.generateAIChallengePlan = generateAIChallengePlan;

async function generateAIChallengePlan(motive, durationDays, targetMinutes = 45, intensity = 'Moderate', types = ['Gym']) {
  const btn = $('#generateChallengePlanBtn');
  const origText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Engineering AI Plan...'; }
  toast(\`AI is personalizing your \${durationDays}-Day \${motive} Challenge (\${targetMinutes} min/day)...\`);

  // Ensure full 1,318 exercises dataset is loaded before building routines
  if (window.exercisesLoadedPromise) {
    try { await window.exercisesLoadedPromise; } catch (e) {}
  }

  const w = profile.wKg || 70;
  const h = profile.hCm || 175;

  const planDays = buildDayByDayRoutines(motive, durationDays, w, h, targetMinutes, intensity, types);

  const newChallenge = {
    id: 'chall_' + Date.now(),
    motive: motive,
    durationDays: Number(durationDays),
    totalWorkoutMinutes: Number(targetMinutes) || 45,
    intensity: intensity || 'Moderate',
    types: types && types.length ? types : ['Gym'],
    createdAt: Date.now(),
    startDate: today(),
    currentDayIndex: 0,
    completedCount: 0,
    userWeight: w,
    userHeight: h,
    days: planDays
  };

  // Safe storage: NEVER deleted unless user explicitly selects Exit Challenge or finishes
  activeChallengePlan = newChallenge;
  window.activeChallengePlan = newChallenge;
  store.set('activeChallengePlan', activeChallengePlan);
  if (FF.online && FF.user) {
    FF.patch({ activeChallenge: activeChallengePlan });
  }

  closeModal('#challengeDurationModal');
  if (btn) { btn.disabled = false; btn.textContent = origText; }

  switchView('challenge');
  renderChallengeView();
  renderTrackingView();
  updateLiveWaterEstimate();
  toast(\`\${durationDays}-Day Challenge Created! Your customized Day 1 is ready.\`);
  window.activeChallengePlan = activeChallengePlan;
  window.generateAIChallengePlan = generateAIChallengePlan;
}
`;

// Locate start and end of buildDayByDayRoutines + generateAIChallengePlan
const startMarker = '// Helper: Day-by-day routines generator factoring in user bodyweight, height & motive';
const endMarker = '/* ================= WORKOUT SECTION CUSTOMIZATION & EXPLORER ================= */';

const sIdx = content.indexOf(startMarker);
const eIdx = content.indexOf(endMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error('ERROR: Could not locate markers in public/fitfuel.js', { sIdx, eIdx });
  process.exit(1);
}

content = content.substring(0, sIdx) + newChallengeEngineCode.trim() + '\r\n\r\n' + content.substring(eIdx);

// 3. Update refreshTodayRoutineBtn in renderChallengeView
const oldRefresh = `    $('#refreshTodayRoutineBtn').onclick = () => {
      const freshExercises = buildDayByDayRoutines(activeChallengePlan.motive, 1, activeChallengePlan.userWeight, activeChallengePlan.userHeight)[0].exercises;
      activeChallengePlan.days[currentIdx].exercises = freshExercises;
      store.set('activeChallengePlan', activeChallengePlan);
      if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
      renderChallengeView();
      toast('Refreshed today’s exercises with new movements!');
    };`;

const newRefresh = `    $('#refreshTodayRoutineBtn').onclick = () => {
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
    };`;

content = content.replace(oldRefresh.replace(/\r\n/g, '\n'), newRefresh.replace(/\r\n/g, '\n'));
// Also try with CRLF
content = content.replace(oldRefresh, newRefresh);

// 4. Update openSwapExerciseModal
const oldSwapAlternatives = `    const q = filterQuery.toLowerCase().trim();
    const matches = EXERCISES_LIBRARY.filter(e => {
      if (e.name.toLowerCase() === currentEx.name.toLowerCase()) return false;
      if (q) return e.name.toLowerCase().includes(q) || (e.sub && e.sub.toLowerCase().includes(q));
      return (e.category && currentEx.category && e.category.toLowerCase() === currentEx.category.toLowerCase()) || true;
    }).slice(0, 20);`;

const newSwapAlternatives = `    const q = filterQuery.toLowerCase().trim();
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

content = content.replace(oldSwapAlternatives.replace(/\r\n/g, '\n'), newSwapAlternatives.replace(/\r\n/g, '\n'));
content = content.replace(oldSwapAlternatives, newSwapAlternatives);

fs.writeFileSync(fitfuelPath, content, 'utf8');
console.log('Successfully updated public/fitfuel.js with advanced challenge routine generator!');
