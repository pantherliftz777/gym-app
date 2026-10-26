const fs = require('fs');

const jsPath = 'public/fitfuel.js';
let js = fs.readFileSync(jsPath, 'utf8');

// 1. Update switchView
const targetSwitchView = `function switchView(viewName) {
  if (typeof syncProfileToAllFeatures === 'function') syncProfileToAllFeatures();
  if (typeof updateDailyMacroMeters === 'function') updateDailyMacroMeters();
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
  });`;

const replacementSwitchView = `function switchView(viewName) {
  if (typeof syncProfileToAllFeatures === 'function') syncProfileToAllFeatures();
  if (typeof updateDailyMacroMeters === 'function') updateDailyMacroMeters();
  activeView = viewName;

  const WORKOUT_VIEWS = ['workouts', 'challenge', 'starting-load', 'exercise-library'];
  const FOOD_VIEWS = ['food-log', 'my-foods'];

  let parentNavView = viewName;
  if (WORKOUT_VIEWS.includes(viewName)) {
    parentNavView = 'workouts';
  } else if (FOOD_VIEWS.includes(viewName)) {
    parentNavView = 'food-log';
  }

  $$('.primary-nav .nav-link').forEach(btn => {
    const isTarget = btn.dataset.view === parentNavView || btn.dataset.view === viewName;
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

  // Sync all hub tabs
  $$('.hub-tab-btn').forEach(tab => {
    const isTabActive = tab.dataset.hubTarget === viewName;
    tab.classList.toggle('active', isTabActive);
  });`;

if (js.includes(targetSwitchView)) {
  js = js.replace(targetSwitchView, replacementSwitchView);
  console.log('Updated switchView successfully.');
} else {
  console.error('Target switchView snippet not found in fitfuel.js');
}

// 2. Attach openModal and closeModal to window
const modalTarget = `function closeModal(selector) {`;
if (js.includes(modalTarget) && !js.includes('window.openModal = openModal;')) {
  // Find where closeModal ends
  const closeIdx = js.indexOf(modalTarget);
  const endTimeoutIdx = js.indexOf('}, 160);\n}', closeIdx);
  if (endTimeoutIdx !== -1) {
    const insertPos = endTimeoutIdx + 11;
    js = js.slice(0, insertPos) + '\n\nwindow.openModal = openModal;\nwindow.closeModal = closeModal;\nwindow.switchView = switchView;\n' + js.slice(insertPos);
    console.log('Attached openModal, closeModal, switchView to window.');
  } else {
    console.error('Could not find end of closeModal');
  }
}

// 3. Attach openExerciseDetailModal to window
if (js.includes('function openExerciseDetailModal') && !js.includes('window.openExerciseDetailModal = openExerciseDetailModal;')) {
  const oIdx = js.indexOf('function openExerciseDetailModal');
  const insertPos = js.indexOf('function ', oIdx + 30);
  if (insertPos !== -1) {
    js = js.slice(0, insertPos) + 'window.openExerciseDetailModal = openExerciseDetailModal;\n\n' + js.slice(insertPos);
    console.log('Attached openExerciseDetailModal to window.');
  }
}

// 4. Attach openSwapExerciseModal, startWorkoutSession, setupChallenge vars to window
if (js.includes('function openSwapExerciseModal') && !js.includes('window.openSwapExerciseModal = openSwapExerciseModal;')) {
  const sIdx = js.indexOf('function openSwapExerciseModal');
  const insertPos = js.indexOf('function ', sIdx + 30);
  if (insertPos !== -1) {
    js = js.slice(0, insertPos) + 'window.openSwapExerciseModal = openSwapExerciseModal;\n\n' + js.slice(insertPos);
    console.log('Attached openSwapExerciseModal to window.');
  }
}

if (js.includes('function startWorkoutSession') && !js.includes('window.startWorkoutSession = startWorkoutSession;')) {
  const sIdx = js.indexOf('function startWorkoutSession');
  const insertPos = js.indexOf('function ', sIdx + 30);
  if (insertPos !== -1) {
    js = js.slice(0, insertPos) + 'window.startWorkoutSession = startWorkoutSession;\n\n' + js.slice(insertPos);
    console.log('Attached startWorkoutSession to window.');
  }
}

