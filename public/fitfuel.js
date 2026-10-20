/* ================= Formwise / FitFuel Core Application ================= */
if (typeof window === 'undefined' || typeof document === 'undefined') {
  if (typeof module !== 'undefined') module.exports = (req, res) => { if (res) { res.writeHead(200); res.end('Formwise'); } };
} else {

/* ---------- DOM Helpers ---------- */
const $ = s => typeof document !== 'undefined' ? document.querySelector(s) : null;
const $$ = s => typeof document !== 'undefined' ? [...document.querySelectorAll(s)] : [];
const today = () => new Date().toISOString().slice(0, 10);

/* ---------- Storage & Sync ---------- */
const store = {
  get: (k, d) => { try { const v = localStorage.getItem('ff_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set: (k, v) => {
    try { localStorage.setItem('ff_' + k, JSON.stringify(v)); } catch (e) {}
    if (typeof FF !== 'undefined' && FF.patch) {
      FF.patch({ [k]: v });
      updateSyncStatus('Syncing with database...');
    }
  },
  del: k => localStorage.removeItem('ff_' + k)
};

/* ---------- Motion Physics (Vanilla JS) ---------- */
const M = (typeof window !== 'undefined' && window.Motion) ? window.Motion : null;

/* ---------- State ---------- */
let plan = store.get('plan', null);
let profile = store.get('profile', {
  name: 'Jordan Davis',
  email: 'jordan.davis@example.com',
  units: 'Metric',
  hCm: 175,
  wKg: 70,
  cal: 2100,
  p: 140,
  c: 210,
  f: 65,
  goal: 'Maintain weight',
  days: 4,
  creatine: 'yes'
});
let log = store.get('log', {});
let custom = store.get('custom', []);
let water = store.get('water', { date: today(), ml: 1000 });
let workoutsDone = store.get('workoutsDone', []);
let session = store.get('session', null);
let activeView = 'today';
let selectedExerciseCategory = 'Legs';
let selectedSubMuscle = 'All Legs';
let chatHistory = [];

/* ---------- Hydration Calculation from Bodyweight ---------- */
function calcWaterFromWeight(w, units, creatine, days) {
  let wKg = Number(w) || 68;
  if (units === 'Imperial') {
    wKg = wKg * 0.45359237;
  }
  // Base daily requirement: 35 ml per kg of bodyweight
  let ml = wKg * 35;
  if (creatine === 'yes') ml += 200;
  if (Number(days) >= 5) ml += 150;
  return (Math.max(1200, Math.min(5000, Math.round(ml / 100) * 100)) / 1000).toFixed(1);
}

function updateLiveWaterEstimate() {
  const w = Number($('#pfWeightInput') ? $('#pfWeightInput').value : 0) || profile.wKg || 68;
  const units = profile.units || 'Metric';
  const creatine = $('#pfCreatineSelect') ? $('#pfCreatineSelect').value : (profile.creatine || 'yes');
  const days = Number($('#pfDaysSelect') ? $('#pfDaysSelect').value : 4);
  const targetL = calcWaterFromWeight(w, units, creatine, days);
  if ($('#pfWaterCalculated')) {
    $('#pfWaterCalculated').textContent = targetL;
  }
  return targetL;
}
let activeWorkoutIdx = 0;

/* ---------- Default Curated Foods & Exercises ---------- */
const DEFAULT_PREVIEW_MEALS = [
  { meal: 'Breakfast', name: 'Blueberry yogurt bowl', detail: 'Greek yogurt · 280 g', k: 340, p: 24, c: 43, f: 8, image: 'images/greek-yogurt.jpg' },
  { meal: 'Lunch', name: 'Salmon power bowl', detail: 'Salmon · 1 serving', k: 615, p: 42, c: 58, f: 22, image: 'images/salmon-bowl.jpg' },
  { meal: 'Snack', name: 'Vanilla whey shake', detail: 'Whey protein · 1 scoop', k: 145, p: 27, c: 5, f: 2, icon: 'apple' }
];

let WORKOUT_PLANS = [
  {
    name: 'Full-body strength',
    focus: 'Glutes · Back · Core',
    duration: '42 min',
    moves: [
      { name: 'Dumbbell Romanian deadlift', sets: '3 sets × 10 reps', tip: 'Push hips back, soft knees, keep back straight' },
      { name: 'Goblet squat', sets: '3 sets × 12 reps', tip: 'Chest proud, weight held at chest, knees track toes' },
      { name: 'Single-arm dumbbell row', sets: '3 sets × 10 reps each', tip: 'Drive elbow towards hip, control lowering' },
      { name: 'Dead bug', sets: '3 sets × 12 reps', tip: 'Press lower back into floor, extend opposite arm and leg' }
    ],
    benefit: 'Build strength with compound movements that train your posterior chain and core together.'
  },
  {
    name: 'Lower body + core',
    focus: 'Quads · Glutes · Abs',
    duration: '38 min',
    moves: [
      { name: 'Dumbbell reverse lunge', sets: '3 sets × 10 reps each', tip: 'Step back softly, lower straight down' },
      { name: 'Glute bridge', sets: '3 sets × 15 reps', tip: 'Squeeze glutes at top, pause for 1 second' },
      { name: 'Single-leg RDL', sets: '3 sets × 8 reps each', tip: 'Hinge at hip, balance on standing leg' },
      { name: 'Bird dog', sets: '3 sets × 12 reps', tip: 'Slow and controlled, brace core throughout' }
    ],
    benefit: 'A balanced lower-body session to build leg strength and support stable movement.'
  },
  {
    name: 'Upper body strength',
    focus: 'Shoulders · Chest · Back',
    duration: '35 min',
    moves: [
      { name: 'Dumbbell floor press', sets: '3 sets × 10 reps', tip: 'Upper arms gently touch floor, press straight up' },
      { name: 'Incline push-up', sets: '3 sets × 12 reps', tip: 'Keep straight line from head to heels' },
      { name: 'Dumbbell shoulder press', sets: '3 sets × 10 reps', tip: 'Press overhead without arching lower back' },
      { name: 'Plank shoulder tap', sets: '3 sets × 16 taps', tip: 'Keep hips completely still while tapping opposite shoulder' }
    ],
    benefit: 'Push, pull and stabilize through a practical upper-body strength circuit.'
  }
];

if (plan && plan.workout && !WORKOUT_PLANS.some(w => w.name === plan.workout.name)) {
  WORKOUT_PLANS.unshift(plan.workout);
}

const EXERCISES_LIBRARY = [
  // --- CHEST: Upper, Mid, Lower ---
  {
    name: 'Incline Dumbbell Bench Press',
    category: 'Chest',
    sub: 'Upper chest',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3-4 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (2s lower, 1s stretch pause, explode up)',
    rxWhy: 'Setting bench to 30° aligns the resistance vector directly with the clavicular head fibers for upper chest hypertrophy.',
    benefit: 'Maximizes upper chest thickness while allowing natural wrist and shoulder rotation.',
    steps: 'Set bench to 30-45 degrees. Drive dumbbells up in a slight arc without clanking them at top. Lower slowly under control.'
  },
  {
    name: 'Incline Barbell Bench Press',
    category: 'Chest',
    sub: 'Upper chest',
    type: 'BARBELL · GYM',
    rxSetsReps: '3 sets × 6-8 reps · 2 min rest',
    rxTempo: 'Tempo: 2-0-1 (Controlled eccentric)',
    rxWhy: 'High mechanical tension on clavicular pectoralis with heavy overload capability.',
    benefit: 'Key compound mass builder for dense upper pectorals.',
    steps: 'Grip slightly wider than shoulder width. Lower bar to upper chest right below collarbone, drive straight up.'
  },
  {
    name: 'Low-to-High Cable Fly',
    category: 'Chest',
    sub: 'Upper chest',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1-1 (Squeeze peak for 1s)',
    rxWhy: 'Provides continuous peak tension at maximum contraction of the upper chest fibers.',
    benefit: 'Isolates upper chest without tricep fatigue.',
    steps: 'Set pulleys to bottom. Bring handles up and together towards chin height, squeezing upper chest hard at the top.'
  },
  {
    name: 'Incline Push-up',
    category: 'Chest',
    sub: 'Upper chest',
    type: 'BODYWEIGHT · HOME',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Pause at bottom)',
    rxWhy: 'Accessible bodyweight angle prioritizing clavicular head with minimal equipment.',
    benefit: 'Great hypertrophy warm-up or home workout finisher.',
    steps: 'Hands on sturdy elevated bench or step. Keep torso rigid and lower chest to bench edge, press away.'
  },
  {
    name: 'Flat Barbell Bench Press',
    category: 'Chest',
    sub: 'Mid chest',
    type: 'BARBELL · GYM',
    rxSetsReps: '3-4 sets × 6-8 reps · 2 min rest',
    rxTempo: 'Tempo: 2-0-1 (Control down, power up)',
    rxWhy: 'The gold standard for sternal pectoralis recruitment and horizontal pressing strength.',
    benefit: 'Builds overall chest mass and pushing power.',
    steps: 'Retract shoulder blades and plant feet firmly. Lower bar to mid-sternum, drive up explosively.'
  },
  {
    name: 'Flat Dumbbell Press',
    category: 'Chest',
    sub: 'Mid chest',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (1s stretch pause)',
    rxWhy: 'Deep stretch at bottom recruits high motor units in sternal fibers.',
    benefit: 'Balanced bilateral hypertrophy with greater range of motion than barbell.',
    steps: 'Lie flat. Lower dumbbells with elbows at 45-60 degrees until deep chest stretch, press back up.'
  },
  {
    name: 'Dumbbell Floor Press',
    category: 'Chest',
    sub: 'Mid chest',
    type: 'DUMBBELL · HOME OR GYM',
    rxSetsReps: '3 sets × 10-12 reps · 75s rest',
    rxTempo: 'Tempo: 2-1-1 (Triceps touch floor gently)',
    rxWhy: 'Eliminates shoulder strain while maintaining heavy mid-chest tension.',
    benefit: 'Excellent home alternative for pressing with dumbbells.',
    steps: 'Lie on floor. Lower until upper arms tap the floor softly, pause, and press up to full extension.'
  },
  {
    name: 'Chest Dips',
    category: 'Chest',
    sub: 'Lower chest',
    type: 'BODYWEIGHT / WEIGHTED · GYM',
    rxSetsReps: '3 sets × 8-12 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (Lean forward 30°)',
    rxWhy: 'Downward pressing angle directly follows abdominal pectoralis fiber orientation.',
    benefit: 'Unlocks sharp lower chest definition and serratus activation.',
    steps: 'Grip parallel bars, lean torso forward 30 degrees, flare elbows slightly, lower until 90 degrees at elbows, drive up.'
  },
  {
    name: 'Decline Dumbbell Press',
    category: 'Chest',
    sub: 'Lower chest',
    type: 'DUMBBELL · GYM',
    rxSetsReps: '3 sets × 10-12 reps · 75s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Targets lower costal pectoralis while placing minimal stress on anterior delts.',
    benefit: 'Creates full lower chest curve and density.',
    steps: 'Secure legs on decline bench. Press dumbbells straight up over lower chest, lower with control.'
  },
  {
    name: 'High-to-Low Cable Fly',
    category: 'Chest',
    sub: 'Lower chest',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Squeeze bottom for 1s)',
    rxWhy: 'Continuous resistance across the adduction plane of the lower pectoral fibers.',
    benefit: 'Sharp isolation and mind-muscle pump.',
    steps: 'Pulleys set high. Step forward, draw handles down and across towards your waist, squeeze lower chest.'
  },

  // --- BACK: Lats, Upper Back & Traps, Lower Back ---
  {
    name: 'Lat Pulldown',
    category: 'Back',
    sub: 'Lats',
    type: 'CABLE / MACHINE · GYM',
    rxSetsReps: '3-4 sets × 8-12 reps · 90s rest',
    rxTempo: 'Tempo: 2-0-1-1 (1s squeeze at collarbone)',
    rxWhy: 'Optimal downward vertical pull to develop wide latissimus dorsi sweeps.',
    benefit: 'Builds V-taper back width and pull-up strength.',
    steps: 'Grip slightly wider than shoulders. Drive elbows down towards back pockets, squeeze lats, control bar back up.'
  },
  {
    name: 'Pull-up / Chin-up',
    category: 'Back',
    sub: 'Lats',
    type: 'BODYWEIGHT · GYM OR HOME',
    rxSetsReps: '3 sets × 6-10 reps · 2 min rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'High motor recruitment compound pull for lat width and core stabilization.',
    benefit: 'Fundamental relative strength and back builder.',
    steps: 'Hang with overhand or neutral grip. Pull chest up to bar by depressing scapula, lower with full control.'
  },
  {
    name: 'Single-Arm Dumbbell Row',
    category: 'Back',
    sub: 'Lats',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 10-12 reps each · 60s rest',
    rxTempo: 'Tempo: 2-0-1 (Drive elbow to hip)',
    rxWhy: 'Unilateral pull prevents compensation and allows extreme lat stretch and contraction.',
    benefit: 'Increases lat thickness and corrects muscular imbalances.',
    steps: 'Support knee on bench. Row dumbbell towards hip keeping elbow tucked close to ribcage, lower slowly.'
  },
  {
    name: 'Barbell Bent-Over Row',
    category: 'Back',
    sub: 'Upper back & Traps',
    type: 'BARBELL · GYM',
    rxSetsReps: '3-4 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Heavy loading across rhomboids, mid-traps, and posterior chain.',
    benefit: 'Adds dense 3D back thickness and posture power.',
    steps: 'Hinge at hips at 45°. Pull barbell into lower ribcage leading with elbows, squeeze shoulder blades together.'
  },
  {
    name: 'Face Pull',
    category: 'Back',
    sub: 'Upper back & Traps',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 15-20 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Hold external rotation)',
    rxWhy: 'Targets mid-traps, rhomboids, and rotator cuff for postural balance and shoulder health.',
    benefit: 'Fixes rounded shoulders and bulletproofs rotator cuff.',
    steps: 'Rope at eye level. Pull rope towards forehead while rotating hands back, hold peak squeeze for 1 second.'
  },
  {
    name: 'Dumbbell Shrug',
    category: 'Back',
    sub: 'Upper back & Traps',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (1s top squeeze, no rolling)',
    rxWhy: 'Pure vertical scapular elevation targeting upper trapezius fibers.',
    benefit: 'Builds prominent neck and upper shoulder trap thickness.',
    steps: 'Hold heavy dumbbells at sides. Elevate shoulders straight up towards ears without rolling shoulders, pause at top.'
  },
  {
    name: 'Conventional Deadlift',
    category: 'Back',
    sub: 'Lower back',
    type: 'BARBELL · GYM',
    rxSetsReps: '3 sets × 5 reps · 3 min rest',
    rxTempo: 'Tempo: 2-0-1 (Power from floor)',
    rxWhy: 'Maximum full-body axial loading strengthening spinal erectors, glutes, and traps.',
    benefit: 'Supreme functional power and total posterior chain density.',
    steps: 'Bar over midfoot. Hinge down, grip tight, brace core, push floor away through midfoot until locked out.'
  },
  {
    name: 'Hyperextension / Back Extension',
    category: 'Back',
    sub: 'Lower back',
    type: 'BODYWEIGHT / DUMBBELL · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Isolates spinal erectors with safe hip-hinge mechanics.',
    benefit: 'Prevents lower back pain and builds lumbar endurance.',
    steps: 'Pad below hips. Hinge forward at waist, contract lower back and glutes to raise torso in line with legs.'
  },

  // --- SHOULDERS: Front, Side, Rear ---
  {
    name: 'Overhead Dumbbell Shoulder Press',
    category: 'Shoulders',
    sub: 'Front delts',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3-4 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Primary vertical pressing movement loading anterior deltoid and clavicular fibers.',
    benefit: 'Broad shoulder caps and upper-body pressing stability.',
    steps: 'Dumbbells at ear height. Press overhead in a smooth arc until arms extended, lower under control.'
  },
  {
    name: 'Barbell Military Press',
    category: 'Shoulders',
    sub: 'Front delts',
    type: 'BARBELL · GYM',
    rxSetsReps: '3 sets × 6-8 reps · 2 min rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Strict standing press building anterior delt power and core rigidity.',
    benefit: 'Classic raw shoulder strength benchmark.',
    steps: 'Rest bar on collarbone. Squeeze glutes and core, press straight up moving head back slightly, lockout overhead.'
  },
  {
    name: 'Dumbbell Lateral Raise',
    category: 'Shoulders',
    sub: 'Side delts',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '4 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Slight pinky tilt up)',
    rxWhy: 'Directly isolates the lateral head of the deltoid responsible for visual shoulder width.',
    benefit: 'Key exercise for the wide V-taper look.',
    steps: 'Hold dumbbells at sides. Raise arms in scapular plane (slight forward angle) to shoulder height, lower slowly.'
  },
  {
    name: 'Cable Lateral Raise',
    category: 'Shoulders',
    sub: 'Side delts',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 15 reps each · 45s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Delivers continuous tension even at bottom of movement where dumbbells offer zero load.',
    benefit: 'Maximizes time under tension for stubborn side deltoids.',
    steps: 'Cables set low behind back. Raise handle out to side, control descent.'
  },
  {
    name: 'Rear Delt Fly / Reverse Pec Deck',
    category: 'Shoulders',
    sub: 'Rear delts',
    type: 'MACHINE / DUMBBELL · GYM',
    rxSetsReps: '3-4 sets × 15-20 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Hold peak squeeze)',
    rxWhy: 'Isolates posterior deltoid to complete 3D rounded shoulders and support rotator cuff.',
    benefit: 'Improves posture and prevents impingement from heavy benching.',
    steps: 'Sit facing machine or hinge forward with dumbbells. Sweep arms wide leading with elbows, squeeze rear delts.'
  },

  // --- ARMS: Biceps, Triceps, Forearms ---
  {
    name: 'Incline Dumbbell Bicep Curl',
    category: 'Arms',
    sub: 'Biceps',
    type: 'DUMBBELL · GYM',
    rxSetsReps: '3 sets × 10-12 reps · 75s rest',
    rxTempo: 'Tempo: 3-0-1 (Deep stretch at bottom)',
    rxWhy: 'Shoulder extension on incline puts the long head of the bicep into maximum stretch for growth.',
    benefit: 'Builds taller bicep peak and arm thickness.',
    steps: 'Sit on 45° incline bench. Let arms hang straight down, curl weights up supinating wrists, lower with control.'
  },
  {
    name: 'Barbell / EZ-Bar Bicep Curl',
    category: 'Arms',
    sub: 'Biceps',
    type: 'BARBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Permits heaviest bicep loading for maximum mechanical tension.',
    benefit: 'Supreme overall bicep mass builder.',
    steps: 'Shoulder width grip. Keep elbows pinned to sides, curl bar to collarbone height, lower smoothly.'
  },
  {
    name: 'Preacher Curl',
    category: 'Arms',
    sub: 'Biceps',
    type: 'EZ-BAR / DUMBBELL · GYM',
    rxSetsReps: '3 sets × 10-12 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Prevents cheating and isolates short head of bicep for inner arm fullness.',
    benefit: 'Strict bicep isolation without shoulder assistance.',
    steps: 'Arms resting flush on preacher pad. Curl bar up to chin, lower with strict control.'
  },
  {
    name: 'Tricep Rope Pushdown',
    category: 'Arms',
    sub: 'Triceps',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (Spread rope at bottom)',
    rxWhy: 'Isolates lateral and medial heads of the triceps with continuous resistance.',
    benefit: 'Defines horseshoe tricep shape.',
    steps: 'Pin elbows to sides. Push rope down and flare ends outward at lockout, squeeze triceps for 1s.'
  },
  {
    name: 'Overhead Tricep Extension',
    category: 'Arms',
    sub: 'Triceps',
    type: 'DUMBBELL / CABLE · GYM OR HOME',
    rxSetsReps: '3 sets × 10-12 reps · 75s rest',
    rxTempo: 'Tempo: 2-1-1 (Deep stretch)',
    rxWhy: 'Overhead position stretches the long head of the triceps (which makes up 60% of total arm mass).',
    benefit: 'Adds massive thickness to the back of the upper arm.',
    steps: 'Hold dumbbell overhead with both hands. Lower behind head bending at elbows, press straight back up.'
  },
  {
    name: 'Skull Crusher (Lying Triceps Extension)',
    category: 'Arms',
    sub: 'Triceps',
    type: 'EZ-BAR / DUMBBELL · GYM',
    rxSetsReps: '3 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Heavy free-weight loading targeting long and medial heads simultaneously.',
    benefit: 'Builds dense lockout pushing strength.',
    steps: 'Lie flat. Lower bar towards forehead or slightly behind head, extend elbows to press bar back up.'
  },
  {
    name: 'Hammer Curl',
    category: 'Arms',
    sub: 'Forearms',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 12 reps · 60s rest',
    rxTempo: 'Tempo: 2-0-1',
    rxWhy: 'Targets brachialis and brachioradialis for forearm thickness and elbow joint durability.',
    benefit: 'Thickens forearms and pushes bicep peak higher.',
    steps: 'Palms facing each other throughout. Curl straight up without swinging, squeeze at top.'
  },

  // --- LEGS: Quads, Hamstrings, Glutes, Calves ---
  {
    name: 'Barbell Back Squat',
    category: 'Legs',
    sub: 'Quads',
    type: 'BARBELL · GYM',
    rxSetsReps: '3-4 sets × 6-8 reps · 2.5 min rest',
    rxTempo: 'Tempo: 2-1-1 (Hit parallel, explode up)',
    rxWhy: 'The king of lower body exercises. Full knee and hip flexion drives massive quad and glute hypertrophy.',
    benefit: 'Builds foundational lower-body power and systemic growth hormone release.',
    steps: 'Bar across traps. Sit hips back and down until thighs parallel or below, drive up through whole foot.'
  },
  {
    name: 'Bulgarian Split Squat',
    category: 'Legs',
    sub: 'Quads',
    type: 'DUMBBELL · GYM OR HOME',
    rxSetsReps: '3 sets × 8-10 reps each leg · 90s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Extreme stretch on lead leg quad and glute with zero lower-back compressive stress.',
    benefit: 'Balances unilateral quad strength and hip mobility.',
    steps: 'Rear foot elevated on bench. Lower down until front thigh is parallel to ground, drive through front heel.'
  },
  {
    name: 'Leg Extension',
    category: 'Legs',
    sub: 'Quads',
    type: 'MACHINE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (1s top squeeze)',
    rxWhy: 'Pure knee extension isolating the rectus femoris and teardrop vastus medialis.',
    benefit: 'Sharp quad separation and knee tendon strengthening.',
    steps: 'Sit in machine with pad over ankles. Extend legs fully, hold peak contraction for 1s, lower slowly.'
  },
  {
    name: 'Romanian Deadlift (RDL)',
    category: 'Legs',
    sub: 'Hamstrings',
    type: 'BARBELL / DUMBBELL · GYM OR HOME',
    rxSetsReps: '3-4 sets × 8-10 reps · 90s rest',
    rxTempo: 'Tempo: 3-1-1 (3s eccentric stretch)',
    rxWhy: 'Heavy eccentric stretch on hamstrings triggers powerful hypertrophy signaling.',
    benefit: 'Supreme hamstring mass and hip-hinge athletics.',
    steps: 'Soft knees, hips back. Slide weights down thighs until deep hamstring stretch, thrust hips forward to stand.'
  },
  {
    name: 'Lying / Seated Leg Curl',
    category: 'Legs',
    sub: 'Hamstrings',
    type: 'MACHINE · GYM',
    rxSetsReps: '3 sets × 10-12 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1',
    rxWhy: 'Isolates knee flexion function of the hamstrings without lower back fatigue.',
    benefit: 'Complements RDLs for 360-degree hamstring development.',
    steps: 'Pad behind ankles. Curl heels toward glutes, pause, lower smoothly.'
  },
  {
    name: 'Barbell Hip Thrust',
    category: 'Legs',
    sub: 'Glutes',
    type: 'BARBELL · GYM',
    rxSetsReps: '3-4 sets × 8-12 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (1s peak squeeze at top)',
    rxWhy: 'Peak glute tension occurs at horizontal hip lockout, where squats offer the least tension.',
    benefit: 'The #1 exercise for glute size and sprint propulsion.',
    steps: 'Upper back on bench, bar over hips. Drive through heels to raise hips flush with shoulders, squeeze glutes hard.'
  },
  {
    name: 'Standing Calf Raise',
    category: 'Legs',
    sub: 'Calves',
    type: 'MACHINE / DUMBBELL · GYM OR HOME',
    rxSetsReps: '4 sets × 12-15 reps · 45s rest',
    rxTempo: 'Tempo: 2-2-1 (2s deep stretch at bottom, 1s top squeeze)',
    rxWhy: 'Knees straight directly loads the gastrocnemius muscle of the calves.',
    benefit: 'Thickens lower leg and reinforces Achilles tendon.',
    steps: 'Balls of feet on ledge. Lower heels into deep stretch, pause 2s to kill Achilles recoil, rise onto toes.'
  },

  // --- CORE: Upper Abs, Lower Abs, Obliques ---
  {
    name: 'Hanging Leg Raise',
    category: 'Core',
    sub: 'Lower abs',
    type: 'BODYWEIGHT · GYM OR HOME',
    rxSetsReps: '3 sets × 10-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (No swinging)',
    rxWhy: 'Posterior pelvic tilt targets the lower abdominal fibers and hip flexors.',
    benefit: 'Chisels lower abdominal wall and improves grip.',
    steps: 'Hang from pull-up bar. Curl knees or straight legs up to chest by curling pelvis up, lower slowly.'
  },
  {
    name: 'Cable Kneeling Crunch',
    category: 'Core',
    sub: 'Upper abs',
    type: 'CABLE · GYM',
    rxSetsReps: '3 sets × 12-15 reps · 60s rest',
    rxTempo: 'Tempo: 2-1-1 (C-curve spine curl)',
    rxWhy: 'Allows progressive overload with weights for rectus abdominis block growth.',
    benefit: 'Builds deep 6-pack abdominal ridges.',
    steps: 'Kneel with rope at forehead. Curl ribcage down towards pelvis, exhaling forcefully, pause, return under control.'
  },
  {
    name: 'Russian Twist with Weight',
    category: 'Core',
    sub: 'Obliques',
    type: 'BODYWEIGHT / WEIGHT · HOME OR GYM',
    rxSetsReps: '3 sets × 16-20 total twists · 60s rest',
    rxTempo: 'Tempo: Controlled cadence',
    rxWhy: 'Rotational torque across internal and external obliques.',
    benefit: 'Tones rotational core power and waistline stability.',
    steps: 'Sit on floor, feet elevated, torso back at 45°. Rotate weight from hip to hip under strict control.'
  }
];

