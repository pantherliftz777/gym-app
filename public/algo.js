/* ========================================================================
   FitFuel Extracted Algorithms (plain script, attaches to window.FF_ALGO)
   Pure, dependency-free functions ported/inspired by:
     - claude-gym-coach knowledge/starting-loads.md  (1RM-free calibration ramp)
     - diet-workout-plan data/activities.json        (MET calorie pricing)
   ======================================================================== */

(function(){
  /* ---------------- 1. Daily energy / macro targets ---------------- */

  function bmrMifflinStJeor(weightKg, heightCm, ageYears, sex) {
    const w = Number(weightKg) || 0;
    const h = Number(heightCm) || 0;
    const a = Number(ageYears) || 0;
    const base = 10 * w + 6.25 * h - 5 * a + 5;
    return String(sex).toLowerCase() === 'female' ? base - 161 : base;
  }

  const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extra: 1.9 };
  function tdee(bmr, activityLevel) {
    const m = ACTIVITY[String(activityLevel).toLowerCase()] || ACTIVITY.moderate;
    return Math.max(1, bmr) * m;
  }

  function macros(kcal, goal, weightKg) {
    const k = Number(kcal) || 2000;
    const w = Number(weightKg) || 70;
    let pRatio = 0.30, cRatio = 0.40, fRatio = 0.30;
    if (goal === 'loss') { pRatio = 0.40; cRatio = 0.35; fRatio = 0.25; }
    else if (goal === 'gain') { pRatio = 0.30; cRatio = 0.45; fRatio = 0.25; }
    const p = Math.max(1.2 * w, Math.round(k * pRatio / 4));
    const c = Math.round(k * cRatio / 4);
    const f = Math.round(k * fRatio / 9);
    return { protein: p, carbs: c, fat: f, calories: k };
  }

  /* ---------------- 2. MET-based calorie pricing ---------------- */

  const MET = {
    'walking, brisk': 4.3, 'walking, hills': 6.0, 'swimming, easy': 5.3,
    'swimming, moderate': 7.0, 'cycling, stationary': 6.8, 'cycling, outdoor': 7.5,
    'running, easy': 8.3, 'running, hard': 9.8, 'rowing machine': 7.0,
    elliptical: 5.0, 'badminton, singles': 7.0, 'football, casual': 7.0,
    cricket: 4.8, 'tennis, doubles': 6.0, yoga: 3.0, hiking: 6.0,
    dancing: 5.5, 'stair climbing': 8.8
  };

  function metCalories(activityKey, weightKg, minutes) {
    const met = MET[String(activityKey).toLowerCase()] || 3.5;
    const w = Number(weightKg) || 70;
    const h = Math.max(0, Number(minutes) || 0) / 60;
    return Math.round(met * w * h);
  }

  /* ---------------- 3. 1RM-free starting load calibration ---------------- */

  const BEGINNER_STANDARDS = {
    male:   { squat: 0.75, bench: 0.50, deadlift: 1.00, press: 0.35, row: 0.55 },
    female: { squat: 0.50, bench: 0.30, deadlift: 0.75, press: 0.22, row: 0.35 }
  };

  const LEVEL_MULTIPLIERS = {
    beginner: 1.0,
    medium: 1.25,
    intermediate: 1.55,
    hard: 1.95
  };

  function startingLoadCeiling(bodyweightKg, sex, lift, level = 'beginner') {
    const bw = Number(bodyweightKg) || 0;
    const key = String(lift).toLowerCase();
    const table = BEGINNER_STANDARDS[String(sex).toLowerCase()] || BEGINNER_STANDARDS.male;
    const std = table[key] != null ? table[key] : 0.45;
    const mult = LEVEL_MULTIPLIERS[String(level).toLowerCase()] || 1.0;
    const minStd = bw * std * 0.40 * mult;
    const maxStd = bw * std * 0.60 * mult;
    return { min: Math.round(minStd * 2) / 2, max: Math.round(maxStd * 2) / 2 };
  }

  function startingLoadPropose(bodyweightKg, sex, lift, priorExperience, level = 'beginner') {
    const { min, max } = startingLoadCeiling(bodyweightKg, sex, lift, level);
    let load = priorExperience ? (min + max) / 2 : (min > 20 ? min : 20);
    load = Math.max(load, min);
    load = Math.min(load, max);
    return Math.round(load / 2.5) * 2.5;
  }

  function recalibrateLoad(currentLoad, repsCompleted, prescribedReps, rpeEstimate) {
    const done = Number(repsCompleted) || 0;
    const target = Number(prescribedReps) || 8;
    const rpe = Number(rpeEstimate) || 7;
    let adj = 0;
    if (done < target) adj = -0.10;
    else if (rpe <= 6) adj = +0.10;
    return Math.max(2.5, Math.round((currentLoad * (1 + adj)) / 2.5) * 2.5);
  }

  /* ---------------- 4. Movement-pattern classifier ---------------- */

  const MOVEMENT_PATTERNS = {
    horizontal_push: ['chest press', 'bench press', 'push-up', 'dip', 'fly', 'cable fly'],
    horizontal_pull: ['row', 'seated row', 'cable row', 'chest supported row'],
    vertical_push:   ['overhead press', 'shoulder press', 'push press', 'jerk'],
    vertical_pull:   ['pull-up', 'lat pulldown', 'chin-up'],
    knee_extension:  ['squat', 'leg press', 'leg extension', 'split squat', 'lunge'],
    knee_flexion:    ['leg curl', 'hamstring curl'],
    hip_hinge:       ['deadlift', 'rdl', 'romanian', 'hip thrust', 'good morning'],
    hip_extension:   ['hip thrust', 'glute bridge'],
    plantarflexion:  ['calf raise'],
    elbow_flexion:   ['curl', 'curl-up'],
    elbow_extension: ['triceps', 'pushdown', 'extension'],
    anti_extension:  ['plank', 'dead bug'],
    core:            ['crunch', 'sit-up', 'leg raise', 'russian twist'],
    carry:           ['carry', 'farmers', 'suitcase']
  };

  function classifyMovement(name) {
    const n = String(name || '').toLowerCase();
    for (const [pattern, keywords] of Object.entries(MOVEMENT_PATTERNS)) {
      if (keywords.some(k => n.includes(k))) return pattern;
    }
    return 'general';
  }

  window.FF_ALGO = {
    bmrMifflinStJeor, tdee, macros,
    MET, metCalories,
    startingLoadCeiling, startingLoadPropose, recalibrateLoad,
    classifyMovement, MOVEMENT_PATTERNS
  };
})();
