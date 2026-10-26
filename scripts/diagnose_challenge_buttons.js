const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.EXERCISES_LIBRARY && window.EXERCISES_LIBRARY.length >= 1300);

    console.log('Navigating to Challenge view with NO active challenge...');
    await page.evaluate(() => {
      window.activeChallengePlan = null;
      if (typeof store !== 'undefined') store.del('activeChallengePlan');
      if (typeof switchView === 'function') switchView('challenge');
      if (typeof renderChallengeView === 'function') renderChallengeView();
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('1. Checking "Start Your Challenge Now" button...');
    const emptyBtn = await page.evaluate(() => {
      const btn = document.querySelector('#challengeViewContainer button.solid-button');
      return btn ? btn.textContent.trim() : null;
    });
    console.log('Empty state button text:', emptyBtn);

    // Click "Start Your Challenge Now"
    await page.evaluate(() => {
      const btn = document.querySelector('#challengeViewContainer button.solid-button');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const modal1Open = await page.evaluate(() => {
      const m = document.getElementById('challengeMotiveModal');
      return m ? m.classList.contains('open') : false;
    });
    console.log('Step 1 Motive Modal opened?', modal1Open);

    // Click Next: Training Preferences
    console.log('2. Clicking "Next: Training Preferences"...');
    await page.evaluate(() => {
      const btn = document.getElementById('proceedToPrefsBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const modal2Open = await page.evaluate(() => {
      const m = document.getElementById('challengePrefsModal');
      return m ? m.classList.contains('open') : false;
    });
    console.log('Step 2 Prefs Modal opened?', modal2Open);

    // Click Next: Select Duration
    console.log('3. Clicking "Next: Select Duration"...');
    await page.evaluate(() => {
      const btn = document.getElementById('proceedToDurationBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const modal3Open = await page.evaluate(() => {
      const m = document.getElementById('challengeDurationModal');
      return m ? m.classList.contains('open') : false;
    });
    console.log('Step 3 Duration Modal opened?', modal3Open);

    // Click Generate AI Plan
    console.log('4. Clicking "Generate AI Plan"...');
    await page.evaluate(() => {
      const btn = document.getElementById('generateChallengePlanBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const planCreated = await page.evaluate(() => {
      const title = document.querySelector('#challengeViewContainer h2');
      return title ? title.textContent.trim() : null;
    });
    console.log('Active challenge created title:', planCreated);

    // Test "Start Today's Workout" button
    console.log('5. Clicking "Start Today\'s Workout"...');
    await page.evaluate(() => {
      const btn = document.getElementById('startActiveSessionBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const sessionModalOpen = await page.evaluate(() => {
      const m = document.getElementById('workoutSessionModal');
      return m ? m.classList.contains('open') : false;
    });
    console.log('Workout Session Modal opened?', sessionModalOpen);

    // Close session modal
    await page.evaluate(() => {
      if (typeof closeModal === 'function') closeModal('#workoutSessionModal');
    });
    await new Promise(r => setTimeout(r, 400));

    // Test "Swap Workout" button
    console.log('6. Clicking "Swap Workout"...');
    await page.evaluate(() => {
      const swapBtn = document.querySelector('.swap-ex-trigger');
      if (swapBtn) swapBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const swapOpen = await page.evaluate(() => {
      const m = document.getElementById('swapExerciseModal');
      return m ? m.classList.contains('open') : false;
    });
    console.log('Swap Modal opened?', swapOpen);

    // Test Select & Replace button in swap modal
    console.log('7. Testing "Select & Replace" in Swap Modal...');
    const replaceResult = await page.evaluate(() => {
      const replaceBtn = document.querySelector('#swapAlternativesList .replace-ex-btn');
      if (replaceBtn) {
        const exName = replaceBtn.dataset.exName;
        replaceBtn.click();
        return { clicked: true, exName };
      }
      return { clicked: false };
    });
    console.log('Replace button clicked:', replaceResult);
    await new Promise(r => setTimeout(r, 600));

    // Test "Refresh Day Plan" button
    console.log('8. Clicking "Refresh Day Plan"...');
    await page.evaluate(() => {
      const btn = document.getElementById('refreshTodayRoutineBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Test "Reset to Day 1" button
    console.log('9. Clicking "Reset to Day 1"...');
    // Mock confirm to return true
    await page.evaluate(() => {
      window.confirm = () => true;
      const btn = document.getElementById('resetChallengePlanBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Test "Exit Challenge" button
    console.log('10. Clicking "Exit Challenge"...');
    await page.evaluate(() => {
      window.confirm = () => true;
      const btn = document.getElementById('exitChallengePlanBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const exited = await page.evaluate(() => {
      const h3 = document.querySelector('.challenge-empty-title');
      return h3 ? h3.textContent.trim() : null;
    });
    console.log('Exited to empty state?', exited);

  } catch (err) {
    console.error('Diagnosis error:', err);
  } finally {
    await browser.close();
  }
})();