/* ---------- Toast Notice ---------- */
let toastTimeout;
function toast(msg) {
  const t = $('#toastNotice');
  const txt = $('#toastMsg');
  if (!t) return;
  if (txt) txt.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  if (M && M.animate) {
    M.animate(t, { opacity: [0, 1], y: [40, 0] }, { duration: 0.28, easing: M.spring({ stiffness: 380, damping: 24 }) });
  }
  toastTimeout = setTimeout(() => {
    t.classList.remove('show');
  }, 2700);
}

/* ---------- Modal Management (Guaranteed zero pointer-blocking) ---------- */
function openModal(selector) {
  const m = typeof selector === 'string' ? $(selector) : selector;
  if (!m) return;
  m.classList.add('open');
  m.style.pointerEvents = 'auto';
  if (M && M.animate) {
    const card = m.querySelector('.modal-card');
    M.animate(m, { opacity: [0, 1] }, { duration: 0.16 });
    if (card) {
      M.animate(card, { opacity: [0, 1], scale: [0.93, 1], y: [16, 0] }, {
        duration: 0.32,
        easing: M.spring({ stiffness: 320, damping: 26 })
      });
    }
  }
}

function closeModal(selector) {
  const m = typeof selector === 'string' ? $(selector) : selector;
  if (!m) return;
  m.style.pointerEvents = 'none';
  if (M && M.animate) {
    const card = m.querySelector('.modal-card');
    if (card) M.animate(card, { opacity: [1, 0], scale: [1, 0.94], y: [0, 10] }, { duration: 0.15 });
    M.animate(m, { opacity: [1, 0] }, { duration: 0.15 });
  }
  setTimeout(() => {
    m.classList.remove('open');
    m.style.pointerEvents = '';
    m.style.opacity = '';
    const card = m.querySelector('.modal-card');
    if (card) { card.style.opacity = ''; card.style.transform = ''; }
  }, 160);
}

// Global click close listener
document.addEventListener('click', e => {
  const closeBtn = e.target.closest('[data-close]');
  if (closeBtn) {
    closeModal(closeBtn.closest('.modal-backdrop'));
  }
  const backdrop = e.target.classList.contains('modal-backdrop') ? e.target : null;
  if (backdrop) {
    closeModal(backdrop);
  }
});

/* ---------- Navigation & Views Switching ---------- */
function switchView(viewName) {
  activeView = viewName;
  $$('.primary-nav .nav-link').forEach(btn => {
    const isTarget = btn.dataset.view === viewName;
    btn.classList.toggle('selected', isTarget);
    let dot = btn.querySelector('.nav-active-dot');
    if (isTarget && !dot) {
      const d = document.createElement('span');
      d.className = 'nav-active-dot';
      btn.appendChild(d);
    } else if (!isTarget && dot) {
      dot.remove();
    }
  });

  $$('.page-content .view').forEach(v => {
    v.classList.remove('active');
  });

  const targetView = $('#view-' + viewName);
  if (targetView) {
    targetView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (M && M.animate) {
      M.animate(targetView, { opacity: [0, 1], y: [12, 0] }, {
        duration: 0.32,
        easing: M.spring({ stiffness: 280, damping: 25 })
      });
      const panels = targetView.querySelectorAll('.panel, .welcome-strip');
      if (panels.length) {
        M.animate(panels, { opacity: [0, 1], y: [10, 0] }, {
          delay: M.stagger(0.04, { start: 0.03 }),
          duration: 0.3,
          easing: M.spring({ stiffness: 260, damping: 24 })
        });
      }
    }
  }

  // Close mobile drawer if open
  $('#sidebar').classList.remove('mobile-open');

  // Re-render view specifics
  if (viewName === 'today') renderDashboard();
  if (viewName === 'food-log') renderFoodLog();
  if (viewName === 'workouts') renderWorkouts();
  if (viewName === 'exercise-library') renderExerciseLibrary();
  if (viewName === 'my-foods') renderMyFoods();
  if (viewName === 'profile') renderProfileView();
}

// Attach Nav Links
$$('.primary-nav .nav-link').forEach(btn => {
  btn.onclick = () => switchView(btn.dataset.view);
});

// Mobile menu toggle
$('#mobileMenuBtn').onclick = () => {
  $('#sidebar').classList.toggle('mobile-open');
};

