const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'exercises.json'), 'utf8');
const exercisesJson = JSON.parse(raw);

// Canonical equipment items
const HOME_EQUIPMENT = [
  'Bodyweight',
  'Dumbbells',
  'Resistance Bands',
  'Bench',
  'Pull-up Bar',
  'Kettlebells',
  'Skipping Rope',
  'Exercise Mat',
  'Chair'
];

const GYM_EQUIPMENT = [
  'Bodyweight',
  'Dumbbells',
  'Barbells',
  'Weight Machines',
  'Cable Machines',
  'Smith Machine',
  'Bench',
  'Pull-up Bar',
  'Kettlebells',
  'Treadmill',
  'Stationary Bike',
  'Elliptical'
];

function resolveExerciseEquipmentAndLocation(ex) {
  const name = (ex.name || '').toLowerCase();
  const rawEq = (ex.equipment || ex.type || '').toLowerCase();
  const instr = (ex.instructions_en || ex.steps || '').toLowerCase();
  const cat = (ex.category || '').toLowerCase();
  const sub = (ex.sub || '').toLowerCase();

  const needed = new Set();

  // 1. Determine equipment
  if (rawEq === 'body weight' || rawEq.includes('body') || rawEq.includes('none')) {
    needed.add('Bodyweight');
    if (name.includes('pull-up') || name.includes('chin-up') || name.includes('pullup') || name.includes('chinup')) {
      needed.add('Pull-up Bar');
    } else if (name.includes('bench dip') || (name.includes('dip') && !name.includes('shrug') && instr.includes('bench'))) {
      needed.add('Bench');
    } else if (name.includes('chair') || instr.includes('chair')) {
      needed.add('Chair');
    } else if (name.includes('jump rope') || name.includes('skipping')) {
      needed.add('Skipping Rope');
    } else if (name.includes('box jump') || name.includes('step-up')) {
      needed.add('Bench');
    }
  } else if (rawEq.includes('dumbbell')) {
    needed.add('Dumbbells');
    if (name.includes('bench') || name.includes('incline') || name.includes('decline') || 
        name.includes('lying') || name.includes('fly') || name.includes('preacher') || name.includes('chest press')) {
      needed.add('Bench');
    }
  } else if (rawEq.includes('barbell') || rawEq.includes('ez') || rawEq.includes('trap bar') || rawEq.includes('olympic')) {
    needed.add('Barbells');
    if (name.includes('bench') || name.includes('incline') || name.includes('decline') || name.includes('lying') || name.includes('chest press')) {
      needed.add('Bench');
    }
  } else if (rawEq.includes('cable')) {
    needed.add('Cable Machines');
    if (name.includes('bench') || name.includes('seated') && instr.includes('bench')) {
      needed.add('Bench');
    }
  } else if (rawEq.includes('smith')) {
    needed.add('Smith Machine');
    if (name.includes('bench') || name.includes('incline') || name.includes('decline')) {
      needed.add('Bench');
    }
  } else if (rawEq.includes('band') || rawEq.includes('resistance band')) {
    needed.add('Resistance Bands');
  } else if (rawEq.includes('kettlebell')) {
    needed.add('Kettlebells');
  } else if (rawEq.includes('treadmill') || name.includes('treadmill')) {
    needed.add('Treadmill');
  } else if (rawEq.includes('bike') || name.includes('cycle') || name.includes('stationary bike')) {
    needed.add('Stationary Bike');
  } else if (rawEq.includes('elliptical') || name.includes('elliptical')) {
    needed.add('Elliptical');
  } else if (rawEq.includes('rope')) {
    if (name.includes('jump') || name.includes('skipping')) {
      needed.add('Skipping Rope');
    } else {
      needed.add('Weight Machines'); // Gym conditioning
    }
  } else if (rawEq.includes('machine') || rawEq.includes('leverage') || rawEq.includes('sled') || rawEq.includes('skierg') || rawEq.includes('ergometer')) {
    needed.add('Weight Machines');
  } else {
    // Default fallback
    needed.add('Bodyweight');
  }

  // 2. Compatible Locations
  const requiredList = Array.from(needed);
  const homeAvailable = new Set(HOME_EQUIPMENT);
  const gymAvailable = new Set(GYM_EQUIPMENT);

  const canHome = requiredList.every(eq => homeAvailable.has(eq));
  const canGym = requiredList.every(eq => gymAvailable.has(eq));

  const compatibleLocations = [];
  if (canHome) compatibleLocations.push('home');
  if (canGym) compatibleLocations.push('gym');
  if (compatibleLocations.length === 0) compatibleLocations.push('gym'); // fallback

  // 3. Workout Types
  const workoutTypes = [];
  const isHiit = name.includes('jump') || name.includes('burpee') || name.includes('hop') || 
                 name.includes('jack') || name.includes('climber') || name.includes('sprint') || 
                 name.includes('hiit') || name.includes('high knee') || sub.includes('plyo') || 
                 name.includes('box jump') || name.includes('skater') || name.includes('kettlebell swing');
  
  const isCardio = cat === 'cardio' || name.includes('run') || name.includes('cycle') || 
                   name.includes('bike') || name.includes('rope') || name.includes('skip') || 
                   name.includes('treadmill') || name.includes('rowing') || name.includes('jack') ||
                   name.includes('burpee') || name.includes('climber') || name.includes('sprint') ||
                   name.includes('jog') || name.includes('elliptical') || name.includes('aerobic');

  const isStretching = name.includes('stretch') || name.includes('plank') || name.includes('twist') || 
                       name.includes('mobility') || name.includes('roll') || name.includes('reach') || 
                       name.includes('bridge') || sub.includes('mobility') || sub.includes('flexibility') ||
                       name.includes('cat-cow') || name.includes('child pose') || name.includes('cobra');

  if (isHiit) workoutTypes.push('hiit');
  if (isCardio) workoutTypes.push('cardio');
  if (isStretching) workoutTypes.push('stretching');
  // If not purely stretching or if it involves weights/resistance:
  if (!isStretching || requiredList.some(r => r !== 'Bodyweight' && r !== 'Exercise Mat') || 
      name.includes('press') || name.includes('squat') || name.includes('curl') || name.includes('deadlift') || 
      name.includes('pull') || name.includes('row') || name.includes('push-up') || name.includes('lunge')) {
    workoutTypes.push('strength');
  }

  // Alternatives mapping
  const alternatives = [];
  if (name.includes('bench press') || name.includes('chest press machine')) {
    alternatives.push('Push-ups', 'Dumbbell Floor Press');
  } else if (name.includes('lat pulldown') || name.includes('cable pulldown')) {
    alternatives.push('Resistance Band Lat Pulldown', 'Pull-ups', 'Inverted Rows');
  } else if (name.includes('leg extension')) {
    alternatives.push('Bodyweight Sissy Squats', 'Goblet Squats');
  } else if (name.includes('leg press')) {
    alternatives.push('Bulgarian Split Squats', 'Bodyweight Squats');
  } else if (name.includes('bicep curl')) {
    alternatives.push('Resistance Band Bicep Curls', 'Chin-ups');
  } else if (name.includes('tricep pushdown')) {
    alternatives.push('Diamond Push-ups', 'Bench Dips');
  }

  return {
    canonicalEquipment: requiredList,
    compatibleLocations,
    workoutTypes,
    alternatives
  };
}

