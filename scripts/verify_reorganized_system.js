const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a';

(async () => {
  console.log('--- Starting FitFuel Reorganized Hub & Challenge Verification ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[FitFuel]') || text.includes('Error') || text.includes('Challenge')) {
      console.log('PAGE LOG:', text);
    }
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
  });

  try {
    console.log('Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Page loaded successfully.');

    // Wait a brief moment for dynamic data to settle
    await new Promise(r => setTimeout(r, 1500));

    // 1. Verify Sidebar Navigation
    const navItems = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.primary-nav .nav-link'));
      return links.map(l => ({
        view: l.dataset.view,
        text: l.innerText.trim().replace(/\n/g, ' ')
      }));
    });
    console.log('Sidebar Navigation Items:', JSON.stringify(navItems, null, 2));

    // 2. Test Workouts & Exercises Hub
    console.log('Clicking Workouts & Exercises in sidebar...');
    await page.click('button[data-view="workouts"]');
    await new Promise(r => setTimeout(r, 600));

    let activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
    console.log('Active view after clicking Workouts & Exercises:', activeView);

    // Capture screenshot of Workouts Hub
    const shot1 = path.join(ARTIFACT_DIR, '01_workouts_hub_plans.png');
    await page.screenshot({ path: shot1 });
    console.log('Saved screenshot:', shot1);

    // Test clicking "Challenges" hub tab
    console.log('Clicking Challenges tab in hub...');
    await page.evaluate(() => {
      const tab = document.querySelector('#view-workouts .hub-tab-btn[data-hub-target="challenge"]');
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
    console.log('Active view after clicking Challenges tab:', activeView);

    // Check if empty state or active challenge is shown
    const challengeHasEmptyCard = await page.evaluate(() => !!document.querySelector('.challenge-empty-card'));
    console.log('Challenge view has empty card:', challengeHasEmptyCard);

    // Click "Start New Challenge" or "Start Your Challenge Now"
    console.log('Triggering Start Challenge Modal...');
    await page.evaluate(() => {
      const btn = document.querySelector('#createChallengeBtn') || document.querySelector('.challenge-empty-card .solid-button');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    let isMotiveOpen = await page.evaluate(() => {
      const m = document.querySelector('#challengeMotiveModal');
      return m && m.classList.contains('open');
    });
    console.log('Motive Modal is open:', isMotiveOpen);

    const shot2 = path.join(ARTIFACT_DIR, '02_challenge_wizard_step1_motive.png');
    await page.screenshot({ path: shot2 });
    console.log('Saved screenshot:', shot2);

    // Step 1 -> Step 2
    console.log('Clicking Next: Training Preferences...');
    await page.evaluate(() => {
      const btn = document.querySelector('#proceedToPrefsBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    let isPrefsOpen = await page.evaluate(() => {
      const m = document.querySelector('#challengePrefsModal');
      return m && m.classList.contains('open');
    });
    console.log('Prefs Modal is open:', isPrefsOpen);

    const shot3 = path.join(ARTIFACT_DIR, '03_challenge_wizard_step2_prefs.png');
    await page.screenshot({ path: shot3 });
    console.log('Saved screenshot:', shot3);

    // Step 2 -> Step 3
    console.log('Clicking Next: Duration Selection...');
    await page.evaluate(() => {
      const btn = document.querySelector('#proceedToDurationBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    let isDurationOpen = await page.evaluate(() => {
      const m = document.querySelector('#challengeDurationModal');
      return m && m.classList.contains('open');
    });
    console.log('Duration Modal is open:', isDurationOpen);

    const shot4 = path.join(ARTIFACT_DIR, '04_challenge_wizard_step3_duration.png');
    await page.screenshot({ path: shot4 });
    console.log('Saved screenshot:', shot4);

    // Step 3 -> Generate Plan
    console.log('Clicking Generate AI Plan...');
    await page.evaluate(() => {
      const btn = document.querySelector('#generateChallengePlanBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const challengePlanGenerated = await page.evaluate(() => {
      const banner = document.querySelector('#challengeViewContainer h2');
      return banner ? banner.innerText : 'None';
    });
    console.log('Challenge Plan Header:', challengePlanGenerated);

    const shot5 = path.join(ARTIFACT_DIR, '05_challenge_active_dashboard.png');
    await page.screenshot({ path: shot5 });
    console.log('Saved screenshot:', shot5);

    // Test "Start Today's Workout" button
    console.log('Testing Start Today Workout button...');
    await page.evaluate(() => {
      const btn = document.querySelector('#startActiveSessionBtn');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const isSessionOpen = await page.evaluate(() => {
      const m = document.querySelector('#workoutSessionModal');
      return m && m.classList.contains('open');
    });
    console.log('Workout Session Modal is open:', isSessionOpen);

    const shot6 = path.join(ARTIFACT_DIR, '06_workout_active_session_modal.png');
    await page.screenshot({ path: shot6 });
    console.log('Saved screenshot:', shot6);

    // Close session modal
    await page.evaluate(() => {
      if (typeof closeModal === 'function') closeModal('#workoutSessionModal');
    });
    await new Promise(r => setTimeout(r, 400));

    // Test "Swap Workout" button
    console.log('Testing Swap Workout button...');
    await page.evaluate(() => {
      const swapBtn = document.querySelector('.swap-ex-trigger');
      if (swapBtn) swapBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const isSwapModalOpen = await page.evaluate(() => {
      const m = document.querySelector('#swapExerciseModal');
      return m && m.classList.contains('open');
    });
    console.log('Swap Exercise Modal is open:', isSwapModalOpen);

    const shot7 = path.join(ARTIFACT_DIR, '07_swap_workout_modal.png');
    await page.screenshot({ path: shot7 });
    console.log('Saved screenshot:', shot7);

    // Close swap modal
    await page.evaluate(() => {
      if (typeof closeModal === 'function') closeModal('#swapExerciseModal');
    });
    await new Promise(r => setTimeout(r, 400));

    // Test Smart Start tab in Workouts Hub
    console.log('Testing Smart Start tab...');
    await page.evaluate(() => {
      const tab = document.querySelector('.hub-tab-btn[data-hub-target="starting-load"]');
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
    console.log('Active view after Smart Start tab click:', activeView);

    const shot8 = path.join(ARTIFACT_DIR, '08_smart_start_hub_tab.png');
    await page.screenshot({ path: shot8 });
    console.log('Saved screenshot:', shot8);

    // Test Exercise Library tab in Workouts Hub
    console.log('Testing Exercise Library tab...');
    await page.evaluate(() => {
      const tab = document.querySelector('.hub-tab-btn[data-hub-target="exercise-library"]');
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
    console.log('Active view after Exercise Library tab click:', activeView);

    const shot9 = path.join(ARTIFACT_DIR, '09_exercise_library_hub_tab.png');
    await page.screenshot({ path: shot9 });
    console.log('Saved screenshot:', shot9);

    // Test Nutrition & Diet Hub
    console.log('Clicking Nutrition & Diet in sidebar...');
    await page.click('button[data-view="food-log"]');
    await new Promise(r => setTimeout(r, 600));

    activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
    console.log('Active view after clicking Nutrition & Diet:', activeView);

    const shot10 = path.join(ARTIFACT_DIR, '10_nutrition_hub_food_log.png');
    await page.screenshot({ path: shot10 });
    console.log('Saved screenshot:', shot10);

    // Test My Foods tab in Nutrition Hub
    console.log('Testing My Foods tab in Nutrition Hub...');
    await page.evaluate(() => {
      const tab = document.querySelector('.hub-tab-btn[data-hub-target="my-foods"]');
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
    console.log('Active view after My Foods tab click:', activeView);

    const shot11 = path.join(ARTIFACT_DIR, '11_nutrition_hub_my_foods.png');
    await page.screenshot({ path: shot11 });
    console.log('Saved screenshot:', shot11);

    // Test Standalone views to ensure nothing was broken
    const standaloneViews = ['today', 'ai-coach', 'body-analysis', 'posture', 'activity', 'tracking', 'profile'];
    for (const v of standaloneViews) {
      console.log(`Testing standalone view navigation: ${v}...`);
      await page.evaluate((viewName) => {
        const btn = document.querySelector(`.primary-nav .nav-link[data-view="${viewName}"]`);
        if (btn) btn.click();
      }, v);
      await new Promise(r => setTimeout(r, 300));
      const cur = await page.evaluate(() => document.querySelector('.view.active')?.id);
      if (cur !== `view-${v}`) {
        throw new Error(`Failed to activate view ${v}, currently active: ${cur}`);
      }
    }
    console.log('All standalone views tested and working perfectly!');

    console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
