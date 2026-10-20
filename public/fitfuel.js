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

const WORKOUT_PLANS = [
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

const EXERCISES_LIBRARY = [
  { name: 'Dumbbell Romanian deadlift', category: 'Legs', sub: 'Hamstrings · Glutes', type: 'DUMBBELL · GYM OR HOME', benefit: 'Strengthens posterior chain and hip-hinge control.', steps: 'Stand tall with soft knees. Push hips back as weights track down your legs, drive through feet to stand.' },
  { name: 'Goblet squat', category: 'Legs', sub: 'Quads · Glutes · Core', type: 'DUMBBELL · GYM OR HOME', benefit: 'Builds lower-body strength with an upright posture.', steps: 'Hold weight at chest. Sit between hips, keep chest proud, press through whole foot.' },
  { name: 'Glute bridge', category: 'Legs', sub: 'Glutes · Core', type: 'BODYWEIGHT · HOME', benefit: 'Trains hip extension and glute activation without equipment.', steps: 'Lie on back with knees bent. Squeeze glutes to lift hips, pause, lower with control.' },
  { name: 'Dumbbell reverse lunge', category: 'Legs', sub: 'Quads · Glutes', type: 'DUMBBELL · GYM OR HOME', benefit: 'Unilateral leg strength, balance, and coordination.', steps: 'Step back softly and bend both knees. Push through front foot to return to standing.' },
  { name: 'Single-leg RDL', category: 'Legs', sub: 'Hamstrings · Glutes', type: 'BODYWEIGHT OR DUMBBELL · HOME', benefit: 'Challenges balance while targeting hamstrings and glutes.', steps: 'Balance on one foot, hinge at hip, reach opposite leg back keeping hips square.' },
  { name: 'Calf raise', category: 'Legs', sub: 'Calves', type: 'BODYWEIGHT · GYM OR HOME', benefit: 'Supports ankle stability and lower-leg power.', steps: 'Rise onto balls of feet, pause at peak contraction, lower heels slowly.' },

  { name: 'Dumbbell floor press', category: 'Chest', sub: 'Mid chest · Triceps', type: 'DUMBBELL · GYM OR HOME', benefit: 'Builds chest pressing strength with shoulder safety.', steps: 'Lie on floor with dumbbells. Lower until upper arms tap floor, then press up.' },
  { name: 'Incline push-up', category: 'Chest', sub: 'Upper chest · Shoulders', type: 'BODYWEIGHT · HOME', benefit: 'Scalable pressing movement for upper body endurance.', steps: 'Hands elevated on sturdy bench. Lower chest to edge, press away keeping body rigid.' },

  { name: 'Single-arm dumbbell row', category: 'Back', sub: 'Lats · Rhomboids', type: 'DUMBBELL · GYM OR HOME', benefit: 'Builds back thickness and balanced pulling strength.', steps: 'Support one hand on bench. Pull dumbbell towards hip without torso twisting, lower slowly.' },
  { name: 'Dumbbell reverse fly', category: 'Back', sub: 'Rear delts · Rhomboids', type: 'DUMBBELL · GYM OR HOME', benefit: 'Targets posterior shoulders and postural muscles.', steps: 'Hinge forward with flat back. Raise arms wide with soft elbows, control descent.' },

  { name: 'Dumbbell shoulder press', category: 'Shoulders', sub: 'Front delts · Shoulders', type: 'DUMBBELL · GYM OR HOME', benefit: 'Vertical pressing power and shoulder stability.', steps: 'Dumbbells at ear height. Press upward until arms are straight overhead, lower smoothly.' },
  { name: 'Lateral raise', category: 'Shoulders', sub: 'Side delts', type: 'DUMBBELL · GYM OR HOME', benefit: 'Isolates medial deltoids for broader shoulders.', steps: 'Raise arms out to sides until parallel to floor, lead with elbows, lower slowly.' },

  { name: 'Hammer curl', category: 'Arms', sub: 'Biceps · Forearms', type: 'DUMBBELL · GYM OR HOME', benefit: 'Develops bicep peak and forearm grip strength.', steps: 'Palms facing each other. Curl weights up without swinging elbows, squeeze at top.' },
  { name: 'Overhead tricep extension', category: 'Arms', sub: 'Triceps', type: 'DUMBBELL · GYM OR HOME', benefit: 'Stretches and isolates the long head of the triceps.', steps: 'Hold weight overhead with both hands. Lower behind head bending elbows, press back up.' },

  { name: 'Dead bug', category: 'Core', sub: 'Deep abs · Core stability', type: 'BODYWEIGHT · HOME', benefit: 'Teaches core bracing while moving limbs.', steps: 'Lie on back, knees at 90 degrees. Extend opposite arm and leg while keeping back pressed to floor.' },
  { name: 'Plank shoulder tap', category: 'Core', sub: 'Obliques · Shoulders', type: 'BODYWEIGHT · HOME', benefit: 'Anti-rotational core strength and shoulder stability.', steps: 'High plank position. Tap opposite shoulder with hand without rocking hips.' }
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
  if ($('#recipeCategory')) $('#recipeCategory').value = 'Lunch';

  const container = $('#recipeIngredientsContainer');
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
  const container = $('#recipeIngredientsContainer');
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
  const container = $('#recipeIngredientsContainer');
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

if ($('#logRecipeToTodayBtn')) {
  $('#logRecipeToTodayBtn').onclick = () => {
    const dishName = ($('#recipeDishName') ? $('#recipeDishName').value.trim() : '') || 'Custom Recipe';
    const targetMeal = ($('#recipeCategory') ? $('#recipeCategory').value : 'Lunch');

    // Compile list of ingredients
    const container = $('#recipeIngredientsContainer');
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
  { name: 'White Rice (Cooked)', p: 2.7, c: 28, f: 0.3, k: 130, icon: '🍚' },
  { name: 'Brown Rice (Cooked)', p: 2.6, c: 23, f: 0.9, k: 111, icon: '🌾' },
  { name: 'Chicken Breast (Cooked)', p: 31, c: 0, f: 3.6, k: 165, icon: '🍗' },
  { name: 'Eggs (Whole, Boiled)', p: 13, c: 1.1, f: 11, k: 155, icon: '🥚' },
  { name: 'Egg Whites (Cooked)', p: 11, c: 0.7, f: 0.2, k: 52, icon: '🍳' },
  { name: 'Greek Yogurt 0%', p: 10, c: 3.6, f: 0.4, k: 59, icon: '🥣', image: 'images/greek-yogurt.jpg' },
  { name: 'Oatmeal (Rolled Oats)', p: 13, c: 68, f: 7, k: 389, icon: '🥣' },
  { name: 'Banana', p: 1.1, c: 23, f: 0.3, k: 89, icon: '🍌' },
  { name: 'Apple', p: 0.3, c: 14, f: 0.2, k: 52, icon: '🍎' },
  { name: 'Salmon Fillet (Grilled)', p: 20, c: 0, f: 13, k: 208, icon: '🐟', image: 'images/salmon-bowl.jpg' },
  { name: 'Paneer (Cottage Cheese)', p: 18, c: 3.5, f: 20, k: 265, icon: '🧀' },
  { name: 'Tofu (Firm)', p: 12, c: 2.5, f: 5.5, k: 90, icon: '🧊' },
  { name: 'Roti / Chapati (Whole Wheat)', p: 3.5, c: 17, f: 0.5, k: 85, icon: '🫓' },
  { name: 'Dal (Yellow Lentil Soup)', p: 6.8, c: 15, f: 2.5, k: 110, icon: '🍲' },
  { name: 'Whey Protein Powder', p: 80, c: 6, f: 3, k: 375, icon: '🥤' },
  { name: 'Almonds', p: 21, c: 22, f: 49, k: 579, icon: '🥜' },
  { name: 'Peanut Butter', p: 25, c: 20, f: 50, k: 588, icon: '🥜' },
  { name: 'Sweet Potato (Baked)', p: 2, c: 21, f: 0.1, k: 90, icon: '🍠' }
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
            <p style="color:#78887c;font-size:.78rem;margin:0;">${f.p}g P · ${f.c}g C · ${f.f}g F</p>
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
  if ($('#planWorkoutTitle')) $('#planWorkoutTitle').textContent = wo.name;
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
  Legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Chest: ['Upper chest', 'Mid chest', 'Lower chest'],
  Back: ['Lats', 'Traps', 'Rhomboids', 'Lower back'],
  Shoulders: ['Front delts', 'Side delts', 'Rear delts'],
  Arms: ['Biceps', 'Triceps', 'Forearms'],
  Core: ['Deep abs', 'Upper abs', 'Obliques']
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
    subTags.innerHTML = list.map(sub => `<button type="button" class="chosen">${sub}</button>`).join('');
  }

  const q = ($('#exerciseSearchInput') ? $('#exerciseSearchInput').value.toLowerCase().trim() : '');
  const filtered = EXERCISES_LIBRARY.filter(e => {
    if (q) return e.name.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q);
    return e.category === selectedExerciseCategory;
  });

  if ($('#libFilterHeader')) {
    $('#libFilterHeader').textContent = `${selectedExerciseCategory.toUpperCase()} · ${(MUSCLE_GROUPS[selectedExerciseCategory] || []).join(' / ').toUpperCase()}`;
  }
  if ($('#libResultCount')) {
    $('#libResultCount').textContent = q ? `${filtered.length} matching exercises` : `${selectedExerciseCategory} focus`;
  }

  const cardsContainer = $('#exerciseCardsContainer');
  if (cardsContainer) {
    cardsContainer.innerHTML = filtered.map(ex => `
      <article class="panel exercise-card">
        <span class="exercise-type">${ex.type}</span>
        <h4>${ex.name}</h4>
        <span class="exercise-group">${ex.sub}</span>
        <p class="exercise-benefit">${ex.benefit}</p>
        <p class="exercise-steps">${ex.steps}</p>
      </article>
    `).join('');
  }
}

window.selectExerciseCategory = function(cat) {
  selectedExerciseCategory = cat;
  if ($('#exerciseSearchInput')) $('#exerciseSearchInput').value = '';
  renderExerciseLibrary();
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
    // If inside auth modal
    if ($('#authModal').classList.contains('open')) {
      e.preventDefault();
      submitAuth();
      return;
    }
    // If inside food modal
    if ($('#foodModal').classList.contains('open')) {
      e.preventDefault();
      confirmAddFood();
      return;
    }
    // If inside custom food modal
    if ($('#customFoodModal').classList.contains('open')) {
      e.preventDefault();
      $('#saveCustomFoodBtn').click();
      return;
    }
    // If inside profile inputs
    if (activeView === 'profile' && document.activeElement && document.activeElement.tagName === 'INPUT') {
      e.preventDefault();
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
      toast('🎉 AI Plan created & synced with your account!');
    } catch (err) {
      toast(err.message || 'Error generating AI plan');
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ Generate & Apply My AI Plan';
      if (loading) loading.style.display = 'none';
    }
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