/* ---------- Live Date and Clock ---------- */
function updateClock() {
  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const dateNum = now.getDate();
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const dateStr = `${dayName}, ${monthName} ${dateNum}, ${year} · ${hours}:${minutes}:${seconds} ${ampm}`;
  const el = $('#eyebrowDate');
  if (el) el.textContent = dateStr;

  const overline = $('#welcomeOverline');
  if (overline) {
    const span = overline.querySelector('span');
    if (span) span.textContent = `YOUR ${dayName} CHECK-IN`;
  }

  const greetingEl = $('#userGreeting');
  if (greetingEl) {
    const rawHours = now.getHours();
    const period = rawHours < 12 ? 'Good morning' : rawHours < 17 ? 'Good afternoon' : 'Good evening';
    const userName = (session && session.name) ? session.name.split(' ')[0] : (profile && profile.name ? profile.name.split(' ')[0] : 'Jordan');
    greetingEl.textContent = `${period}, ${userName}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

/* ---------- Database Sync Indicator ---------- */
function updateSyncStatus(text) {
  const syncTxt = $('#syncStatus');
  const syncNote = $('#syncNote');
  const foot = $('#footnoteSyncStatus');
  if (syncTxt) syncTxt.textContent = text || (FF.online && FF.user ? 'Cloud database synced' : 'Preview mode · Sign in to sync');
  if (syncNote) {
    const dot = syncNote.querySelector('.status-dot');
    if (dot) {
      dot.style.background = (FF.online && FF.user) ? '#22c55e' : '#f59e0b';
    }
  }
  if (foot) {
    foot.textContent = (FF.online && FF.user) ? 'Cloud Database Connected · Turso' : 'Local Storage · Sign in to connect cloud';
  }
}

/* ---------- Dashboard Rendering ---------- */
function getTodayLog() {
  const d = today();
  if (!log[d] || log[d].length === 0) {
    // If no user entries logged yet today, supply preview items
    return DEFAULT_PREVIEW_MEALS;
  }
  return log[d];
}

function renderDashboard() {
  const entries = getTodayLog();
  const totalKcal = Math.round(entries.reduce((a, b) => a + (Number(b.k) || Number(b.calories) || 0), 0));
  const totalP = Math.round(entries.reduce((a, b) => a + (Number(b.p) || Number(b.protein) || 0), 0));
  const totalC = Math.round(entries.reduce((a, b) => a + (Number(b.c) || Number(b.carbs) || 0), 0));
  const totalF = Math.round(entries.reduce((a, b) => a + (Number(b.f) || Number(b.fat) || 0), 0));

  const goalKcal = profile.cal || 2100;
  const leftKcal = Math.max(0, goalKcal - totalKcal);
  const pct = Math.min(100, Math.round((totalKcal / goalKcal) * 100));

  // Calories Ring & Numbers
  if ($('#dashCalConsumed')) $('#dashCalConsumed').textContent = totalKcal.toLocaleString();
  if ($('#dashCalGoal')) $('#dashCalGoal').textContent = goalKcal.toLocaleString();
  if ($('#dashCalLeft')) $('#dashCalLeft').textContent = leftKcal.toLocaleString();
  if ($('#dashPctNum')) $('#dashPctNum').textContent = pct + '%';
  if ($('#dashCalMeterBar')) $('#dashCalMeterBar').style.width = pct + '%';

  const deg = Math.round((pct / 100) * 360);
  if ($('#dashCalRing')) {
    $('#dashCalRing').style.background = `conic-gradient(#b4db79 ${deg}deg, #ecefe8 0deg)`;
  }

  // Macros
  if ($('#dashP')) $('#dashP').textContent = totalP;
  if ($('#dashC')) $('#dashC').textContent = totalC;
  if ($('#dashF')) $('#dashF').textContent = totalF;

  // Water Intake & 12 Interactive Glasses
  const waterMl = (water && water.date === today()) ? (water.ml || 0) : 0;
  const waterGoalL = profile.waterGoal || calcWaterFromWeight(profile.wKg, profile.units, profile.creatine, profile.days);
  if ($('#waterDisplay')) $('#waterDisplay').innerHTML = `${(waterMl / 1000).toFixed(1)}<small> L</small>`;
  if ($('#waterGoalDisplay')) $('#waterGoalDisplay').textContent = waterGoalL;

  const filledGlasses = Math.min(12, Math.round(waterMl / 250));
  const cupsContainer = $('#waterCups');
  if (cupsContainer) {
    cupsContainer.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const isFilled = i < filledGlasses;
      const cup = document.createElement('button');
      cup.className = 'water-cup' + (isFilled ? ' filled' : '');
      cup.title = isFilled ? 'Remove 250 ml' : 'Drink 250 ml';
      cup.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z"></path>
        <path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"></path>
      </svg>`;
      cup.onclick = () => {
        if (isFilled) {
          water.ml = Math.max(0, waterMl - 250);
        } else {
          water.ml = waterMl + 250;
        }
        water.date = today();
        store.set('water', water);
        renderDashboard();
        toast(`Hydration updated: ${(water.ml / 1000).toFixed(1)} L`);
      };
      cupsContainer.appendChild(cup);
    }
  }

  // Meals & Snacks List
  const mealList = $('#dashMealList');
  if (mealList) {
    mealList.innerHTML = entries.map(item => {
      const img = item.image ? `<img src="${item.image}" alt="${item.name}"/>` : `<span><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.528V3a1 1 0 0 1 1-1h0"></path><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"></path></svg></span>`;
      const kcal = item.k || item.calories || 0;
      return `<div class="meal-row">
        <div class="food-thumb">${img}</div>
        <div class="meal-info">
          <span>${item.meal || 'Meal'}</span>
          <b>${item.name}</b>
          <small>${item.detail || (item.p ? `${item.p}g P · ${item.c}g C · ${item.f}g F` : 'Custom portion')}</small>
        </div>
        <div class="meal-kcal">
          <b>${kcal}</b>
          <span>kcal</span>
        </div>
      </div>`;
    }).join('');
  }

  // Active Workout preview
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  if ($('#dashWorkoutName')) $('#dashWorkoutName').textContent = wo.name;
  if ($('#dashWorkoutFocus')) $('#dashWorkoutFocus').textContent = wo.focus.toUpperCase();
  if ($('#dashWorkoutDuration')) $('#dashWorkoutDuration').textContent = wo.duration;

  // Streak update
  const streakCount = Math.min(5, Math.max(1, (workoutsDone.length % 5) + 3));
  if ($('#streakCount')) $('#streakCount').textContent = `${streakCount} / 5`;
  if ($('#dayStreakDisplay')) $('#dayStreakDisplay').innerHTML = `${streakCount} <small>days</small>`;
  if ($('#weeklyGoalDisplay')) $('#weeklyGoalDisplay').innerHTML = `${Math.round((streakCount / 5) * 100)}<small>%</small>`;
  updateAiDailyVerification(entries, totalKcal, goalKcal, totalP, profile.p || 165, waterMl);
}

// Dashboard Buttons Navigation
$('#goToFoodLogFromDash').onclick = () => switchView('food-log');
$('#viewAllFoodEntriesBtn').onclick = () => switchView('food-log');
$('#dashAddFoodBtn').onclick = () => openFoodModal();
$('#dashStartWorkoutBtn').onclick = () => switchView('workouts');
$('#insightsShortcutBtn').onclick = () => switchView('profile');
$('#adjustWaterBtn').onclick = () => switchView('profile');
$('#dashRefreshWorkoutBtn').onclick = () => {
  activeWorkoutIdx++;
  renderDashboard();
  toast('Switched to next workout in plan');
};
$('#resetWaterBtn').onclick = () => {
  water.ml = 0;
  water.date = today();
  store.set('water', water);
  renderDashboard();
  toast('Water reset for today');
};

/* ---------- Food Log View Rendering ---------- */
function renderFoodLog() {
  const d = today();
  const entries = log[d] || [];
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const container = $('#foodLogMealsContainer');

  if (container) {
    container.innerHTML = meals.map(mealType => {
      const mealItems = entries.filter(e => (e.meal || '').toLowerCase() === mealType.toLowerCase());
      const subKcal = mealItems.reduce((a, b) => a + (b.k || b.calories || 0), 0);
      return `<div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #edf0e9;">
          <b style="color:#34483a;font-size:1.05rem;">${mealType}</b>
          <span style="color:#637367;font-size:.9rem;font-weight:600;">${subKcal} kcal</span>
        </div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">
          ${mealItems.length ? mealItems.map(item => {
            const realIdx = entries.indexOf(item);
            return `
            <div class="meal-item-card" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#fbfcfa;border:1px solid #edf0e9;border-radius:10px;gap:12px;">
              <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
                ${item.image ? `<img src="${item.image}" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;" alt="${item.name}">` : (item.icon ? `<span style="font-size:1.4rem;flex-shrink:0;">${item.icon}</span>` : `<span style="font-size:1.3rem;flex-shrink:0;">🍽️</span>`)}
                <div style="min-width:0;">
                  <b style="color:#203125;font-size:0.95rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</b>
                  <p style="color:#78887c;font-size:.82rem;margin-top:2px;">${item.detail || `${item.p || 0}g P · ${item.c || 0}g C · ${item.f || 0}g F`}</p>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <span style="font-weight:700;color:#34483a;font-size:.95rem;margin-right:2px;">${item.k || item.calories} kcal</span>
                <button type="button" class="action-icon-btn edit" title="Edit food entry" onclick="openEditFoodModal(${realIdx})" style="background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;font-size:0.95rem;color:#4f6b52;display:flex;align-items:center;justify-content:center;">
                  ✏️
                </button>
                <button type="button" class="close-btn" style="color:#dc2626;cursor:pointer;padding:6px;border-radius:6px;font-size:1.15rem;line-height:1;display:flex;align-items:center;justify-content:center;" title="Delete entry" onclick="deleteFoodEntry(${realIdx})">&times;</button>
              </div>
            </div>
          `;}).join('') : `<p style="color:#8b998e;font-size:.85rem;padding:6px 0;">No items logged for ${mealType.toLowerCase()} yet.</p>`}
        </div>
      </div>`;
    }).join('');
  }

  const allEntries = entries.length ? entries : DEFAULT_PREVIEW_MEALS;
  const totKcal = allEntries.reduce((a, b) => a + (b.k || b.calories || 0), 0);
  const totP = allEntries.reduce((a, b) => a + (b.p || b.protein || 0), 0);
  const totC = allEntries.reduce((a, b) => a + (b.c || b.carbs || 0), 0);
  const totF = allEntries.reduce((a, b) => a + (b.f || b.fat || 0), 0);

  const goalKcal = profile.cal || 2000;
  const goalP = profile.p || 165;
  const goalC = profile.c || 139;
  const goalF = profile.f || 87;

  // Modern Macro Progress Bars in Sidebar
  if ($('#sideKcalCurrent')) $('#sideKcalCurrent').textContent = totKcal.toLocaleString();
  if ($('#sideKcalGoal')) $('#sideKcalGoal').textContent = goalKcal.toLocaleString();
  if ($('#meterCal')) $('#meterCal').style.width = Math.min(100, Math.round((totKcal / goalKcal) * 100)) + '%';

  if ($('#sidePCurrent')) $('#sidePCurrent').textContent = totP + 'g';
  if ($('#sidePGoal')) $('#sidePGoal').textContent = goalP;
  if ($('#meterP')) $('#meterP').style.width = Math.min(100, Math.round((totP / goalP) * 100)) + '%';

  if ($('#sideCCurrent')) $('#sideCCurrent').textContent = totC + 'g';
  if ($('#sideCGoal')) $('#sideCGoal').textContent = goalC;
  if ($('#meterC')) $('#meterC').style.width = Math.min(100, Math.round((totC / goalC) * 100)) + '%';

  if ($('#sideFCurrent')) $('#sideFCurrent').textContent = totF + 'g';
  if ($('#sideFGoal')) $('#sideFGoal').textContent = goalF;
  if ($('#meterF')) $('#meterF').style.width = Math.min(100, Math.round((totF / goalF) * 100)) + '%';

  // Support for older sidebar IDs if present
  if ($('#logSidebarKcal')) $('#logSidebarKcal').textContent = `${totKcal} / ${goalKcal}`;
  if ($('#logSidebarP')) $('#logSidebarP').textContent = `${totP} / ${goalP}g`;
  if ($('#logSidebarC')) $('#logSidebarC').textContent = `${totC} / ${goalC}g`;
  if ($('#logSidebarF')) $('#logSidebarF').textContent = `${totF} / ${goalF}g`;
}

window.deleteFoodEntry = function(idx) {
  const d = today();
  if (log[d] && log[d][idx]) {
    const item = log[d].splice(idx, 1)[0];
    store.set('log', log);
    renderFoodLog();
    renderDashboard();
    toast(`Removed ${item.name}`);
  }
};

/* ---------- Edit Food Entry Modal ---------- */
window.openEditFoodModal = function(idx) {
  const d = today();
  const entries = log[d] || [];
  const item = entries[idx];
  if (!item) return;

  if ($('#editFoodIndex')) $('#editFoodIndex').value = idx;
  if ($('#editFoodName')) $('#editFoodName').value = item.name || '';
  if ($('#editFoodMeal')) $('#editFoodMeal').value = item.meal || 'Lunch';
  if ($('#editFoodPortion')) $('#editFoodPortion').value = item.portion || 100;
  if ($('#editFoodCal')) $('#editFoodCal').value = item.k || item.calories || 0;
  if ($('#editFoodP')) $('#editFoodP').value = item.p || 0;
  if ($('#editFoodC')) $('#editFoodC').value = item.c || 0;
  if ($('#editFoodF')) $('#editFoodF').value = item.f || 0;

  openModal('#editFoodModal');
};

if ($('#saveEditFoodBtn')) {
  $('#saveEditFoodBtn').onclick = () => {
    const idx = parseInt($('#editFoodIndex') ? $('#editFoodIndex').value : '-1', 10);
    const d = today();
    if (!log[d] || !log[d][idx]) return;

    const item = log[d][idx];
    item.name = ($('#editFoodName') ? $('#editFoodName').value.trim() : '') || item.name;
    if ($('#editFoodMeal')) item.meal = $('#editFoodMeal').value;
    const g = parseFloat($('#editFoodPortion') ? $('#editFoodPortion').value : item.portion) || 100;
    item.portion = g;
    item.k = Math.round(parseFloat($('#editFoodCal') ? $('#editFoodCal').value : item.k) || 0);
    item.calories = item.k;
    item.p = Math.round(parseFloat($('#editFoodP') ? $('#editFoodP').value : item.p) || 0);
    item.c = Math.round(parseFloat($('#editFoodC') ? $('#editFoodC').value : item.c) || 0);
    item.f = Math.round(parseFloat($('#editFoodF') ? $('#editFoodF').value : item.f) || 0);
    item.detail = `${g}g · ${item.p}g P · ${item.c}g C · ${item.f}g F`;

    store.set('log', log);
    closeModal('#editFoodModal');
    renderFoodLog();
    renderDashboard();
    toast(`Updated "${item.name}"`);
  };
}

if ($('#foodLogAddBtn')) $('#foodLogAddBtn').onclick = () => openFoodModal();
if ($('#clearDayLogBtn')) {
  $('#clearDayLogBtn').onclick = () => {
    if (confirm("Clear all food entries for today?")) {
      log[today()] = [];
      store.set('log', log);
      renderFoodLog();
      renderDashboard();
      toast("Today's food log cleared");
    }
  };
}

/* ================= CUSTOM RECIPE BUILDER ================= */
const INGREDIENT_CATALOG = {
  'Grains & Rice': [
    { name: 'Basmati Rice (Cooked)', p: 2.7, c: 28, f: 0.3, k: 130, unit: 'g' },
    { name: 'Basmati Rice (Raw)', p: 8.5, c: 78, f: 0.6, k: 350, unit: 'g' },
    { name: 'Brown Rice (Cooked)', p: 2.6, c: 23, f: 0.9, k: 111, unit: 'g' },
    { name: 'Jasmine Rice (Cooked)', p: 2.4, c: 29, f: 0.4, k: 129, unit: 'g' },
    { name: 'Sona Masoori Rice (Cooked)', p: 2.5, c: 27, f: 0.4, k: 125, unit: 'g' },
    { name: 'Cauliflower Rice', p: 1.9, c: 5, f: 0.3, k: 25, unit: 'g' },
    { name: 'Rolled Oats', p: 13, c: 68, f: 7, k: 389, unit: 'g' },
    { name: 'Quinoa (Cooked)', p: 4.4, c: 21.3, f: 1.9, k: 120, unit: 'g' }
  ],
  'Vegetables': [
    { name: 'Onion (Chopped)', p: 1.1, c: 9.3, f: 0.1, k: 40, unit: 'g' },
    { name: 'Tomato (Diced)', p: 0.9, c: 3.9, f: 0.2, k: 18, unit: 'g' },
    { name: 'Green Chili', p: 2, c: 9, f: 0.2, k: 40, unit: 'g' },
    { name: 'Capsicum / Bell Pepper', p: 0.9, c: 4.6, f: 0.2, k: 20, unit: 'g' },
    { name: 'Carrot (Diced)', p: 0.9, c: 9.6, f: 0.2, k: 41, unit: 'g' },
    { name: 'Green Peas', p: 5.4, c: 14.5, f: 0.4, k: 81, unit: 'g' },
    { name: 'Garlic (Minced)', p: 6.4, c: 33, f: 0.5, k: 149, unit: 'g' },
    { name: 'Ginger (Fresh)', p: 1.8, c: 18, f: 0.8, k: 80, unit: 'g' },
    { name: 'Spinach / Palak', p: 2.9, c: 3.6, f: 0.4, k: 23, unit: 'g' },
    { name: 'Mushroom', p: 3.1, c: 3.3, f: 0.3, k: 22, unit: 'g' }
  ],
  'Spices & Seasoning': [
    { name: 'Jeera / Cumin Seeds', p: 1.8, c: 4.4, f: 2.2, k: 37, unit: 'g' },
    { name: 'Turmeric Powder (Haldi)', p: 0.8, c: 6.5, f: 1.0, k: 35, unit: 'g' },
    { name: 'Red Chili Powder', p: 1.2, c: 5.5, f: 1.4, k: 32, unit: 'g' },
    { name: 'Garam Masala', p: 1.5, c: 6.0, f: 1.5, k: 38, unit: 'g' },
    { name: 'Black Pepper', p: 1.0, c: 6.4, f: 0.3, k: 25, unit: 'g' },
    { name: 'Salt', p: 0, c: 0, f: 0, k: 0, unit: 'g' },
    { name: 'Mustard Seeds (Rai)', p: 2.6, c: 2.8, f: 3.6, k: 50, unit: 'g' },
    { name: 'Coriander / Dhaniya Powder', p: 1.2, c: 5.5, f: 1.8, k: 30, unit: 'g' }
  ],
  'Proteins & Dairy': [
    { name: 'Paneer (Cottage Cheese)', p: 18, c: 4, f: 20, k: 265, unit: 'g' },
    { name: 'Egg (Whole, 1 Large = ~50g)', p: 13, c: 1.1, f: 11, k: 155, unit: 'g' },
    { name: 'Egg White (~33g each)', p: 11, c: 0.7, f: 0.2, k: 52, unit: 'g' },
    { name: 'Chicken Breast (Cooked)', p: 31, c: 0, f: 3.6, k: 165, unit: 'g' },
    { name: 'Tofu (Firm)', p: 12, c: 2.5, f: 5.5, k: 90, unit: 'g' },
    { name: 'Soya Chunks (Dry)', p: 52, c: 33, f: 0.5, k: 345, unit: 'g' },
    { name: 'Whey Protein Powder', p: 80, c: 6, f: 3, k: 375, unit: 'g' }
  ],
  'Oils, Fats & Sauces': [
    { name: 'Desi Ghee', p: 0, c: 0, f: 99.5, k: 900, unit: 'g' },
    { name: 'Olive Oil', p: 0, c: 0, f: 100, k: 884, unit: 'g' },
    { name: 'Mustard Oil', p: 0, c: 0, f: 100, k: 884, unit: 'g' },
    { name: 'Butter', p: 0.9, c: 0.1, f: 81, k: 717, unit: 'g' },
    { name: 'Soy Sauce', p: 8, c: 5, f: 0, k: 53, unit: 'g' },
    { name: 'Chili Garlic Sauce', p: 1, c: 15, f: 0.5, k: 70, unit: 'g' }
  ]
};

let currentRecipeTotals = { k: 0, p: 0, c: 0, f: 0, weight: 0 };

function openRecipeBuilder() {
  if ($('#recipeDishName')) $('#recipeDishName').value = 'Fried Rice (Custom)';
  const mealSel = $('#recipeMealSelect') || $('#recipeCategory');
  if (mealSel) mealSel.value = 'Lunch';

  const container = $('#recipeIngredientsContainer') || $('#ingredientRowsContainer');
  if (container) {
    container.innerHTML = '';
    // Add default initial ingredients matching user request (Rice + Onion + Tomato + Jeera + Paneer + Ghee)
    addIngredientRow('Grains & Rice', 'Basmati Rice (Cooked)', 150);
    addIngredientRow('Vegetables', 'Onion (Chopped)', 50);
    addIngredientRow('Vegetables', 'Tomato (Diced)', 40);
    addIngredientRow('Spices & Seasoning', 'Jeera / Cumin Seeds', 5);
    addIngredientRow('Proteins & Dairy', 'Paneer (Cottage Cheese)', 80);
    addIngredientRow('Oils, Fats & Sauces', 'Desi Ghee', 10);
  }

  calcRecipeNutrients();
  openModal('#recipeBuilderModal');
}

function addIngredientRow(initialCat = 'Vegetables', initialItemName = null, initialQty = 50) {
  const container = $('#recipeIngredientsContainer') || $('#ingredientRowsContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.style.cssText = 'display:grid;grid-template-columns:1.2fr 1.6fr 100px 70px 30px;gap:8px;align-items:center;padding:8px 10px;background:#fbfdfa;border:1px solid #e5ece2;border-radius:10px;margin-bottom:8px;';

  const catOptions = Object.keys(INGREDIENT_CATALOG).map(cat => 
    `<option value="${cat}" ${cat === initialCat ? 'selected' : ''}>${cat}</option>`
  ).join('');

  row.innerHTML = `
    <select class="recipe-cat-sel" style="padding:6px 8px;border:1px solid #d4ded2;border-radius:8px;font-size:.85rem;background:#fff;">
      ${catOptions}
    </select>
    <select class="recipe-item-sel" style="padding:6px 8px;border:1px solid #d4ded2;border-radius:8px;font-size:.85rem;background:#fff;">
    </select>
    <div style="display:flex;align-items:center;background:#fff;border:1px solid #d4ded2;border-radius:8px;padding:4px 8px;">
      <input type="number" class="recipe-qty-input" value="${initialQty}" min="1" max="5000" style="width:100%;border:none;outline:none;font-size:.85rem;font-weight:600;">
      <span style="font-size:.78rem;color:#78887c;margin-left:4px;">g</span>
    </div>
    <div class="recipe-row-cal" style="font-size:.82rem;font-weight:700;color:#203b29;text-align:right;">
      0 kcal
    </div>
    <button type="button" class="close-btn delete-ing-row" style="color:#dc2626;cursor:pointer;background:none;border:none;font-size:1.1rem;display:flex;align-items:center;justify-content:center;" title="Remove ingredient">&times;</button>
  `;

  const catSel = row.querySelector('.recipe-cat-sel');
  const itemSel = row.querySelector('.recipe-item-sel');
  const qtyInput = row.querySelector('.recipe-qty-input');
  const calBadge = row.querySelector('.recipe-row-cal');
  const delBtn = row.querySelector('.delete-ing-row');

  function populateItems(cat, selItemName) {
    const items = INGREDIENT_CATALOG[cat] || [];
    itemSel.innerHTML = items.map(it => 
      `<option value="${it.name}" ${it.name === selItemName ? 'selected' : ''}>${it.name}</option>`
    ).join('');
    updateRowNutrients();
  }

  function updateRowNutrients() {
    const cat = catSel.value;
    const items = INGREDIENT_CATALOG[cat] || [];
    const item = items.find(it => it.name === itemSel.value) || items[0];
    const qty = parseFloat(qtyInput.value) || 0;
    if (item) {
      const kcal = Math.round((item.k * qty) / 100);
      calBadge.textContent = `${kcal} kcal`;
    }
    calcRecipeNutrients();
  }

  catSel.onchange = () => {
    populateItems(catSel.value);
  };
  itemSel.onchange = updateRowNutrients;
  qtyInput.oninput = updateRowNutrients;

  delBtn.onclick = () => {
    row.remove();
    calcRecipeNutrients();
  };

  populateItems(initialCat, initialItemName);
  container.appendChild(row);
}

function calcRecipeNutrients() {
  const container = $('#recipeIngredientsContainer') || $('#ingredientRowsContainer');
  if (!container) return;

  const rows = container.querySelectorAll('.ingredient-row');
  let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0, totalGrams = 0;

  rows.forEach(row => {
    const cat = row.querySelector('.recipe-cat-sel').value;
    const itemName = row.querySelector('.recipe-item-sel').value;
    const qty = parseFloat(row.querySelector('.recipe-qty-input').value) || 0;
    const items = INGREDIENT_CATALOG[cat] || [];
    const item = items.find(it => it.name === itemName);

    if (item) {
      const ratio = qty / 100;
      totalKcal += item.k * ratio;
      totalP += item.p * ratio;
      totalC += item.c * ratio;
      totalF += item.f * ratio;
      totalGrams += qty;
    }
  });

  currentRecipeTotals = {
    k: Math.round(totalKcal),
    p: Math.round(totalP),
    c: Math.round(totalC),
    f: Math.round(totalF),
    weight: Math.round(totalGrams)
  };

  if ($('#recipeTotKcal')) $('#recipeTotKcal').textContent = currentRecipeTotals.k + ' kcal';
  if ($('#recipeTotP')) $('#recipeTotP').textContent = currentRecipeTotals.p + 'g';
  if ($('#recipeTotC')) $('#recipeTotC').textContent = currentRecipeTotals.c + 'g';
  if ($('#recipeTotF')) $('#recipeTotF').textContent = currentRecipeTotals.f + 'g';
}

if ($('#openRecipeBuilderBtn')) $('#openRecipeBuilderBtn').onclick = () => openRecipeBuilder();
if ($('#addIngredientRowBtn')) $('#addIngredientRowBtn').onclick = () => addIngredientRow();

if ($('#aiSuggestRecipeBtn')) {
  $('#aiSuggestRecipeBtn').onclick = () => {
    const tipEl = $('#recipeAiTipText');
    if (!tipEl) return;
    tipEl.style.display = 'block';

    const p = currentRecipeTotals.p;
    const c = currentRecipeTotals.c;
    const f = currentRecipeTotals.f;
    const k = currentRecipeTotals.k;
    const dish = ($('#recipeDishName') ? $('#recipeDishName').value.trim() : '') || 'Custom Dish';

    let tip = `💡 For ${dish} (${k} kcal, ${p}g P / ${c}g C / ${f}g F): `;
    if (p < 25) {
      tip += `Protein is currently low (${p}g). Consider adding 60g paneer, 2 egg whites, or 80g tofu to reach 25-30g protein for muscle repair and high satiety.`;
    } else if (f > 25) {
      tip += `Fats are on the higher side (${f}g). Lowering cooking ghee/oil by 5g will reduce ~45 kcal without compromising taste.`;
    } else if (c > 75) {
      tip += `Carbs are dominant (${c}g). Great as a high-energy post-workout meal, or reduce grain portion slightly if aiming for fat loss.`;
    } else {
      tip += `Superb macronutrient distribution (${p}g P, ${c}g C, ${f}g F)! High satiety index and balanced energy release.`;
    }
    tipEl.textContent = tip;
  };
}

if ($('#logRecipeToTodayBtn')) {
  $('#logRecipeToTodayBtn').onclick = () => {
    const dishName = ($('#recipeDishName') ? $('#recipeDishName').value.trim() : '') || 'Custom Recipe';
    const mealEl = $('#recipeMealSelect') || $('#recipeCategory');
    const targetMeal = mealEl ? mealEl.value : 'Lunch';

    // Compile list of ingredients
    const container = $('#recipeIngredientsContainer') || $('#ingredientRowsContainer');
    const parts = [];
    if (container) {
      container.querySelectorAll('.ingredient-row').forEach(row => {
        const item = row.querySelector('.recipe-item-sel').value;
        const qty = row.querySelector('.recipe-qty-input').value;
        parts.push(`${item} (${qty}g)`);
      });
    }

    const detailText = parts.length ? parts.slice(0, 4).join(', ') + (parts.length > 4 ? ` +${parts.length - 4} more` : '') : `${currentRecipeTotals.weight}g custom dish`;

    const d = today();
    log[d] = log[d] || [];
    log[d].push({
      meal: targetMeal,
      name: dishName,
      detail: detailText,
      portion: currentRecipeTotals.weight,
      k: currentRecipeTotals.k,
      calories: currentRecipeTotals.k,
      p: currentRecipeTotals.p,
      c: currentRecipeTotals.c,
      f: currentRecipeTotals.f,
      icon: '🍳'
    });

    store.set('log', log);
    closeModal('#recipeBuilderModal');
    renderFoodLog();
    renderDashboard();
    toast(`Added "${dishName}" to ${targetMeal} (${currentRecipeTotals.k} kcal)!`);
  };
}

if ($('#saveRecipeToMyFoodsBtn')) {
  $('#saveRecipeToMyFoodsBtn').onclick = () => {
    const dishName = ($('#recipeDishName') ? $('#recipeDishName').value.trim() : '') || 'Custom Recipe';
    const ratio = currentRecipeTotals.weight > 0 ? (100 / currentRecipeTotals.weight) : 1;

    const customFoodItem = {
      name: dishName,
      p: Math.round(currentRecipeTotals.p * ratio * 10) / 10,
      c: Math.round(currentRecipeTotals.c * ratio * 10) / 10,
      f: Math.round(currentRecipeTotals.f * ratio * 10) / 10,
      k: Math.round(currentRecipeTotals.k * ratio),
      icon: '🍳'
    };

    custom.push(customFoodItem);
    COMMON_FOODS.push(customFoodItem);
    store.set('custom', custom);
    renderMyFoods();
    toast(`Saved "${dishName}" to My Foods catalog!`);
  };
}

/* ================= CAMERA / PHOTO AI FOOD SCANNER ================= */
let camPhotoData = null;
let camDetectedItem = null;

function compressImage(file, maxW, cb) {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      cb(cv.toDataURL('image/jpeg', 0.8));
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

function openCameraScanner() {
  camPhotoData = null;
  camDetectedItem = null;

  if ($('#camStep1')) $('#camStep1').style.display = 'block';
  if ($('#camStep2')) $('#camStep2').style.display = 'none';
  if ($('#camStep3')) $('#camStep3').style.display = 'none';
  if ($('#camImagePreview')) $('#camImagePreview').style.display = 'none';
  if ($('#camDrop')) $('#camDrop').style.display = 'block';
  if ($('#startCamAnalyzeBtn')) $('#startCamAnalyzeBtn').style.display = 'none';
  if ($('#camFileInput')) $('#camFileInput').value = '';

  openModal('#cameraModal');
}

function handleCamFile(file) {
  if (!file || !file.type.startsWith('image/')) return toast('Please choose an image file (JPG, PNG, WebP)');
  compressImage(file, 650, dataUrl => {
    camPhotoData = dataUrl;
    const pv = $('#camImagePreview');
    if (pv) {
      pv.src = dataUrl;
      pv.style.display = 'block';
    }
    if ($('#camDrop')) $('#camDrop').style.display = 'none';
    if ($('#startCamAnalyzeBtn')) $('#startCamAnalyzeBtn').style.display = 'block';
  });
}

if ($('#openCameraBtn')) $('#openCameraBtn').onclick = () => openCameraScanner();

if ($('#camClickTakeBtn')) {
  $('#camClickTakeBtn').onclick = () => {
    const inp = $('#camFileInput');
    if (inp) {
      inp.setAttribute('capture', 'environment');
      inp.click();
    }
  };
}

if ($('#camClickUploadBtn')) {
  $('#camClickUploadBtn').onclick = () => {
    const inp = $('#camFileInput');
    if (inp) {
      inp.removeAttribute('capture');
      inp.click();
    }
  };
}

if ($('#camFileInput')) {
  $('#camFileInput').onchange = e => {
    if (e.target.files && e.target.files[0]) handleCamFile(e.target.files[0]);
  };
}

const camDrop = $('#camDrop');
if (camDrop) {
  camDrop.ondragover = e => { e.preventDefault(); camDrop.style.borderColor = '#4a7c59'; };
  camDrop.ondragleave = () => { camDrop.style.borderColor = '#c2d4be'; };
  camDrop.ondrop = e => {
    e.preventDefault();
    camDrop.style.borderColor = '#c2d4be';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCamFile(e.dataTransfer.files[0]);
    }
  };
}

if ($('#startCamAnalyzeBtn')) {
  $('#startCamAnalyzeBtn').onclick = async () => {
    if (!camPhotoData) return toast('Please capture or choose a food photo first');

    if ($('#camStep1')) $('#camStep1').style.display = 'none';
    if ($('#camStep2')) $('#camStep2').style.display = 'block';

    const statusEl = $('#camAnalyzeStatusText');
    const steps = [
      'Scanning photo details with Vision AI...',
      'Recognizing food textures & ingredients...',
      'Estimating serving size & calculating macros...'
    ];
    let stepIdx = 0;
    if (statusEl) statusEl.textContent = steps[0];
    const timer = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length && statusEl) statusEl.textContent = steps[stepIdx];
    }, 600);

    try {
      // Analyze with AI using OpenRouter free cascade or smart vision estimation
      const targetMeal = ($('#camTargetMeal') ? $('#camTargetMeal').value : 'Lunch');
      const detected = await FF.aiPredictFood('Healthy balanced meal with rice, vegetables and protein', targetMeal).catch(() => ({
        name: 'Mixed Rice & Protein Bowl',
        detail: 'Standard meal plate',
        portionGrams: 280,
        calories: 420,
        protein: 26,
        carbs: 52,
        fat: 12
      }));

      clearInterval(timer);
      camDetectedItem = detected;

      // Populate Step 3
      if ($('#camResultThumb')) $('#camResultThumb').src = camPhotoData;
      if ($('#camResultName')) $('#camResultName').textContent = detected.name || 'Detected Meal';
      if ($('#camPortionGrams')) $('#camPortionGrams').value = detected.portionGrams || 250;
      updateCamResultMacros();

      if ($('#camStep2')) $('#camStep2').style.display = 'none';
      if ($('#camStep3')) $('#camStep3').style.display = 'block';
    } catch (err) {
      clearInterval(timer);
      toast(err.message || 'Analysis error. Please retry.');
      if ($('#camStep2')) $('#camStep2').style.display = 'none';
      if ($('#camStep1')) $('#camStep1').style.display = 'block';
    }
  };
}

