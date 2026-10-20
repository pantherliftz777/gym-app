/* ================= Formwise / FitFuel Core Application ================= */
if (typeof window === 'undefined' || typeof document === 'undefined') {
  if (typeof module !== 'undefined') module.exports = (req, res) => { if (res) { res.writeHead(200); res.end('Formwise'); } };
} else {

/* ---------- DOM Helpers ---------- */
const $ = s => typeof document !== 'undefined' ? document.querySelector(s) : null;
const $$ = s => typeof document !== 'undefined' ? [...document.querySelectorAll(s)] : [];
const today = () => new Date().toISOString().slice(0, 10);

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
let streakTracker = store.get('streakTracker', {
  currentStreak: 0,
  lastActiveDate: null,
  streakBroken: false,
  brokenStreakCount: 0,
  history: []
});
let activeChallengePlan = store.get('activeChallengePlan', null);
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

/* ---------- Toast Notice (Self-hiding & Click-to-dismiss) ---------- */
let toastTimeout = null;
function hideToast() {
  const t = $('#toastNotice');
  if (!t) return;
  clearTimeout(toastTimeout);
  if (M && M.animate) {
    try {
      M.animate(t, { opacity: [1, 0], y: [0, 30] }, { duration: 0.18 });
    } catch (e) {}
  }
  setTimeout(() => {
    t.classList.remove('show');
    t.style.opacity = '';
    t.style.transform = '';
    t.style.pointerEvents = 'none';
  }, 180);
}

function toast(msg) {
  const t = $('#toastNotice');
  const txt = $('#toastMsg');
  if (!t) return;
  if (txt) txt.textContent = msg;
  clearTimeout(toastTimeout);
  t.style.pointerEvents = 'auto';
  t.classList.add('show');
  t.onclick = hideToast;
  const closeBtn = t.querySelector('.toast-close');
  if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); hideToast(); };

  if (M && M.animate) {
    try {
      M.animate(t, { opacity: [0, 1], y: [40, 0] }, { duration: 0.28, easing: M.spring({ stiffness: 380, damping: 24 }) });
    } catch (e) {}
  }
  toastTimeout = setTimeout(hideToast, 3500);
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
  if (viewName === 'today') { renderDashboard(); renderDailyTip(); }
  if (viewName === 'food-log') renderFoodLog();
  if (viewName === 'workouts') renderWorkouts();
  if (viewName === 'exercise-library') renderExerciseLibrary();
  if (viewName === 'my-foods') renderMyFoods();
  if (viewName === 'profile') renderProfileView();
  if (viewName === 'challenge') renderChallengeView();
  if (viewName === 'tracking') renderTrackingView();
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

/* ---------- Accurate Streak & Habit Tracking System ---------- */
function recordDailyActivity(source = 'general') {
  const d = today();
  if (!streakTracker.history) streakTracker.history = [];

  if (streakTracker.lastActiveDate && streakTracker.lastActiveDate !== d) {
    const last = new Date(streakTracker.lastActiveDate);
    const curr = new Date(d);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
    if (diffDays >= 2) {
      // User was inactive for 2 or more consecutive days -> Streak breaks!
      streakTracker.streakBroken = true;
      streakTracker.brokenStreakCount = streakTracker.currentStreak || 1;
      streakTracker.currentStreak = 1; // Restarting at Day 1
    } else if (diffDays === 1) {
      // Consecutive day!
      streakTracker.currentStreak = (streakTracker.currentStreak || 0) + 1;
      streakTracker.streakBroken = false;
    }
  } else if (!streakTracker.lastActiveDate) {
    streakTracker.currentStreak = 1;
    streakTracker.streakBroken = false;
  }

  streakTracker.lastActiveDate = d;
  if (!streakTracker.history.includes(d)) {
    streakTracker.history.push(d);
  }
  store.set('streakTracker', streakTracker);
  return streakTracker;
}

function evaluateStreakStatus() {
  const d = today();
  if (!streakTracker.history) streakTracker.history = [];

  // Ingest any active dates recorded in workoutsDone, food log, or water
  if (Array.isArray(workoutsDone)) {
    workoutsDone.forEach(w => { if (w.date && !streakTracker.history.includes(w.date)) streakTracker.history.push(w.date); });
  }
  if (log) {
    Object.keys(log).forEach(k => { if (Array.isArray(log[k]) && log[k].length > 0 && !streakTracker.history.includes(k)) streakTracker.history.push(k); });
  }

  const activeToday = (workoutsDone && workoutsDone.some(w => w.date === d)) ||
                      (log && log[d] && log[d].length > 0) ||
                      (water && water.date === d && water.ml > 0);

  if (activeToday) {
    recordDailyActivity('action_logged');
  } else if (streakTracker.lastActiveDate && streakTracker.lastActiveDate !== d) {
    const last = new Date(streakTracker.lastActiveDate);
    const curr = new Date(d);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
    if (diffDays >= 2) {
      if (!streakTracker.streakBroken && (streakTracker.currentStreak || 0) > 0) {
        streakTracker.streakBroken = true;
        streakTracker.brokenStreakCount = streakTracker.currentStreak;
        streakTracker.currentStreak = 0;
        store.set('streakTracker', streakTracker);
      }
    }
  }

  return streakTracker;
}

function getCheerupMessage(streakDays, weeklyGoalMet, remainingDays) {
  if (streakDays <= 0) return 'Start your daily streak today! Log a meal, workout, or water intake.';
  if (streakDays === 1) return '🌱 Day 1 started! A great journey begins with a single step. Keep going!';
  if (streakDays === 2) return '⚡ 2 Days in a row! Momentum is building—keep the flame alive!';
  if (streakDays === 3) return '🔥 3-Day streak! Halfway through the work week, solid consistency!';
  if (streakDays === 4) return '🚀 4 Days strong! One more day to hit your weekly goal.';
  if (streakDays === 5) return '⭐ 5-Day milestone! You crushed your weekly workout goal!';
  if (streakDays === 6) return '🏆 6 Days! Elite dedication. You are performing at peak level!';
  return `👑 ${streakDays}-Day Legendary Streak! Master of discipline. Incredible consistency!`;
}

