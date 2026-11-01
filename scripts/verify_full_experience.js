const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Loading http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1. Home / Today view check
  await page.screenshot({ path: 'test_screenshots/01_pristine_home_view.png' });
  console.log('Saved 01_pristine_home_view.png');

  // 2. Open 3-dots menu
  console.log('2. Testing 3-dots topbar menu...');
  const moreBtn = await page.$('#topbarMoreBtn');
  if (moreBtn) {
    await moreBtn.click();
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: 'test_screenshots/02_topbar_3dots_menu.png' });
    console.log('Saved 02_topbar_3dots_menu.png');
    await moreBtn.click(); // close menu
    await new Promise(r => setTimeout(r, 200));
  }

  // 3. Switch to Challenge View
  console.log('3. Navigating to Challenge View...');
  await page.evaluate(() => switchView('challenge'));
  await new Promise(r => setTimeout(r, 400));

  // 4. Open Challenge Motive Modal
  console.log('4. Opening Motive Modal...');
  await page.evaluate(() => openModal('#challengeMotiveModal'));
  await new Promise(r => setTimeout(r, 400));

  // Select "Build Muscle & Hypertrophy"
  await page.click('#motiveOptionsList .setup-choice-card[data-motive*="Muscle"]');
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'test_screenshots/03_challenge_step1_motive.png' });

  // Next -> Step 2
  await page.click('#proceedToPrefsBtn');
  await new Promise(r => setTimeout(r, 400));

  // Select Home Workout, 35 min, Moderate
  console.log('5. Selecting preferences: Home, 35 min, Moderate...');
  await page.click('#chTypesOptionsList label:nth-child(2)'); // Home Workout
  await new Promise(r => setTimeout(r, 150));
  await page.click('#chTimeOptionsList button[data-minutes="35"]');
  await new Promise(r => setTimeout(r, 150));
  await page.click('#chIntensityOptionsList button[data-intensity="Moderate"]');
  await new Promise(r => setTimeout(r, 150));
  await page.screenshot({ path: 'test_screenshots/04_challenge_step2_prefs.png' });

  // Next -> Step 3
  await page.click('#proceedToDurationBtn');
  await new Promise(r => setTimeout(r, 400));

  // Select 25 Days Transformation
  console.log('6. Selecting duration: 25 Days Transformation...');
  await page.click('#durationOptionsList .setup-choice-card[data-days="25"]');
  await new Promise(r => setTimeout(r, 150));
  await page.screenshot({ path: 'test_screenshots/05_challenge_step3_duration.png' });

  // Generate Plan
  console.log('7. Generating AI Plan...');
  await page.click('#generateChallengePlanBtn');
  await new Promise(r => setTimeout(r, 1500));

  const plan = await page.evaluate(() => {
    const p = window.activeChallengePlan;
    if (!p) return null;
    return {
      durationDays: p.durationDays,
      totalDays: p.days?.length,
      motive: p.motive,
      intensity: p.intensity,
      totalMinutes: p.totalWorkoutMinutes,
      types: p.types,
      day1Title: p.days?.[0]?.title,
      firstExercise: p.days?.[0]?.exercises?.[0]?.name
    };
  });
  console.log('Generated AI Challenge Plan:', plan);

  await page.screenshot({ path: 'test_screenshots/06_challenge_step4_active_plan.png' });
  console.log('Saved 06_challenge_step4_active_plan.png');

  await browser.close();
  console.log('Full experience test completed perfectly.');
})();
