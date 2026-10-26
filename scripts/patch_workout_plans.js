const fs = require('fs');

let code = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. Expand WORKOUT_PLANS to 10 comprehensive routines
const oldPlansRegex = /let WORKOUT_PLANS = \[[\s\S]*?\];\s*if \(plan && plan\.workout && !WORKOUT_PLANS\.some\(w => w\.name === plan\.workout\.name\)\) \{\s*WORKOUT_PLANS\.unshift\(plan\.workout\);\s*\}/;

const newPlans = `let WORKOUT_PLANS = [
  {
    name: 'Full-body Strength & Hypertrophy',
    focus: 'Glutes · Back · Chest · Core',
    duration: '45 min',
    moves: [
      { name: 'Barbell Back Squat', sets: '3 sets × 8–10 reps', tip: 'Brace 360° core, break at hips & knees together, drive through midfoot.' },
      { name: 'Flat Barbell Bench Press', sets: '3 sets × 8–10 reps', tip: 'Retract scapulae, maintain arch, lower under control to lower sternum.' },
      { name: 'Barbell Bent-Over Row', sets: '3 sets × 10 reps', tip: 'Hinge at 45°, pull bar to lower belly button, squeeze lats at peak.' },
      { name: 'Romanian Deadlift', sets: '3 sets × 10–12 reps', tip: 'Hips back, soft knee bend, feel deep hamstring stretch before driving up.' },
      { name: 'Dead bug', sets: '3 sets × 12 reps each', tip: 'Press lumbar spine into ground, extend opposite arm and leg synchronously.' }
    ],
    benefit: 'The foundational compound routine to build full-body muscular density, bone strength, and metabolic output.'
  },
  {
    name: 'Upper Body Push Power',
    focus: 'Chest · Shoulders · Triceps',
    duration: '42 min',
    moves: [
      { name: 'Incline Dumbbell Bench Press', sets: '3–4 sets × 8–10 reps', tip: 'Set bench to 30°, flare elbows 45°, press dumbbells in smooth converging arc.' },
      { name: 'Overhead Dumbbell Shoulder Press', sets: '3 sets × 8–10 reps', tip: 'Lock ribs down, press overhead without arching lumbar spine.' },
      { name: 'Chest Dips', sets: '3 sets × 10–12 reps', tip: 'Lean torso forward 20° to bias chest fibers, lower until upper arms parallel.' },
      { name: 'Dumbbell Lateral Raise', sets: '3 sets × 12–15 reps', tip: 'Lead with elbows, slight forward lean, pause briefly at parallel.' },
      { name: 'Tricep Rope Pushdown', sets: '3 sets × 12–15 reps', tip: 'Pin elbows to ribs, spread rope handles apart at bottom lockout.' }
    ],
    benefit: 'Targeted upper body push session maximizing chest fullness, 3D shoulder capping, and tricep strength.'
  },
  {
    name: 'Upper Body Pull & Lats',
    focus: 'Lats · Upper Back · Biceps',
    duration: '40 min',
    moves: [
      { name: 'Lat Pulldown', sets: '3–4 sets × 8–10 reps', tip: 'Depress shoulders first, pull bar to collarbone, avoid excessive swinging.' },
      { name: 'Single-Arm Dumbbell Row', sets: '3 sets × 10 reps each', tip: 'Pull elbow toward hip pocket, pause at peak contraction.' },
      { name: 'Face Pull', sets: '3 sets × 12–15 reps', tip: 'Pull rope to nose/forehead height, externally rotate shoulders to finish.' },
      { name: 'Dumbbell Shrug', sets: '3 sets × 12 reps', tip: 'Elevate traps straight up toward ears, hold 1 full second at apex.' },
      { name: 'Incline Dumbbell Curl', sets: '3 sets × 10–12 reps', tip: 'Full supination, maximize bicep long head stretch at the bottom.' }
    ],
    benefit: 'Sculpt a wide, powerful V-taper while bulletproofing the rotator cuff and posterior shoulders.'
  },
  {
    name: 'Lower Body Quads & Glute Drive',
    focus: 'Quads · Glutes · Calves',
    duration: '45 min',
    moves: [
      { name: 'Barbell Back Squat', sets: '3–4 sets × 6–8 reps', tip: 'Drive knees outward in line with toes, maintain neutral cervical spine.' },
      { name: 'Bulgarian Split Squat', sets: '3 sets × 8–10 reps each', tip: 'Front shin vertical, drop back knee straight down, drive through front heel.' },
      { name: 'Goblet Squat', sets: '3 sets × 12 reps', tip: 'Hold dumbbell tight at sternum, squat deep between hips.' },
      { name: 'Standing Calf Raise', sets: '4 sets × 15 reps', tip: '2-second pause at maximum stretch, explosive drive to ball of foot.' }
    ],
    benefit: 'High-yield lower body session to develop quad hypertrophy, glute power, and explosive athletic propulsion.'
  },
  {
    name: 'Posterior Chain & Hamstring Power',
    focus: 'Hamstrings · Glutes · Lower Back',
    duration: '42 min',
    moves: [
      { name: 'Conventional Deadlift', sets: '3 sets × 5 reps', tip: 'Pack lats, drag bar up shins, push the floor away like a leg press.' },
      { name: 'Barbell Hip Thrust', sets: '3–4 sets × 10–12 reps', tip: 'Chin tucked, full posterior pelvic tilt at top, 1-second glute squeeze.' },
      { name: 'Dumbbell Romanian Deadlift', sets: '3 sets × 10 reps', tip: 'Keep dumbbells tight to thighs, push hips back until hamstrings are taut.' },
      { name: 'Hyperextension / Back Extension', sets: '3 sets × 12–15 reps', tip: 'Hinge only at hips, avoid hyperextending lumbar spine at top.' }
    ],
    benefit: 'Strengthens the posterior kinetic chain, enhances posture, and prevents lower back injuries.'
  },
  {
    name: 'Home Bodyweight Calisthenics (Zero Equipment)',
    focus: 'Chest · Shoulders · Core',
    duration: '32 min',
    moves: [
      { name: 'Push-up', sets: '3 sets × 12–15 reps', tip: 'Straight plank line, elbows 45°, chest touches 1 inch off floor.' },
      { name: 'Incline Push-up', sets: '3 sets × 12 reps', tip: 'Elevate hands on bench or sturdy chair for upper chest emphasis.' },
      { name: 'Bodyweight Squat', sets: '3 sets × 20 reps', tip: 'Smooth tempo, reach parallel depth, keep heels glued down.' },
      { name: 'Plank Shoulder Tap', sets: '3 sets × 16 taps', tip: 'Anti-rotation focus: zero swaying in the hips while tapping opposite shoulder.' },
      { name: 'Bird Dog', sets: '3 sets × 12 reps each', tip: 'Full extension of opposite limbs, squeeze glute and lat simultaneously.' }
    ],
    benefit: '100% zero-equipment workout calibrated for home fitness, calisthenic control, and joint stability.'
  },
  {
    name: 'Home Cardio Shred & Metcon',
    focus: 'Conditioning · Fat Burn · Stamina',
    duration: '30 min',
    moves: [
      { name: 'Burpee', sets: '3 sets × 40s active · 20s rest', tip: 'Drop chest swiftly, pop feet up outside hands, explode up with soft landing.' },
      { name: 'Jumping Jacks', sets: '3 sets × 45s active · 15s rest', tip: 'Light on balls of feet, rhythmic breathing, full arm extension.' },
      { name: 'Mountain Climber', sets: '3 sets × 40s active · 20s rest', tip: 'High plank position, drive knees to chest without raising hips.' },
      { name: 'High Knees', sets: '3 sets × 30s active · 30s rest', tip: 'Pumping arms, drive knees above hip line, quick ground contact.' }
    ],
    benefit: 'Maximum heart-rate conditioning to boost VO2 max, elevate metabolic rate, and accelerate fat oxidation.'
  },
  {
    name: '3D Shoulders & Arms Sculpt',
    focus: 'Delts · Biceps · Triceps',
    duration: '38 min',
    moves: [
      { name: 'Barbell Military Press', sets: '3 sets × 8–10 reps', tip: 'Squeeze glutes and quads for base stability, press in straight vertical plane.' },
      { name: 'Dumbbell Lateral Raise', sets: '3 sets × 12–15 reps', tip: 'Lead with elbows, control the eccentric lowering to maintain constant delt tension.' },
      { name: 'Rear Delt Fly', sets: '3 sets × 12–15 reps', tip: 'Hinge over, pull dumbbells wide, squeeze rear delts without shrugging traps.' },
      { name: 'Dumbbell Hammer Curl', sets: '3 sets × 10 reps', tip: 'Neutral palms, targets brachialis and forearms for thick arm profile.' },
      { name: 'Overhead Tricep Extension', sets: '3 sets × 12 reps', tip: 'Elbows forward and high, deep stretch behind neck, lockout triceps at top.' }
    ],
    benefit: 'Focused aesthetic conditioning for complete shoulder roundness and balanced arm development.'
  },
  {
    name: 'Core Armor & Rotational Power',
    focus: 'Abs · Obliques · Deep Core',
    duration: '28 min',
    moves: [
      { name: 'Hanging Leg Raise', sets: '3 sets × 10–12 reps', tip: 'Tilt pelvis backward as legs rise, avoid swinging or momentum.' },
      { name: 'Russian Twist', sets: '3 sets × 20 twists', tip: 'Lean back 45°, rotate ribcage fully from side to side, keep feet steady.' },
      { name: 'Ab Wheel Rollout', sets: '3 sets × 8–10 reps', tip: 'Tuck pelvis, roll out as far as core allows without dropping lumbar spine.' },
      { name: 'Side Plank', sets: '3 sets × 35s each side', tip: 'Elbow under shoulder, stack feet, drive bottom hip upward into straight line.' }
    ],
    benefit: 'Fortifies the midsection with 360-degree core stiffness to maximize lifting safety and trunk athleticism.'
  },
  {
    name: 'Full Body Mobility & Recovery Flow',
    focus: 'Joint Health · Decompression · Flexibility',
    duration: '25 min',
    moves: [
      { name: "World's Greatest Stretch", sets: '2 sets × 6 reps each', tip: 'Deep lunge with elbow to instep, open thoracic spine with high hand reach.' },
      { name: 'Cat-Cow Stretch', sets: '2 sets × 10 breath cycles', tip: 'Coordinate breath: inhale belly down, exhale arch spine toward ceiling.' },
      { name: 'Hip 90/90 Stretch', sets: '2 sets × 45s each side', tip: 'Square chest over front shin, sink into hip capsule without rounding back.' },
      { name: 'Foam Roller Upper Back', sets: '2 sets × 60s slow roll', tip: 'Roll thoracic spine with arms crossed, mobilize extended segments.' }
    ],
    benefit: 'Decompresses the spine, restores joint range of motion, and accelerates central nervous system recovery.'
  }
];

if (plan && plan.workout && !WORKOUT_PLANS.some(w => w.name === plan.workout.name)) {
  WORKOUT_PLANS.unshift(plan.workout);
}`;

if (oldPlansRegex.test(code)) {
  code = code.replace(oldPlansRegex, newPlans);
  console.log('Successfully replaced WORKOUT_PLANS with 10 comprehensive routines!');
} else {
  console.error('Could not match old WORKOUT_PLANS');
}

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
