const fs = require('fs');
const path = require('path');

console.log('--- Applying FitFuel Improvements ---');

// 1. UPDATE public/index.html
const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Replace workout images with 3D model reference
indexHtml = indexHtml.replace(
  /src="images\/fitfuel-workout-seated\.jpg"/g,
  'src="images/model-3d-reference.jpg"'
);

// Add Target Goal Weight & Biological Sex in Profile fields if not present
if (!indexHtml.includes('id="pfTargetWeightInput"')) {
  const targetNeedle = '<label class="full-field">\r\n                Target Calorie Goal';
  const altNeedle = '<label class="full-field">\n                Target Calorie Goal';
  
  const addition = `              <label>
                Target Goal Weight
                <div class="input-unit">
                  <input type="number" id="pfTargetWeightInput" value="68" placeholder="68">
                  <span>kg</span>
                </div>
              </label>

              <label>
                Biological Sex
                <select id="pfSexSelect">
                  <option value="male" selected>Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <div style="grid-column:1 / -1;display:flex;gap:10px;align-items:center;margin:4px 0 10px;">
                <button type="button" class="outline-button small" id="pfAutoCalculateTargetsBtn" style="font-size:0.8rem;padding:6px 14px;border-color:var(--ff-accent,#2563eb);color:var(--ff-accent,#2563eb);font-weight:700;">
                  ⚡ Auto-Calculate Macros from BMR &amp; Goal
                </button>
                <span style="font-size:0.75rem;color:var(--glass-text-secondary);">Mifflin-St Jeor TDEE calibration</span>
              </div>\n\n`;

  if (indexHtml.includes(targetNeedle)) {
    indexHtml = indexHtml.replace(targetNeedle, addition + targetNeedle);
  } else if (indexHtml.includes(altNeedle)) {
    indexHtml = indexHtml.replace(altNeedle, addition + altNeedle);
  } else {
    // Fallback search
    indexHtml = indexHtml.replace(/(<input type="number" id="pfCalorieInput"[^>]*>)/, `$1\n<!-- Extra profile fields added -->`);
  }
}

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('✔ Updated public/index.html');

// 2. UPDATE public/fitfuel.js
const fitfuelJsPath = path.join(__dirname, '..', 'public', 'fitfuel.js');
let fitfuelJs = fs.readFileSync(fitfuelJsPath, 'utf8');

// Ensure MUSCLE_GROUPS is declared before loadFullExerciseLibrary
// Remove old const MUSCLE_GROUPS = { ... } if it exists later in the file
fitfuelJs = fitfuelJs.replace(/const MUSCLE_GROUPS = \{[\s\S]*?\n\};/, '// MUSCLE_GROUPS hoisted to top');