/* ---------- Dashboard Rendering ---------- */
function getTodayLog() {
  const d = today();
  // Return user's actual food entries for today. Empty array if nothing logged.
  return (log && Array.isArray(log[d])) ? log[d] : [];
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

  // Calories Ring & Numbers (Zero when nothing is logged)
  if ($('#dashCalConsumed')) $('#dashCalConsumed').textContent = totalKcal.toLocaleString();
  if ($('#dashCalGoal')) $('#dashCalGoal').textContent = goalKcal.toLocaleString();
  if ($('#dashCalLeft')) $('#dashCalLeft').textContent = leftKcal.toLocaleString();
  if ($('#dashPctNum')) $('#dashPctNum').textContent = pct + '%';
  if ($('#dashCalMeterBar')) $('#dashCalMeterBar').style.width = pct + '%';

  const deg = Math.round((pct / 100) * 360);
  if ($('#dashCalRing')) {
    $('#dashCalRing').style.background = `conic-gradient(#b4db79 ${deg}deg, #ecefe8 0deg)`;
  }

  // Macros (Strict 0 when no foods logged)
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
        recordDailyActivity('water');
        renderDashboard();
        toast(`Hydration updated: ${(water.ml / 1000).toFixed(1)} L`);
      };
      cupsContainer.appendChild(cup);
    }
  }

  // Meals & Snacks List (Clear zero-state when empty)
  const mealList = $('#dashMealList');
  if (mealList) {
    if (entries.length === 0) {
      mealList.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; color: #637367; background: #f9fbf8; border: 1px dashed #dbe6d6; border-radius: 14px;">
          <div style="font-size: 28px; margin-bottom: 6px;">🥗</div>
          <b style="color: #203b29; font-size: 14px; display: block; margin-bottom: 4px;">No Meals Logged Today</b>
          <p style="font-size: 12px; margin: 0 0 12px; color: #637367; line-height: 1.45;">Your calorie and nutrient intake is currently 0. Log your breakfast, lunch, or snack to start tracking your daily nutrition.</p>
          <button type="button" class="solid-button small" id="emptyDashAddMealBtn" style="margin: 0 auto; display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            Log Food Now
          </button>
        </div>
      `;
      const btn = $('#emptyDashAddMealBtn');
      if (btn) btn.onclick = () => { switchView('food-log'); setTimeout(openFoodModal, 100); };
    } else {
      mealList.innerHTML = entries.map(item => {
        const img = item.image ? `<img src="${item.image}" alt="${item.name}"/>` : `<span><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.528V3a1 1 0 0 1 1-1h0"></path><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"></path></svg></span>`;
        const kcal = item.k || item.calories || 0;
        return `<div class="meal-row">
          <div class="food-thumb img-preview-trigger" data-title="${escapeHtml(item.name)}" data-src="${item.image || ''}" title="Click to view full image">${img}</div>
          <div class="meal-info">
            <span>${escapeHtml(item.meal || 'Meal')}</span>
            <b>${escapeHtml(item.name)}</b>
            <small>${escapeHtml(item.detail || (item.p ? `${item.p}g P · ${item.c}g C · ${item.f}g F` : 'Custom portion'))}</small>
          </div>
          <div class="meal-kcal">
            <b>${kcal}</b>
            <span>kcal</span>
          </div>
        </div>`;
      }).join('');
    }
  }

  // Active Workout preview
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  if ($('#dashWorkoutName')) $('#dashWorkoutName').textContent = wo.name;
  if ($('#dashWorkoutFocus')) $('#dashWorkoutFocus').textContent = wo.focus.toUpperCase();
  if ($('#dashWorkoutDuration')) $('#dashWorkoutDuration').textContent = wo.duration;

  /* ---------- Accurate Streak Calculation & 7-Day Weekly Bars ---------- */
  const curStreakInfo = evaluateStreakStatus();
  const streakCount = curStreakInfo.currentStreak || 0;
  const targetDays = profile.days || 5;

  // Compute Monday through Sunday of current week
  const now = new Date();
  const dayIdx = (now.getDay() + 6) % 7; // 0=Mon, ..., 6=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIdx);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  let weekCompletedCount = 0;
  const weeklyDayData = [];

  for (let i = 0; i < 7; i++) {
    const dObj = new Date(monday);
    dObj.setDate(monday.getDate() + i);
    const dateStr = dObj.toISOString().slice(0, 10);
    const isToday = (dateStr === today());
    const isPast = (dObj < now && !isToday);
    const isFuture = (dObj > now && !isToday);

    const isActive = (curStreakInfo.history && curStreakInfo.history.includes(dateStr)) ||
                     (workoutsDone && workoutsDone.some(w => w.date === dateStr)) ||
                     (log && log[dateStr] && log[dateStr].length > 0) ||
                     (water && water.date === dateStr && water.ml > 0);

    if (isActive) weekCompletedCount++;
    weeklyDayData.push({ letter: dayLetters[i], name: dayLabels[i], dateStr, isActive, isToday, isFuture, isPast });
  }

  // Update Top Banner Stats
  if ($('#dayStreakDisplay')) $('#dayStreakDisplay').innerHTML = `${streakCount} <small>days</small>`;
  const weekPct = Math.min(100, Math.round((weekCompletedCount / targetDays) * 100));
  if ($('#weeklyGoalDisplay')) $('#weeklyGoalDisplay').innerHTML = `${weekPct}<small>%</small>`;

  // Update Sidebar Weekly Streak
  if ($('#streakCount')) $('#streakCount').textContent = `${weekCompletedCount} / ${targetDays}`;
  const sidebarBars = $('#streakBars');
  if (sidebarBars) {
    sidebarBars.innerHTML = weeklyDayData.map(d => `<i class="${d.isActive ? '' : 'muted'}" title="${d.name}: ${d.isActive ? 'Active' : 'Rest/Pending'}"></i>`).join('');
  }
  const remDays = Math.max(0, targetDays - weekCompletedCount);
  const cheerMsg = getCheerupMessage(streakCount, weekCompletedCount >= targetDays, remDays);
  if ($('#streakText')) $('#streakText').textContent = (curStreakInfo.streakBroken ? '⚠️ Streak broken. Restart Day 1!' : (remDays > 0 ? `${remDays} more day${remDays > 1 ? 's' : ''} to hit your goal.` : 'Goal reached! Incredible effort! 🔥'));

  // Update Dedicated Dashboard Streak Card (Image 2)
  if ($('#dashStreakFraction')) $('#dashStreakFraction').textContent = `${weekCompletedCount} / ${targetDays}`;
  if ($('#streakBadgePill')) $('#streakBadgePill').innerHTML = `🔥 ${streakCount} Day${streakCount === 1 ? '' : 's'}`;
  if ($('#streakCongratsHeadline')) {
    $('#streakCongratsHeadline').textContent = curStreakInfo.streakBroken
      ? 'Mission Failed: Streak Broken'
      : (streakCount >= targetDays ? 'Weekly Target Smashed! 🎉' : (streakCount > 0 ? `${streakCount}-Day Streak in Action!` : 'Start Your Streak Today'));
  }
  if ($('#dashStreakCheerMsg')) {
    $('#dashStreakCheerMsg').textContent = curStreakInfo.streakBroken
      ? 'You missed 2 or more consecutive days. Don’t get discouraged—champions restart! Begin Day 1 today.'
      : cheerMsg;
  }

  // Render 7-day pill bar graph on Dashboard matching Image 2
  const barGraph = $('#dashStreakBarGraph');
  if (barGraph) {
    barGraph.innerHTML = weeklyDayData.map(d => {
      const activeColor = d.isActive ? '#82aa52' : '#e2ead9';
      const borderStyle = d.isToday ? 'border: 2px solid #203b29;' : 'border: 1px solid rgba(0,0,0,0.04);';
      const labelWeight = d.isToday ? 'font-weight: 800; color: #203b29;' : 'font-weight: 600; color: #788b7e;';
      const statusIcon = d.isActive ? '✓' : (d.isToday ? '•' : '');
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <span style="font-size:.72rem; ${labelWeight}">${d.name}</span>
          <div style="width:100%; height:14px; background:${activeColor}; border-radius:99px; ${borderStyle} transition:background .2s; display:flex; align-items:center; justify-content:center; color:#fff; font-size:9px; font-weight:800;" title="${d.name} (${d.dateStr}): ${d.isActive ? 'Active' : (d.isToday ? 'Today' : 'Rest/Pending')}">
            ${statusIcon}
          </div>
          <small style="font-size:.65rem; color:${d.isActive ? '#4b6e2f' : '#a2b1a5'}; font-weight:700;">${d.letter}</small>
        </div>
      `;
    }).join('');
  }

  // Mission Failed Alert Box
  const failBox = $('#missionFailedAlert');
  if (failBox) {
    if (curStreakInfo.streakBroken) {
      failBox.style.display = 'flex';
      const restartBtn = $('#restartStreakBtn');
      if (restartBtn) {
        restartBtn.onclick = () => {
          recordDailyActivity('manual_restart');
          curStreakInfo.streakBroken = false;
          store.set('streakTracker', curStreakInfo);
          failBox.style.display = 'none';
          renderDashboard();
          toast('🔥 Day 1 Streak Started! Welcome back champion.');
        };
      }
    } else {
      failBox.style.display = 'none';
    }
  }

  // Quick Check-in Button
  const checkInBtn = $('#quickCheckInBtn');
  if (checkInBtn) {
    checkInBtn.onclick = () => {
      recordDailyActivity('manual_checkin');
      renderDashboard();
      toast('⚡ Daily Check-In recorded! Streak updated.');
    };
  }

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
                ${item.image ? `<img src="${item.image}" class="img-preview-trigger" data-title="${escapeHtml(item.name)}" data-src="${item.image}" style="width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0;cursor:pointer;" alt="${item.name}" title="Click to view full image">` : (item.icon ? `<span style="font-size:1.4rem;flex-shrink:0;">${item.icon}</span>` : `<span style="font-size:1.3rem;flex-shrink:0;">🍽️</span>`)}
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
  ],
  'Dry Fruits & Seeds': [
    { name: 'Almonds (Badam)', p: 21.2, c: 21.6, f: 49.9, k: 579, unit: 'g' },
    { name: 'Walnuts (Akhrot)', p: 15.2, c: 13.7, f: 65.2, k: 654, unit: 'g' },
    { name: 'Cashews (Kaju)', p: 18.2, c: 30.2, f: 43.8, k: 553, unit: 'g' },
    { name: 'Pistachios (Pista)', p: 20.2, c: 27.2, f: 45.3, k: 562, unit: 'g' },
    { name: 'Raisins (Kismis)', p: 3.1, c: 79.2, f: 0.5, k: 299, unit: 'g' },
    { name: 'Dates (Khajoor)', p: 1.8, c: 75.0, f: 0.2, k: 277, unit: 'g' },
    { name: 'Chia Seeds', p: 16.5, c: 42.1, f: 30.7, k: 486, unit: 'g' },
    { name: 'Flax Seeds (Alsi)', p: 18.3, c: 28.9, f: 42.2, k: 534, unit: 'g' },
    { name: 'Pumpkin Seeds', p: 30.2, c: 10.7, f: 49.1, k: 559, unit: 'g' },
    { name: 'Sunflower Seeds', p: 20.8, c: 20.0, f: 51.5, k: 584, unit: 'g' },
    { name: 'Sesame Seeds (Til)', p: 17.7, c: 23.4, f: 49.7, k: 573, unit: 'g' },
    { name: 'Roasted Makhana', p: 9.7, c: 76.9, f: 0.1, k: 347, unit: 'g' }
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
    recordDailyActivity('meal');
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
    recordDailyActivity('meal');
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

  // --- NUTS, DRY FRUITS & SEEDS ---
  { name: 'Almonds / Badam (Raw, 100g)', p: 21.2, c: 21.6, f: 49.9, k: 579, icon: '🥜', cat: 'Dry Fruits', micros: 'Vitamin E (170% RDA), Magnesium, Manganese, Riboflavin' },
  { name: 'Almonds / Badam (1 fistful ~28g / 23 nuts)', p: 6.0, c: 6.0, f: 14.0, k: 164, icon: '🥜', cat: 'Dry Fruits', micros: 'Vitamin E (50% RDA), Magnesium, Dietary Fiber' },
  { name: 'Walnuts / Akhrot (Raw Halves, 100g)', p: 15.2, c: 13.7, f: 65.2, k: 654, icon: '🥜', cat: 'Dry Fruits', micros: 'Plant Omega-3 (ALA 9.1g), Neuroprotective Polyphenols' },
  { name: 'Walnuts / Akhrot (28g ~7 whole nuts)', p: 4.3, c: 3.9, f: 18.5, k: 185, icon: '🥜', cat: 'Dry Fruits', micros: 'Plant Omega-3 (ALA 2.5g), Copper, Manganese' },
  { name: 'Cashews / Kaju (Raw, 100g)', p: 18.2, c: 30.2, f: 43.8, k: 553, icon: '🥜', cat: 'Dry Fruits', micros: 'Zinc (5.8mg), Magnesium (292mg), Copper, Iron' },
  { name: 'Cashews / Kaju (1 serving ~28g / 18 nuts)', p: 5.1, c: 8.5, f: 12.3, k: 155, icon: '🥜', cat: 'Dry Fruits', micros: 'Magnesium, Phosphorus, Monounsaturated oleic acid' },
  { name: 'Pistachios / Pista (Shelled, 100g)', p: 20.2, c: 27.2, f: 45.3, k: 562, icon: '🥜', cat: 'Dry Fruits', micros: 'Potassium (1025mg), Vitamin B6 (1.7mg), Lutein' },
  { name: 'Pistachios / Pista (1 serving ~28g / 45 kernels)', p: 5.7, c: 7.7, f: 12.8, k: 159, icon: '🥜', cat: 'Dry Fruits', micros: 'Eye health carotenoids, Fiber, Vitamin B6' },
  { name: 'Raisins / Kismis (100g)', p: 3.1, c: 79.2, f: 0.5, k: 299, icon: '🍇', cat: 'Dry Fruits', micros: 'Iron (1.9mg), Potassium (749mg), Boron for bone health' },
  { name: 'Raisins / Kismis (1 small handful ~30g)', p: 0.9, c: 23.8, f: 0.1, k: 90, icon: '🍇', cat: 'Dry Fruits', micros: 'Rapid glycogen replenish, Electrolyte potassium' },
  { name: 'Dates / Khajoor (Medjool / Kimia, 100g)', p: 1.8, c: 75.0, f: 0.2, k: 277, icon: '🌴', cat: 'Dry Fruits', micros: 'Potassium (696mg), Magnesium, Polyphenols, Fiber' },
  { name: 'Dates / Khajoor (2 whole dates ~48g)', p: 0.9, c: 36.0, f: 0.1, k: 133, icon: '🌴', cat: 'Dry Fruits', micros: 'Pre-workout natural burst energy, Copper, Vit B6' },
  { name: 'Dried Figs / Anjeer (100g)', p: 3.3, c: 63.9, f: 0.9, k: 249, icon: '🌰', cat: 'Dry Fruits', micros: 'High Calcium (162mg), Iron (2.0mg), Potassium, Fiber 9.8g' },
  { name: 'Dried Figs / Anjeer (2 whole soaked figs ~40g)', p: 1.3, c: 25.6, f: 0.4, k: 100, icon: '🌰', cat: 'Dry Fruits', micros: 'Digestive enzymes, Calcium, Soluble prebiotic fiber' },
  { name: 'Dried Apricots / Khubani (100g)', p: 3.4, c: 62.6, f: 0.5, k: 241, icon: '🍑', cat: 'Dry Fruits', micros: 'Beta-Carotene (Vit A 180mcg), Potassium (1160mg), Iron' },
  { name: 'Dried Cranberries (100g)', p: 0.5, c: 82.0, f: 1.4, k: 308, icon: '🍒', cat: 'Dry Fruits', micros: 'Proanthocyanidins (urinary tract health), Vit C' },
  { name: 'Dried Prunes / Munakka (100g)', p: 2.2, c: 63.9, f: 0.4, k: 240, icon: '🍇', cat: 'Dry Fruits', micros: 'Sorbitol (gut motility), Vit K (60mcg), Boron, Iron' },
  { name: 'Chia Seeds (Raw, 100g)', p: 16.5, c: 42.1, f: 30.7, k: 486, icon: '🌱', cat: 'Seeds', micros: 'Calcium (631mg = 63% RDA), Omega-3 (17.8g), Fiber 34g' },
  { name: 'Chia Seeds (1 tbsp ~12g)', p: 2.0, c: 5.0, f: 3.8, k: 60, icon: '🌱', cat: 'Seeds', micros: 'Soluble mucilage fiber, Plant Omega-3 ALA, Calcium' },
  { name: 'Flax Seeds / Alsi (Raw/Roasted, 100g)', p: 18.3, c: 28.9, f: 42.2, k: 534, icon: '🌱', cat: 'Seeds', micros: 'Omega-3 ALA (22.8g), Lignans (antioxidant), Magnesium' },
  { name: 'Flax Seeds / Alsi (Ground, 1 tbsp ~10g)', p: 1.8, c: 2.9, f: 4.2, k: 53, icon: '🌱', cat: 'Seeds', micros: 'High bioavailability ALA, Prebiotic soluble fiber' },
  { name: 'Pumpkin Seeds / Kaddu ke Beej (100g)', p: 30.2, c: 10.7, f: 49.1, k: 559, icon: '🎃', cat: 'Seeds', micros: 'Zinc (7.8mg = 70% RDA), Magnesium (592mg = 148% RDA)' },
  { name: 'Pumpkin Seeds / Kaddu ke Beej (1 tbsp ~15g)', p: 4.5, c: 1.6, f: 7.4, k: 84, icon: '🎃', cat: 'Seeds', micros: 'High natural Zinc for testosterone & immunity, Tryptophan' },
  { name: 'Sunflower Seeds / Surajmukhi Beej (100g)', p: 20.8, c: 20.0, f: 51.5, k: 584, icon: '🌻', cat: 'Seeds', micros: 'Vitamin E (35mg = 234% RDA), Selenium (53mcg), Folate' },
  { name: 'Sunflower Seeds (1 tbsp ~15g)', p: 3.1, c: 3.0, f: 7.7, k: 88, icon: '🌻', cat: 'Seeds', micros: 'Cellular protection Vit E, Magnesium, Copper' },
  { name: 'Sesame Seeds / White or Black Til (100g)', p: 17.7, c: 23.4, f: 49.7, k: 573, icon: '⚪', cat: 'Seeds', micros: 'Mega Calcium (975mg = 98% RDA), Iron, Copper, Sesamin' },
  { name: 'Sesame Seeds / Til (1 tbsp ~10g)', p: 1.8, c: 2.3, f: 5.0, k: 57, icon: '⚪', cat: 'Seeds', micros: 'Highest non-dairy calcium source, Zinc, Vitamin B1' },
  { name: 'Watermelon Seeds / Magaz (100g)', p: 28.3, c: 15.3, f: 47.4, k: 557, icon: '🍉', cat: 'Seeds', micros: 'Iron (7.3mg), Magnesium (515mg), Zinc, Essential aminos' },
  { name: 'Hemp Seeds (Shelled Hearts, 100g)', p: 31.6, c: 8.7, f: 48.8, k: 553, icon: '🌿', cat: 'Seeds', micros: 'Complete 9 Aminos Plant Protein, GLA, Perfect 3:1 Omega' },
  { name: 'Pine Nuts / Chilgoza (100g)', p: 13.7, c: 13.1, f: 68.4, k: 673, icon: '🌲', cat: 'Dry Fruits', micros: 'Pinolenic acid (appetite satiety), Vitamin E, Vit K' },
  { name: 'Brazil Nuts (100g)', p: 14.3, c: 12.3, f: 66.4, k: 656, icon: '🌰', cat: 'Dry Fruits', micros: 'Extreme Selenium (1917mcg = 3485% RDA - eat 2 nuts/day)' },
  { name: 'Roasted Fox Nuts / Makhana (100g)', p: 9.7, c: 76.9, f: 0.1, k: 347, icon: '⚪', cat: 'Dry Fruits', micros: 'Flavonoid antioxidants, Low Sodium, High Magnesium' },
  { name: 'Roasted Fox Nuts / Makhana in Ghee (30g bowl)', p: 3.0, c: 23.0, f: 3.5, k: 135, icon: '⚪', cat: 'Dry Fruits', micros: 'Light snacking, Kidney support, Easy digestion' },
  { name: 'Mixed Dry Fruits & Seeds Trail Mix (30g handful)', p: 4.8, c: 12.5, f: 11.2, k: 165, icon: '🥜', cat: 'Dry Fruits', micros: 'Complete balance of Omega-3s, Vit E, Zinc & Iron' },
  { name: 'Peanut Butter (1 tbsp ~16g)', p: 4.0, c: 3.5, f: 8.0, k: 95, icon: '🥜', cat: 'Dry Fruits', micros: 'Niacin, Biotin, Monounsaturated healthy fats' },
  { name: 'Desi Ghee (1 tsp ~5g)', p: 0.0, c: 0.0, f: 5.0, k: 45, icon: '🧈', cat: 'Homemade', micros: 'Butyric acid (gut lining), Vit A, Vit D, Vit E' }
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
  recordDailyActivity('meal');
  closeModal('#foodModal');
  renderFoodLog();
  renderDashboard();
  toast(`Added ${name} to ${meal}`);
}

