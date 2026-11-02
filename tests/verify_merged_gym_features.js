const puppeteer = require('puppeteer');
const assert = require('assert');

async function testMergedFeatures() {
  console.log('=== VERIFYING MERGED GYM FEATURES & BETA ACCESS CONTROL ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 1. Visit homepage
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    // Clear any admin flags so we test as a standard unapproved regular member
    await page.evaluate(() => {
      localStorage.setItem('fitfuel_beta_demo_admin', 'false');
      localStorage.removeItem('ff_token');
      window.isBetaDemoAdminMode = false;
      window.unlockedBetaFeatures = {};
    });

    console.log('[TEST 1] Verifying Pre-Existing Features are 100% open to regular members:');

    // 1a. Exercise Library (Training)
    await page.evaluate(() => window.switchView('exercise-library'));
    await new Promise(r => setTimeout(r, 400));
    let activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-exercise-library');
    let hasContent = await page.$eval('#view-exercise-library', el => el.innerHTML.length > 500);
    assert(hasContent, 'Exercise library has full content');
    console.log('  [PASS] Training / Exercise Library is open and functional.');

    // 1b. Starting Load & 1RM
    await page.evaluate(() => window.switchView('starting-load'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-starting-load');
    console.log('  [PASS] Starting Load & 1RM calculator is open and functional.');

    // 1c. Gym Challenges
    await page.evaluate(() => window.switchView('challenge'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-challenge');
    console.log('  [PASS] Gym Challenges & Streaks is open and functional.');

    // 1d. Food Log (Nutrition)
    await page.evaluate(() => window.switchView('food-log'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-food-log');
    console.log('  [PASS] Food Log is open and functional.');

    // 1e. My Foods
    await page.evaluate(() => window.switchView('my-foods'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-my-foods');
    console.log('  [PASS] My Foods & Recipes is open and functional.');

    // 1f. Progress & Weight Tracking
    await page.evaluate(() => window.switchView('tracking'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-tracking');
    console.log('  [PASS] Progress Tracking is open and functional.');

    // 1g. GPS Outdoor Activity Tracker (Pre-existing regular feature)
    await page.evaluate(() => window.switchView('activity'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-activity');
    let isLocked = await page.$eval('#view-activity', el => el.innerHTML.includes('beta-locked-card'));
    assert(!isLocked, 'GPS Activity MUST NOT be locked out for regular members!');
    console.log('  [PASS] GPS Activity Tracker is open and NOT locked.');

    // 1h. 3D Body Analysis & Anthropometrics (Pre-existing regular feature)
    await page.evaluate(() => window.switchView('body-analysis'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-body-analysis');
    isLocked = await page.$eval('#view-body-analysis', el => el.innerHTML.includes('beta-locked-card'));
    assert(!isLocked, '3D Body Analysis MUST NOT be locked out for regular members!');
    console.log('  [PASS] 3D Body Analysis is open and NOT locked.');

    // 1i. Member Profile, Plans, Attendance, QR Pass, Trainer Booking
    await page.evaluate(() => window.switchView('profile'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-profile');
    const profileHtml = await page.$eval('#view-profile', el => el.innerHTML);
    assert(profileHtml.includes('Personal Plan'), 'Profile contains Member Plan card');
    assert(profileHtml.includes('ATTENDANCE'), 'Profile contains Attendance card');
    assert(profileHtml.includes('QR Turnstile Pass'), 'Profile contains Turnstile Pass card');
    assert(profileHtml.includes('Trainer Session Booking'), 'Profile contains Trainer Booking card');
    console.log('  [PASS] Member Plans, Attendance, QR Turnstile Pass, and Trainer Booking cards present.');

    console.log('\n[TEST 2] Verifying Gated Beta Features show Informative Preview Cards (Never Blank):');

    // 2a. Gated view: posture
    await page.evaluate(() => window.switchView('posture'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-posture');
    let postureContent = await page.$eval('#view-posture', el => el.innerHTML);
    assert(postureContent.length > 300, 'Posture view is NOT blank');
    assert(postureContent.includes('AI Camera Form Checker'), 'Informative title shown');
    assert(postureContent.includes('Apply for Beta Access'), 'Apply for Beta Access button shown');
    assert(postureContent.includes('hub-subnav-bar'), 'Hub subnav bar is included for navigation');
    console.log('  [PASS] Posture view displays informative preview card with Apply button (no blank container).');

    // 2b. Gated view: wearables
    await page.evaluate(() => window.switchView('wearables'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-wearables');
    let wearablesContent = await page.$eval('#view-wearables', el => el.innerHTML);
    assert(wearablesContent.length > 300, 'Wearables view is NOT blank');
    let wearablesTitle = await page.$eval('#view-wearables h2', el => el.textContent.trim());
    assert(wearablesTitle.includes('Apple Watch & Whoop BLE Sync'), 'Informative title shown');
    assert(wearablesContent.includes('Apply for Beta Access'), 'Apply for Beta Access button shown');
    assert(wearablesContent.includes('hub-subnav-bar'), 'Hub subnav bar is included for navigation');
    console.log('  [PASS] Wearables view displays informative preview card with Apply button (no blank container).');

    // 2c. Gated view: meal-prep
    await page.evaluate(() => window.switchView('meal-prep'));
    await new Promise(r => setTimeout(r, 400));
    activeId = await page.$eval('.page-content .view.active', el => el.id);
    assert.strictEqual(activeId, 'view-meal-prep');
    let mealPrepContent = await page.$eval('#view-meal-prep', el => el.innerHTML);
    assert(mealPrepContent.length > 300, 'Meal prep view is NOT blank');
    let mealPrepTitle = await page.$eval('#view-meal-prep h2', el => el.textContent.trim());
    assert(mealPrepTitle.includes('AI Grocery & Meal Prep Generator'), 'Informative title shown');
    assert(mealPrepContent.includes('Apply for Beta Access'), 'Apply for Beta Access button shown');
    assert(mealPrepContent.includes('hub-subnav-bar'), 'Hub subnav bar is included for navigation');
    console.log('  [PASS] Meal prep view displays informative preview card with Apply button (no blank container).');

    console.log('\n[TEST 3] Verifying Seamless Unlock upon Approval:');

    // Unlock posture and wearables
    await page.evaluate(() => {
      window.unlockedBetaFeatures = {
        'formCorrectionAi': true,
        'wearableSync': true,
        'mealPlanAi': true
      };
      window.switchView('wearables');
    });
    await new Promise(r => setTimeout(r, 400));
    const unlockedWearables = await page.$eval('#view-wearables', el => el.innerHTML);
    assert(unlockedWearables.includes('LIVE HEART RATE TELEMETRY') || unlockedWearables.includes('152'), 'Unlocked wearables renders live telemetry');
    assert(unlockedWearables.includes('Report Beta Bug / Feedback'), 'Unlocked wearables has feedback button');
    console.log('  [PASS] Approved beta feature unlocks live telemetry HUD and feedback button.');

    console.log('\n[TEST 4] Verifying Service Worker & Cache Invalidation:');
    const swContent = await page.evaluate(async () => {
      const res = await fetch('/sw.js');
      return await res.text();
    });
    assert(swContent.includes('fitfuel-cache-v8.1.0-merged') || swContent.includes('fitfuel-cache-v8.0.0-merged'), 'Service worker has bumped cache version');
    assert(swContent.includes('Deleting obsolete cache'), 'Service worker deletes obsolete caches');
    console.log('  [PASS] Service worker cache-busting and obsolete cache deletion verified.');

    console.log('\n================================================================');
    console.log(' ALL MERGED GYM FEATURES & BETA ACCESS CONTROL CHECKS PASSED! ');
    console.log('================================================================');

  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testMergedFeatures();