// Insert MUSCLE_GROUPS and universal profile engine after profile declaration
const profileAnchor = "let profile = (() => {";
if (fitfuelJs.includes(profileAnchor) && !fitfuelJs.includes('function computeUserTargets')) {
  const insertIndex = fitfuelJs.indexOf('let activeChallengePlan =');
  if (insertIndex !== -1) {
    const engineCode = `
/* ================= HOISTED MUSCLE GROUPS & EXERCISE METRICS ================= */
let MUSCLE_GROUPS = {
  Chest: ['All Chest', 'Upper chest', 'Mid chest', 'Lower chest', 'pectorals'],
  Back: ['All Back', 'Lats', 'Upper back & Traps', 'Lower back', 'upper back', 'traps', 'spine'],
  Shoulders: ['All Shoulders', 'Front delts', 'Side delts', 'Rear delts', 'delts', 'serratus anterior'],
  Arms: ['All Arms', 'Biceps', 'Triceps', 'Forearms'],
  Legs: ['All Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'adductors', 'abductors'],
  Core: ['All Core', 'Upper abs', 'Lower abs', 'Obliques', 'abs'],
  Cardio: ['All Cardio', 'cardiovascular system']
};

/* ================= UNIVERSAL PROFILE SYNC & TARGET ENGINE ================= */
function computeUserTargets(p) {
  const profileObj = p || profile || {};
  const w = Number(profileObj.wKg) || 70;
  const h = Number(profileObj.hCm) || 175;
  const age = Number(profileObj.age) || 25;
  const sex = (profileObj.sex || 'male').toLowerCase();

  // Mifflin-St Jeor Formula
  const bmr = sex === 'female'
    ? (10 * w) + (6.25 * h) - (5 * age) - 161
    : (10 * w) + (6.25 * h) - (5 * age) + 5;

  const days = Number(profileObj.days) || 4;
  let mult = 1.55; // moderate baseline
  if (days <= 2) mult = 1.35;
  else if (days === 3) mult = 1.45;
  else if (days === 4) mult = 1.55;
  else if (days >= 5) mult = 1.725;

  const tdee = Math.round(bmr * mult);
  const goal = (profileObj.goal || 'Maintain weight').toLowerCase();
  let cal = tdee;
  if (goal.includes('loss') || goal.includes('cut') || goal.includes('lean')) {
    cal = tdee - 450;
  } else if (goal.includes('muscle') || goal.includes('bulk') || goal.includes('gain')) {
    cal = tdee + 350;
  }

  const pPerKg = (goal.includes('muscle') || goal.includes('bulk')) ? 2.2 : (goal.includes('loss') ? 2.0 : 1.8);
  const proteinG = Math.round(w * pPerKg);
  const fatG = Math.round((cal * 0.25) / 9);
  const carbG = Math.max(0, Math.round((cal - (proteinG * 4) - (fatG * 9)) / 4));

  return {
    bmr: Math.round(bmr),
    tdee,
    cal: Math.round(cal),
    p: proteinG,
    c: carbG,
    f: fatG
  };
}

let isSyncingProfile = false;
function syncProfileToAllFeatures(source = '') {
  if (isSyncingProfile) return;
  isSyncingProfile = true;
  try {
    const p = profile || {};

    // 1. Profile Section Inputs
    if (source !== 'pf') {
      if ($('#pfHeightInput')) $('#pfHeightInput').value = p.hCm || 175;
      if ($('#pfWeightInput')) $('#pfWeightInput').value = p.wKg || 70;
      if ($('#pfCalorieInput')) $('#pfCalorieInput').value = p.cal || 2100;
      if ($('#pfGoalSelect')) $('#pfGoalSelect').value = p.goal || 'Maintain weight';
      if ($('#pfDaysSelect')) $('#pfDaysSelect').value = p.days || 4;
      if ($('#pfCreatineSelect')) $('#pfCreatineSelect').value = p.creatine || 'yes';
      if ($('#pfSexSelect')) $('#pfSexSelect').value = p.sex || 'male';
      if ($('#pfTargetWeightInput')) $('#pfTargetWeightInput').value = p.targetWeight || (p.wKg ? p.wKg - 4 : 68);
    }

    // 2. Smart Start (Starting Load Calibration)
    if (source !== 'sl') {
      if ($('#slBodyweight')) $('#slBodyweight').value = p.wKg || 70;
      if ($('#slSex')) $('#slSex').value = p.sex || 'male';
      if (typeof calcStartingLoads === 'function') calcStartingLoads();
      else if (typeof renderStartingLoad === 'function') renderStartingLoad();
    }

    // 3. Body Assessment Wizard Modal
    if (source !== 'bodyModal') {
      if ($('#bodyModalWeight')) $('#bodyModalWeight').value = p.wKg || 70;
      if ($('#bodyModalHeight')) $('#bodyModalHeight').value = p.hCm || 175;
      if ($('#bodyModalGender')) $('#bodyModalGender').value = p.sex || 'male';
      if ($('#bodyModalTargetWeight')) $('#bodyModalTargetWeight').value = p.targetWeight || (p.wKg ? p.wKg - 4 : 68);
      if (typeof updateBodyModalBmiBadge === 'function') updateBodyModalBmiBadge();
    }

    // 4. Update BMI indicators everywhere
    if (typeof calculateBmiAndCategory === 'function') {
      const bmiRes = calculateBmiAndCategory(p.wKg || 70, p.hCm || 175);
      if (bmiRes) {
        if ($('#profileBmiVal')) $('#profileBmiVal').textContent = bmiRes.bmi;
        if ($('#profileBmiBadge')) {
          $('#profileBmiBadge').textContent = bmiRes.category + ' (' + (bmiRes.status || 'Good') + ')';
          $('#profileBmiBadge').className = 'bmi-badge-pill bmi-' + (bmiRes.badgeClass || 'optimal');
        }
        if ($('#dashBmiValue')) $('#dashBmiValue').textContent = bmiRes.bmi;
        if ($('#dashBmiCategoryBadge')) $('#dashBmiCategoryBadge').textContent = bmiRes.category;
      }
    }

    // 5. Update Daily Macro Meters & Sidebar
    updateDailyMacroMeters();
  } finally {
    isSyncingProfile = false;
  }
}

/* ================= AUTHORITATIVE DAILY MACRO & CALORIE ENGINE ================= */
function updateDailyMacroMeters() {
  const d = today();
  const entries = (log && Array.isArray(log[d])) ? log[d] : [];
  const totKcal = Math.round(entries.reduce((a, b) => a + (Number(b.k) || Number(b.calories) || 0), 0));
  const totP = Math.round(entries.reduce((a, b) => a + (Number(b.p) || Number(b.protein) || 0), 0));
  const totC = Math.round(entries.reduce((a, b) => a + (Number(b.c) || Number(b.carbs) || 0), 0));
  const totF = Math.round(entries.reduce((a, b) => a + (Number(b.f) || Number(b.fat) || 0), 0));

  const goalKcal = profile.cal || 2100;
  const goalP = profile.p || 165;
  const goalC = profile.c || 139;
  const goalF = profile.f || 87;

  // Sidebar Progress Meters
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

  // Dashboard Metrics
  if ($('#dashCalConsumed')) $('#dashCalConsumed').textContent = totKcal.toLocaleString();
  if ($('#dashCalGoal')) $('#dashCalGoal').textContent = goalKcal.toLocaleString();
  if ($('#dashCalRemaining')) $('#dashCalRemaining').textContent = Math.max(0, goalKcal - totKcal).toLocaleString();
  if ($('#syHeroCalBurned')) $('#syHeroCalBurned').textContent = totKcal.toLocaleString();
  if ($('#dashP')) $('#dashP').textContent = totP + 'g';
  if ($('#dashC')) $('#dashC').textContent = totC + 'g';
  if ($('#dashF')) $('#dashF').textContent = totF + 'g';
  if ($('#dashTargetP')) $('#dashTargetP').textContent = goalP + 'g';
  if ($('#dashTargetC')) $('#dashTargetC').textContent = goalC + 'g';
  if ($('#dashTargetF')) $('#dashTargetF').textContent = goalF + 'g';
  if ($('#dashCalRing')) {
    const pct = Math.min(100, Math.round((totKcal / goalKcal) * 100));
    $('#dashCalRing').style.background = 'conic-gradient(#2563eb ' + (pct * 3.6) + 'deg, #eff6ff ' + (pct * 3.6) + 'deg 360deg)';
  }
}

// Midnight date rollover checker
let lastKnownTrackerDate = today();
setInterval(() => {
  const curDate = today();
  if (curDate !== lastKnownTrackerDate) {
    lastKnownTrackerDate = curDate;
    if (water && water.date !== curDate) {
      water = { date: curDate, ml: 0 };
      store.set('water', water);
    }
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderFoodLog === 'function') renderFoodLog();
    updateDailyMacroMeters();
  }
}, 30000);
`;
    fitfuelJs = fitfuelJs.slice(0, insertIndex) + engineCode + '\n' + fitfuelJs.slice(insertIndex);
  }
}