// Test against all 1318 exercises
let homeCount = 0;
let gymCount = 0;
let pureBwCount = 0;
let multiEqCount = 0;

exercisesJson.forEach(ex => {
  const meta = resolveExerciseEquipmentAndLocation(ex);
  if (meta.compatibleLocations.includes('home')) homeCount++;
  if (meta.compatibleLocations.includes('gym')) gymCount++;
  if (meta.canonicalEquipment.length === 1 && meta.canonicalEquipment[0] === 'Bodyweight') pureBwCount++;
  if (meta.canonicalEquipment.length > 1) multiEqCount++;
});

console.log('Total exercises tested:', exercisesJson.length);
console.log('Home compatible:', homeCount);
console.log('Gym compatible:', gymCount);
console.log('Pure Bodyweight (No Equipment):', pureBwCount);
console.log('Multi-Equipment exercises (e.g. Dumbbells + Bench):', multiEqCount);

// Test strict cases
console.log('\n--- Specific Case Checks ---');
const pushups = exercisesJson.find(e => e.name.toLowerCase() === 'push-up' || e.name.toLowerCase() === 'pushups' || e.name.toLowerCase() === 'push-ups');
if (pushups) console.log('Push-ups:', resolveExerciseEquipmentAndLocation(pushups));

const pullups = exercisesJson.find(e => e.name.toLowerCase().includes('pull-up'));
if (pullups) console.log('Pull-ups sample:', pullups.name, resolveExerciseEquipmentAndLocation(pullups));

const dbBench = exercisesJson.find(e => e.name.toLowerCase().includes('dumbbell bench press'));
if (dbBench) console.log('DB Bench Press sample:', dbBench.name, resolveExerciseEquipmentAndLocation(dbBench));

const cableFly = exercisesJson.find(e => e.name.toLowerCase().includes('cable'));
if (cableFly) console.log('Cable sample:', cableFly.name, resolveExerciseEquipmentAndLocation(cableFly));