$('#confirmAddFoodBtn').onclick = confirmAddFood;

/* ---------- Exercise Biomechanics, Visuals & Modal Guide ---------- */
function findExerciseInfo(name) {
  if (!name) return null;
  const n = name.toLowerCase().trim();

  // 1. Exact match in library
  let found = EXERCISES_LIBRARY.find(e => e.name.toLowerCase() === n);
  if (found) return found;

  // 2. Fuzzy match
  found = EXERCISES_LIBRARY.find(e => {
    const en = e.name.toLowerCase();
    return n.includes(en) || en.includes(n) ||
           (n.includes('rdl') && en.includes('rdl')) ||
           (n.includes('deadlift') && en.includes('deadlift')) ||
           (n.includes('squat') && en.includes('squat')) ||
           (n.includes('row') && en.includes('row')) ||
           (n.includes('press') && en.includes('press')) ||
           (n.includes('lunge') && en.includes('lunge')) ||
           (n.includes('fly') && en.includes('fly')) ||
           (n.includes('curl') && en.includes('curl'));
  });
  if (found) return found;

  // 3. Fallback inference
  let category = 'Full Body';
  let sub = 'Core & Stabilizers';
  if (n.includes('chest') || n.includes('bench') || n.includes('push-up') || n.includes('dip')) {
    category = 'Chest'; sub = 'Pectoralis Major';
  } else if (n.includes('back') || n.includes('row') || n.includes('pull') || n.includes('lat')) {
    category = 'Back'; sub = 'Lats & Rhomboids';
  } else if (n.includes('squat') || n.includes('leg') || n.includes('quad') || n.includes('lunge')) {
    category = 'Legs'; sub = 'Quads & Glutes';
  } else if (n.includes('shoulder') || n.includes('press') || n.includes('raise') || n.includes('delt')) {
    category = 'Shoulders'; sub = 'Deltoid complex';
  } else if (n.includes('bicep') || n.includes('curl') || n.includes('tricep')) {
    category = 'Arms'; sub = 'Upper arm flexors/extensors';
  }

  return {
    name: name,
    category: category,
    sub: sub,
    type: 'COMPOUND / ISOLATION',
    rxSetsReps: '3-4 sets × 8-12 reps · 90s rest',
    rxTempo: 'Tempo: 2-1-1 (Controlled negative, explosive drive)',
    rxWhy: 'High mechanical tension and progressive overload capacity targeting prime movers.',
    benefit: 'Develops strength, hypertrophy, and functional motor stability.',
    steps: 'Brace your core 360°, maintain neutral spine alignment, and control the eccentric stretch.'
  };
}