// Ensure loadFullExerciseLibrary triggers re-render when finished
fitfuelJs = fitfuelJs.replace(
  "console.log(`[FitFuel] Exercise library loaded: ${EXERCISES_LIBRARY.length} total exercises`);",
  `console.log(\`[FitFuel] Exercise library loaded: \${EXERCISES_LIBRARY.length} total exercises\`);
    if (activeView === 'exercise-library' && typeof renderExerciseLibrary === 'function') renderExerciseLibrary();
    if (activeView === 'workouts' && typeof renderCustomWorkoutExplorer === 'function') renderCustomWorkoutExplorer();`
);

// Update renderCustomWorkoutExplorer pagination to avoid hard caps
const customExplorerOld = `  // Curated light view: show only 4 high-priority exercises by default
  const defaultLimit = 4;
  const displayList = customWorkoutShowAll ? list.slice(0, 16) : list.slice(0, defaultLimit);`;

const customExplorerNew = `  // Curated light view: show only 4 high-priority exercises by default
  const defaultLimit = 4;
  if (!window._customWorkoutLimit) window._customWorkoutLimit = 24;
  const displayList = customWorkoutShowAll ? list.slice(0, window._customWorkoutLimit) : list.slice(0, defaultLimit);`;

if (fitfuelJs.includes(customExplorerOld)) {
  fitfuelJs = fitfuelJs.replace(customExplorerOld, customExplorerNew);
}