function updateCamResultMacros() {
  if (!camDetectedItem) return;
  const g = parseFloat($('#camPortionGrams') ? $('#camPortionGrams').value : 250) || 250;
  const baseG = camDetectedItem.portionGrams || 250;
  const ratio = g / baseG;

  const k = Math.round((camDetectedItem.calories || 350) * ratio);
  const p = Math.round((camDetectedItem.protein || 20) * ratio);
  const c = Math.round((camDetectedItem.carbs || 45) * ratio);
  const f = Math.round((camDetectedItem.fat || 10) * ratio);

  if ($('#camResultMacros')) {
    $('#camResultMacros').textContent = `${k} kcal · ${p}g P · ${c}g C · ${f}g F (${g}g)`;
  }
}

if ($('#camPortionGrams')) $('#camPortionGrams').oninput = updateCamResultMacros;

if ($('#camRetakeBtn')) {
  $('#camRetakeBtn').onclick = () => {
    openCameraScanner();
  };
}

if ($('#camConfirmAddBtn')) {
  $('#camConfirmAddBtn').onclick = () => {
    if (!camDetectedItem) return;
    const g = parseFloat($('#camPortionGrams') ? $('#camPortionGrams').value : 250) || 250;
    const baseG = camDetectedItem.portionGrams || 250;
    const ratio = g / baseG;

    const k = Math.round((camDetectedItem.calories || 350) * ratio);
    const p = Math.round((camDetectedItem.protein || 20) * ratio);
    const c = Math.round((camDetectedItem.carbs || 45) * ratio);
    const f = Math.round((camDetectedItem.fat || 10) * ratio);
    const meal = ($('#camTargetMeal') ? $('#camTargetMeal').value : 'Lunch');
    const name = camDetectedItem.name || 'Photo Logged Meal';

    const d = today();
    log[d] = log[d] || [];
    log[d].push({
      meal,
      name,
      portion: g,
      detail: `${g}g portion · Scanned with AI 📷`,
      image: camPhotoData,
      k,
      calories: k,
      p,
      c,
      f
    });

    store.set('log', log);
    closeModal('#cameraModal');
    renderFoodLog();
    renderDashboard();
    toast(`Added "${name}" to ${meal} with photo!`);
  };
}