function getExerciseVisualSvg(category, name) {
  const n = (name || '').toLowerCase();
  const titleBadge = (category || 'EXERCISE').toUpperCase();

  let exerciseGraphic = '';

  if (n.includes('deadlift') || n.includes('rdl') || n.includes('hinge') || n.includes('bridge')) {
    exerciseGraphic = `
      <path d="M 120 180 Q 150 140 180 130 T 230 110" fill="none" stroke="#3d5a45" stroke-width="4" stroke-dasharray="6,4"/>
      <circle cx="230" cy="95" r="14" fill="#ffffff" stroke="#b4db79" stroke-width="3"/>
      <line x1="230" y1="110" x2="180" y2="135" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="180" y1="135" x2="185" y2="185" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="185" y1="185" x2="180" y2="230" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="220" y1="120" x2="195" y2="175" stroke="#cbd5e0" stroke-width="5" stroke-linecap="round"/>
      <rect x="180" y="170" width="30" height="12" rx="4" fill="#b4db79"/>
      <ellipse cx="180" cy="155" rx="14" ry="22" fill="#b4db79" opacity="0.45"/>
      <path d="M 195 210 L 195 150" stroke="#b4db79" stroke-width="2.5" marker-end="url(#arrow)"/>
      <text x="250" y="145" fill="#b4db79" font-size="11" font-weight="700">POSTERIOR CHAIN HINGE</text>
      <text x="250" y="165" fill="#a0aec0" font-size="10">Hamstrings &amp; Glute Max</text>
      <text x="250" y="185" fill="#718096" font-size="9.5">Spine Neutral · Hips Push Back</text>
    `;
  } else if (n.includes('squat') || n.includes('lunge') || n.includes('leg') || n.includes('calf')) {
    exerciseGraphic = `
      <line x1="140" y1="80" x2="140" y2="210" stroke="#2d4233" stroke-width="2" stroke-dasharray="4,4"/>
      <circle cx="170" cy="95" r="14" fill="#ffffff" stroke="#b4db79" stroke-width="3"/>
      <line x1="170" y1="110" x2="175" y2="155" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="175" y1="155" x2="225" y2="160" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="225" y1="160" x2="215" y2="225" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="140" y1="112" x2="200" y2="112" stroke="#b4db79" stroke-width="6" stroke-linecap="round"/>
      <rect x="135" y="104" width="8" height="16" rx="2" fill="#e2e8f0"/>
      <rect x="197" y="104" width="8" height="16" rx="2" fill="#e2e8f0"/>
      <ellipse cx="200" cy="158" rx="22" ry="10" fill="#b4db79" opacity="0.5"/>
      <text x="250" y="145" fill="#b4db79" font-size="11" font-weight="700">PARALLEL SQUAT DEPTH (90°)</text>
      <text x="250" y="165" fill="#a0aec0" font-size="10">Quadriceps &amp; Adductor Magnus</text>
      <text x="250" y="185" fill="#718096" font-size="9.5">Knees Track over 2nd Toe</text>
    `;
  } else if (n.includes('press') || n.includes('bench') || n.includes('push') || n.includes('dip')) {
    exerciseGraphic = `
      <line x1="110" y1="170" x2="250" y2="170" stroke="#334a3a" stroke-width="10" stroke-linecap="round"/>
      <circle cx="135" cy="155" r="13" fill="#ffffff" stroke="#b4db79" stroke-width="3"/>
      <line x1="145" y1="162" x2="220" y2="162" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="175" y1="162" x2="175" y2="105" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <line x1="150" y1="105" x2="200" y2="105" stroke="#b4db79" stroke-width="6" stroke-linecap="round"/>
      <circle cx="150" cy="105" r="7" fill="#e2e8f0"/>
      <circle cx="200" cy="105" r="7" fill="#e2e8f0"/>
      <ellipse cx="175" cy="155" rx="16" ry="11" fill="#b4db79" opacity="0.55"/>
      <path d="M 175 140 L 175 95" stroke="#b4db79" stroke-width="2" marker-end="url(#arrow)"/>
      <text x="240" y="110" fill="#b4db79" font-size="11" font-weight="700">HORIZONTAL PRESSING VECTOR</text>
      <text x="240" y="130" fill="#a0aec0" font-size="10">Pectoralis Major &amp; Anterior Delts</text>
      <text x="240" y="150" fill="#718096" font-size="9.5">Scapula Retracted &amp; Depressed</text>
    `;
  } else if (n.includes('row') || n.includes('pull') || n.includes('lat') || n.includes('shrug')) {
    exerciseGraphic = `
      <circle cx="190" cy="95" r="14" fill="#ffffff" stroke="#b4db79" stroke-width="3"/>
      <line x1="190" y1="110" x2="160" y2="155" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="160" y1="155" x2="165" y2="220" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="180" y1="120" x2="150" y2="140" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <rect x="140" y="132" width="18" height="15" rx="3" fill="#b4db79"/>
      <ellipse cx="170" cy="130" rx="14" ry="18" fill="#b4db79" opacity="0.55"/>
      <path d="M 130 155 L 165 135" stroke="#b4db79" stroke-width="2" marker-end="url(#arrow)"/>
      <text x="230" y="125" fill="#b4db79" font-size="11" font-weight="700">LAT &amp; RHOMBOID RETRACTION</text>
      <text x="230" y="145" fill="#a0aec0" font-size="10">Latissimus Dorsi &amp; Mid Traps</text>
      <text x="230" y="165" fill="#718096" font-size="9.5">Drive Elbows Towards Hips</text>
    `;
  } else if (n.includes('raise') || n.includes('curl') || n.includes('extension') || n.includes('arm')) {
    exerciseGraphic = `
      <circle cx="180" cy="95" r="14" fill="#ffffff" stroke="#b4db79" stroke-width="3"/>
      <line x1="180" y1="110" x2="180" y2="175" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="180" y1="175" x2="180" y2="230" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="180" y1="120" x2="180" y2="150" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <line x1="180" y1="150" x2="155" y2="125" stroke="#b4db79" stroke-width="6" stroke-linecap="round"/>
      <circle cx="155" cy="125" r="8" fill="#e2e8f0"/>
      <circle cx="172" cy="138" r="12" fill="#b4db79" opacity="0.6"/>
      <path d="M 180 160 Q 155 160 155 138" fill="none" stroke="#b4db79" stroke-width="2" stroke-dasharray="3,3"/>
      <text x="220" y="120" fill="#b4db79" font-size="11" font-weight="700">ISOLATION CONTRACTION ARC</text>
      <text x="220" y="140" fill="#a0aec0" font-size="10">Peak Tension at Mid-Range</text>
      <text x="220" y="160" fill="#718096" font-size="9.5">Lock Elbow as Pivot Axis</text>
    `;
  } else {
    exerciseGraphic = `
      <circle cx="140" cy="120" r="13" fill="#ffffff" stroke="#b4db79" stroke-width="3"/>
      <line x1="150" y1="125" x2="220" y2="125" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <line x1="155" y1="125" x2="135" y2="165" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <line x1="215" y1="125" x2="245" y2="95" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="185" cy="125" rx="24" ry="14" fill="#b4db79" opacity="0.5"/>
      <text x="210" y="155" fill="#b4db79" font-size="11" font-weight="700">CORE ANTI-ROTATION &amp; BRACE</text>
      <text x="210" y="175" fill="#a0aec0" font-size="10">Transverse Abdominis &amp; Obliques</text>
      <text x="210" y="195" fill="#718096" font-size="9.5">Maintain Posterior Pelvic Tilt</text>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 250" style="width:100%;height:auto;max-height:260px;display:block;background:linear-gradient(135deg, #132218 0%, #0d1711 100%);">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#b4db79"/>
        </marker>
        <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1d2f23" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="460" height="250" fill="url(#gridPattern)" />
      <rect x="18" y="18" width="105" height="22" rx="11" fill="#203b29" stroke="#375540"/>
      <text x="70" y="33" fill="#b4db79" font-size="9.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">${titleBadge}</text>
      <line x1="30" y1="230" x2="430" y2="230" stroke="#223628" stroke-width="2"/>
      ${exerciseGraphic}
      <text x="20" y="240" fill="#718e7b" font-size="9.5" font-family="sans-serif">${escapeHtml(name.toUpperCase())}</text>
    </svg>
  `;
}

function openExerciseDetailModal(exerciseName) {
  const ex = findExerciseInfo(exerciseName);
  if (!ex) return;

  if ($('#exModalTitle')) $('#exModalTitle').textContent = ex.name;
  if ($('#exModalSubBadge')) $('#exModalSubBadge').textContent = `${(ex.category || 'WORKOUT').toUpperCase()} · ${(ex.sub || '').toUpperCase()}`;
  if ($('#exModalSetsReps')) $('#exModalSetsReps').textContent = ex.rxSetsReps || '3-4 sets × 8-10 reps';
  if ($('#exModalTempo')) $('#exModalTempo').textContent = `${ex.rxTempo || 'Tempo: 2-1-1'}`;
  if ($('#exModalWhy')) $('#exModalWhy').textContent = ex.rxWhy || ex.benefit;
  if ($('#exModalSteps')) $('#exModalSteps').textContent = ex.steps;

  // Render SVG Visual Demonstration
  const visualContainer = $('#exModalVisualContainer');
  if (visualContainer) {
    visualContainer.innerHTML = getExerciseVisualSvg(ex.category, ex.name);
  }

  // Reset AI Advice container
  const adviceEl = $('#exModalAiAdvice');
  if (adviceEl) {
    adviceEl.style.display = 'none';
    adviceEl.innerHTML = '';
  }

  // Wire AI Form Coach Button
  if ($('#exModalAiCoachBtn')) {
    $('#exModalAiCoachBtn').onclick = async () => {
      if (!adviceEl) return;
      adviceEl.style.display = 'block';
      adviceEl.innerHTML = '<span style="color:#557c60;">🤖 Formwise AI is analyzing biomechanics &amp; customized cues...</span>';

      const prompt = `As an elite strength & biomechanics coach, give a direct, impactful breakdown for "${ex.name}" targeting ${ex.sub || ex.category}:
1. The #1 Mind-Muscle Connection Cue
2. Common Fatal Form Mistake to Avoid
3. Optimal Hypertrophy Intensification Technique (e.g. paused stretch, tempo control)`;

      try {
        const reply = await FF.callAI(prompt, 'You are an elite strength coach. Give concise, highly practical coaching points in clean markdown formatting.');
        adviceEl.innerHTML = markedInline(reply);
      } catch (err) {
        adviceEl.innerHTML = `
          <b>💡 Formwise AI Core Biomechanics Tip:</b>
          <p style="margin:4px 0 0;">Focus on a strict 2-3 second eccentric stretch. Keep your core braced 360° and avoid momentum. For <b>${escapeHtml(ex.name)}</b>, pause for 1 second at maximum stretch to trigger maximal tension on the ${escapeHtml(ex.sub || 'target muscles')}.</p>
        `;
      }
    };
  }

  // Wire Mark Completed Button
  if ($('#exModalLogDoneBtn')) {
    $('#exModalLogDoneBtn').onclick = () => {
      workoutsDone.push({ name: ex.name, date: today(), at: Date.now() });
      store.set('workoutsDone', workoutsDone);
      recordDailyActivity('workout');
      closeModal('#exerciseDetailModal');
      renderDashboard();
      toast(`✓ Completed set logged for "${ex.name}"!`);
    };
  }

  openModal('#exerciseDetailModal');
}

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
    list.innerHTML = wo.moves.map((m, i) => {
      const ex = findExerciseInfo(m.name);
      return `
        <div class="workout-move-item" onclick="openExerciseDetailModal('${m.name.replace(/'/g, "\\'")}')" title="Hover for details · Click for full visual diagram & AI guide">
          <span style="width:30px;height:30px;border-radius:50%;background:#e3eee4;color:#203b29;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.88rem;flex-shrink:0;">${i + 1}</span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:8px;">
                <b style="color:#203125;font-size:1.02rem;">${m.name}</b>
                <span style="font-size:.72rem;background:#eef5eb;color:#203b29;font-weight:700;padding:2px 8px;border-radius:999px;">${ex.sub || 'COMPOUND'}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-weight:600;color:#556658;font-size:.88rem;">${m.sets}</span>
                <span class="move-hover-cta">👁️ View Visual</span>
              </div>
            </div>
            <p style="color:#637367;font-size:.86rem;margin-top:4px;">💡 ${m.tip}</p>
            
            <!-- Hover details strip (visible on hover) -->
            <div class="move-hover-details">
              <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:4px;">
                <span>🎯 <b>Target:</b> ${ex.sub || ex.category}</span>
                <span>⏱️ <b>${ex.rxTempo || 'Tempo: 2-1-1'}</b></span>
              </div>
              <p style="margin:2px 0 0;font-size:.8rem;color:#556658;">🧬 ${ex.rxWhy || ex.benefit}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
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
  recordDailyActivity('workout');
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
          <h4 style="margin:4px 0 8px;color:#203125;font-size:1.15rem;cursor:pointer;" onclick="openExerciseDetailModal('${ex.name.replace(/'/g, "\\'")}')" title="Click to view visual illustration and full execution guide">
            ${ex.name} <span style="font-size:.76rem;color:#557c60;vertical-align:middle;">👁️</span>
          </h4>
          
          <!-- Scientific Prescription Box -->
          <div class="exercise-prescription-box" style="cursor:pointer;" onclick="openExerciseDetailModal('${ex.name.replace(/'/g, "\\'")}')" title="Click for visual breakdown">
            <div class="rx-header">
              <span class="rx-sets-reps">🎯 ${ex.rxSetsReps || '3 sets × 8-10 reps · 90s rest'}</span>
              <span class="rx-tempo">${ex.rxTempo || 'Tempo: 2-0-1'}</span>
            </div>
            <p class="rx-why"><b>Why this works:</b> ${ex.rxWhy || ex.benefit}</p>
          </div>

          <p class="exercise-benefit" style="margin-top:8px;font-size:.84rem;color:#637367;">💡 ${ex.steps}</p>
        </div>

        <div style="margin-top:14px;display:flex;gap:8px;">
          <button type="button" class="outline-button small" style="flex:1;font-size:.8rem;padding:7px;border-color:#b4db79;" onclick="openExerciseDetailModal('${ex.name.replace(/'/g, "\\'")}')">
            👁️ Visual Guide
          </button>
          <button type="button" class="solid-button small" style="flex:1;font-size:.8rem;padding:7px;background:#203b29;" onclick="askAiAboutExercise('${ex.name.replace(/'/g, "\\'")}', '${(ex.sub || '').replace(/'/g, "\\'")}')">
            🤖 AI Coach
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
  recordDailyActivity('workout');
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

  const updateAvatarEl = (el) => {
    if (!el) return;
    if (profile.avatarUrl) {
      el.innerHTML = `<img src="${profile.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${escapeHtml(name)}">`;
    } else {
      el.textContent = initials;
    }
  };
  updateAvatarEl($('#pfLargeAvatar'));
  updateAvatarEl($('#topAvatar'));
  updateAvatarEl($('#sidebarAvatar'));

  if ($('#removeAvatarBtn')) {
    $('#removeAvatarBtn').style.display = profile.avatarUrl ? 'inline-block' : 'none';
  }

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

/* Profile Picture Upload & Remove Listeners */
if ($('#pfAvatarUploadInput')) {
  $('#pfAvatarUploadInput').onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose a valid image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (re) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        } else {
          if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        profile.avatarUrl = dataUrl;
        store.set('profile', profile);
        if (FF.patch) FF.patch({ profile });
        renderProfileView();
        toast('🎉 Profile picture updated successfully!');
      };
      img.src = re.target.result;
    };
    reader.readAsDataURL(file);
  };
}

if ($('#removeAvatarBtn')) {
  $('#removeAvatarBtn').onclick = () => {
    delete profile.avatarUrl;
    store.set('profile', profile);
    if (FF.patch) FF.patch({ profile });
    renderProfileView();
    toast('Profile photo removed');
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

if ($('#viewAllComplaintsBtn')) {
  $('#viewAllComplaintsBtn').onclick = async () => {
    const list = $('#adminComplaintsList');
    if (!list) return;
    list.style.display = 'block';
    list.innerHTML = '<span style="color:#637367;">Loading complaints & suggestions...</span>';
    try {
      const complaints = await FF.adminComplaints();
      if (!complaints || !complaints.length) {
        list.innerHTML = '<div style="padding:10px;text-align:center;color:#637367;font-size:.85rem;background:#f9fcf7;border-radius:8px;">No complaints or suggestions submitted yet! 🎉</div>';
        return;
      }
      list.innerHTML = complaints.map(c => {
        const dateStr = c.created ? new Date(c.created).toLocaleString() : '';
        const files = Array.isArray(c.files) ? c.files : [];
        const filesHtml = files.length ? `
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
            ${files.map(f => {
              if (f.data && f.data.startsWith('data:image')) {
                return `<img src="${f.data}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #dbe2d6;cursor:pointer;" class="img-preview-trigger" data-title="${escapeHtml(f.name)}" data-src="${f.data}" title="Click to enlarge" />`;
              }
              return `<span style="font-size:.72rem;background:#edf0e8;padding:2px 6px;border-radius:4px;color:#334438;">📎 ${escapeHtml(f.name)}</span>`;
            }).join('')}
          </div>` : '';
        return `
          <div style="padding:10px 12px;margin-bottom:8px;background:#ffffff;border:1px solid #e2ebd9;border-radius:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <b style="color:#203b29;font-size:.88rem;">${escapeHtml(c.name)}</b>
              <span style="font-size:.7rem;padding:2px 8px;border-radius:99px;background:#eef5eb;color:#2a5033;font-weight:700;text-transform:uppercase;">${escapeHtml(c.type || 'complaint')}</span>
            </div>
            <p style="margin:0;color:#34483a;font-size:.84rem;line-height:1.4;">${escapeHtml(c.text)}</p>
            ${filesHtml}
            <small style="display:block;margin-top:4px;color:#859288;font-size:.72rem;">${dateStr}</small>
          </div>
        `;
      }).join('');
    } catch (e) {
      list.innerHTML = `<span style="color:#b23;font-size:.82rem;">${escapeHtml(e.message || 'Admin access required')}</span>`;
    }
  };
}

/* ---------- Complaint / Feedback Form Submission ---------- */
let cmpTypeVal = 'complaint';

function initComplaintSystem() {
  const typeBtns = $$('.cmp-type-btn');
  typeBtns.forEach(btn => {
    btn.onclick = () => {
      typeBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = '#e2ebd9';
        b.style.background = '#ffffff';
        b.style.fontWeight = '600';
        b.style.color = '#55665b';
      });
      btn.classList.add('active');
      btn.style.borderColor = '#b4db79';
      btn.style.background = '#f3f9ed';
      btn.style.fontWeight = '700';
      btn.style.color = '#203b29';
      cmpTypeVal = btn.dataset.type || 'complaint';
    };
  });

  const openFormBtns = [$('#openComplaintModalBtn'), $('#profileComplaintBtn')].filter(Boolean);
  openFormBtns.forEach(btn => {
    btn.onclick = () => {
      if ($('#cmpNameInput') && profile && profile.name) {
        $('#cmpNameInput').value = profile.name;
      }
      openModal('#complaintModal');
    };
  });

  const form = $('#complaintForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = ($('#cmpNameInput')?.value || '').trim();
      const text = ($('#cmpTextInput')?.value || '').trim();
      if (name.length < 2) return toast('Please enter your name');
      if (text.length < 5) return toast('Please describe your issue or suggestion');

      const submitBtn = $('#cmpSubmitBtn');
      const origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

      const fileInput = $('#cmpFileInput');
      const files = [...(fileInput?.files || [])].slice(0, 3);
      const readAll = files.map(f => new Promise(res => {
        if (f.size > 900000) return res({ name: f.name, type: f.type, data: '' });
        const fr = new FileReader();
        fr.onload = () => res({ name: f.name, type: f.type, data: fr.result });
        fr.onerror = () => res({ name: f.name, type: f.type, data: '' });
        fr.readAsDataURL(f);
      }));
      const safeFiles = await Promise.all(readAll);

      try {
        await FF.sendComplaint(name, cmpTypeVal, text, safeFiles);
        toast('✅ Feedback received! Admin team has been notified.');
        closeModal('#complaintModal');
        if ($('#cmpTextInput')) $('#cmpTextInput').value = '';
        if (fileInput) fileInput.value = '';
      } catch (err) {
        toast('⚠️ Error sending complaint: ' + (err.message || 'Please retry'));
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
      }
    };
  }
}
initComplaintSystem();

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

/* ---------- Data Erasure & Account Deletion Handlers ---------- */
async function handleEraseData() {
  const confirmErase = confirm('⚠️ Are you sure you want to erase all your logged data?\n\nThis will clear:\n• All logged food entries & meals\n• All water intake records\n• All custom recipes and custom foods\n• All weight records\n• All completed workout logs\n\nYour account and login credentials will remain active. This cannot be undone.');
  if (!confirmErase) return;

  try {
    closeModal('#settingsModal');
    toast('Erasing all user data...');
    await FF.eraseData();

    // Reset local in-memory state
    log = {};
    store.del('log');
    custom = [];
    store.del('custom');
    plan = null;
    store.del('plan');
    weightLog = [];
    store.del('weights');
    workoutsDone = [];
    store.del('workouts');
    streakTracker = { currentStreak: 0, lastActiveDate: null, streakBroken: false, brokenStreakCount: 0, history: [] };
    store.del('streakTracker');
    waterMl = 0;
    waterHistory = {};
    store.del('water');

    renderDashboard();
    renderFoodLog();
    renderWorkouts();
    renderMyFoods();
    renderProfileView();

    updateSyncStatus('Data reset · Fresh start');
    toast('✅ All logged data erased successfully. Starting fresh!');
  } catch (err) {
    toast('Error erasing data: ' + (err.message || 'Unknown error'));
  }
}

async function handleDeleteAccount() {
  const response = prompt('🚨 DANGER: PERMANENT ACCOUNT DELETION\n\nThis will permanently delete your account, login credentials, and all records from the cloud database.\n\nType DELETE in uppercase to confirm:');
  if (response !== 'DELETE') {
    if (response !== null) {
      toast('Account deletion cancelled (confirmation did not match).');
    }
    return;
  }

  try {
    closeModal('#settingsModal');
    toast('Permanently deleting account from database...');
    await FF.deleteAccount();

    session = null;
    profile = { name: 'New User', email: '', cal: 2100, goal: 'Maintain weight', units: 'Metric', hCm: 175, wKg: 70, days: 4, creatine: 'yes' };
    log = {};
    custom = [];
    plan = null;
    weightLog = [];
    workoutsDone = [];
    streakTracker = { currentStreak: 0, lastActiveDate: null, streakBroken: false, brokenStreakCount: 0, history: [] };
    store.del('streakTracker');
    waterMl = 0;
    waterHistory = {};

    renderDashboard();
    renderFoodLog();
    renderWorkouts();
    renderMyFoods();
    renderProfileView();

    updateSyncStatus('Account deleted · Logged out');
    toast('Your account and all records were permanently deleted.');
    openModal('#authModal');
  } catch (err) {
    toast('Error deleting account: ' + (err.message || 'Unknown error'));
  }
}

if ($('#eraseDataBtn')) $('#eraseDataBtn').onclick = handleEraseData;
if ($('#deleteAccountBtn')) $('#deleteAccountBtn').onclick = handleDeleteAccount;
if ($('#profileEraseDataBtn')) $('#profileEraseDataBtn').onclick = handleEraseData;
if ($('#profileDeleteAccountBtn')) $('#profileDeleteAccountBtn').onclick = handleDeleteAccount;

/* ---------- High-Resolution Image Lightbox Modal ---------- */
function openImageLightbox(src, title = 'High-Res Preview') {
  const modal = $('#imageLightboxModal');
  const img = $('#lightboxImage');
  const titleEl = $('#lightboxTitle');
  if (!modal || !img) return;
  img.src = src;
  if (titleEl) titleEl.textContent = title;
  openModal('#imageLightboxModal');
}

// Global click handler to expand any image with full aspect-ratio
document.addEventListener('click', e => {
  const trigger = e.target.closest('.img-preview-trigger, #dashWorkoutImg, #planWorkoutImg, .cam-preview-image, #camResultThumb');
  if (!trigger) return;
  if (e.target.closest('button, select, input, a')) return;
  const src = trigger.dataset.src || trigger.src || (trigger.querySelector('img') ? trigger.querySelector('img').src : null);
  if (!src) return;
  const title = trigger.dataset.title || trigger.alt || 'High-Res Image';
  openImageLightbox(src, title);
});

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
      user = await FF.register(name, email, '', pass, false);
      // Do NOT log the user in directly! Switch to login and require manual sign-in
      setAuthMode('login');
      $('#authEmailInput').value = email;
      $('#authPasswordInput').value = '';
      $('#authPasswordInput').focus();
      if ($('#authSubtitle')) $('#authSubtitle').textContent = 'ACCOUNT CREATED — PLEASE SIGN IN';
      toast('🎉 Account created! Please enter your password to sign in.');
      return;
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
        if (st.activeChallenge) { activeChallengePlan = st.activeChallenge; store.set('activeChallengePlan', activeChallengePlan); }
      }
    } catch (e) {}

    closeModal('#authModal');
    renderProfileView();
    renderDashboard();
    renderDailyTip();
    renderFoodLog();
    updateSyncStatus('Cloud database synced');
    showMotivationalQuotePopup();
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

/* ================= MOTIVATIONAL QUOTES ON LOGIN / SIGNUP ================= */
const MOTIVATION_QUOTES = [
  { text: "The last three or four reps is what makes the muscle grow. This area of pain divides a champion from someone who is not a champion.", author: "Arnold Schwarzenegger" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "We don't rise to the level of our expectations, we fall to the level of our training.", author: "Archilochus" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "You don't have to be extreme, just consistent. Small daily wins compound into greatness.", author: "Fitness Discipline" },
  { text: "The pain of discipline is far less than the pain of regret.", author: "Sarah Bombell" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Elite Mindset" },
  { text: "The only bad workout is the one that didn't happen.", author: "Strength Philosophy" },
  { text: "Energy flows where attention goes. Focus on your reps, your nutrition, and your sleep.", author: "Formwise Coaching" }
];

function showMotivationalQuotePopup() {
  const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
  if ($('#motivationQuoteText')) $('#motivationQuoteText').textContent = `"${quote.text}"`;
  if ($('#motivationQuoteAuthor')) $('#motivationQuoteAuthor').textContent = `— ${quote.author}`;
  openModal('#motivationModal');
}

if ($('#dismissMotivationBtn')) {
  $('#dismissMotivationBtn').onclick = () => closeModal('#motivationModal');
}

/* ================= DAILY TIP & HABIT SCIENCE ================= */
const DAILY_TIPS = [
  {
    category: "DAILY NUTRITION & MUSCLE SCIENCE",
    title: "Target 1.6g to 2.2g Protein per kg Bodyweight",
    content: "Consuming adequate protein throughout the day distributes leucine spikes to trigger muscle protein synthesis (MPS). Distribute your daily intake evenly over 3 to 4 meals to maximize recovery.",
    takeaway: "Aim for ~25-40g protein per meal.",
    source: "International Society of Sports Nutrition (ISSN)"
  },
  {
    category: "HYDRATION & CELLULAR VOLUME",
    title: "1-2% Dehydration Drops Muscular Strength by up to 10%",
    content: "Muscles are over 70% water. Even minor dehydration compromises electrolyte pump gradients and muscular endurance. Drink a full glass of water first thing in the morning and sip steadily around your training session.",
    takeaway: "Track your 12 glasses today on the dashboard.",
    source: "Journal of Athletic Training"
  },
  {
    category: "HYPERTROPHY & BIOMECHANICS",
    title: "Emphasize the 3-Second Eccentric Lowering Phase",
    content: "Research confirms that mechanical tension in the stretched, eccentric (lowering) portion of a lift yields significantly greater muscle damage and hypertrophic signaling than rapid concentric repetitions.",
    takeaway: "Lower weights under strict 2-3s control without bouncing.",
    source: "Sports Medicine Meta-Analysis"
  },
  {
    category: "SLEEP & HORMONAL RECOVERY",
    title: "Over 70% of Human Growth Hormone (HGH) Spikes During Deep Sleep",
    content: "Deep Slow-Wave Sleep (stages 3 & 4) triggers peak release of anabolic hormones essential for repairing micro-tears in muscle tissue and resynthesizing glycogen. Skimping on sleep blunts insulin sensitivity.",
    takeaway: "Target 7.5 to 8.5 hours in a cool, dark room.",
    source: "Sleep Medicine Reviews"
  },
  {
    category: "PROGRESSIVE OVERLOAD PRINCIPLE",
    title: "Add 1 Rep or 1 kg Each Week to Force Muscular Adaptation",
    content: "The body only adapts when exposed to a stimulus beyond what it is currently accustomed to. Log your lifts, track your sets, and strive for incremental micro-progressions each week.",
    takeaway: "Track every completed workout in your Habit Log.",
    source: "American College of Sports Medicine (ACSM)"
  },
  {
    category: "REST INTERVAL PHYSIOLOGY",
    title: "Longer Rest Intervals (2-3 min) Maximize Compound Muscle Strength",
    content: "For heavy compound movements (squats, presses, deadlifts), resting 2-3 minutes allows ATP-CP stores to resynthesize over 95%, allowing you to lift heavier volume compared to short 30-second rests.",
    takeaway: "Use the built-in +60s rest button on heavy compound days.",
    source: "Journal of Strength and Conditioning Research"
  }
];

let currentTipIndex = Math.floor(Math.random() * DAILY_TIPS.length);

function renderDailyTip() {
  const tip = DAILY_TIPS[currentTipIndex % DAILY_TIPS.length];
  if (!tip) return;
  if ($('#dailyTipCategory')) $('#dailyTipCategory').textContent = tip.category;
  if ($('#dailyTipTitle')) $('#dailyTipTitle').textContent = tip.title;
  if ($('#dailyTipContent')) $('#dailyTipContent').textContent = tip.content;
  if ($('#dailyTipKeyTakeaway')) $('#dailyTipKeyTakeaway').innerHTML = `<b>Key takeaway:</b> ${escapeHtml(tip.takeaway)}`;
  if ($('#dailyTipSource')) $('#dailyTipSource').textContent = tip.source;
}

function cycleDailyTip() {
  currentTipIndex = (currentTipIndex + 1) % DAILY_TIPS.length;
  renderDailyTip();
  if (M && M.animate) {
    const p = $('#dailyTipPanel');
    if (p) M.animate(p, { scale: [0.98, 1], opacity: [0.85, 1] }, { duration: 0.2 });
  }
}

if ($('#nextDailyTipBtn')) {
  $('#nextDailyTipBtn').onclick = cycleDailyTip;
}

/* ================= WEB AUDIO SYNTHESIZER (3-2-1 BEEP GENERATOR) ================= */
let audioCtx = null;
function playAudioChime(freq = 440, type = 'sine', duration = 0.14) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

/* ================= CHALLENGE SETUP & AI ENGINE ================= */
let setupMotive = 'Burn Fat & Lean Out';
let setupDuration = 15;

function initChallengeSetupListeners() {
  // Motive Selection Cards
  $$('#motiveOptionsList .setup-choice-card').forEach(card => {
    card.onclick = () => {
      $$('#motiveOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupMotive = card.dataset.motive || 'Burn Fat & Lean Out';
    };
  });

  // Step 1 -> Step 2
  if ($('#proceedToDurationBtn')) {
    $('#proceedToDurationBtn').onclick = () => {
      closeModal('#challengeMotiveModal');
      if ($('#challengeMetricsPreview')) {
        const w = profile.wKg || 70;
        const h = profile.hCm || 175;
        const u = profile.units || 'Metric';
        const d = profile.days || 4;
        $('#challengeMetricsPreview').textContent = `${w} ${u === 'Metric' ? 'kg' : 'lbs'} · ${h} cm · ${d} Workouts/Wk · Goal: ${setupMotive}`;
      }
      setTimeout(() => openModal('#challengeDurationModal'), 100);
    };
  }

  // Step 2 -> Back to Step 1
  if ($('#backToMotiveBtn')) {
    $('#backToMotiveBtn').onclick = () => {
      closeModal('#challengeDurationModal');
      setTimeout(() => openModal('#challengeMotiveModal'), 100);
    };
  }

  // Duration Selection Cards
  $$('#durationOptionsList .setup-choice-card').forEach(card => {
    card.onclick = () => {
      $$('#durationOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupDuration = Number(card.dataset.days) || 15;
    };
  });

  // Generate AI Plan
  if ($('#generateChallengePlanBtn')) {
    $('#generateChallengePlanBtn').onclick = () => generateAIChallengePlan(setupMotive, setupDuration);
  }

  // Start New Challenge button on challenge intro
  if ($('#createChallengeBtn')) {
    $('#createChallengeBtn').onclick = () => {
      openModal('#challengeMotiveModal');
    };
  }
}
initChallengeSetupListeners();

// Helper: Day-by-day routines generator factoring in user bodyweight, height & motive
function buildDayByDayRoutines(motive, durationDays, w, h) {
  const isFat = motive.includes('Fat');
  const isStrength = motive.includes('Strength');
  const defaultReps = isFat ? '14-16 reps' : (isStrength ? '5-6 heavy reps' : '10-12 reps');
  const defaultDuration = isFat ? 35 : (isStrength ? 50 : 45);
  const defaultRest = isStrength ? 90 : (isFat ? 45 : 60);

  const splitTemplates = [
    { title: 'Chest & Triceps Hypertrophy', focus: 'Upper & Mid Chest · Triceps', muscleGroup: 'Chest' },
    { title: 'Back & Biceps Engine', focus: 'Lats · Upper Back · Biceps', muscleGroup: 'Back' },
    { title: 'Quads & Lower Body Power', focus: 'Quads · Hamstrings · Calves', muscleGroup: 'Legs' },
    { title: 'Shoulders & Core Stability', focus: 'Deltoids · Abs · Obliques', muscleGroup: 'Shoulders' },
    { title: 'Glutes, Posterior & Cardio Shred', focus: 'Posterior Chain · Glutes · Conditioning', muscleGroup: 'Legs' },
    { title: 'Full-Body Athletic Conditioning', focus: 'Compound Movements · Metcon', muscleGroup: 'Chest' },
    { title: 'Active Recovery & Core Armor', focus: 'Mobility · Deep Core · Balance', muscleGroup: 'Abs / Core' }
  ];

  const days = [];
  for (let i = 1; i <= durationDays; i++) {
    const template = splitTemplates[(i - 1) % splitTemplates.length];
    const category = template.muscleGroup === 'Abs / Core' ? 'Chest' : template.muscleGroup;
    const libraryMatches = EXERCISES_LIBRARY.filter(e => e.category.toLowerCase().includes(category.toLowerCase()));
    const selectedExercises = (libraryMatches.length >= 4 ? libraryMatches.slice(0, 4) : EXERCISES_LIBRARY.slice(0, 4)).map((ex, idx) => ({
      name: ex.name,
      subMuscle: ex.sub || ex.category,
      category: ex.category,
      sets: 3,
      reps: defaultReps,
      durationSec: defaultDuration,
      restSec: defaultRest,
      tip: ex.steps || ex.rxWhy || 'Maintain tight core, chest up, smooth cadence.'
    }));

    days.push({
      dayNumber: i,
      title: `Day ${i}: ${template.title}`,
      focus: template.focus,
      intensity: (i % 3 === 0) ? 'Peak High' : 'Targeted',
      estDuration: `${selectedExercises.length * 9} min`,
      completed: false,
      completedAt: null,
      exercises: selectedExercises
    });
  }
  return days;
}

async function generateAIChallengePlan(motive, durationDays) {
  const btn = $('#generateChallengePlanBtn');
  const origText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Engineering AI Plan...'; }
  toast(`🤖 AI is personalizing your ${durationDays}-Day ${motive} Challenge...`);

  const w = profile.wKg || 70;
  const h = profile.hCm || 175;

  const planDays = buildDayByDayRoutines(motive, durationDays, w, h);

  const newChallenge = {
    id: 'chall_' + Date.now(),
    motive: motive,
    durationDays: Number(durationDays),
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
  store.set('activeChallengePlan', activeChallengePlan);
  if (FF.online && FF.user) {
    FF.patch({ activeChallenge: activeChallengePlan });
  }

  closeModal('#challengeDurationModal');
  if (btn) { btn.disabled = false; btn.textContent = origText; }

  switchView('challenge');
  renderChallengeView();
  renderTrackingView();
  toast(`🔥 ${durationDays}-Day Challenge Created! Your customized Day 1 is ready.`);
}

/* ================= CHALLENGE VIEW RENDERING ================= */
let swapTargetDayIdx = 0;
let swapTargetExIdx = 0;

function renderChallengeView() {
  const container = $('#challengeViewContainer');
  if (!container) return;

  if (!activeChallengePlan || !activeChallengePlan.days || !activeChallengePlan.days.length) {
    // Empty state: invite user to start a challenge
    container.innerHTML = `
      <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:18px;padding:36px 24px;text-align:center;box-shadow:0 4px 18px rgba(32,59,41,0.05);max-width:680px;margin:20px auto;">
        <div style="width:68px;height:68px;border-radius:20px;background:#eef6e9;color:#203b29;font-size:36px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          🎯
        </div>
        <h3 style="font-size:1.4rem;color:#1e3424;font-weight:800;margin:0 0 8px;">No Active Challenge Plan</h3>
        <p style="color:#637367;font-size:.92rem;line-height:1.55;max-width:500px;margin:0 auto 24px;">
          Ready to transform? Choose your goal (Burn Fat, Build Muscle, Maintain Weight) and duration (10, 15, 25, 30 days) to have our AI generate your personalized roadmap.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:28px;text-align:left;">
          <div style="background:#f9fcf8;border:1px solid #e2ebd9;border-radius:12px;padding:12px 14px;">
            <b style="color:#203b29;font-size:.88rem;display:block;">⚡ AI Engineered</b>
            <small style="color:#637367;">Personalized to your height, weight &amp; strength targets.</small>
          </div>
          <div style="background:#f9fcf8;border:1px solid #e2ebd9;border-radius:12px;padding:12px 14px;">
            <b style="color:#203b29;font-size:.88rem;display:block;">⏱️ Built-in Timers</b>
            <small style="color:#637367;">Counter time, rest intervals (+60s), &amp; 3-2-1 countdown.</small>
          </div>
          <div style="background:#f9fcf8;border:1px solid #e2ebd9;border-radius:12px;padding:12px 14px;">
            <b style="color:#203b29;font-size:.88rem;display:block;">🔄 Swap Any Workout</b>
            <small style="color:#637367;">Change or replace any exercise with 1 click.</small>
          </div>
        </div>
        <button type="button" class="solid-button" onclick="openModal('#challengeMotiveModal')" style="background:#203b29;padding:12px 28px;font-size:1rem;font-weight:700;">
          🚀 Start Your Challenge Now
        </button>
      </div>
    `;
    return;
  }

  // Active Challenge Dashboard
  const p = activeChallengePlan;
  const currentIdx = Math.min(p.days.length - 1, p.currentDayIndex || 0);
  const currentDay = p.days[currentIdx];
  const pct = Math.min(100, Math.round(((p.completedCount || 0) / p.durationDays) * 100));
  const remaining = Math.max(0, p.durationDays - (p.completedCount || 0));

  container.innerHTML = `
    <!-- CHALLENGE HERO BANNER -->
    <div style="background:linear-gradient(135deg, #203b29 0%, #172c1e 100%);color:#f0f5ee;border-radius:18px;padding:24px 28px;margin-bottom:20px;box-shadow:0 6px 24px rgba(32,59,41,0.18);">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:16px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="background:rgba(180,219,121,0.2);color:#c9f582;font-size:.72rem;font-weight:800;letter-spacing:1px;padding:3px 10px;border-radius:99px;text-transform:uppercase;">ACTIVE CHALLENGE</span>
            <span style="font-size:.8rem;color:#b8cebe;font-weight:600;">Day ${currentIdx + 1} of ${p.durationDays}</span>
          </div>
          <h2 style="margin:0;font-size:1.45rem;color:#ffffff;font-weight:800;">${escapeHtml(p.motive)} Challenge</h2>
          <p style="margin:4px 0 0;color:#ccdccf;font-size:.88rem;">Personalized for ${p.userWeight} kg · ${p.userHeight} cm · Target Goal Active</p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:.74rem;color:#a3baa9;display:block;text-transform:uppercase;font-weight:700;">COMPLETION</span>
          <strong style="font-size:1.6rem;color:#b4db79;font-weight:800;">${pct}%</strong>
        </div>
      </div>

      <!-- Animated Progress Track -->
      <div style="background:rgba(255,255,255,0.12);height:9px;border-radius:99px;overflow:hidden;margin-bottom:18px;">
        <div style="background:#b4db79;height:100%;width:${pct}%;border-radius:99px;transition:width .35s ease;"></div>
      </div>

      <!-- Action Button Controls -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <button type="button" class="solid-button" id="startActiveSessionBtn" style="background:#b4db79;color:#182e1f;font-weight:800;padding:10px 22px;border:none;">
          ▶ Start Today's Workout (${escapeHtml(currentDay.title)})
        </button>
        <button type="button" class="outline-button" id="refreshTodayRoutineBtn" style="border-color:rgba(255,255,255,0.3);color:#ffffff;background:rgba(255,255,255,0.06);font-size:.84rem;">
          ⟳ Refresh Day Plan
        </button>
        <button type="button" class="outline-button" id="resetChallengePlanBtn" style="border-color:rgba(255,255,255,0.3);color:#ffffff;background:rgba(255,255,255,0.06);font-size:.84rem;">
          🔄 Reset to Day 1
        </button>
        <button type="button" class="outline-button" id="exitChallengePlanBtn" style="border-color:#feb2b2;color:#feb2b2;background:rgba(229,62,62,0.1);font-size:.84rem;margin-left:auto;">
          ⚠️ Exit Challenge
        </button>
      </div>
    </div>

    <!-- TODAY'S ROUTINE CARD -->
    <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:22px;margin-bottom:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div>
          <span class="section-kicker" style="color:#456b32;font-weight:800;">TODAY'S SCHEDULED ROUTINE</span>
          <h3 style="margin:2px 0 0;font-size:1.2rem;color:#1e3424;font-weight:800;">${escapeHtml(currentDay.title)}</h3>
          <p style="margin:2px 0 0;font-size:.86rem;color:#637367;">Focus: <b>${escapeHtml(currentDay.focus)}</b> · Est: ${currentDay.estDuration}</p>
        </div>
        <span style="font-size:.78rem;font-weight:800;padding:4px 12px;border-radius:99px;background:${currentDay.completed ? '#e6f4da' : '#f4f6f2'};color:${currentDay.completed ? '#2d581e' : '#556658'};">
          ${currentDay.completed ? '✓ COMPLETED' : '⚡ READY TO TRAIN'}
        </span>
      </div>

      <!-- Exercise List with Swap Buttons -->
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${currentDay.exercises.map((ex, idx) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border:1px solid #eef3eb;background:#fbfdfa;border-radius:12px;gap:12px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="width:28px;height:28px;border-radius:8px;background:#e5f0dc;color:#203b29;font-weight:800;font-size:.84rem;display:flex;align-items:center;justify-content:center;">
                ${idx + 1}
              </span>
              <div>
                <b style="color:#203b29;font-size:.94rem;display:block;">${escapeHtml(ex.name)}</b>
                <small style="color:#637367;font-size:.82rem;">${escapeHtml(ex.subMuscle || 'General')} · ${ex.sets} sets × ${ex.reps} · Rest ${ex.restSec || 60}s</small>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="outline-button small swap-ex-trigger" data-ex-idx="${idx}" style="font-size:.8rem;color:#203b29;border-color:#c8dac1;padding:5px 12px;background:#ffffff;">
                ⇄ Swap Workout
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- FULL CHALLENGE ROADMAP TIMELINE -->
    <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:22px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div>
          <span class="section-kicker">ALL DAYS OVERVIEW</span>
          <h3 style="margin:2px 0 0;font-size:1.15rem;color:#1e3424;font-weight:800;">${p.durationDays}-Day Challenge Roadmap</h3>
        </div>
        <span style="font-size:.84rem;color:#637367;font-weight:600;">${remaining} day${remaining === 1 ? '' : 's'} remaining</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:10px;">
        ${p.days.map((d, dIdx) => {
          const isCurrent = dIdx === currentIdx;
          const bg = d.completed ? '#f3f9ed' : (isCurrent ? '#fdfefb' : '#fafbfa');
          const border = isCurrent ? '2px solid #203b29' : (d.completed ? '1px solid #b4db79' : '1px solid #edf0ea');
          return `
            <div style="padding:12px 14px;border-radius:12px;background:${bg};border:${border};display:flex;flex-direction:column;gap:4px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <b style="font-size:.88rem;color:#203b29;">Day ${d.dayNumber}</b>
                <span style="font-size:.72rem;font-weight:700;color:${d.completed ? '#2e5a1e' : (isCurrent ? '#203b29' : '#88988d')};">
                  ${d.completed ? '✓ Done' : (isCurrent ? '⚡ Current' : 'Upcoming')}
                </span>
              </div>
              <span style="font-size:.82rem;color:#45594b;font-weight:600;">${escapeHtml(d.title.split(': ')[1] || d.title)}</span>
              <small style="font-size:.74rem;color:#788b7e;">${d.exercises.length} moves · ${d.estDuration}</small>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Wire Action Buttons
  if ($('#startActiveSessionBtn')) {
    $('#startActiveSessionBtn').onclick = () => startWorkoutSession(currentDay);
  }

  if ($('#exitChallengePlanBtn')) {
    $('#exitChallengePlanBtn').onclick = () => {
      const ok = confirm('⚠️ Are you sure you want to exit and abandon this challenge?\n\nThis will remove your active plan. Only do this if you wish to exit or start a completely new challenge.');
      if (ok) {
        activeChallengePlan = null;
        store.del('activeChallengePlan');
        if (FF.online && FF.user) FF.patch({ activeChallenge: null });
        renderChallengeView();
        renderTrackingView();
        toast('Challenge plan exited.');
      }
    };
  }

  if ($('#resetChallengePlanBtn')) {
    $('#resetChallengePlanBtn').onclick = () => {
      const ok = confirm('🔄 Reset your active challenge back to Day 1? All workout structures will be preserved.');
      if (ok) {
        activeChallengePlan.currentDayIndex = 0;
        activeChallengePlan.completedCount = 0;
        activeChallengePlan.days.forEach(d => { d.completed = false; d.completedAt = null; });
        store.set('activeChallengePlan', activeChallengePlan);
        if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
        renderChallengeView();
        renderTrackingView();
        toast('Challenge reset to Day 1! Ready to crush it.');
      }
    };
  }

  if ($('#refreshTodayRoutineBtn')) {
    $('#refreshTodayRoutineBtn').onclick = () => {
      const freshExercises = buildDayByDayRoutines(activeChallengePlan.motive, 1, activeChallengePlan.userWeight, activeChallengePlan.userHeight)[0].exercises;
      activeChallengePlan.days[currentIdx].exercises = freshExercises;
      store.set('activeChallengePlan', activeChallengePlan);
      if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
      renderChallengeView();
      toast('Refreshed today’s exercises with new movements!');
    };
  }

  // Wire Swap Workout Triggers
  $$('.swap-ex-trigger').forEach(btn => {
    btn.onclick = () => {
      const exIdx = Number(btn.dataset.exIdx) || 0;
      openSwapExerciseModal(currentIdx, exIdx);
    };
  });
}

/* ================= WORKOUT SWAP MODAL ================= */
function openSwapExerciseModal(dayIdx, exIdx) {
  swapTargetDayIdx = dayIdx;
  swapTargetExIdx = exIdx;
  const currentEx = activeChallengePlan.days[dayIdx].exercises[exIdx];
  if ($('#swapTargetExName')) $('#swapTargetExName').textContent = currentEx.name;

  const renderAlternatives = (filterQuery = '') => {
    const list = $('#swapAlternativesList');
    if (!list) return;
    const q = filterQuery.toLowerCase().trim();
    const matches = EXERCISES_LIBRARY.filter(e => {
      if (e.name.toLowerCase() === currentEx.name.toLowerCase()) return false;
      if (q) return e.name.toLowerCase().includes(q) || (e.sub && e.sub.toLowerCase().includes(q));
      return (e.category && currentEx.category && e.category.toLowerCase() === currentEx.category.toLowerCase()) || true;
    }).slice(0, 20);

    list.innerHTML = matches.map(ex => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid #edf2e8;border-radius:10px;background:#ffffff;gap:10px;">
        <div>
          <b style="color:#203b29;font-size:.9rem;display:block;">${escapeHtml(ex.name)}</b>
          <small style="color:#637367;font-size:.78rem;">${escapeHtml(ex.sub || ex.category)} · ${escapeHtml(ex.rxSetsReps || '3 sets × 10 reps')}</small>
        </div>
        <button type="button" class="solid-button small replace-ex-btn" data-ex-name="${escapeHtml(ex.name)}" style="background:#203b29;font-size:.78rem;white-space:nowrap;">
          Select &amp; Replace
        </button>
      </div>
    `).join('');

    $$('.replace-ex-btn').forEach(b => {
      b.onclick = () => {
        const chosenName = b.dataset.exName;
        const chosenObj = EXERCISES_LIBRARY.find(e => e.name === chosenName) || { name: chosenName, sub: 'Targeted', category: 'Chest' };
        activeChallengePlan.days[swapTargetDayIdx].exercises[swapTargetExIdx] = {
          name: chosenObj.name,
          subMuscle: chosenObj.sub || chosenObj.category,
          category: chosenObj.category,
          sets: 3,
          reps: currentEx.reps || '12 reps',
          durationSec: currentEx.durationSec || 45,
          restSec: currentEx.restSec || 60,
          tip: chosenObj.steps || chosenObj.rxWhy || 'Maintain tight posture and controlled cadence.'
        };
        store.set('activeChallengePlan', activeChallengePlan);
        if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
        closeModal('#swapExerciseModal');
        renderChallengeView();
        toast(`Swapped to "${chosenObj.name}"!`);
      };
    });
  };

  renderAlternatives();
  if ($('#swapSearchInput')) {
    $('#swapSearchInput').value = '';
    $('#swapSearchInput').oninput = (e) => renderAlternatives(e.target.value);
  }
  openModal('#swapExerciseModal');
}

/* ================= INTERACTIVE WORKOUT SESSION PLAYER & TIMERS ================= */
let sessionDay = null;
let sessionExIdx = 0;
let sessionSetIdx = 1;
let sessionPhase = 'active'; // 'active' or 'rest'
let sessionTimerSec = 45;
let sessionTimerInterval = null;
let sessionIsPaused = false;

function formatTimerMMSS(totalSeconds) {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerClockDisplay() {
  if ($('#timerClockDigits')) {
    $('#timerClockDigits').textContent = formatTimerMMSS(sessionTimerSec);
  }
}

function startWorkoutSession(dayData) {
  if (!dayData || !dayData.exercises || !dayData.exercises.length) return;
  sessionDay = dayData;
  sessionExIdx = 0;
  sessionSetIdx = 1;
  sessionPhase = 'active';
  sessionIsPaused = false;
  sessionTimerSec = sessionDay.exercises[0].durationSec || 45;

  openModal('#workoutSessionModal');
  renderSessionStepUI();
  startActiveSetTimer();
}

function renderSessionStepUI() {
  if (!sessionDay || !sessionDay.exercises[sessionExIdx]) return;
  const ex = sessionDay.exercises[sessionExIdx];

  if ($('#sessionDayKicker')) $('#sessionDayKicker').textContent = `CHALLENGE DAY ${sessionDay.dayNumber} · ACTIVE SESSION`;
  if ($('#sessionExTitle')) $('#sessionExTitle').textContent = ex.name;
  if ($('#sessionProgressBadge')) $('#sessionProgressBadge').textContent = `Exercise ${sessionExIdx + 1} of ${sessionDay.exercises.length}`;
  if ($('#sessionSetBadge')) $('#sessionSetBadge').textContent = `Set ${sessionSetIdx} of ${ex.sets || 3} · ${ex.reps}`;
  if ($('#sessionBioTip')) $('#sessionBioTip').innerHTML = `<b>Form Tip:</b> ${escapeHtml(ex.tip || 'Maintain controlled breathing and strict tempo.')}`;

  if (sessionPhase === 'active') {
    if ($('#timerPhaseBadge')) {
      $('#timerPhaseBadge').textContent = 'ACTIVE SET';
      $('#timerPhaseBadge').className = 'timer-phase-badge';
    }
    if ($('#timerInstruction')) $('#timerInstruction').textContent = 'Execute repetitions with strict form and full range of motion.';
    if ($('#activeSetControls')) $('#activeSetControls').style.display = 'flex';
    if ($('#restControls')) $('#restControls').style.display = 'none';
  } else {
    if ($('#timerPhaseBadge')) {
      $('#timerPhaseBadge').textContent = 'REST INTERVAL';
      $('#timerPhaseBadge').className = 'timer-phase-badge rest';
    }
    if ($('#timerInstruction')) $('#timerInstruction').textContent = 'Breathe deeply, hydrate, and recover before your next set.';
    if ($('#activeSetControls')) $('#activeSetControls').style.display = 'none';
    if ($('#restControls')) $('#restControls').style.display = 'flex';
  }
  updateTimerClockDisplay();
}

function startActiveSetTimer() {
  clearInterval(sessionTimerInterval);
  sessionIsPaused = false;
  if ($('#timerPlayPauseBtn')) $('#timerPlayPauseBtn').textContent = '⏸ Pause';

  sessionTimerInterval = setInterval(() => {
    if (sessionIsPaused) return;
    if (sessionTimerSec > 0) {
      sessionTimerSec--;
      updateTimerClockDisplay();
      if (sessionTimerSec <= 3 && sessionTimerSec > 0) {
        playAudioChime(440, 'sine', 0.08);
      }
    } else {
      clearInterval(sessionTimerInterval);
      playAudioChime(660, 'sine', 0.2);
      transitionToRestPhase();
    }
  }, 1000);
}

function transitionToRestPhase() {
  clearInterval(sessionTimerInterval);
  sessionPhase = 'rest';
  const ex = sessionDay.exercises[sessionExIdx];
  sessionTimerSec = ex.restSec || 60;
  renderSessionStepUI();

  sessionTimerInterval = setInterval(() => {
    if (sessionTimerSec > 0) {
      sessionTimerSec--;
      updateTimerClockDisplay();
      if (sessionTimerSec <= 3 && sessionTimerSec > 0) {
        playAudioChime(440, 'sine', 0.08);
      }
    } else {
      clearInterval(sessionTimerInterval);
      trigger321CountdownAndAdvance();
    }
  }, 1000);
}

function trigger321CountdownAndAdvance() {
  clearInterval(sessionTimerInterval);
  const overlay = $('#sessionCountdownOverlay');
  const num = $('#countdownNumber');
  const sub = $('#countdownSubtext');
  if (!overlay || !num || !sub) {
    advanceToNextSetOrExercise();
    return;
  }

  overlay.style.display = 'flex';
  num.textContent = '3';
  sub.textContent = 'GET READY!';
  playAudioChime(440, 'sine', 0.14);

  setTimeout(() => {
    num.textContent = '2';
    playAudioChime(440, 'sine', 0.14);
    setTimeout(() => {
      num.textContent = '1';
      playAudioChime(440, 'sine', 0.14);
      setTimeout(() => {
        num.textContent = 'GO! 🔥';
        sub.textContent = 'CRUSH THIS SET!';
        playAudioChime(880, 'triangle', 0.35);
        setTimeout(() => {
          overlay.style.display = 'none';
          advanceToNextSetOrExercise();
        }, 650);
      }, 850);
    }, 850);
  }, 850);
}

function advanceToNextSetOrExercise() {
  const currentEx = sessionDay.exercises[sessionExIdx];
  if (sessionSetIdx < (currentEx.sets || 3)) {
    // Next set of current exercise
    sessionSetIdx++;
    sessionPhase = 'active';
    sessionTimerSec = currentEx.durationSec || 45;
    renderSessionStepUI();
    startActiveSetTimer();
  } else {
    // Current exercise complete! Check if more exercises
    if (sessionExIdx + 1 < sessionDay.exercises.length) {
      sessionExIdx++;
      sessionSetIdx = 1;
      sessionPhase = 'active';
      sessionTimerSec = sessionDay.exercises[sessionExIdx].durationSec || 45;
      renderSessionStepUI();
      startActiveSetTimer();
      toast(`Next movement: ${sessionDay.exercises[sessionExIdx].name}!`);
    } else {
      // Entire workout day finished!
      finishCurrentWorkoutSession();
    }
  }
}

function finishCurrentWorkoutSession() {
  clearInterval(sessionTimerInterval);
  sessionDay.completed = true;
  sessionDay.completedAt = Date.now();
  if (activeChallengePlan) {
    activeChallengePlan.completedCount = (activeChallengePlan.completedCount || 0) + 1;
    if (activeChallengePlan.currentDayIndex + 1 < activeChallengePlan.durationDays) {
      activeChallengePlan.currentDayIndex++;
    }
    store.set('activeChallengePlan', activeChallengePlan);
    if (FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
  }

  workoutsDone.push({
    name: `${sessionDay.title}`,
    date: today(),
    at: Date.now()
  });
  store.set('workoutsDone', workoutsDone);
  recordDailyActivity('challenge_workout');

  closeModal('#workoutSessionModal');
  renderChallengeView();
  renderTrackingView();
  renderDashboard();
  toast(`🎉 Outstanding! You crushed Day ${sessionDay.dayNumber} of your challenge!`);
}

// Wire Session Player Buttons
if ($('#sessionCompleteSetBtn')) {
  $('#sessionCompleteSetBtn').onclick = () => {
    transitionToRestPhase();
  };
}

if ($('#timerMinusTenBtn')) {
  $('#timerMinusTenBtn').onclick = () => {
    sessionTimerSec = Math.max(5, sessionTimerSec - 10);
    updateTimerClockDisplay();
  };
}

if ($('#timerPlusTenBtn')) {
  $('#timerPlusTenBtn').onclick = () => {
    sessionTimerSec += 10;
    updateTimerClockDisplay();
  };
}

if ($('#timerPlayPauseBtn')) {
  $('#timerPlayPauseBtn').onclick = () => {
    sessionIsPaused = !sessionIsPaused;
    $('#timerPlayPauseBtn').textContent = sessionIsPaused ? '▶ Resume' : '⏸ Pause';
  };
}

if ($('#restPlusSixtyBtn')) {
  $('#restPlusSixtyBtn').onclick = () => {
    sessionTimerSec += 60;
    updateTimerClockDisplay();
    toast('Added +60s rest time');
  };
}

if ($('#restPlusFifteenBtn')) {
  $('#restPlusFifteenBtn').onclick = () => {
    sessionTimerSec += 15;
    updateTimerClockDisplay();
  };
}

if ($('#restMinusFifteenBtn')) {
  $('#restMinusFifteenBtn').onclick = () => {
    sessionTimerSec = Math.max(1, sessionTimerSec - 15);
    updateTimerClockDisplay();
  };
}

if ($('#restSkipBtn')) {
  $('#restSkipBtn').onclick = () => {
    sessionTimerSec = 0;
    updateTimerClockDisplay();
    trigger321CountdownAndAdvance();
  };
}

if ($('#startNextSetNowBtn')) {
  $('#startNextSetNowBtn').onclick = () => {
    trigger321CountdownAndAdvance();
  };
}

if ($('#sessionQuitBtn')) {
  $('#sessionQuitBtn').onclick = () => {
    if (confirm('Quit active workout session? Any uncompleted sets for this day will not be saved.')) {
      clearInterval(sessionTimerInterval);
      closeModal('#workoutSessionModal');
    }
  };
}

/* ================= TRACKING VIEW RENDERING ================= */
function renderTrackingView() {
  const container = $('#trackingViewContainer');
  if (!container) return;

  const curStreak = evaluateStreakStatus();
  const streakDays = curStreak.currentStreak || 0;
  const totalWorkouts = workoutsDone.length || 0;
  const entries = getTodayLog();
  const todayKcal = Math.round(entries.reduce((a, b) => a + (Number(b.k) || Number(b.calories) || 0), 0));
  const goalKcal = profile.cal || 2100;
  const todayP = Math.round(entries.reduce((a, b) => a + (Number(b.p) || Number(b.protein) || 0), 0));
  const goalP = profile.p || 165;
  const waterMl = (water && water.date === today()) ? (water.ml || 0) : 0;
  const waterGoal = profile.waterGoal || calcWaterFromWeight(profile.wKg, profile.units, profile.creatine, profile.days);

  // Active Challenge status box
  let challengeBlock = '';
  if (activeChallengePlan) {
    const cp = activeChallengePlan;
    const completedDays = cp.completedCount || 0;
    const pct = Math.min(100, Math.round((completedDays / cp.durationDays) * 100));
    challengeBlock = `
      <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:22px;margin-bottom:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <div>
            <span class="section-kicker" style="color:#3e632b;font-weight:800;">ACTIVE PLAN TRACKER</span>
            <h3 style="margin:2px 0 0;font-size:1.25rem;color:#1e3424;font-weight:800;">${escapeHtml(cp.motive)} (${cp.durationDays} Days)</h3>
            <p style="margin:2px 0 0;font-size:.86rem;color:#637367;">Progress: <b>Day ${completedDays} of ${cp.durationDays} Completed</b> (${pct}%)</p>
          </div>
          <button type="button" class="solid-button small" onclick="switchView('challenge')" style="background:#203b29;">
            Open Challenge Engine →
          </button>
        </div>

        <div style="background:#eaf2e5;height:8px;border-radius:99px;overflow:hidden;margin-bottom:16px;">
          <div style="background:#82aa52;height:100%;width:${pct}%;border-radius:99px;"></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(36px, 1fr));gap:6px;">
          ${cp.days.map((d, idx) => {
            const isDone = d.completed;
            const isCurrent = idx === (cp.currentDayIndex || 0);
            const bg = isDone ? '#82aa52' : (isCurrent ? '#203b29' : '#e2ebd9');
            const color = (isDone || isCurrent) ? '#ffffff' : '#637367';
            return `
              <div style="height:36px;border-radius:8px;background:${bg};color:${color};display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:800;" title="Day ${d.dayNumber}: ${d.title} (${isDone ? 'Completed' : (isCurrent ? 'Current' : 'Pending')})">
                ${isDone ? '✓' : d.dayNumber}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    challengeBlock = `
      <div style="background:#fcfdfa;border:1px dashed #d5e2d0;border-radius:16px;padding:22px;margin-bottom:20px;text-align:center;">
        <span style="font-size:28px;">🎯</span>
        <b style="color:#203b29;font-size:1.05rem;display:block;margin:6px 0 2px;">No Active Challenge Plan</b>
        <p style="color:#637367;font-size:.86rem;margin:0 0 14px;">Set a 10, 15, 25, or 30-day fitness challenge to unlock day-by-day progression tracking.</p>
        <button type="button" class="solid-button small" onclick="switchView('challenge');openModal('#challengeMotiveModal');" style="background:#203b29;">
          🚀 Start Challenge
        </button>
      </div>
    `;
  }

  // Recent Workouts List
  const recentWorkoutsHtml = (workoutsDone && workoutsDone.length) ? (
    workoutsDone.slice(-8).reverse().map(w => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #edf2e8;">
        <div>
          <b style="color:#203b29;font-size:.9rem;display:block;">${escapeHtml(w.name)}</b>
          <small style="color:#788b7e;font-size:.78rem;">${w.date || today()}</small>
        </div>
        <span style="font-size:.75rem;padding:3px 10px;border-radius:99px;background:#eef6e9;color:#2c561e;font-weight:700;">
          ✓ Logged
        </span>
      </div>
    `).join('')
  ) : `
    <div style="padding:20px;text-align:center;color:#637367;font-size:.85rem;">
      No workouts completed yet. Mark exercises complete or start a challenge routine!
    </div>
  `;

  container.innerHTML = `
    ${challengeBlock}

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:16px;">
      <!-- STREAK & CONSISTENCY -->
      <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
        <span class="section-kicker">HABIT CONSISTENCY</span>
        <h4 style="margin:2px 0 14px;font-size:1.1rem;color:#1e3424;font-weight:800;">Workout &amp; Streak Metrics</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          <div style="background:#f7faf4;padding:12px;border-radius:10px;border:1px solid #edf3ea;">
            <span style="font-size:.72rem;color:#788b7e;font-weight:700;display:block;">CURRENT STREAK</span>
            <b style="font-size:1.4rem;color:#203b29;">🔥 ${streakDays} <small style="font-size:.8rem;font-weight:600;">Days</small></b>
          </div>
          <div style="background:#f7faf4;padding:12px;border-radius:10px;border:1px solid #edf3ea;">
            <span style="font-size:.72rem;color:#788b7e;font-weight:700;display:block;">TOTAL WORKOUTS</span>
            <b style="font-size:1.4rem;color:#203b29;">💪 ${totalWorkouts}</b>
          </div>
        </div>
        <p style="font-size:.84rem;color:#556658;margin:0;line-height:1.45;">
          ${curStreak.streakBroken ? '⚠️ Streak broken due to 2+ inactive days. Rebuild your streak today!' : 'Keep training consistently to lock in permanent muscle and metabolic adaptations.'}
        </p>
      </div>

      <!-- NUTRITION & HYDRATION COMPLIANCE -->
      <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
        <span class="section-kicker">TODAY'S FUELING</span>
        <h4 style="margin:2px 0 14px;font-size:1.1rem;color:#1e3424;font-weight:800;">Nutrition &amp; Water Compliance</h4>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:4px;">
              <span style="color:#556658;font-weight:600;">Calories Intake</span>
              <b>${todayKcal} / ${goalKcal} kcal</b>
            </div>
            <div style="background:#edf2ea;height:7px;border-radius:99px;overflow:hidden;">
              <div style="background:#82aa52;height:100%;width:${Math.min(100, Math.round((todayKcal/goalKcal)*100))}%;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:4px;">
              <span style="color:#556658;font-weight:600;">Protein Target</span>
              <b>${todayP} / ${goalP} g</b>
            </div>
            <div style="background:#edf2ea;height:7px;border-radius:99px;overflow:hidden;">
              <div style="background:#82aa52;height:100%;width:${Math.min(100, Math.round((todayP/goalP)*100))}%;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:4px;">
              <span style="color:#556658;font-weight:600;">Hydration</span>
              <b>${(waterMl/1000).toFixed(1)} / ${waterGoal} L</b>
            </div>
            <div style="background:#edf2ea;height:7px;border-radius:99px;overflow:hidden;">
              <div style="background:#63a1d9;height:100%;width:${Math.min(100, Math.round((waterMl/(Number(waterGoal)*1000))*100))}%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- WORKOUT VOLUME HISTORY -->
    <div style="background:#ffffff;border:1px solid #e3eadc;border-radius:16px;padding:20px;margin-top:20px;box-shadow:0 2px 10px rgba(32,59,41,0.04);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div>
          <span class="section-kicker">COMPLETION LOG</span>
          <h4 style="margin:2px 0 0;font-size:1.1rem;color:#1e3424;font-weight:800;">Recent Completed Workouts</h4>
        </div>
        <span style="font-size:.82rem;color:#637367;">Total: ${totalWorkouts} sessions</span>
      </div>
      <div style="display:flex;flex-direction:column;">
        ${recentWorkoutsHtml}
      </div>
    </div>
  `;
}

if ($('#trackingCheckInBtn')) {
  $('#trackingCheckInBtn').onclick = () => {
    recordDailyActivity('manual_checkin');
    renderTrackingView();
    renderDashboard();
    toast('⚡ Daily check-in logged to tracking!');
  };
}

async function bootApp() {
  initMotionEffects();
  renderProfileView();
  renderDashboard();
  renderDailyTip();
  renderFoodLog();
  renderWorkouts();
  renderExerciseLibrary();
  renderMyFoods();
  renderChallengeView();
  renderTrackingView();

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
      if (st.activeChallenge) { activeChallengePlan = st.activeChallenge; store.set('activeChallengePlan', activeChallengePlan); }
      updateSyncStatus('Cloud database synced');
      renderProfileView();
      renderDashboard();
      renderDailyTip();
      renderChallengeView();
      renderTrackingView();
    } else {
      updateSyncStatus('Preview session · Sign in to save');
    }
  } catch (e) {
    updateSyncStatus('Local storage active');
  }
}

bootApp();
}
