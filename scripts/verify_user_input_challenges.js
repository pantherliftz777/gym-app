const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot of pristine home view
  await page.screenshot({ path: 'test_screenshots/01_verify_home_pristine.png' });
  console.log('Saved test_screenshots/01_verify_home_pristine.png');

  // Clear any existing activeChallengePlan in localStorage so we test from clean state
  await page.evaluate(() => {
    localStorage.removeItem('activeChallengePlan');
    if (window.activeChallengePlan) window.activeChallengePlan = null;
    if (typeof switchView === 'function') switchView('challenge');
  });
  await new Promise(r => setTimeout(r, 600));

  // Open Challenge Motive Modal
  await page.evaluate(() => {
    const btn = document.querySelector('button[onclick*="challengeMotiveModal"]');
    if (btn) btn.click();
    else if (typeof openModal === 'function') openModal('#challengeMotiveModal');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'test_screenshots/02_verify_step1_motive.png' });
  console.log('Saved test_screenshots/02_verify_step1_motive.png');

  // TEST CASE 1:
  // Motive: "Burn Fat & Lean Out"
  // Types: "Home" + "HIIT"
  // Time: "20 min"
  // Intensity: "Hard"
  // Duration: "10 Days"
  console.log('Configuring Case 1: Burn Fat & Lean Out, Home, HIIT, 20 min, Hard, 10 Days...');
  await page.evaluate(() => {
    // Select Motive
    const fatCard = document.querySelector('#motiveOptionsList .setup-choice-card[data-motive="Burn Fat & Lean Out"]');
    if (fatCard) fatCard.click();
    // Next to Prefs
    document.getElementById('proceedToPrefsBtn').click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    // Select Home (uncheck Gym, check Home)
    const homeCb = document.querySelector('#chTypesOptionsList input[value="Home"]');
    if (homeCb && !homeCb.checked) homeCb.click();

    // Select HIIT
    const hiitCb = document.querySelector('#chTypesOptionsList input[value="HIIT"]');
    if (hiitCb && !hiitCb.checked) hiitCb.click();

    // Select 20 min
    const m20 = document.querySelector('#chTimeOptionsList [data-minutes="20"]');
    if (m20) m20.click();

    // Select Hard intensity
    const hardBtn = document.querySelector('#chIntensityOptionsList [data-intensity="Hard"]');
    if (hardBtn) hardBtn.click();

    // Proceed to duration
    document.getElementById('proceedToDurationBtn').click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'test_screenshots/03_verify_step3_10days.png' });
  console.log('Saved test_screenshots/03_verify_step3_10days.png');

  // Select 10 days and generate plan
  await page.evaluate(() => {
    const d10 = document.querySelector('#durationOptionsList [data-days="10"]');
    if (d10) d10.click();
    document.getElementById('generateChallengePlanBtn').click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'test_screenshots/04_verify_generated_case1_plan.png' });
  console.log('Saved test_screenshots/04_verify_generated_case1_plan.png');

  // Inspect generated activeChallengePlan in page context
  const planInfo = await page.evaluate(() => {
    const p = window.activeChallengePlan;
    if (!p) return null;
    const day1 = p.days[0];
    return {
      motive: p.motive,
      durationDays: p.durationDays,
      totalWorkoutMinutes: p.totalWorkoutMinutes,
      intensity: p.intensity,
      types: p.types,
      totalDaysCount: p.days.length,
      day1Title: day1.title,
      day1Focus: day1.focus,
      day1ExCount: day1.exercises.length,
      day1Exercises: day1.exercises.map(e => ({
        name: e.name,
        equipment: e.equipment,
        sets: e.sets,
        reps: e.reps,
        restSec: e.restSec
      })),
      allForbiddenHomeItems: p.days.flatMap(d => d.exercises).filter(e => {
        const eq = (e.equipment || '').toLowerCase();
        const n = (e.name || '').toLowerCase();
        const forbidden = ['barbell', 'cable', 'machine', 'smith', 'sled', 'assisted', 'trap bar', 'ez barbell', 'bike'];
        return forbidden.some(f => eq.includes(f) || n.includes(f));
      }).map(e => e.name + ' (' + e.equipment + ')')
    };
  });

  console.log('\n--- VERIFICATION OF CASE 1 GENERATED PLAN ---');
  console.log(JSON.stringify(planInfo, null, 2));

  // Assertions for Case 1
  if (!planInfo) throw new Error('FAIL: No active challenge plan was generated!');
  if (planInfo.motive !== 'Burn Fat & Lean Out') throw new Error(`FAIL: Motive mismatch: ${planInfo.motive}`);
  if (planInfo.durationDays !== 10 || planInfo.totalDaysCount !== 10) throw new Error(`FAIL: Expected 10 days, got ${planInfo.totalDaysCount}`);
  if (planInfo.totalWorkoutMinutes !== 20) throw new Error(`FAIL: Expected 20 min, got ${planInfo.totalWorkoutMinutes}`);
  if (planInfo.intensity !== 'Hard') throw new Error(`FAIL: Expected Hard intensity, got ${planInfo.intensity}`);
  if (!planInfo.types.includes('Home')) throw new Error(`FAIL: Expected Home in types, got ${planInfo.types}`);
  if (planInfo.day1ExCount !== 3) throw new Error(`FAIL: Expected 3 exercises for 20min express, got ${planInfo.day1ExCount}`);
  if (planInfo.allForbiddenHomeItems.length > 0) throw new Error(`FAIL: Found forbidden gym equipment in Home workout: ${planInfo.allForbiddenHomeItems.join(', ')}`);
  console.log('✅ CASE 1 (Home Fat Burn 20min 10 Days) PASSED PERFECTLY!');

  // TEST EXERCISE SWAP:
  console.log('\nTesting Exercise Swap Modal...');
  await page.evaluate(() => {
    const swapBtn = document.querySelector('.swap-ex-trigger[data-ex-idx="0"]');
    if (swapBtn) swapBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'test_screenshots/05_verify_swap_modal.png' });
  console.log('Saved test_screenshots/05_verify_swap_modal.png');

  // Verify swap modal content
  const swapInfo = await page.evaluate(() => {
    const alternatives = Array.from(document.querySelectorAll('.replace-ex-btn')).map(b => b.dataset.exName);
    return {
      modalVisible: document.querySelector('#swapExerciseModal').classList.contains('open'),
      targetName: document.querySelector('#swapTargetExName') ? document.querySelector('#swapTargetExName').textContent : '',
      alternativesCount: alternatives.length,
      sampleAlternatives: alternatives.slice(0, 5)
    };
  });
  console.log('Swap modal info:', swapInfo);
  if (!swapInfo.modalVisible || swapInfo.alternativesCount === 0) {
    throw new Error('FAIL: Swap modal did not render alternatives!');
  }

  // Click replacement
  await page.evaluate(() => {
    const firstRep = document.querySelector('.replace-ex-btn');
    if (firstRep) firstRep.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'test_screenshots/06_verify_after_swap.png' });
  console.log('Saved test_screenshots/06_verify_after_swap.png');
  console.log('✅ EXERCISE SWAP PASSED PERFECTLY!');

  // TEST CASE 2:
  // Motive: "Raw Strength & Power"
  // Types: "Gym"
  // Time: "60 min"
  // Intensity: "Hard"
  // Duration: "30 Days"
  console.log('\nConfiguring Case 2: Raw Strength & Power, Gym, 60 min, Hard, 30 Days...');
  await page.evaluate(() => {
    // Generate AI Plan directly with parameters
    window.generateAIChallengePlan('Raw Strength & Power', 30, 60, 'Hard', ['Gym']);
  });
  await new Promise(r => setTimeout(r, 1200));

  const planInfo2 = await page.evaluate(() => {
    const p = window.activeChallengePlan;
    if (!p) return null;
    const day1 = p.days[0];
    return {
      motive: p.motive,
      durationDays: p.durationDays,
      totalWorkoutMinutes: p.totalWorkoutMinutes,
      intensity: p.intensity,
      types: p.types,
      totalDaysCount: p.days.length,
      day1Title: day1.title,
      day1Focus: day1.focus,
      day1ExCount: day1.exercises.length,
      day1Exercises: day1.exercises.map(e => ({
        name: e.name,
        equipment: e.equipment,
        sets: e.sets,
        reps: e.reps,
        restSec: e.restSec
      }))
    };
  });

  console.log('\n--- VERIFICATION OF CASE 2 GENERATED PLAN ---');
  console.log(JSON.stringify(planInfo2, null, 2));

  if (!planInfo2) throw new Error('FAIL: Case 2 plan not generated!');
  if (planInfo2.motive !== 'Raw Strength & Power') throw new Error(`FAIL: Expected Raw Strength & Power, got ${planInfo2.motive}`);
  if (planInfo2.durationDays !== 30 || planInfo2.totalDaysCount !== 30) throw new Error(`FAIL: Expected 30 days, got ${planInfo2.totalDaysCount}`);
  if (planInfo2.totalWorkoutMinutes !== 60) throw new Error(`FAIL: Expected 60 min, got ${planInfo2.totalWorkoutMinutes}`);
  if (planInfo2.day1ExCount !== 7) throw new Error(`FAIL: Expected 7 exercises for 60 min, got ${planInfo2.day1ExCount}`);
  if (!planInfo2.day1Exercises[0].reps.includes('4–6')) throw new Error(`FAIL: Expected 4-6 heavy reps for Strength Hard, got ${planInfo2.day1Exercises[0].reps}`);
  if (planInfo2.day1Exercises[0].restSec !== 75) throw new Error(`FAIL: Expected 75s rest for Strength Hard, got ${planInfo2.day1Exercises[0].restSec}`);

  await page.screenshot({ path: 'test_screenshots/07_verify_case2_strength_30days.png' });
  console.log('Saved test_screenshots/07_verify_case2_strength_30days.png');
  console.log('✅ CASE 2 (Gym Raw Strength 60min 30 Days) PASSED PERFECTLY!');

  console.log('\n================ ALL TESTS PASSED SUCCESSFULLY! ================');
  await browser.close();
})();