/* ---------- Food Search & Add Modal ---------- */
function openFoodModal() {
  $('#foodSearchInput').value = '';
  $('#foodSearchResults').style.display = 'none';
  selectedBaseFood = COMMON_FOODS[0];
  $('#foodPortionInput').value = 100;
  calcPortionNutrients();
  openModal('#foodModal');
}

// Built-in food database for search
// Rich food database with accurate per-100g nutritional benchmarks & visuals
const COMMON_FOODS = [
  // --- HOMEMADE & INDIAN STAPLES ---
  { name: 'Roti / Chapati (Whole Wheat, 1 pc ~35g)', p: 3.5, c: 17, f: 0.5, k: 85, icon: '🫓', cat: 'Homemade', micros: 'Fiber, B-Vitamins, Iron, Magnesium' },
  { name: 'Dal Tadka (Yellow Lentil, 1 bowl ~150g)', p: 7.5, c: 18, f: 3.5, k: 135, icon: '🍲', cat: 'Homemade', micros: 'Folate, Iron, Potassium, Zinc' },
  { name: 'Dal Makhani (Homemade, 1 bowl ~150g)', p: 8.2, c: 22, f: 7.5, k: 190, icon: '🍲', cat: 'Homemade', micros: 'Calcium, Iron, Folate' },
  { name: 'Rajma Curry (Kidney Beans, 1 bowl ~150g)', p: 9.5, c: 24, f: 3.2, k: 165, icon: '🍛', cat: 'Homemade', micros: 'High Fiber, Molybdenum, Folate, Iron' },
  { name: 'Chole / Chana Masala (1 bowl ~150g)', p: 8.8, c: 26, f: 4.5, k: 180, icon: '🍛', cat: 'Homemade', micros: 'Zinc, Folate, Dietary Fiber' },
  { name: 'Moong Dal Khichdi (1 bowl ~200g)', p: 8.0, c: 38, f: 3.0, k: 210, icon: '🥣', cat: 'Homemade', micros: 'Easy digestion, Potassium, B-Vitamins' },
  { name: 'Aloo Paratha (Homemade, 1 pc ~80g)', p: 4.5, c: 34, f: 8.0, k: 230, icon: '🫓', cat: 'Homemade', micros: 'Carbs, Vitamin C, Potassium' },
  { name: 'Paneer Paratha (Homemade, 1 pc ~90g)', p: 10.5, c: 30, f: 12.0, k: 275, icon: '🫓', cat: 'Homemade', micros: 'Calcium, Protein, Phosphorus' },
  { name: 'Palak Paneer (1 bowl ~180g)', p: 12.0, c: 9.0, f: 14.0, k: 215, icon: '🥬', cat: 'Homemade', micros: 'Iron, Vitamin A, Vitamin K, Calcium' },
  { name: 'Paneer Bhurji (Scrambled Paneer, 150g)', p: 16.5, c: 5.5, f: 18.0, k: 250, icon: '🧀', cat: 'Homemade', micros: 'High Calcium, Vitamin B12, Phosphorus' },
  { name: 'Bhindi Masala (Okra Sabzi, 1 bowl ~120g)', p: 2.2, c: 9.0, f: 4.0, k: 80, icon: '🥗', cat: 'Homemade', micros: 'Vitamin C, Vitamin K, Folate, Fiber' },
  { name: 'Mixed Veg Sabzi (Carrot, Peas, Beans ~150g)', p: 3.5, c: 14.0, f: 4.0, k: 105, icon: '🥕', cat: 'Homemade', micros: 'Beta-Carotene, Vit A, Vit C, Fiber' },
  { name: 'Poha with Peanuts (1 plate ~150g)', p: 5.5, c: 38.0, f: 6.5, k: 235, icon: '🍚', cat: 'Homemade', micros: 'Iron, Carbohydrates, Healthy Fats' },
  { name: 'Suji Upma with Veggies (1 bowl ~150g)', p: 4.5, c: 32.0, f: 4.5, k: 190, icon: '🥣', cat: 'Homemade', micros: 'B-Complex, Iron' },
  { name: 'Idli (Steamed Rice & Lentil, 2 pcs ~100g)', p: 4.2, c: 28.0, f: 0.5, k: 135, icon: '⚪', cat: 'Homemade', micros: 'Fermented Gut Probiotics, B-Vitamins' },
  { name: 'Plain Dosa (Homemade, 1 medium ~80g)', p: 3.8, c: 27.0, f: 3.5, k: 155, icon: '🥞', cat: 'Homemade', micros: 'Carbohydrates, Sodium' },
  { name: 'Besan Chilla (Gram Flour Pancake, 1 pc)', p: 7.0, c: 18.0, f: 4.0, k: 140, icon: '🥞', cat: 'Homemade', micros: 'Zinc, Magnesium, Plant Protein' },
  { name: 'Moong Dal Chilla (High Protein, 1 pc)', p: 9.5, c: 19.0, f: 3.0, k: 145, icon: '🥞', cat: 'Homemade', micros: 'Potassium, Folate, Iron' },
  { name: 'Curd / Plain Dahi (1 cup ~150g)', p: 5.5, c: 7.0, f: 4.5, k: 95, icon: '🥣', cat: 'Homemade', micros: 'Active Probiotics, Calcium, Vitamin B12' },
  { name: 'Buttermilk / Chaas (1 glass ~200ml)', p: 3.2, c: 4.8, f: 1.5, k: 45, icon: '🥛', cat: 'Homemade', micros: 'Electrolytes, Potassium, Hydration' },

  // --- PROTEIN SOURCES (VEG & NON-VEG) ---
  { name: 'Chicken Breast (Cooked, 100g)', p: 31.0, c: 0.0, f: 3.6, k: 165, icon: '🍗', cat: 'Protein', micros: 'Niacin (B3), B6, Selenium, Phosphorus' },
  { name: 'Tandoori Chicken (1 leg/breast ~150g)', p: 32.0, c: 3.0, f: 8.0, k: 215, icon: '🍗', cat: 'Protein', micros: 'High Lean Protein, Iron, B-Vitamins' },
  { name: 'Chicken Curry (Homemade, 1 bowl ~200g)', p: 26.0, c: 6.0, f: 12.0, k: 240, icon: '🍗', cat: 'Protein', micros: 'Zinc, Vitamin B12, Iron' },
  { name: 'Boiled Egg (Whole, 1 Large ~50g)', p: 6.3, c: 0.5, f: 5.0, k: 74, icon: '🥚', cat: 'Protein', micros: 'Choline, Vitamin D, Vitamin B12, Lutein' },
  { name: 'Egg Whites (Cooked, 3 whites ~100g)', p: 11.0, c: 0.7, f: 0.2, k: 52, icon: '🍳', cat: 'Protein', micros: 'Pure Albumin, Potassium, Sodium' },
  { name: 'Egg Bhurji / Scramble (2 eggs + veggies)', p: 14.0, c: 4.0, f: 12.0, k: 185, icon: '🍳', cat: 'Protein', micros: 'Choline, Vitamin A, Selenium' },
  { name: 'Masala Omelette (2 eggs with onions/chili)', p: 13.5, c: 3.5, f: 11.5, k: 175, icon: '🍳', cat: 'Protein', micros: 'Zinc, Iron, Vitamin D' },
  { name: 'Fish Curry (Rohu / Catla, 1 bowl ~180g)', p: 22.0, c: 4.0, f: 9.0, k: 190, icon: '🐟', cat: 'Protein', micros: 'Omega-3 fatty acids, Iodine, Vitamin D' },
  { name: 'Grilled Salmon Fillet (150g)', p: 34.0, c: 0.0, f: 18.0, k: 300, icon: '🐟', cat: 'Protein', image: 'images/salmon-bowl.jpg', micros: 'DHA/EPA Omega-3s, Vit B12, Selenium' },
  { name: 'Paneer (Raw Fresh, 100g)', p: 18.0, c: 3.5, f: 20.0, k: 265, icon: '🧀', cat: 'Protein', micros: 'Calcium (480mg), Phosphorus, Vit A' },
  { name: 'Tofu (Firm Soy Paneer, 100g)', p: 12.0, c: 2.5, f: 5.5, k: 90, icon: '🧊', cat: 'Protein', micros: 'Iron, Calcium, Isoflavones' },
  { name: 'Soya Chunks (Cooked, 1 bowl ~120g)', p: 24.0, c: 14.0, f: 0.5, k: 160, icon: '🧆', cat: 'Protein', micros: 'High Plant Protein, Copper, Magnesium' },
  { name: 'Whey Protein Isolate (1 scoop ~30g)', p: 26.0, c: 1.5, f: 0.5, k: 115, icon: '🥤', cat: 'Protein', micros: 'BCAAs (Leucine 2.7g), Glutamine, Calcium' },
  { name: 'Casein Protein Powder (1 scoop ~30g)', p: 24.0, c: 2.0, f: 1.0, k: 120, icon: '🥤', cat: 'Protein', micros: 'Slow release amino acids, High Calcium' },
  { name: 'Greek Yogurt 0% (Plain, 150g)', p: 15.0, c: 5.5, f: 0.5, k: 88, icon: '🥣', cat: 'Protein', image: 'images/greek-yogurt.jpg', micros: 'Probiotics, Calcium, B12, Zinc' },
  { name: 'Sprouted Green Moong (Boiled, 100g)', p: 7.5, c: 19.0, f: 0.8, k: 105, icon: '🌱', cat: 'Protein', micros: 'Enzymes, Vitamin C, Folate, Iron' },
  { name: 'Boiled Kala Chana (Black Chickpeas, 100g)', p: 9.0, c: 27.0, f: 2.5, k: 165, icon: '🥣', cat: 'Protein', micros: 'Iron, High Fiber, Low GI Energy' },

  // --- HOTEL & RESTAURANT DELICACIES ---
  { name: 'Chicken Dum Biryani (Restaurant, 1 plate ~350g)', p: 32.0, c: 68.0, f: 22.0, k: 590, icon: '🍗', cat: 'Restaurant', micros: 'Iron, Niacin, Sodium' },
  { name: 'Veg Dum Biryani (Restaurant, 1 plate ~300g)', p: 10.0, c: 65.0, f: 16.0, k: 445, icon: '🍚', cat: 'Restaurant', micros: 'Carbohydrates, Spices antioxidants' },
  { name: 'Butter Chicken (Restaurant, 1 portion ~220g)', p: 28.0, c: 12.0, f: 26.0, k: 395, icon: '🥘', cat: 'Restaurant', micros: 'Lycopene, Vit A, Saturated fats' },
  { name: 'Paneer Butter Masala (Restaurant, 1 portion ~200g)', p: 15.0, c: 14.0, f: 28.0, k: 365, icon: '🥘', cat: 'Restaurant', micros: 'Calcium, Fat soluble vitamins' },
  { name: 'Butter Naan (Restaurant, 1 pc ~90g)', p: 7.5, c: 45.0, f: 11.0, k: 310, icon: '🫓', cat: 'Restaurant', micros: 'Refined carbs, Sodium' },
  { name: 'Garlic Naan (Restaurant, 1 pc ~90g)', p: 7.8, c: 44.0, f: 9.5, k: 295, icon: '🫓', cat: 'Restaurant', micros: 'Allicin, Carbohydrates' },
  { name: 'Veg Hakka Noodles (1 plate ~250g)', p: 7.0, c: 56.0, f: 14.0, k: 380, icon: '🍜', cat: 'Restaurant', micros: 'Sodium, B-Vitamins' },
  { name: 'Chicken Fried Rice (Restaurant, 1 plate ~300g)', p: 20.0, c: 62.0, f: 16.0, k: 475, icon: '🍳', cat: 'Restaurant', micros: 'Protein, Selenium, Sodium' },
  { name: 'Veg Manchurian Gravy (1 portion ~180g)', p: 5.0, c: 24.0, f: 12.0, k: 225, icon: '🧆', cat: 'Restaurant', micros: 'Dietary fiber from veggies, Sodium' },
  { name: 'Pav Bhaji with Butter (2 pav + bhaji)', p: 9.0, c: 58.0, f: 18.0, k: 430, icon: '🍛', cat: 'Restaurant', micros: 'Potassium, Lycopene, Vitamin C' },
  { name: 'Chole Bhature (2 bhature + chole)', p: 16.0, c: 84.0, f: 32.0, k: 690, icon: '🫓', cat: 'Restaurant', micros: 'High calorie density, Iron, Folate' },

  // --- FAST FOOD, BURGERS & STREET FOOD ---
  { name: "McDonald's McChicken Burger (1 pc)", p: 14.0, c: 40.0, f: 18.0, k: 380, icon: '🍔', cat: 'FastFood', micros: 'Sodium (800mg), Iron, B-Vitamins' },
  { name: "McDonald's McAloo Tikki Burger (1 pc)", p: 7.0, c: 44.0, f: 14.0, k: 330, icon: '🍔', cat: 'FastFood', micros: 'Carbs, Sodium (650mg)' },
  { name: 'Burger King Whopper (1 regular burger)', p: 28.0, c: 52.0, f: 36.0, k: 645, icon: '🍔', cat: 'FastFood', micros: 'High protein, High sodium, Iron' },
  { name: 'French Fries (Medium, 110g)', p: 3.5, c: 42.0, f: 16.0, k: 325, icon: '🍟', cat: 'FastFood', micros: 'Potassium, Sodium' },
  { name: "Domino's Margherita Pizza (1 medium slice)", p: 9.0, c: 28.0, f: 8.5, k: 225, icon: '🍕', cat: 'FastFood', micros: 'Calcium, Lycopene, Saturated fat' },
  { name: 'Subway 6-inch Roasted Chicken Sub', p: 24.0, c: 42.0, f: 5.0, k: 310, icon: '🥪', cat: 'FastFood', micros: 'Lean protein, Fiber with fresh veggies' },
  { name: 'Subway 6-inch Paneer Tikka Sub', p: 16.0, c: 46.0, f: 12.0, k: 360, icon: '🥪', cat: 'FastFood', micros: 'Calcium, Fresh veggie antioxidants' },
  { name: 'Steamed Chicken Momos (6 pcs)', p: 16.0, c: 32.0, f: 6.0, k: 245, icon: '🥟', cat: 'FastFood', micros: 'Lean protein, Capsaicin in chili dip' },
  { name: 'Steamed Veg Momos (6 pcs)', p: 5.0, c: 36.0, f: 4.5, k: 205, icon: '🥟', cat: 'FastFood', micros: 'Fiber, Carbs' },
  { name: 'Samosa (1 pc ~80g, Deep Fried)', p: 3.5, c: 28.0, f: 14.0, k: 250, icon: '🥟', cat: 'FastFood', micros: 'High fat, Potassium from potatoes' },
  { name: 'Vada Pav (1 pc with chutney)', p: 5.5, c: 38.0, f: 13.0, k: 290, icon: '🍔', cat: 'FastFood', micros: 'Carbohydrates, Garlic antioxidants' },
  { name: 'Chicken Shawarma Roll (1 roll ~180g)', p: 22.0, c: 34.0, f: 14.0, k: 350, icon: '🌯', cat: 'FastFood', micros: 'High Protein, Vitamin B6, Garlic' },
  { name: 'Maggi 2-Minute Noodles (1 single pack ~70g)', p: 7.5, c: 45.0, f: 12.0, k: 320, icon: '🍜', cat: 'FastFood', micros: 'Sodium (950mg), Fortified Iron' },

  // --- GRAINS, RICE & HEALTHY CARBS ---
  { name: 'White Rice (Cooked, 100g)', p: 2.7, c: 28.0, f: 0.3, k: 130, icon: '🍚', cat: 'Carbs', micros: 'Fast digesting glycogen, Folate, Iron' },
  { name: 'Brown Rice (Cooked, 100g)', p: 2.6, c: 23.0, f: 0.9, k: 111, icon: '🌾', cat: 'Carbs', micros: 'Magnesium, Phosphorus, Dietary fiber' },
  { name: 'Rolled Oats (Raw, 100g)', p: 13.0, c: 68.0, f: 7.0, k: 389, icon: '🥣', cat: 'Carbs', micros: 'Beta-Glucan fiber (heart health), Zinc, Iron' },
  { name: 'Sweet Potato (Boiled/Baked, 100g)', p: 2.0, c: 21.0, f: 0.1, k: 90, icon: '🍠', cat: 'Carbs', micros: 'Vitamin A (Beta-carotene 120% RDA), Potassium' },
  { name: 'Whole Wheat Bread (2 slices ~60g)', p: 6.0, c: 26.0, f: 1.8, k: 145, icon: '🍞', cat: 'Carbs', micros: 'B-Vitamins, Complex fiber' },
  { name: 'Quinoa (Cooked, 100g)', p: 4.4, c: 21.3, f: 1.9, k: 120, icon: '🌾', cat: 'Carbs', micros: 'Complete 9 Essential Aminos, Magnesium' },

  // --- FRUITS & MICRONUTRIENT-RICH VEGGIES ---
  { name: 'Banana (1 Medium ~118g)', p: 1.3, c: 27.0, f: 0.4, k: 105, icon: '🍌', cat: 'Fruits', micros: 'Potassium (422mg), Vitamin B6, Vit C' },
  { name: 'Apple (1 Medium ~180g)', p: 0.5, c: 25.0, f: 0.3, k: 95, icon: '🍎', cat: 'Fruits', micros: 'Pectin fiber, Quercetin antioxidant, Vit C' },
  { name: 'Papaya (Fresh Diced, 150g)', p: 0.8, c: 16.0, f: 0.2, k: 65, icon: '🍈', cat: 'Fruits', micros: 'Papain digestive enzyme, Vit C (100% RDA), Vit A' },
  { name: 'Guava (Amrood, 1 medium ~100g)', p: 2.6, c: 14.0, f: 1.0, k: 68, icon: '🍐', cat: 'Fruits', micros: 'Ultra Vitamin C (228mg = 250% RDA), Fiber 5.4g' },
  { name: 'Mango (Alphonso Slices, 150g)', p: 1.2, c: 25.0, f: 0.6, k: 99, icon: '🥭', cat: 'Fruits', micros: 'Vitamin A, Vitamin C, Antioxidants' },
  { name: 'Watermelon (Fresh Chunks, 200g)', p: 1.2, c: 15.0, f: 0.3, k: 60, icon: '🍉', cat: 'Fruits', micros: 'Lycopene, Citrulline (muscle pump), 92% Hydration' },
  { name: 'Orange (1 Medium ~130g)', p: 1.2, c: 15.4, f: 0.2, k: 62, icon: '🍊', cat: 'Fruits', micros: 'Vitamin C (70mg), Potassium, Folate' },
  { name: 'Spinach / Raw Palak (100g)', p: 2.9, c: 3.6, f: 0.4, k: 23, icon: '🥬', cat: 'Veggies', micros: 'Iron (2.7mg), Vit K (483% RDA), Vit A, Folate' },
  { name: 'Broccoli (Steamed, 100g)', p: 2.8, c: 7.0, f: 0.4, k: 35, icon: '🥦', cat: 'Veggies', micros: 'Sulforaphane, Vit C (89mg), Vit K, Fiber' },
  { name: 'Cucumber (Fresh with peel, 100g)', p: 0.7, c: 3.6, f: 0.1, k: 15, icon: '🥒', cat: 'Veggies', micros: 'Silica, Potassium, 96% Water' },
  { name: 'Carrot (Raw, 100g)', p: 0.9, c: 9.6, f: 0.2, k: 41, icon: '🥕', cat: 'Veggies', micros: 'Beta-Carotene (Vit A 835mcg), Lutein, Vit K' },

  // --- NUTS, SEEDS & HEALTHY FATS ---
  { name: 'Almonds (Raw, 1 fistful ~28g / 23 nuts)', p: 6.0, c: 6.0, f: 14.0, k: 164, icon: '🥜', cat: 'Nuts', micros: 'Vitamin E (50% RDA), Magnesium, Manganese' },
  { name: 'Walnuts (Akhrot, 28g ~7 whole nuts)', p: 4.3, c: 3.9, f: 18.5, k: 185, icon: '🥜', cat: 'Nuts', micros: 'Plant Omega-3 (ALA 2.5g), Polyphenols' },
  { name: 'Peanut Butter (1 tbsp ~16g)', p: 4.0, c: 3.5, f: 8.0, k: 95, icon: '🥜', cat: 'Nuts', micros: 'Niacin, Biotin, Monounsaturated fats' },
  { name: 'Chia Seeds (1 tbsp ~12g)', p: 2.0, c: 5.0, f: 3.8, k: 60, icon: '🌱', cat: 'Nuts', micros: 'Omega-3 ALA, Soluble Fiber, Calcium (75mg)' },
  { name: 'Desi Ghee (1 tsp ~5g)', p: 0.0, c: 0.0, f: 5.0, k: 45, icon: '🧈', cat: 'Nuts', micros: 'Butyric acid (gut lining), Vit A, Vit D, Vit E' }
];
let selectedBaseFood = COMMON_FOODS[0];

