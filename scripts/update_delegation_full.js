const fs = require('fs');

const jsPath = 'public/fitfuel.js';
let js = fs.readFileSync(jsPath, 'utf8');

const sIdx = js.indexOf('/* ================= BULLETPROOF GLOBAL EVENT DELEGATION');
if (sIdx !== -1) {
  const enhancedDelegation = `/* ================= BULLETPROOF GLOBAL EVENT DELEGATION (HUBS & CHALLENGES) ================= */
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

  // 3. Motive Option Card Click
  const motiveCard = e.target.closest('#motiveOptionsList .setup-choice-card');
  if (motiveCard) {
    document.querySelectorAll('#motiveOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
    motiveCard.classList.add('selected');
    setupMotive = motiveCard.dataset.motive || 'Burn Fat & Lean Out';
    return;
  }

  // 4. Challenge Motive Step 1 -> Step 2
  const proceedPrefsBtn = e.target.closest('#proceedToPrefsBtn');
  if (proceedPrefsBtn) {
    e.preventDefault();
    if (typeof closeModal === 'function') closeModal('#challengeMotiveModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengePrefsModal');
    }, 100);
    return;
  }

  // 5. Time Minutes Card Click
  const timeCard = e.target.closest('#chTimeOptionsList .setup-choice-card');
  if (timeCard) {
    document.querySelectorAll('#chTimeOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
    timeCard.classList.add('selected');
    setupMinutes = Number(timeCard.dataset.minutes) || 45;
    return;
  }

  // 6. Intensity Card Click
  const intCard = e.target.closest('#chIntensityOptionsList .setup-choice-card');
  if (intCard) {
    document.querySelectorAll('#chIntensityOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
    intCard.classList.add('selected');
    setupIntensity = intCard.dataset.intensity || 'Moderate';
    return;
  }

  // 7. Types Card Click
  const typeCard = e.target.closest('#chTypesOptionsList .setup-choice-card');
  if (typeCard && e.target.tagName !== 'INPUT') {
    const cb = typeCard.querySelector('input[type="checkbox"]');
    if (cb) {
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return;
  }

  // 8. Challenge Prefs Step 2 -> Step 3
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

  // 9. Duration Days Card Click
  const durCard = e.target.closest('#durationOptionsList .setup-choice-card');
  if (durCard) {
    document.querySelectorAll('#durationOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
    durCard.classList.add('selected');
    setupDuration = Number(durCard.dataset.days) || 15;
    return;
  }

  // 10. Back from Duration to Prefs
  const backPrefsBtn = e.target.closest('#backToPrefsBtn');
  if (backPrefsBtn) {
    e.preventDefault();
    if (typeof closeModal === 'function') closeModal('#challengeDurationModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengePrefsModal');
    }, 100);
    return;
  }

  // 11. Generate Challenge Plan
  const genChallengeBtn = e.target.closest('#generateChallengePlanBtn');
  if (genChallengeBtn) {
    e.preventDefault();
    if (typeof generateAIChallengePlan === 'function') {
      generateAIChallengePlan(setupMotive, setupDuration, setupMinutes, setupIntensity, setupTypes);
    }
    return;
  }

  // 12. Start Active Challenge Workout Session
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

  // 13. Refresh Today's Routine
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

  // 14. Reset Challenge Plan to Day 1
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

  // 15. Exit Challenge Plan
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

  // 16. Swap Exercise Trigger
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
  js = js.slice(0, sIdx) + enhancedDelegation;
  fs.writeFileSync(jsPath, js, 'utf8');
  console.log('Updated delegation block with card choice listeners successfully.');
}
