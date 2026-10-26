const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== Starting Deep Verification of v7.5.0 Fixes ===');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  const consoleErrors = [];
  const uncaughtExceptions = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore network errors if favicon or external CDN is blocked offline
      if (!text.includes('favicon') && !text.includes('Failed to load resource')) {
        console.error('Browser console error:', text);
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    console.error('Page uncaught error:', err.message);
    uncaughtExceptions.push(err.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  console.log('\n--- 1. Testing soundFX Object Methods directly ---');
  const soundFxMethods = await page.evaluate(() => {
    return {
      hasTap: typeof soundFX.tap === 'function',
      hasBellChime: typeof soundFX.bellChime === 'function',
      hasComplete: typeof soundFX.complete === 'function',
      hasCelebrate: typeof soundFX.celebrate === 'function',
      hasPop: typeof soundFX.pop === 'function',
      hasNotification: typeof soundFX.notification === 'function'
    };
  });
  console.log('soundFX methods inspection:', soundFxMethods);
  if (!soundFxMethods.hasTap || !soundFxMethods.hasBellChime || !soundFxMethods.hasComplete || !soundFxMethods.hasCelebrate) {
    throw new Error('soundFX missing required methods: ' + JSON.stringify(soundFxMethods));
  }

  // Safely invoke soundFX methods in page to ensure they run with zero errors
  await page.evaluate(() => {
    soundFX.tap();
    soundFX.bellChime();
    soundFX.complete();
    soundFX.celebrate();
  });
  console.log('soundFX invocation executed smoothly without throws.');

  console.log('\n--- 2. Testing Today Dashboard #dashWorkoutStartBtn ---');
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 400));
  
  const startBtnExists = await page.$('#dashWorkoutStartBtn');
  console.log('#dashWorkoutStartBtn exists:', !!startBtnExists);
  await page.click('#dashWorkoutStartBtn');
  await new Promise(r => setTimeout(r, 500));

  const activeViewAfterStart = await page.evaluate(() => {
    const active = document.querySelector('.view.active');
    return active ? active.id : null;
  });
  console.log('Active view after #dashWorkoutStartBtn:', activeViewAfterStart);
  if (activeViewAfterStart !== 'view-workouts') {
    throw new Error(`Expected view-workouts after clicking start button, got ${activeViewAfterStart}`);
  }

  console.log('\n--- 3. Testing Today Dashboard #dashViewAllActivityBtn ---');
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 400));

  const viewAllBtnExists = await page.$('#dashViewAllActivityBtn');
  console.log('#dashViewAllActivityBtn exists:', !!viewAllBtnExists);
  await page.click('#dashViewAllActivityBtn');
  await new Promise(r => setTimeout(r, 500));

  const activeViewAfterActivity = await page.evaluate(() => {
    const active = document.querySelector('.view.active');
    return active ? active.id : null;
  });
  console.log('Active view after #dashViewAllActivityBtn:', activeViewAfterActivity);
  if (activeViewAfterActivity !== 'view-activity') {
    throw new Error(`Expected view-activity after clicking view all activity, got ${activeViewAfterActivity}`);
  }

  console.log('\n--- 4. Testing AI Coach /boost and /goal ---');
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 500));

  // Type /goal and send
  await page.type('#coachChatInput', '/goal');
  await page.click('#coachChatSendBtn');
  await new Promise(r => setTimeout(r, 600));

  const bodyModalOpen = await page.evaluate(() => {
    const m = document.querySelector('#bodyAnalysisModal');
    return m && m.classList.contains('open');
  });
  console.log('After /goal: bodyAnalysisModal is open:', bodyModalOpen);
  if (!bodyModalOpen) {
    throw new Error('Expected #bodyAnalysisModal to open after /goal command');
  }
  // Dismiss modal so input is clear
  await page.evaluate(() => closeModal(document.querySelector('#bodyAnalysisModal')));
  await new Promise(r => setTimeout(r, 400));

  // Type /boost and send
  await page.type('#coachChatInput', '/boost');
  await page.click('#coachChatSendBtn');
  await new Promise(r => setTimeout(r, 1600));

  const activeViewAfterBoost = await page.evaluate(() => {
    const active = document.querySelector('.view.active');
    return active ? active.id : null;
  });
  console.log('Active view after /boost (launches posture):', activeViewAfterBoost);
  if (activeViewAfterBoost !== 'view-posture') {
    throw new Error(`Expected view-posture after /boost, got ${activeViewAfterBoost}`);
  }

  console.log('\n--- 5. Testing Coach Plan Buttons ---');
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 400));

  // 5a. #coachPlanAddToWorkoutBtn
  await page.click('#coachPlanAddToWorkoutBtn');
  await new Promise(r => setTimeout(r, 500));
  const activeViewAfterAddToWorkouts = await page.evaluate(() => {
    const active = document.querySelector('.view.active');
    const title = document.querySelector('#planWorkoutTitle')?.textContent;
    return { id: active ? active.id : null, title };
  });
  console.log('After #coachPlanAddToWorkoutBtn:', activeViewAfterAddToWorkouts);
  if (activeViewAfterAddToWorkouts.id !== 'view-workouts') {
    throw new Error('Expected view-workouts after adding coach plan');
  }

  // 5b. #coachPlanInspectFormBtn
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 400));
  await page.click('#coachPlanInspectFormBtn');
  await new Promise(r => setTimeout(r, 500));
  const activeViewAfterInspectForm = await page.evaluate(() => {
    const active = document.querySelector('.view.active');
    return active ? active.id : null;
  });
  console.log('After #coachPlanInspectFormBtn:', activeViewAfterInspectForm);
  if (activeViewAfterInspectForm !== 'view-posture') {
    throw new Error('Expected view-posture after coach form inspection');
  }

  // 5c. #coachPlanModifyVolBtn
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 400));
  await page.click('#coachPlanModifyVolBtn');
  await new Promise(r => setTimeout(r, 500));
  const quickModalOpen = await page.evaluate(() => {
    const m = document.querySelector('#quickOptionsModal');
    return m && m.classList.contains('open');
  });
  console.log('After #coachPlanModifyVolBtn: quickOptionsModal is open:', quickModalOpen);
  if (!quickModalOpen) {
    throw new Error('Expected #quickOptionsModal to be open after modify volume click');
  }
  // Close quick modal
  await page.evaluate(() => closeModal(document.querySelector('#quickOptionsModal')));
  await new Promise(r => setTimeout(r, 300));

  console.log('\n--- 6. Testing #postureExerciseSelect Dynamic UI Adaptations ---');
  await page.evaluate(() => switchView('posture'));
  await new Promise(r => setTimeout(r, 400));

  // Test selecting 'lunge'
  await page.select('#postureExerciseSelect', 'lunge');
  await new Promise(r => setTimeout(r, 300));
  const lungeState = await page.evaluate(() => {
    return {
      exercise: window.postureExercise || document.querySelector('#postureExerciseSelect')?.value,
      badge: document.querySelector('#postureExerciseBadge')?.textContent,
      guideSnippet: document.querySelector('#postureGuideText')?.textContent?.trim().slice(0, 40)
    };
  });
  console.log('Posture state after selecting lunge:', lungeState);
  if (lungeState.exercise !== 'lunge' || !lungeState.badge.includes('Lunge')) {
    throw new Error('Posture exercise guide failed to update for lunge');
  }

  // Test selecting 'pushup'
  await page.select('#postureExerciseSelect', 'pushup');
  await new Promise(r => setTimeout(r, 300));
  const pushupState = await page.evaluate(() => {
    return {
      exercise: window.postureExercise || document.querySelector('#postureExerciseSelect')?.value,
      badge: document.querySelector('#postureExerciseBadge')?.textContent,
      guideSnippet: document.querySelector('#postureGuideText')?.textContent?.trim().slice(0, 40)
    };
  });
  console.log('Posture state after selecting pushup:', pushupState);
  if (pushupState.exercise !== 'pushup' || !pushupState.badge.includes('Push-Up')) {
    throw new Error('Posture exercise guide failed to update for pushup');
  }

  console.log('\n--- 7. Testing Settings -> Customization and Save Customization ---');
  // Open Settings modal
  await page.evaluate(() => openModal('#settingsModal'));
  await new Promise(r => setTimeout(r, 400));

  // Click #settingsGoToCustomizationBtn -> triggers soundFX.tap()
  await page.click('#settingsGoToCustomizationBtn');
  await new Promise(r => setTimeout(r, 500));

  const activeViewAfterSettingsNav = await page.evaluate(() => {
    const active = document.querySelector('.view.active');
    return active ? active.id : null;
  });
  console.log('Active view after settings customization nav:', activeViewAfterSettingsNav);
  if (activeViewAfterSettingsNav !== 'view-customization') {
    throw new Error('Expected view-customization after settings navigation');
  }

  // Click #saveCustomizationBtn -> triggers soundFX.complete()
  await page.click('#saveCustomizationBtn');
  await new Promise(r => setTimeout(r, 400));
  console.log('Successfully saved customization without errors.');

  console.log('\n--- 8. Verifying 0 Uncaught Errors in Browser ---');
  console.log('Uncaught page errors count:', uncaughtExceptions.length);
  console.log('Console errors count:', consoleErrors.length);
  if (uncaughtExceptions.length > 0) {
    throw new Error('Found uncaught exceptions: ' + JSON.stringify(uncaughtExceptions));
  }
  if (consoleErrors.length > 0) {
    throw new Error('Found browser console errors: ' + JSON.stringify(consoleErrors));
  }

  console.log('\n--- 9. Capturing Verification Screenshots ---');
  const shotsDir = path.join(__dirname, '..', 'brain_verify');
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

  const artifactDirs = [
    shotsDir,
    'C:\\Users\\pandi\\.gemini\\antigravity\\brain\\d22a54bb-6331-45b2-8bcf-1c9b6f6e91a7',
    'C:\\Users\\pandi\\.gemini\\antigravity\\brain\\eb8ed369-d3cf-459b-8060-0898be809b6e'
  ];

  // Save posture view screenshot
  await page.evaluate(() => switchView('posture'));
  await new Promise(r => setTimeout(r, 400));
  const postureShotBuffer = await page.screenshot({ fullPage: false });

  // Save coach view screenshot
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 400));
  const coachShotBuffer = await page.screenshot({ fullPage: false });

  // Save today view screenshot
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 400));
  const todayShotBuffer = await page.screenshot({ fullPage: false });

  for (const d of artifactDirs) {
    try {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      fs.writeFileSync(path.join(d, 'verification_posture_v750.png'), postureShotBuffer);
      fs.writeFileSync(path.join(d, 'verification_coach_v750.png'), coachShotBuffer);
      fs.writeFileSync(path.join(d, 'verification_today_v750.png'), todayShotBuffer);
      console.log('Saved verification screenshots to:', d);
    } catch (e) {
      console.warn('Could not write to artifact dir:', d, e.message);
    }
  }

  await browser.close();
  console.log('\n=== ALL DEEP VERIFICATION CHECKS PASSED PERFECTLY (0 ERRORS) ===');
})();