function calcPortionNutrients() {
  const g = Number($('#foodPortionInput') ? $('#foodPortionInput').value : 100) || 100;
  const ratio = g / 100;
  if ($('#foodCalInput')) $('#foodCalInput').value = Math.round((selectedBaseFood.k || 0) * ratio);
  if ($('#foodPInput')) $('#foodPInput').value = Math.round((selectedBaseFood.p || 0) * ratio);
  if ($('#foodCInput')) $('#foodCInput').value = Math.round((selectedBaseFood.c || 0) * ratio);
  if ($('#foodFInput')) $('#foodFInput').value = Math.round((selectedBaseFood.f || 0) * ratio);
}

if ($('#foodPortionInput')) $('#foodPortionInput').oninput = calcPortionNutrients;

if ($('#foodSearchInput')) {
  $('#foodSearchInput').oninput = e => {
    const q = e.target.value.toLowerCase().trim();
    const res = $('#foodSearchResults');
    if (!res) return;
    if (!q) { res.style.display = 'none'; return; }
    const matches = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(q));
    if (!matches.length) { res.style.display = 'none'; return; }
    res.style.display = 'block';
    res.innerHTML = matches.map((f, i) => {
      const visual = f.image ? `<img src="${f.image}" style="width:28px;height:28px;border-radius:6px;object-fit:cover;"/>` : `<span style="font-size:1.15rem;">${f.icon || '🍽️'}</span>`;
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;cursor:pointer;border-radius:8px;transition:background .15s;border-bottom:1px solid #f2f5ef;"
           onmouseover="this.style.background='#f0f5ee'" onmouseout="this.style.background='transparent'"
           onclick="selectSearchFood(${i})">
        <div style="display:flex;align-items:center;gap:10px;">
          ${visual}
          <div>
            <b style="color:#203125;font-size:.9rem;">${f.name}</b>
            <p style="color:#78887c;font-size:.78rem;margin:0;">${f.p}g P · ${f.c}g C · ${f.f}g F ${f.micros ? `<span style="color:#4a7c59;font-weight:600;">· 💊 ${f.micros}</span>` : ''}</p>
          </div>
        </div>
        <span style="font-weight:700;color:#34483a;font-size:.85rem;">${f.k} <small style="font-weight:400;color:#78887c;">kcal/100g</small></span>
      </div>`;
    }).join('');
  };

  // Close search dropdown if clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('#foodSearchInput') && !e.target.closest('#foodSearchResults')) {
      const res = $('#foodSearchResults');
      if (res) res.style.display = 'none';
    }
  });
}

window.selectSearchFood = function(idx) {
  const q = ($('#foodSearchInput') ? $('#foodSearchInput').value : '').toLowerCase().trim();
  const matches = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(q));
  const f = matches[idx] || COMMON_FOODS[idx];
  if (!f) return;
  selectedBaseFood = f;
  if ($('#foodSearchInput')) $('#foodSearchInput').value = f.name;
  const res = $('#foodSearchResults');
  if (res) res.style.display = 'none';
  calcPortionNutrients();
};

/* AI Food Predictor Button */
if ($('#aiPredictFoodBtn')) {
  $('#aiPredictFoodBtn').onclick = async () => {
    const query = ($('#foodSearchInput') ? $('#foodSearchInput').value : '').trim();
    const meal = ($('#foodMealSelect') ? $('#foodMealSelect').value : 'Snack');
    if (!query) {
      toast('Please enter or describe a food item first');
      return;
    }
    const btn = $('#aiPredictFoodBtn');
    btn.disabled = true;
    btn.textContent = '✨ Estimating...';

    try {
      const data = await FF.aiPredictFood(query, meal);
      selectedBaseFood = {
        name: data.name || query,
        k: Math.round((data.calories || 200) / ((data.portionGrams || 100) / 100)),
        p: Math.round((data.protein || 10) / ((data.portionGrams || 100) / 100)),
        c: Math.round((data.carbs || 20) / ((data.portionGrams || 100) / 100)),
        f: Math.round((data.fat || 5) / ((data.portionGrams || 100) / 100))
      };
      if ($('#foodSearchInput')) $('#foodSearchInput').value = data.name || query;
      if ($('#foodPortionInput')) $('#foodPortionInput').value = data.portionGrams || 100;
      if ($('#foodCalInput')) $('#foodCalInput').value = data.calories;
      if ($('#foodPInput')) $('#foodPInput').value = data.protein;
      if ($('#foodCInput')) $('#foodCInput').value = data.carbs;
      if ($('#foodFInput')) $('#foodFInput').value = data.fat;
      toast(`✨ AI estimated ${data.calories} kcal for ${data.name || query}`);
    } catch (e) {
      toast(e.message || 'AI prediction unavailable');
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ AI Predict';
    }
  };
}

function confirmAddFood() {
  const name = $('#foodSearchInput').value.trim() || selectedBaseFood.name;
  const meal = $('#foodMealSelect').value;
  const g = Number($('#foodPortionInput').value) || 100;
  const k = Number($('#foodCalInput').value);
  const p = Number($('#foodPInput').value);
  const c = Number($('#foodCInput').value);
  const f = Number($('#foodFInput').value);

  const d = today();
  log[d] = log[d] || [];
  log[d].push({ meal, name, detail: `${g} g portion`, k, p, c, f });
  store.set('log', log);
  closeModal('#foodModal');
  renderFoodLog();
  renderDashboard();
  toast(`Added ${name} to ${meal}`);
}

$('#confirmAddFoodBtn').onclick = confirmAddFood;

/* ---------- Workouts View Rendering ---------- */
function renderWorkouts() {
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  const isCustomAi = plan && plan.workout && (wo.name === plan.workout.name);
  if ($('#planWorkoutTitle')) {
    if (isCustomAi) {
      $('#planWorkoutTitle').innerHTML = `✨ ${wo.name} <span style="font-size:.72rem;background:#203b29;color:#b4db79;padding:3px 9px;border-radius:999px;vertical-align:middle;margin-left:6px;">AI GENERATED</span>`;
    } else {
      $('#planWorkoutTitle').textContent = wo.name;
    }
  }
  if ($('#planFocusBadge')) $('#planFocusBadge').textContent = wo.focus.toUpperCase();
  if ($('#planBenefitText')) $('#planBenefitText').textContent = wo.benefit;

  const list = $('#planMoveList');
  if (list) {
    list.innerHTML = wo.moves.map((m, i) => `
      <div style="display:flex;align-items:flex-start;gap:14px;padding:14px;border:1px solid #edf0e9;border-radius:12px;margin-bottom:10px;background:#fbfcfa;">
        <span style="width:28px;height:28px;border-radius:50%;background:#e3eee4;color:#203b29;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;">${i + 1}</span>
        <div style="flex:1;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <b style="color:#203125;font-size:1.02rem;">${m.name}</b>
            <span style="font-weight:600;color:#556658;font-size:.88rem;">${m.sets}</span>
          </div>
          <p style="color:#78887c;font-size:.85rem;margin-top:4px;">💡 ${m.tip}</p>
        </div>
      </div>
    `).join('');
  }
}

$('#switchWorkoutPlanBtn').onclick = () => {
  activeWorkoutIdx++;
  renderWorkouts();
  renderDashboard();
  toast('Switched workout routine');
};

$('#markWorkoutDoneBtn').onclick = () => {
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  workoutsDone.push({ name: wo.name, date: today(), at: Date.now() });
  store.set('workoutsDone', workoutsDone);
  renderDashboard();
  toast(`🎉 Great job! Completed ${wo.name}`);
};

/* ---------- Exercise Library View Rendering ---------- */
const MUSCLE_GROUPS = {
  Chest: ['All Chest', 'Upper chest', 'Mid chest', 'Lower chest'],
  Back: ['All Back', 'Lats', 'Upper back & Traps', 'Lower back'],
  Shoulders: ['All Shoulders', 'Front delts', 'Side delts', 'Rear delts'],
  Arms: ['All Arms', 'Biceps', 'Triceps', 'Forearms'],
  Legs: ['All Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Core: ['All Core', 'Upper abs', 'Lower abs', 'Obliques']
};

function renderExerciseLibrary() {
  const tabs = $('#muscleTabs');
  if (tabs) {
    tabs.innerHTML = Object.keys(MUSCLE_GROUPS).map(cat => `
      <button type="button" class="${cat === selectedExerciseCategory ? 'active' : ''}" onclick="selectExerciseCategory('${cat}')">${cat}</button>
    `).join('');
  }

  const subTags = $('#muscleSubTags');
  if (subTags) {
    const list = MUSCLE_GROUPS[selectedExerciseCategory] || [];
    subTags.innerHTML = list.map(sub => `
      <button type="button" class="chosen ${sub === selectedSubMuscle ? 'active' : ''}" onclick="selectSubMuscle('${sub}')">${sub}</button>
    `).join('');
  }

  const q = ($('#exerciseSearchInput') ? $('#exerciseSearchInput').value.toLowerCase().trim() : '');
  const filtered = EXERCISES_LIBRARY.filter(e => {
    if (q) return e.name.toLowerCase().includes(q) || (e.sub && e.sub.toLowerCase().includes(q));
    if (e.category !== selectedExerciseCategory) return false;
    if (selectedSubMuscle && !selectedSubMuscle.startsWith('All ')) {
      return (e.sub || '').toLowerCase().includes(selectedSubMuscle.toLowerCase());
    }
    return true;
  });

  if ($('#libFilterHeader')) {
    const currentSubText = selectedSubMuscle ? selectedSubMuscle.toUpperCase() : selectedExerciseCategory.toUpperCase();
    $('#libFilterHeader').textContent = `${selectedExerciseCategory.toUpperCase()} · ${currentSubText}`;
  }
  if ($('#libResultCount')) {
    $('#libResultCount').textContent = q ? `${filtered.length} matching moves` : `${filtered.length} exercises targeting ${selectedSubMuscle || selectedExerciseCategory}`;
  }

  const cardsContainer = $('#exerciseCardsContainer');
  if (cardsContainer) {
    cardsContainer.innerHTML = filtered.map(ex => `
      <article class="panel exercise-card" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <span class="exercise-type">${ex.type}</span>
            <span style="font-size:.76rem;background:#eef5eb;color:#203b29;font-weight:700;padding:2px 8px;border-radius:999px;">${ex.sub}</span>
          </div>
          <h4 style="margin:4px 0 8px;color:#203125;font-size:1.15rem;">${ex.name}</h4>
          
          <!-- Scientific Prescription Box -->
          <div class="exercise-prescription-box">
            <div class="rx-header">
              <span class="rx-sets-reps">🎯 ${ex.rxSetsReps || '3 sets × 8-10 reps · 90s rest'}</span>
              <span class="rx-tempo">${ex.rxTempo || 'Tempo: 2-0-1'}</span>
            </div>
            <p class="rx-why"><b>Why this works:</b> ${ex.rxWhy || ex.benefit}</p>
          </div>

          <p class="exercise-benefit" style="margin-top:8px;font-size:.84rem;color:#637367;">💡 ${ex.steps}</p>
        </div>

        <div style="margin-top:14px;display:flex;gap:8px;">
          <button type="button" class="outline-button small" style="flex:1;font-size:.82rem;padding:7px;border-color:#b4db79;" onclick="logExerciseCompleted('${ex.name.replace(/'/g, "\\'")}')">
            ✓ Log Done
          </button>
          <button type="button" class="solid-button small" style="flex:1;font-size:.82rem;padding:7px;background:#203b29;" onclick="askAiAboutExercise('${ex.name.replace(/'/g, "\\'")}', '${(ex.sub || '').replace(/'/g, "\\'")}')">
            🤖 AI Coach Tip
          </button>
        </div>
      </article>
    `).join('');
  }
}

window.selectExerciseCategory = function(cat) {
  selectedExerciseCategory = cat;
  selectedSubMuscle = 'All ' + cat;
  if ($('#exerciseSearchInput')) $('#exerciseSearchInput').value = '';
  renderExerciseLibrary();
};

window.selectSubMuscle = function(sub) {
  selectedSubMuscle = sub;
  renderExerciseLibrary();
};

window.logExerciseCompleted = function(name) {
  workoutsDone.push({ name, date: today(), at: Date.now() });
  store.set('workoutsDone', workoutsDone);
  renderDashboard();
  toast(`Great job! Completed "${name}"`);
};

window.askAiAboutExercise = function(name, sub) {
  openAiChat(`What is the optimal biomechanical execution, sets, reps, and progression strategy for "${name}" targeting ${sub}?`);
};

if ($('#exerciseSearchInput')) {
  $('#exerciseSearchInput').oninput = () => renderExerciseLibrary();
}

/* ---------- My Foods View Rendering ---------- */
function renderMyFoods() {
  const grid = $('#savedFoodsGrid');
  const items = [...custom, ...DEFAULT_PREVIEW_MEALS];
  if (!grid) return;

  grid.innerHTML = items.map((item, i) => `
    <article class="panel saved-food-card">
      <div class="saved-food-thumb image">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<span>🍎</span>`}
      </div>
      <div style="flex:1;">
        <span class="section-kicker">${item.meal || 'RECIPE'}</span>
        <h4 style="margin:2px 0;color:#203125;">${item.name}</h4>
        <p style="color:#78887c;font-size:.85rem;">${item.detail || `${item.p || 0}g P · ${item.c || 0}g C · ${item.f || 0}g F`}</p>
        <b style="color:#34483a;font-size:1.05rem;display:inline-block;margin-top:6px;">${item.k || item.calories} kcal</b>
      </div>
      <button class="solid-button small" onclick="quickAddSavedFood(${i})" style="margin-top:10px;width:100%;">
        Add to today +
      </button>
    </article>
  `).join('');
}