// 5. Append document-level delegation for Hubs & Challenge
const delegationCode = `
/* ================= BULLETPROOF GLOBAL EVENT DELEGATION (HUBS & CHALLENGES) ================= */
document.addEventListener('click', function(e) {
  // 1. Hub navigation tabs
  const hubBtn = e.target.closest('.hub-tab-btn');
  if (hubBtn) {
    e.preventDefault();
    const action = hubBtn.dataset.tabAction;
    const target = hubBtn.dataset.hubTarget;
    if (action === 'open-recipes') {
      if (typeof switchView === 'function') switchView('food-log');
      if (typeof openModal === 'function') openModal('#recipeBuilderModal');
      return;
    }
    if (action === 'open-water') {
      if (typeof switchView === 'function') switchView('food-log');
      setTimeout(() => {
        const waterCard = document.getElementById('waterIntakeCard') || document.querySelector('.water-log-card');
        if (waterCard) {
          waterCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          waterCard.style.outline = '2px solid #38bdf8';
          setTimeout(() => { waterCard.style.outline = ''; }, 1800);
        }
      }, 150);
      return;
    }
    if (target && typeof switchView === 'function') {
      switchView(target);
    }
    return;
  }

  // 2. Start Challenge triggers
  const startChallengeBtn = e.target.closest('#createChallengeBtn, [data-open-challenge], .challenge-empty-card .solid-button');
  if (startChallengeBtn) {
    e.preventDefault();
    if (typeof openModal === 'function') openModal('#challengeMotiveModal');
    return;
  }

  // 3. Challenge Motive Step 1 -> Step 2
  const proceedPrefsBtn = e.target.closest('#proceedToPrefsBtn');
  if (proceedPrefsBtn) {
    e.preventDefault();
    if (typeof closeModal === 'function') closeModal('#challengeMotiveModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengePrefsModal');
    }, 100);
    return;
  }

  // 4. Challenge Prefs Step 2 -> Step 3
  const proceedDurationBtn = e.target.closest('#proceedToDurationBtn');
  if (proceedDurationBtn) {
    e.preventDefault();
    const prev = document.getElementById('challengeMetricsPreview');
    if (prev) {
      const typesStr = (Array.isArray(setupTypes) && setupTypes.length) ? setupTypes.join(', ') : 'Home';
      prev.textContent = \`\${setupMinutes || 45} Total Min/Day · \${setupIntensity || 'Moderate'} Intensity · \${typesStr} · \${setupMotive || 'Burn Fat'}\`;
    }
    if (typeof closeModal === 'function') closeModal('#challengePrefsModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengeDurationModal');
    }, 100);
    return;
  }

  // 5. Back from Duration to Prefs
  const backPrefsBtn = e.target.closest('#backToPrefsBtn');
  if (backPrefsBtn) {
    e.preventDefault();
    if (typeof closeModal === 'function') closeModal('#challengeDurationModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengePrefsModal');
    }, 100);
    return;
  }

  // 6. Generate Challenge Plan
  const genChallengeBtn = e.target.closest('#generateChallengePlanBtn');
  if (genChallengeBtn) {
    e.preventDefault();
    if (typeof generateAIChallengePlan === 'function') {
      generateAIChallengePlan(setupMotive, setupDuration, setupMinutes, setupIntensity, setupTypes);
    }
    return;
  }

  // 7. Start Active Challenge Workout Session
  const startSessionBtn = e.target.closest('#startActiveSessionBtn');
  if (startSessionBtn) {
    e.preventDefault();
    if (activeChallengePlan && activeChallengePlan.days) {
      const curIdx = Math.min(activeChallengePlan.days.length - 1, activeChallengePlan.currentDayIndex || 0);
      const curDay = activeChallengePlan.days[curIdx];
      if (typeof startWorkoutSession === 'function') startWorkoutSession(curDay);
    }
    return;
  }

  // 8. Refresh Today's Routine
  const refreshRoutineBtn = e.target.closest('#refreshTodayRoutineBtn');
  if (refreshRoutineBtn) {
    e.preventDefault();
    if (activeChallengePlan && activeChallengePlan.days) {
      const curIdx = Math.min(activeChallengePlan.days.length - 1, activeChallengePlan.currentDayIndex || 0);
      if (typeof generatePersonalizedChallengeSchedule === 'function') {
        const freshExercises = generatePersonalizedChallengeSchedule(
          1,
          activeChallengePlan.motive,
          activeChallengePlan.userWeight,
          activeChallengePlan.userHeight,
          activeChallengePlan.totalWorkoutMinutes || 45,
          activeChallengePlan.intensity || 'Moderate',
          activeChallengePlan.types || ['Home']
        )[0].exercises;
        activeChallengePlan.days[curIdx].exercises = freshExercises;
        store.set('activeChallengePlan', activeChallengePlan);
        if (FF && FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
        if (typeof renderChallengeView === 'function') renderChallengeView();
        if (typeof toast === 'function') toast('Refreshed today’s exercises with new movements!');
      }
    }
    return;
  }

  // 9. Reset Challenge Plan to Day 1
  const resetPlanBtn = e.target.closest('#resetChallengePlanBtn');
  if (resetPlanBtn) {
    e.preventDefault();
    if (activeChallengePlan && confirm('Reset progress back to Day 1?')) {
      activeChallengePlan.currentDayIndex = 0;
      activeChallengePlan.completedCount = 0;
      if (activeChallengePlan.days) {
        activeChallengePlan.days.forEach(d => { d.completed = false; });
      }
      store.set('activeChallengePlan', activeChallengePlan);
      if (FF && FF.online && FF.user) FF.patch({ activeChallenge: activeChallengePlan });
      if (typeof renderChallengeView === 'function') renderChallengeView();
      if (typeof toast === 'function') toast('Challenge reset back to Day 1.');
    }
    return;
  }

  // 10. Exit Challenge Plan
  const exitPlanBtn = e.target.closest('#exitChallengePlanBtn');
  if (exitPlanBtn) {
    e.preventDefault();
    if (confirm('Are you sure you want to exit and abandon this challenge?')) {
      activeChallengePlan = null;
      store.del('activeChallengePlan');
      if (FF && FF.online && FF.user) FF.patch({ activeChallenge: null });
      if (typeof renderChallengeView === 'function') renderChallengeView();
      if (typeof toast === 'function') toast('Challenge ended.');
    }
    return;
  }

  // 11. Swap Exercise Trigger
  const swapTrigger = e.target.closest('.swap-ex-trigger');
  if (swapTrigger) {
    e.preventDefault();
    const exIdx = Number(swapTrigger.dataset.exIdx) || 0;
    if (activeChallengePlan && activeChallengePlan.days) {
      const curIdx = Math.min(activeChallengePlan.days.length - 1, activeChallengePlan.currentDayIndex || 0);
      if (typeof openSwapExerciseModal === 'function') {
        openSwapExerciseModal(curIdx, exIdx);
      }
    }
    return;
  }
});
`;

if (!js.includes('BULLETPROOF GLOBAL EVENT DELEGATION')) {
  js += '\n' + delegationCode;
  console.log('Appended global delegation code.');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Patched public/fitfuel.js successfully.');