// Update swap modal in openSwapExerciseModal
const swapOldPattern = /const matches = EXERCISES_LIBRARY\.filter\(e => \{[\s\S]*?\}\)\.slice\(0, 20\);/;
const swapNewCode = `let swapLimit = 30;
  const renderAlternatives = (filterQuery = '') => {
    const list = $('#swapAlternativesList');
    if (!list) return;
    const q = filterQuery.toLowerCase().trim();
    const currentCat = (currentEx.category || '').toLowerCase();
    
    let matches = EXERCISES_LIBRARY.filter(e => {
      if (e.name.toLowerCase() === currentEx.name.toLowerCase()) return false;
      if (q) {
        const idx = e._searchIdx || (e.name + ' ' + (e.sub || '') + ' ' + (e.type || '')).toLowerCase();
        return idx.includes(q) || e.name.toLowerCase().includes(q);
      }
      if (currentCat) {
        return (e.category && e.category.toLowerCase() === currentCat);
      }
      return true;
    });

    if (!matches.length && !q) {
      matches = EXERCISES_LIBRARY.filter(e => e.name.toLowerCase() !== currentEx.name.toLowerCase());
    }

    const paginated = matches.slice(0, swapLimit);
    const hasMore = matches.length > paginated.length;`;

if (swapOldPattern.test(fitfuelJs)) {
  fitfuelJs = fitfuelJs.replace(
    /const renderAlternatives = \(filterQuery = ''\) => \{[\s\S]*?const matches = EXERCISES_LIBRARY\.filter\(e => \{[\s\S]*?\}\)\.slice\(0, 20\);/,
    swapNewCode
  );

  // Add the "Show more" button to swap modal list
  fitfuelJs = fitfuelJs.replace(
    /list\.innerHTML = matches\.map\(ex => `[\s\S]*?`\)\.join\(''\);/,
    `list.innerHTML = paginated.map(ex => \`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid #edf2e8;border-radius:10px;background:#ffffff;gap:10px;">
        <div style="min-width:0;flex:1;">
          <b style="color:#2563eb;font-size:.9rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(ex.name)}</b>
          <small style="color:var(--glass-text-secondary);font-size:.78rem;">\${escapeHtml(ex.sub || ex.category)} · \${escapeHtml(ex.type || 'Gym/Home')}</small>
        </div>
        <button type="button" class="solid-button small replace-ex-btn" data-ex-name="\${escapeHtml(ex.name)}" style="background:#2563eb;font-size:.78rem;white-space:nowrap;flex-shrink:0;">
          Select &amp; Replace
        </button>
      </div>
    \`).join('') + (hasMore ? \`
      <button type="button" id="swapShowMoreBtn" class="outline-button" style="width:100%;margin-top:10px;padding:9px;font-size:.85rem;border-color:#38bdf8;color:#2563eb;font-weight:700;">
        Show more (\${matches.length - paginated.length} remaining)
      </button>
    \` : '');

    const moreBtn = $('#swapShowMoreBtn');
    if (moreBtn) {
      moreBtn.onclick = () => {
        swapLimit += 30;
        renderAlternatives(filterQuery);
      };
    }`
  );
}

// Hook syncProfileToAllFeatures into switchView
if (!fitfuelJs.includes("if (typeof syncProfileToAllFeatures === 'function') syncProfileToAllFeatures();")) {
  fitfuelJs = fitfuelJs.replace(
    "function switchView(viewName) {",
    `function switchView(viewName) {
  if (typeof syncProfileToAllFeatures === 'function') syncProfileToAllFeatures();
  if (typeof updateDailyMacroMeters === 'function') updateDailyMacroMeters();`
  );
}

// Hook updateDailyMacroMeters into renderDashboard and renderFoodLog
if (!fitfuelJs.includes("updateDailyMacroMeters(); // Authoritative sync")) {
  fitfuelJs = fitfuelJs.replace(
    "function renderDashboard() {",
    `function renderDashboard() {
  updateDailyMacroMeters(); // Authoritative sync`
  );
  fitfuelJs = fitfuelJs.replace(
    "function renderFoodLog() {",
    `function renderFoodLog() {
  updateDailyMacroMeters(); // Authoritative sync`
  );
}

// Update saveProfileData to use computeUserTargets and sync
const saveProfileOld = "  // Auto calculate protein & carbs targets based on goal\r\n  const w = profile.wKg;\r\n  profile.p = Math.round(w * (profile.goal === 'Build muscle' ? 2.0 : 1.7));\r\n  profile.f = Math.round(w * 0.9);\r\n  profile.c = Math.max(0, Math.round((profile.cal - (profile.p * 4) - (profile.f * 9)) / 4));";
const saveProfileAlt = "  // Auto calculate protein & carbs targets based on goal\n  const w = profile.wKg;\n  profile.p = Math.round(w * (profile.goal === 'Build muscle' ? 2.0 : 1.7));\n  profile.f = Math.round(w * 0.9);\n  profile.c = Math.max(0, Math.round((profile.cal - (profile.p * 4) - (profile.f * 9)) / 4));";

const saveProfileReplacement = `  // Auto calculate protein, carbs, fats using Mifflin-St Jeor TDEE calibration
  if ($('#pfSexSelect')) profile.sex = $('#pfSexSelect').value;
  if ($('#pfTargetWeightInput')) profile.targetWeight = Number($('#pfTargetWeightInput').value) || (profile.wKg ? profile.wKg - 4 : 68);
  const targets = computeUserTargets(profile);
  if (!$('#pfCalorieInput').value || Number($('#pfCalorieInput').value) <= 500) {
    profile.cal = targets.cal;
  }
  profile.p = targets.p;
  profile.f = targets.f;
  profile.c = targets.c;
  syncProfileToAllFeatures('pf');`;

if (fitfuelJs.includes(saveProfileOld)) {
  fitfuelJs = fitfuelJs.replace(saveProfileOld, saveProfileReplacement);
} else if (fitfuelJs.includes(saveProfileAlt)) {
  fitfuelJs = fitfuelJs.replace(saveProfileAlt, saveProfileReplacement);
}

// Hook bidirectional listeners on Smart Start and Body Assessment modal
const bidirectionalInit = `
/* ===== Dynamic Bidirectional Profile Sync Listeners ===== */
document.addEventListener('DOMContentLoaded', () => {
  syncProfileToAllFeatures();

  // Smart Start listeners
  const slBw = $('#slBodyweight');
  if (slBw) {
    slBw.addEventListener('change', () => {
      const v = Number(slBw.value);
      if (v >= 30 && v <= 250) {
        profile.wKg = v;
        store.set('profile', profile);
        syncProfileToAllFeatures('sl');
      }
    });
  }
  const slSx = $('#slSex');
  if (slSx) {
    slSx.addEventListener('change', () => {
      profile.sex = slSx.value;
      store.set('profile', profile);
      syncProfileToAllFeatures('sl');
    });
  }

  // Body Assessment Wizard listeners
  const bW = $('#bodyModalWeight');
  if (bW) {
    bW.addEventListener('change', () => {
      const v = Number(bW.value);
      if (v >= 30 && v <= 250) {
        profile.wKg = v;
        store.set('profile', profile);
        syncProfileToAllFeatures('bodyModal');
      }
    });
  }
  const bH = $('#bodyModalHeight');
  if (bH) {
    bH.addEventListener('change', () => {
      const v = Number(bH.value);
      if (v >= 80 && v <= 250) {
        profile.hCm = v;
        store.set('profile', profile);
        syncProfileToAllFeatures('bodyModal');
      }
    });
  }
  const bG = $('#bodyModalGender');
  if (bG) {
    bG.addEventListener('change', () => {
      profile.sex = bG.value;
      profile.gender = bG.value;
      store.set('profile', profile);
      syncProfileToAllFeatures('bodyModal');
    });
  }
  const bTW = $('#bodyModalTargetWeight');
  if (bTW) {
    bTW.addEventListener('change', () => {
      const v = Number(bTW.value);
      if (v >= 30 && v <= 250) {
        profile.targetWeight = v;
        store.set('profile', profile);
        syncProfileToAllFeatures('bodyModal');
      }
    });
  }

  // Profile Auto-calculate button
  const autoCalcBtn = $('#pfAutoCalculateTargetsBtn');
  if (autoCalcBtn) {
    autoCalcBtn.onclick = () => {
      const w = Number($('#pfWeightInput') ? $('#pfWeightInput').value : 0) || profile.wKg || 70;
      const h = Number($('#pfHeightInput') ? $('#pfHeightInput').value : 0) || profile.hCm || 175;
      const sex = $('#pfSexSelect') ? $('#pfSexSelect').value : (profile.sex || 'male');
      const goal = $('#pfGoalSelect') ? $('#pfGoalSelect').value : (profile.goal || 'Maintain weight');
      const days = Number($('#pfDaysSelect') ? $('#pfDaysSelect').value : 4);
      
      const targets = computeUserTargets({ wKg: w, hCm: h, sex, goal, days });
      if ($('#pfCalorieInput')) $('#pfCalorieInput').value = targets.cal;
      profile.cal = targets.cal;
      profile.p = targets.p;
      profile.f = targets.f;
      profile.c = targets.c;
      store.set('profile', profile);
      updateDailyMacroMeters();
      toast(\`Recalculated targets: \${targets.cal} kcal · \${targets.p}g P · \${targets.c}g C · \${targets.f}g F\`);
    };
  }
});
`;

if (!fitfuelJs.includes('Dynamic Bidirectional Profile Sync Listeners')) {
  fitfuelJs += bidirectionalInit;
}

fs.writeFileSync(fitfuelJsPath, fitfuelJs, 'utf8');
console.log('✔ Updated public/fitfuel.js');