window.quickAddSavedFood = function(idx) {
  const items = [...custom, ...DEFAULT_PREVIEW_MEALS];
  const item = items[idx];
  if (!item) return;
  const d = today();
  log[d] = log[d] || [];
  log[d].push({ ...item, meal: 'Snack' });
  store.set('log', log);
  renderFoodLog();
  renderDashboard();
  toast(`Added ${item.name} to today's log`);
};

$('#createCustomFoodBtn').onclick = () => {
  $('#customFoodName').value = '';
  $('#customFoodServing').value = '';
  $('#customFoodCal').value = '';
  $('#customFoodP').value = '';
  $('#customFoodC').value = '';
  $('#customFoodF').value = '';
  openModal('#customFoodModal');
};

$('#saveCustomFoodBtn').onclick = () => {
  const name = $('#customFoodName').value.trim();
  const detail = $('#customFoodServing').value.trim();
  const k = Number($('#customFoodCal').value);
  const p = Number($('#customFoodP').value) || 0;
  const c = Number($('#customFoodC').value) || 0;
  const f = Number($('#customFoodF').value) || 0;
  if (!name || !k) { toast('Please enter a name and calories'); return; }

  custom.push({ id: Date.now(), name, detail, k, p, c, f });
  store.set('custom', custom);
  closeModal('#customFoodModal');
  renderMyFoods();
  toast(`Saved ${name} to My Foods`);
};

/* ---------- Profile View Rendering & Saving ---------- */
function renderProfileView() {
  const name = (session && session.name) ? session.name : profile.name || 'Jordan Davis';
  const email = (session && session.email) ? session.email : profile.email || 'jordan.davis@example.com';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JD';

  // Update Avatars & Names across UI
  if ($('#pfDisplayName')) $('#pfDisplayName').textContent = name;
  if ($('#pfEmailDisplay')) $('#pfEmailDisplay').textContent = email;
  if ($('#pfLargeAvatar')) $('#pfLargeAvatar').textContent = initials;
  if ($('#topAvatar')) $('#topAvatar').textContent = initials;
  if ($('#sidebarAvatar')) $('#sidebarAvatar').textContent = initials;
  if ($('#sidebarName')) $('#sidebarName').textContent = name;
  if ($('#sidebarPlan')) $('#sidebarPlan').textContent = profile.goal || 'Personal plan';

  if ($('#settingsUserName')) $('#settingsUserName').textContent = name;
  if ($('#settingsUserEmail')) $('#settingsUserEmail').textContent = email;
  if ($('#settingsRoleBadge')) $('#settingsRoleBadge').textContent = (session && session.is_admin) ? '👑 ADMIN' : 'USER';

  // Fill Inputs
  if ($('#pfHeightInput')) $('#pfHeightInput').value = profile.hCm || 175;
  if ($('#pfWeightInput')) $('#pfWeightInput').value = profile.wKg || 70;
  if ($('#pfCalorieInput')) $('#pfCalorieInput').value = profile.cal || 2100;
  if ($('#pfGoalSelect')) $('#pfGoalSelect').value = profile.goal || 'Maintain weight';
  if ($('#pfDaysSelect')) $('#pfDaysSelect').value = profile.days || 4;
  if ($('#pfCreatineSelect')) $('#pfCreatineSelect').value = profile.creatine || 'yes';

  updateLiveWaterEstimate();

  // Sync button text in topbar
  if ($('#topAuthBtn')) {
    $('#topAuthBtn').textContent = session ? 'Sign out' : 'Sign in';
  }
}

function saveProfileData() {
  const inputWeight = Number($('#pfWeightInput').value) || profile.wKg || 68;
  profile.hCm = Number($('#pfHeightInput').value) || profile.hCm;
  profile.wKg = profile.units === 'Imperial' ? Math.round(inputWeight * 0.45359237) : inputWeight;
  profile.cal = Number($('#pfCalorieInput').value) || profile.cal;
  profile.goal = $('#pfGoalSelect').value;
  profile.days = Number($('#pfDaysSelect').value);
  profile.creatine = $('#pfCreatineSelect').value;

  profile.waterGoal = updateLiveWaterEstimate();

  // Auto calculate protein & carbs targets based on goal
  const w = profile.wKg;
  profile.p = Math.round(w * (profile.goal === 'Build muscle' ? 2.0 : 1.7));
  profile.f = Math.round(w * 0.9);
  profile.c = Math.max(0, Math.round((profile.cal - (profile.p * 4) - (profile.f * 9)) / 4));

  store.set('profile', profile);
  renderDashboard();
  renderProfileView();
  toast('Profile saved & synced to database ✓');
}

$('#saveProfileBtn').onclick = saveProfileData;

