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

  /* ---------------- 5. Anthropometric & Clinical Body Composition Engine ---------------- */

  // ISO 8559-1 / CAESAR standardized anatomical height ratios (fraction of total height)
  const ISO_ANATOMICAL_LEVELS = {
    neck: 0.83,   // Cervicale / thyroid cartilage plane
    chest: 0.72,  // Fourth intercostal space / nipple plane
    waist: 0.60,  // Narrowest natural waist / umbilicus
    hips: 0.52,   // Maximum protrusion of buttocks / pubic crest
    thigh: 0.42,  // Mid-thigh level
    bicep: 0.68,  // Maximum bicep girth (mid-brachium)
    calf: 0.22    // Maximum gastrocnemius girth
  };

  /**
   * Ramanujan's Second Elliptical Circumference Approximation.
   * Cross-sectional human torso and limbs approximate ellipses with
   * transverse width 2a (front view) and sagittal depth 2b (side profile).
   * Exact within 0.004% error.
   */
  function ramanujanEllipticalCircumference(widthCm, depthCm) {
    const w = Number(widthCm) || 0;
    const d = Number(depthCm) || 0;
    if (w <= 0 || d <= 0) return 0;
    const a = w / 2;
    const b = d / 2;
    const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
    const c = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(Math.max(0, 4 - 3 * h))));
    return Math.round(c * 10) / 10;
  }

  /**
   * Multi-Angle Anthropometric Estimator & Ramanujan Elliptical Tape Model.
   * Derives cross-sectional transverse width (front view) and sagittal depth (side view)
   * at standardized ISO 8559-1 / CAESAR vertical planes, then derives true elliptical
   * perimeter circumferences via Ramanujan's formula.
   */
  function estimateAnthropometrics({
    heightCm,
    weightKg,
    gender = 'male',
    goal = 'lean_athletic',
    experience = 'intermediate',
    photoMeasurements = null,
    crossSections = null
  }) {
    let h = Number(heightCm);
    if (!h || h <= 0 || isNaN(h)) h = 178;
    h = Math.max(80, Math.min(260, h));

    let w = Number(weightKg);
    if (!w || w <= 0 || isNaN(w)) w = 72;
    w = Math.max(30, Math.min(300, w));

    const isFemale = String(gender).toLowerCase() === 'female';
    const g = String(goal || '').toLowerCase();

    // Baseline anatomical width (transverse 2a) and depth (sagittal 2b) in cm
    const rawDims = {};

    if (!isFemale) {
      // Male transverse width & sagittal depth regressions (ANSUR II / CAESAR)
      rawDims.neck = {
        width: 0.071 * h + (w - 70) * 0.038,
        depth: 0.067 * h + (w - 70) * 0.036
      };
      rawDims.chest = {
        width: 0.198 * h + (w - 70) * 0.165,
        depth: 0.150 * h + (w - 70) * 0.135
      };
      rawDims.waist = {
        width: 0.160 * h + (w - 70) * 0.185,
        depth: 0.128 * h + (w - 70) * 0.165
      };
      rawDims.hips = {
        width: 0.192 * h + (w - 70) * 0.140,
        depth: 0.154 * h + (w - 70) * 0.115
      };
      rawDims.bicep = {
        width: 0.060 * h + (w - 70) * 0.052,
        depth: 0.058 * h + (w - 70) * 0.050
      };
      rawDims.thigh = {
        width: 0.102 * h + (w - 70) * 0.075,
        depth: 0.094 * h + (w - 70) * 0.065
      };
      rawDims.calf = {
        width: 0.067 * h + (w - 70) * 0.040,
        depth: 0.064 * h + (w - 70) * 0.038
      };
    } else {
      // Female transverse width & sagittal depth regressions
      rawDims.neck = {
        width: 0.065 * h + (w - 60) * 0.032,
        depth: 0.062 * h + (w - 60) * 0.030
      };
      rawDims.chest = {
        width: 0.188 * h + (w - 60) * 0.145,
        depth: 0.144 * h + (w - 60) * 0.120
      };
      rawDims.waist = {
        width: 0.148 * h + (w - 60) * 0.155,
        depth: 0.118 * h + (w - 60) * 0.135
      };
      rawDims.hips = {
        width: 0.205 * h + (w - 60) * 0.165,
        depth: 0.162 * h + (w - 60) * 0.140
      };
      rawDims.bicep = {
        width: 0.053 * h + (w - 60) * 0.045,
        depth: 0.051 * h + (w - 60) * 0.043
      };
      rawDims.thigh = {
        width: 0.108 * h + (w - 60) * 0.080,
        depth: 0.098 * h + (w - 60) * 0.072
      };
      rawDims.calf = {
        width: 0.068 * h + (w - 60) * 0.040,
        depth: 0.065 * h + (w - 60) * 0.038
      };
    }

    // Goal & muscularity adjustments
    if (g.includes('muscle') || g.includes('hypertrophy') || g.includes('strength')) {
      rawDims.bicep.width += 0.4; rawDims.bicep.depth += 0.4;
      rawDims.chest.width += 0.8; rawDims.chest.depth += 0.6;
      rawDims.thigh.width += 0.5; rawDims.thigh.depth += 0.5;
    } else if (g.includes('fat') || g.includes('cut') || g.includes('loss')) {
      rawDims.waist.width -= 0.7; rawDims.waist.depth -= 0.7;
      rawDims.hips.width -= 0.4;  rawDims.hips.depth -= 0.4;
    }

    // Override with photo / direct measurements if provided
    const userInputs = crossSections || photoMeasurements || {};
    const sites = ['neck', 'chest', 'waist', 'hips', 'bicep', 'thigh', 'calf'];
    const finalCrossSections = {};
    const circumferences = {};

    sites.forEach(site => {
      let width = rawDims[site].width;
      let depth = rawDims[site].depth;

      if (userInputs[site]) {
        if (typeof userInputs[site] === 'object') {
          if (userInputs[site].width) width = Number(userInputs[site].width) || width;
          if (userInputs[site].depth) depth = Number(userInputs[site].depth) || depth;
        }
      }

      width = Math.round(Math.max(5, width) * 10) / 10;
      depth = Math.round(Math.max(5, depth) * 10) / 10;

      // True Ramanujan elliptical perimeter derivation
      const c = ramanujanEllipticalCircumference(width, depth);

      finalCrossSections[site] = {
        level: ISO_ANATOMICAL_LEVELS[site],
        widthCm: width,
        depthCm: depth,
        aspectRatio: Math.round((width / Math.max(1, depth)) * 100) / 100,
        circumferenceCm: c
      };
      circumferences[site] = c;
    });

    return {
      neck: circumferences.neck,
      chest: circumferences.chest,
      waist: circumferences.waist,
      hips: circumferences.hips,
      bicep: circumferences.bicep,
      thigh: circumferences.thigh,
      calf: circumferences.calf,
      circumferences,
      crossSections: finalCrossSections
    };
  }

  /**
   * U.S. Navy Hodgdon-Beckett Body Fat Equation
   * Men: %BF = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
   * Women: %BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
   * All circumference & height parameters in cm.
   */
  function calculateNavyBodyFat({ gender = 'male', heightCm, waistCm, neckCm, hipsCm }) {
    let h = Number(heightCm);
    if (!h || h <= 0 || isNaN(h)) h = 178;
    h = Math.max(60, Math.min(260, h));

    let w = Number(waistCm);
    if (!w || w <= 0 || isNaN(w)) w = 82;
    w = Math.max(30, Math.min(250, w));

    let n = Number(neckCm);
    if (!n || n <= 0 || isNaN(n)) n = 38;
    n = Math.max(15, Math.min(80, n));

    let hip = Number(hipsCm);
    if (!hip || hip <= 0 || isNaN(hip)) hip = w * 1.15;
    hip = Math.max(30, Math.min(250, hip));

    const isFemale = String(gender).toLowerCase() === 'female';

    const CM_TO_INCH = 1 / 2.54;
    const hIn = h * CM_TO_INCH;
    const wIn = w * CM_TO_INCH;
    const nIn = n * CM_TO_INCH;
    const hipIn = hip * CM_TO_INCH;

    let bfp = 0;
    if (!isFemale) {
      const diff = Math.max(0.5, wIn - nIn);
      bfp = 86.010 * Math.log10(diff) - 70.041 * Math.log10(hIn) + 36.76;
      bfp = Math.max(3.0, Math.min(50.0, bfp));
    } else {
      const diff = Math.max(0.5, wIn + hipIn - nIn);
      bfp = 163.205 * Math.log10(diff) - 97.684 * Math.log10(hIn) - 78.387;
      bfp = Math.max(8.0, Math.min(55.0, bfp));
    }

    if (isNaN(bfp) || !isFinite(bfp)) {
      bfp = isFemale ? 22.0 : 15.0;
    }

    return Math.round(bfp * 10) / 10;
  }

  /**
   * Clinical Risk Indicators & Body Ratios
   * - WHR (Waist-to-Hip Ratio) with WHO clinical classifications:
   *     Men: <0.90 Healthy/Low Risk, 0.90-0.99 Moderate, >=1.00 Elevated/High Risk
   *     Women: <0.85 Healthy/Low Risk, 0.85-0.89 Moderate, >=0.90 Elevated/High Risk
   * - WHtR (Waist-to-Height Ratio) with Ashwell/NICE <=0.50 rule:
   *     <=0.40 Slim, 0.40-0.50 Healthy/Optimal, 0.50-0.60 Moderate Risk, >0.60 Elevated Risk
   * - Lean Body Mass & Fat Mass breakdown
   */
  function calculateClinicalRatios({ heightCm, weightKg, waistCm, hipsCm, gender = 'male', bodyFatPct = null }) {
    let h = Number(heightCm);
    if (!h || h <= 0 || isNaN(h)) h = 178;
    h = Math.max(60, Math.min(260, h));

    let w = Number(weightKg);
    if (!w || w <= 0 || isNaN(w)) w = 72;
    w = Math.max(25, Math.min(350, w));

    let waist = Number(waistCm);
    if (!waist || waist <= 0 || isNaN(waist)) waist = 82;
    waist = Math.max(30, Math.min(250, waist));

    let hips = Number(hipsCm);
    if (!hips || hips <= 0 || isNaN(hips)) hips = 98;
    hips = Math.max(30, Math.min(250, hips));

    const isFemale = String(gender).toLowerCase() === 'female';

    const whr = Math.round((waist / Math.max(10, hips)) * 100) / 100;
    let whrStatus = 'Healthy / Low Risk';
    let whrRiskLevel = 'low';
    if (!isFemale) {
      if (whr >= 1.00) { whrStatus = 'Elevated Risk'; whrRiskLevel = 'elevated'; }
      else if (whr >= 0.90) { whrStatus = 'Moderate Risk'; whrRiskLevel = 'moderate'; }
    } else {
      if (whr >= 0.90) { whrStatus = 'Elevated Risk'; whrRiskLevel = 'elevated'; }
      else if (whr >= 0.85) { whrStatus = 'Moderate Risk'; whrRiskLevel = 'moderate'; }
    }

    const whtr = Math.round((waist / Math.max(50, h)) * 100) / 100;
    let whtrStatus = 'Healthy / Optimal';
    let whtrRiskLevel = 'healthy';
    if (whtr > 0.60) { whtrStatus = 'Elevated Risk'; whtrRiskLevel = 'elevated'; }
    else if (whtr > 0.50) { whtrStatus = 'Moderate Risk'; whtrRiskLevel = 'moderate'; }
    else if (whtr < 0.40) { whtrStatus = 'Slender / Lean'; whtrRiskLevel = 'slim'; }

    const bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
    let bmiCategory = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 30) bmiCategory = 'Obese';
    else if (bmi >= 25) bmiCategory = 'Overweight';

    const bf = (bodyFatPct != null && !isNaN(Number(bodyFatPct))) ? Number(bodyFatPct) : 16.5;
    const fatMassKg = Math.round(w * (bf / 100) * 10) / 10;
    const leanMassKg = Math.round((w - fatMassKg) * 10) / 10;

    return {
      whr: isNaN(whr) ? 0.85 : whr,
      whrStatus,
      whrRiskLevel,
      whrThreshold: isFemale ? '< 0.85' : '< 0.90',
      whtr: isNaN(whtr) ? 0.45 : whtr,
      whtrStatus,
      whtrRiskLevel,
      whtrThreshold: '≤ 0.50',
      bmi: isNaN(bmi) ? 22.5 : bmi,
      bmiCategory,
      bodyFatPct: bf,
      fatMassKg: isNaN(fatMassKg) ? 12.0 : fatMassKg,
      leanMassKg: isNaN(leanMassKg) ? 60.0 : leanMassKg
    };
  }

  /**
   * Unified Anthropometric & Clinical Evaluation Pipeline
   */
  function evaluateAnthropometricPhysique({
    heightCm = 178,
    weightKg = 72,
    gender = 'male',
    age = 26,
    goal = 'lean_athletic',
    experience = 'intermediate',
    manualMeasurements = null,
    photoMeasurements = null,
    crossSections = null
  }) {
    const reg = estimateAnthropometrics({
      heightCm,
      weightKg,
      gender,
      goal,
      experience,
      photoMeasurements,
      crossSections
    });

    const circumferences = {
      neck: (manualMeasurements && Number(manualMeasurements.neck)) || reg.neck,
      chest: (manualMeasurements && Number(manualMeasurements.chest)) || reg.chest,
      waist: (manualMeasurements && Number(manualMeasurements.waist)) || reg.waist,
      hips: (manualMeasurements && Number(manualMeasurements.hips)) || reg.hips,
      bicep: (manualMeasurements && Number(manualMeasurements.bicep)) || reg.bicep,
      thigh: (manualMeasurements && Number(manualMeasurements.thigh)) || reg.thigh,
      calf: (manualMeasurements && Number(manualMeasurements.calf)) || reg.calf
    };

    const navyBf = calculateNavyBodyFat({
      gender,
      heightCm,
      waistCm: circumferences.waist,
      neckCm: circumferences.neck,
      hipsCm: circumferences.hips
    });

    const clinical = calculateClinicalRatios({
      heightCm,
      weightKg,
      waistCm: circumferences.waist,
      hipsCm: circumferences.hips,
      gender,
      bodyFatPct: navyBf
    });

    return {
      circumferences,
      crossSections: reg.crossSections,
      navyBf,
      clinical,
      anatomicalLevels: ISO_ANATOMICAL_LEVELS
    };
  }

  const FF_ALGO = {
    bmrMifflinStJeor, tdee, macros,
    MET, metCalories,
    startingLoadCeiling, startingLoadPropose, recalibrateLoad,
    classifyMovement, MOVEMENT_PATTERNS,
    ISO_ANATOMICAL_LEVELS,
    ramanujanEllipticalCircumference,
    estimateAnthropometrics,
    calculateNavyBodyFat,
    calculateClinicalRatios,
    evaluateAnthropometricPhysique
  };

  if (typeof window !== 'undefined') {
    window.FF_ALGO = FF_ALGO;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FF_ALGO;
  }
})();