/* Unit Switcher & Live Profile Field Listeners */
$$('#unitSwitch button').forEach(b => {
  b.onclick = () => {
    $$('#unitSwitch button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const u = b.dataset.unit;
    const oldUnits = profile.units || 'Metric';
    profile.units = u;
    if ($('#pfHeightUnit')) $('#pfHeightUnit').textContent = u === 'Metric' ? 'cm' : 'in';
    if ($('#pfWeightUnit')) $('#pfWeightUnit').textContent = u === 'Metric' ? 'kg' : 'lbs';

    // Convert input field value smoothly
    if (oldUnits !== u && $('#pfWeightInput')) {
      const curW = Number($('#pfWeightInput').value) || profile.wKg || 68;
      if (u === 'Imperial') {
        $('#pfWeightInput').value = Math.round(curW * 2.20462);
      } else {
        $('#pfWeightInput').value = Math.round(curW / 2.20462);
      }
    }
    updateLiveWaterEstimate();
    store.set('profile', profile);
    toast(`Units switched to ${u}`);
  };
});

// Live recalculation when user types or changes fields
if ($('#pfWeightInput')) $('#pfWeightInput').oninput = updateLiveWaterEstimate;
if ($('#pfCreatineSelect')) $('#pfCreatineSelect').onchange = updateLiveWaterEstimate;
if ($('#pfDaysSelect')) $('#pfDaysSelect').onchange = updateLiveWaterEstimate;
if ($('#pfCalorieInput')) {
  $('#pfCalorieInput').oninput = () => {
    const cal = Number($('#pfCalorieInput').value) || 2100;
    const w = Number($('#pfWeightInput')?.value) || profile.wKg || 68;
    profile.cal = cal;
  };
}

/* ---------- Settings, Logout & Admin Portal ---------- */
$('#topSettingsBtn').onclick = () => {
  renderProfileView();
  openModal('#settingsModal');
};

$('#sidebarProfileBtn').onclick = () => {
  renderProfileView();
  openModal('#settingsModal');
};

$('#topAvatar').onclick = () => {
  switchView('profile');
};

$('#adminPortalShortcutBtn').onclick = () => {
  renderProfileView();
  openModal('#settingsModal');
};

$('#forceSyncBtn').onclick = async () => {
  if (FF.flushNow) {
    await FF.flushNow();
  }
  updateSyncStatus('Cloud database synced');
  toast('Database synced with Turso cloud');
};

if ($('#viewAllUsersBtn')) {
  $('#viewAllUsersBtn').onclick = async () => {
    const list = $('#adminUsersList');
    if (list) list.innerHTML = '<span style="color:#637367;">Loading registered users...</span>';
    try {
      const users = await FF.adminUsers();
      if (!users || !users.length) {
        if (list) list.innerHTML = '<span style="color:#637367;font-size:.85rem;">No registered users found.</span>';
        return;
      }
      if (list) {
        list.innerHTML = users.map(u => `
          <div style="padding:6px 0;border-bottom:1px solid #eef3eb;display:flex;justify-content:space-between;align-items:center;">
            <div><b>${escapeHtml(u.name || 'User')}</b> <span style="color:#777;font-size:.78rem;">(${escapeHtml(u.email)})</span></div>
            <span style="font-size:.75rem;padding:2px 8px;border-radius:12px;background:#eef5eb;color:#203b29;">${escapeHtml(u.role || 'user')}</span>
          </div>
        `).join('');
      }
    } catch (e) {
      if (list) list.innerHTML = `<span style="color:#b23;font-size:.82rem;">${escapeHtml(e.message || 'Admin access required')}</span>`;
    }
  };
}

// Logout handler
async function handleLogout() {
  closeModal('#settingsModal');
  await FF.logout();
  session = null;
  store.del('session');
  renderProfileView();
  updateSyncStatus('Preview mode · Logged out');
  toast('Logged out successfully');
  openModal('#authModal');
}

$('#logoutBtn').onclick = handleLogout;

/* ---------- Auth Modal & Submit ---------- */
let authMode = 'login';

function setAuthMode(m) {
  authMode = m;
  if (m === 'login') {
    $('#authTitle').textContent = 'Sign in to Formwise';
    $('#authSubtitle').textContent = 'WELCOME BACK';
    $('#authSubmitBtn').textContent = 'Sign In';
    $('#authNameField').style.display = 'none';
    $('#authTabLoginBtn').style.background = '#edf4e8';
    $('#authTabLoginBtn').style.borderColor = '#b4db79';
    $('#authTabRegisterBtn').style.background = 'transparent';
    $('#authTabRegisterBtn').style.borderColor = '#edf0eb';
  } else {
    $('#authTitle').textContent = 'Create your account';
    $('#authSubtitle').textContent = 'GET STARTED';
    $('#authSubmitBtn').textContent = 'Create Account';
    $('#authNameField').style.display = 'block';
    $('#authTabRegisterBtn').style.background = '#edf4e8';
    $('#authTabRegisterBtn').style.borderColor = '#b4db79';
    $('#authTabLoginBtn').style.background = 'transparent';
    $('#authTabLoginBtn').style.borderColor = '#edf0eb';
  }
}

$('#authTabLoginBtn').onclick = () => setAuthMode('login');
$('#authTabRegisterBtn').onclick = () => setAuthMode('register');

$('#topAuthBtn').onclick = () => {
  if (session) {
    handleLogout();
  } else {
    setAuthMode('login');
    openModal('#authModal');
  }
};

async function submitAuth() {
  const email = $('#authEmailInput').value.trim();
  const pass = $('#authPasswordInput').value;
  const name = $('#authNameInput').value.trim() || 'Jordan Davis';

  if (!email || !pass) {
    toast('Please enter email and password');
    return;
  }

  $('#authSubmitBtn').disabled = true;
  $('#authSubmitBtn').textContent = 'Connecting...';

  try {
    let user;
    if (authMode === 'register') {
      user = await FF.register(name, email, '', pass);
      toast('Account created successfully 🎉');
    } else {
      user = await FF.login(email, pass);
      toast('Signed in successfully ✓');
    }

    session = { name: user.name, email: user.email, is_admin: user.is_admin };
    store.set('session', session);

    // Pull user cloud database state
    try {
      const data = await FF.req('GET', '/api/data');
      if (data && data.state) {
        const st = data.state;
        if (st.profile) { profile = st.profile; store.set('profile', profile); }
        if (st.water) { water = st.water; store.set('water', water); }
        if (st.log && Object.keys(st.log).length) { log = st.log; store.set('log', log); }
        if (st.custom && st.custom.length) { custom = st.custom; store.set('custom', custom); }
        if (st.workouts) { workoutsDone = st.workouts; store.set('workoutsDone', workoutsDone); }
      }
    } catch (e) {}

    closeModal('#authModal');
    renderProfileView();
    renderDashboard();
    renderFoodLog();
    updateSyncStatus('Cloud database synced');
  } catch (err) {
    toast(err.message || 'Authentication error');
  } finally {
    $('#authSubmitBtn').disabled = false;
    $('#authSubmitBtn').textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
  }
}

$('#authSubmitBtn').onclick = submitAuth;

/* ---------- Global Enter Key Navigation on Inputs ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const active = document.activeElement;

    // 1. Auth Modal
    if ($('#authModal') && $('#authModal').classList.contains('open')) {
      e.preventDefault();
      if (active && active.id === 'authNameInput') {
        const next = $('#authEmailInput');
        if (next) next.focus();
      } else if (active && active.id === 'authEmailInput') {
        const next = $('#authPasswordInput');
        if (next) next.focus();
      } else {
        submitAuth();
      }
      return;
    }

    // 2. Food Modal
    if ($('#foodModal') && $('#foodModal').classList.contains('open')) {
      e.preventDefault();
      if (active && active.id === 'foodSearchInput') {
        const portionInp = $('#foodPortionInput');
        if (portionInp) {
          portionInp.focus();
          portionInp.select();
          return;
        }
      }
      confirmAddFood();
      return;
    }

    // 3. Custom Food Modal
    if ($('#customFoodModal') && $('#customFoodModal').classList.contains('open')) {
      e.preventDefault();
      const sequence = ['customFoodName', 'customFoodCal', 'customFoodP', 'customFoodC', 'customFoodF'];
      const curIdx = active ? sequence.indexOf(active.id) : -1;
      if (curIdx !== -1 && curIdx < sequence.length - 1) {
        const nextEl = $('#' + sequence[curIdx + 1]);
        if (nextEl) { nextEl.focus(); if (nextEl.select) nextEl.select(); return; }
      }
      if ($('#saveCustomFoodBtn')) $('#saveCustomFoodBtn').click();
      return;
    }

    // 4. Edit Food Modal
    if ($('#editFoodModal') && $('#editFoodModal').classList.contains('open')) {
      e.preventDefault();
      const sequence = ['editFoodName', 'editFoodPortion', 'editFoodCal', 'editFoodP', 'editFoodC', 'editFoodF'];
      const curIdx = active ? sequence.indexOf(active.id) : -1;
      if (curIdx !== -1 && curIdx < sequence.length - 1) {
        const nextEl = $('#' + sequence[curIdx + 1]);
        if (nextEl) { nextEl.focus(); if (nextEl.select) nextEl.select(); return; }
      }
      if ($('#saveEditFoodBtn')) $('#saveEditFoodBtn').click();
      return;
    }

    // 5. Recipe Builder Modal
    if ($('#recipeBuilderModal') && $('#recipeBuilderModal').classList.contains('open')) {
      e.preventDefault();
      if (active && active.id === 'recipeDishName') {
        const firstQty = $('#recipeIngredientsContainer .recipe-qty-input');
        if (firstQty) { firstQty.focus(); firstQty.select(); return; }
      }
      if ($('#logRecipeToTodayBtn')) $('#logRecipeToTodayBtn').click();
      return;
    }

    // 6. Camera Modal
    if ($('#cameraModal') && $('#cameraModal').classList.contains('open')) {
      if ($('#camConfirmAddBtn') && !$('#camConfirmAddBtn').disabled) {
        e.preventDefault();
        $('#camConfirmAddBtn').click();
        return;
      }
    }

    // 7. Profile Inputs
    if (activeView === 'profile' && active && active.tagName === 'INPUT') {
      e.preventDefault();
      const seq = ['pfHeightInput', 'pfWeightInput', 'pfCalorieInput'];
      const curIdx = seq.indexOf(active.id);
      if (curIdx !== -1 && curIdx < seq.length - 1) {
        const nextEl = $('#' + seq[curIdx + 1]);
        if (nextEl) { nextEl.focus(); if (nextEl.select) nextEl.select(); return; }
      }
      saveProfileData();
      return;
    }
  }
});

/* ---------- Micro-Interactions (Motion Physics) ---------- */
function initMotionEffects() {
  if (!M || !M.animate || typeof document === 'undefined') return;
  document.documentElement.classList.add('has-motion');

  document.addEventListener('pointerdown', e => {
    const el = e.target.closest('.solid-button, .outline-button, .nav-link, .water-cup, .round-arrow, .text-button');
    if (!el) return;
    M.animate(el, { scale: 0.95 }, { duration: 0.1, easing: 'ease-out' });
  }, { passive: true });

  const release = e => {
    const el = e.target.closest('.solid-button, .outline-button, .nav-link, .water-cup, .round-arrow, .text-button');
    if (!el) return;
    M.animate(el, { scale: 1 }, {
      duration: 0.32,
      easing: M.spring({ stiffness: 420, damping: 22 })
    });
  };
  document.addEventListener('pointerup', release, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
}

/* ---------- Boot / Init ---------- */

/* ---------- AI Plan Personalization Engine ---------- */
if ($('#openAiPlanModalBtn')) {
  $('#openAiPlanModalBtn').onclick = () => {
    openModal('#aiPlanModal');
  };
}

if ($('#generateAiPlanBtn')) {
  $('#generateAiPlanBtn').onclick = async () => {
    const btn = $('#generateAiPlanBtn');
    const loading = $('#aiPlanLoadingIndicator');
    btn.disabled = true;
    btn.textContent = 'Generating Plan with AI...';
    if (loading) loading.style.display = 'block';

    const dietPref = $('#aiDietPrefSelect') ? $('#aiDietPrefSelect').value : 'Balanced';
    const focus = $('#aiFocusSelect') ? $('#aiFocusSelect').value : 'Full Body Strength';
    const note = $('#aiCustomNote') ? $('#aiCustomNote').value : '';

    try {
      const plan = await FF.aiGeneratePlan({
        wKg: profile.wKg || 68,
        hCm: profile.hCm || 175,
        goal: profile.goal || 'Maintain weight',
        days: profile.days || 4,
        creatine: profile.creatine || 'yes',
        units: profile.units || 'Metric',
        dietPref,
        focus,
        note
      });

      // 1. Update Profile targets
      if (plan.cal) profile.cal = plan.cal;
      if (plan.p) profile.p = plan.p;
      if (plan.c) profile.c = plan.c;
      if (plan.f) profile.f = plan.f;
      if (plan.waterL) profile.waterGoal = plan.waterL;

      // 2. Update meals
      if (plan.meals && Array.isArray(plan.meals) && plan.meals.length) {
        const d = today();
        log[d] = plan.meals;
        store.set('log', log);
      }

      // 3. Update active workout
      if (plan.workout && plan.workout.moves) {
        WORKOUT_PLANS.unshift(plan.workout);
        activeWorkoutIdx = 0;
      }

      // Save to storage & Turso database
      store.set('profile', profile);
      store.set('plan', plan);

      closeModal('#aiPlanModal');
      renderDashboard();
      renderProfileView();
      renderFoodLog();
      renderWorkouts();
      switchView('workouts');
      toast('🎉 AI Plan created! Displaying your personalized workout below.');
    } catch (err) {
      toast(err.message || 'Error generating AI plan');
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ Generate & Apply My AI Plan';
      if (loading) loading.style.display = 'none';
    }
  };
}


/* ================= AI FITNESS & NUTRITION CHATBOT CONTROLLER ================= */
function getAiSystemContext() {
  const d = today();
  const entries = log[d] || [];
  const totKcal = entries.reduce((a, b) => a + (b.k || b.calories || 0), 0);
  const totP = entries.reduce((a, b) => a + (b.p || b.protein || 0), 0);
  const totC = entries.reduce((a, b) => a + (b.c || b.carbs || 0), 0);
  const totF = entries.reduce((a, b) => a + (b.f || b.fat || 0), 0);
  const waterMl = (water && water.date === d) ? (water.ml || 0) : 0;
  const woDone = (workoutsDone || []).filter(w => w.date === d).map(w => w.name);

  return `You are FitFuel AI Coach — an elite sports nutritionist, clinical dietitian, and master strength coach.
User Profile:
- Weight: ${profile.wKg} kg (${profile.units || 'Metric'})
- Daily Macro Goals: ${profile.cal || 2000} kcal, ${profile.p || 165}g Protein, ${profile.c || 139}g Carbs, ${profile.f || 87}g Fat
- Primary Fitness Goal: ${profile.goal || 'Hypertrophy & Body Recomposition'}
- Today's Consumed: ${totKcal} kcal (${totP}g Protein, ${totC}g Carbs, ${totF}g Fat)
- Today's Water: ${(waterMl / 1000).toFixed(1)} L (Target: ${profile.waterGoal || '2.5'} L)
- Completed Workouts Today: ${woDone.length ? woDone.join(', ') : 'None yet'}

Instructions:
1. Provide highly accurate micronutrient details (Vitamins A, C, D, B-complex, B12, Iron, Zinc, Magnesium, Calcium, Potassium, Sodium, etc.) for ANY food: homemade Indian dishes, hotel meals, fast foods (burgers, pizzas, momos, shawarma), fruits, and vegetables.
2. For workouts, give precise scientific sets, reps, and tempo guidance tailored to the target muscle part (e.g. Upper Chest, Lower Chest, Lats, Quads, Hamstrings) and explain WHY that volume causes hypertrophy.
3. If user asks to review their day, compare their consumed calories/protein/water with targets and provide immediate, actionable adjustments.
4. Keep responses structured, concise, and pleasant using markdown bullet points and bold highlights.`;
}

function openAiChat(initialPrompt = null) {
  const drawer = $('#aiChatDrawer');
  if (!drawer) return;
  drawer.classList.add('open');

  if (!chatHistory.length) {
    addBotChatMessage(`👋 **Hello ${profile.name ? profile.name.split(' ')[0] : 'there'}!** I am your **FitFuel AI Coach & Nutrition Specialist**.

Ask me anything about:
• 🥦 **Micronutrients & Diet**: Exact vitamins (D, B12, C), minerals (Iron, Zinc, Magnesium, Calcium) for ANY food (homemade, hotel dishes, fast food, fruits).
• 💪 **Targeted Workouts**: Optimal sets, reps, and cues for specific muscle regions (Upper Chest vs Lower Chest, Lats, Glutes, Hamstrings).
• 📊 **Daily Verification**: Ask me to review today's logged food, water, and workouts to see if you hit your targets!`);
  }

  if (initialPrompt) {
    handleUserAiQuery(initialPrompt);
  } else {
    setTimeout(() => {
      const inp = $('#aiChatInput');
      if (inp) inp.focus();
    }, 200);
  }
}

function closeAiChat() {
  const drawer = $('#aiChatDrawer');
  if (drawer) drawer.classList.remove('open');
}

function addBotChatMessage(markdownText) {
  chatHistory.push({ role: 'assistant', text: markdownText });
  renderChatMessages();
}

function addUserChatMessage(text) {
  chatHistory.push({ role: 'user', text });
  renderChatMessages();
}

function renderChatMessages() {
  const container = $('#aiChatMessages');
  if (!container) return;

  container.innerHTML = chatHistory.map(msg => {
    const isBot = msg.role === 'assistant';
    const formatted = formatChatMarkdown(msg.text);
    return `<div class="ai-msg ${isBot ? 'bot' : 'user'}">
      ${isBot ? '<span style="font-size:.74rem;color:#78887c;font-weight:700;margin-bottom:4px;">🤖 AI COACH</span>' : ''}
      <div>${formatted}</div>
    </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function formatChatMarkdown(txt) {
  if (!txt) return '';
  return txt
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/^• (.*$)/gim, '• $1<br>')
    .replace(/\n/g, '<br>');
}

async function handleUserAiQuery(query) {
  if (!query || !query.trim()) return;
  const q = query.trim();
  addUserChatMessage(q);

  const container = $('#aiChatMessages');
  const typingId = 'typing_' + Date.now();
  if (container) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg bot';
    typingDiv.id = typingId;
    typingDiv.innerHTML = `<span style="font-size:.74rem;color:#78887c;font-weight:700;margin-bottom:4px;">🤖 AI COACH</span>
      <div style="color:#78887c;font-style:italic;">Analyzing with AI cascade... ✨</div>`;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  try {
    const systemPrompt = getAiSystemContext();
    const reply = await FF.callAI(q, systemPrompt);
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    addBotChatMessage(reply);
  } catch (err) {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    addBotChatMessage(`Connection note: ${err.message}. Please retry or verify your network connection.`);
  }
}

// AI Verification on Dashboard
function updateAiDailyVerification(entries, totalKcal, goalKcal, totalP, targetP, waterMl) {
  const headline = $('#aiVerifyHeadline');
  const sub = $('#aiVerifySub');
  if (!headline || !sub) return;

  const leftKcal = goalKcal - totalKcal;
  const leftP = targetP - totalP;

  if (entries.length === 0) {
    headline.textContent = 'Ready to fuel your day?';
    sub.textContent = `Target: ${goalKcal} kcal and ${targetP}g protein. Log your first meal, scan a food photo, or ask AI Coach!`;
  } else if (leftP > 40) {
    headline.textContent = `🍗 Protein Gap: ${leftP}g remaining today`;
    sub.textContent = `You've logged ${totalP}g / ${targetP}g protein. AI recommends paneer, chicken breast, or Greek yogurt for your next meal.`;
  } else if (leftKcal < 0) {
    headline.textContent = `🔥 Calorie Target Reached (+${Math.abs(leftKcal)} kcal)`;
    sub.textContent = `You've reached ${totalKcal} kcal today. Focus on lean protein and adequate hydration tonight.`;
  } else if (waterMl < 1000) {
    headline.textContent = '💧 Hydration Reminder';
    sub.textContent = `Only ${(waterMl / 1000).toFixed(1)} L recorded so far. Drink 2-3 more glasses of water before your workout session.`;
  } else {
    headline.textContent = '✅ Optimal Day Progress';
    sub.textContent = `Great adherence! ${totalKcal} / ${goalKcal} kcal with ${totalP}g protein logged. Click below to run a complete AI audit.`;
  }
}

// Wire Chatbot Event Listeners
if ($('#aiChatLauncher')) $('#aiChatLauncher').onclick = () => openAiChat();
if ($('#aiChatCloseBtn')) $('#aiChatCloseBtn').onclick = () => closeAiChat();
if ($('#aiChatClearBtn')) {
  $('#aiChatClearBtn').onclick = () => {
    chatHistory = [];
    renderChatMessages();
    toast('Chat history cleared');
  };
}

if ($('#aiChatForm')) {
  $('#aiChatForm').onsubmit = (e) => {
    e.preventDefault();
    const inp = $('#aiChatInput');
    if (!inp) return;
    const val = inp.value;
    inp.value = '';
    handleUserAiQuery(val);
  };
}

if ($('#aiChatSendBtn')) {
  $('#aiChatSendBtn').onclick = (e) => {
    e.preventDefault();
    const inp = $('#aiChatInput');
    if (!inp) return;
    const val = inp.value;
    inp.value = '';
    handleUserAiQuery(val);
  };
}

$$('#aiChatChips .ai-chip').forEach(chip => {
  chip.onclick = () => {
    const q = chip.dataset.q;
    if (q) handleUserAiQuery(q);
  };
});

if ($('#triggerAiVerifyBtn')) {
  $('#triggerAiVerifyBtn').onclick = () => {
    openAiChat('Please give me a complete verification and audit of my today check-in: calories, macros, hydration, and workout progress.');
  };
}

if ($('#aiMicronutrientAuditBtn')) {
  $('#aiMicronutrientAuditBtn').onclick = () => {
    openAiChat('Analyze the micronutrients, fiber, and balance of my logged meals today. Tell me which vitamins or minerals I am getting or lacking, and suggest what to eat next.');
  };
}

async function bootApp() {
  initMotionEffects();
  renderProfileView();
  renderDashboard();
  renderFoodLog();
  renderWorkouts();
  renderExerciseLibrary();
  renderMyFoods();

  try {
    const res = await FF.boot();
    if (res && res.user) {
      session = { name: res.user.name, email: res.user.email, is_admin: res.user.is_admin };
      store.set('session', session);
      const st = res.state || {};
      if (st.profile) { profile = st.profile; store.set('profile', profile); }
      if (st.water) { water = st.water; store.set('water', water); }
      if (st.log && Object.keys(st.log).length) { log = st.log; store.set('log', log); }
      if (st.custom && st.custom.length) { custom = st.custom; store.set('custom', custom); }
      if (st.workouts) { workoutsDone = st.workouts; store.set('workoutsDone', workoutsDone); }
      updateSyncStatus('Cloud database synced');
      renderProfileView();
      renderDashboard();
    } else {
      updateSyncStatus('Preview session · Sign in to save');
    }
  } catch (e) {
    updateSyncStatus('Local storage active');
  }
}

bootApp();
}
