const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1. Switch to Challenge View
  console.log('Switching to Challenge view...');
  await page.evaluate(() => switchView('challenge'));
  await new Promise(r => setTimeout(r, 400));

  // 2. Open Motive Modal
  console.log('Opening Challenge Motive modal...');
  await page.evaluate(() => openModal('#challengeMotiveModal'));
  await new Promise(r => setTimeout(r, 400));

  // Select "Build Muscle & Hypertrophy"
  console.log('Selecting Motive: Build Muscle & Hypertrophy...');
  await page.click('#motiveOptionsList .setup-choice-card[data-motive*="Muscle"]');
  await new Promise(r => setTimeout(r, 200));

  const motiveSelected = await page.evaluate(() => {
    const card = document.querySelector('#motiveOptionsList .setup-choice-card[data-motive*="Muscle"]');
    return card ? card.classList.contains('selected') : false;
  });
  console.log('Motive card selected:', motiveSelected);

  const step1Screenshot = path.join(__dirname, '../test_screenshots/challenge_step1_motive.png');
  await page.screenshot({ path: step1Screenshot });
  console.log('Saved step 1 screenshot.');

  // Click Next to Preferences
  console.log('Clicking Next: Training Preferences...');
  await page.click('#proceedToPrefsBtn');
  await new Promise(r => setTimeout(r, 500));

  // Step 2: Test Workout Types
  console.log('Testing Home Workout selection...');
  await page.click('#chTypesOptionsList label:nth-child(2)'); // Click Home
  await new Promise(r => setTimeout(r, 200));

  // Step 2: Test Minutes (Time) selection: Click 20 min then 60 min
  console.log('Clicking 20 min...');
  await page.click('#chTimeOptionsList button[data-minutes="20"]');
  await new Promise(r => setTimeout(r, 200));

  console.log('Clicking 60 min...');
  await page.click('#chTimeOptionsList button[data-minutes="60"]');
  await new Promise(r => setTimeout(r, 200));

  const timeCheck = await page.evaluate(() => {
    const b20 = document.querySelector('#chTimeOptionsList button[data-minutes="20"]');
    const b60 = document.querySelector('#chTimeOptionsList button[data-minutes="60"]');
    return {
      b20Selected: b20.classList.contains('selected'),
      b60Selected: b60.classList.contains('selected')
    };
  });
  console.log('Time buttons state:', timeCheck);

  // Step 2: Test Intensity selection: Click Mild then Hard
  console.log('Clicking Mild...');
  await page.click('#chIntensityOptionsList button[data-intensity="Mild"]');
  await new Promise(r => setTimeout(r, 200));

  console.log('Clicking Hard...');
  await page.click('#chIntensityOptionsList button[data-intensity="Hard"]');
  await new Promise(r => setTimeout(r, 200));

  const intCheck = await page.evaluate(() => {
    const mild = document.querySelector('#chIntensityOptionsList button[data-intensity="Mild"]');
    const hard = document.querySelector('#chIntensityOptionsList button[data-intensity="Hard"]');
    return {
      mildSelected: mild.classList.contains('selected'),
      hardSelected: hard.classList.contains('selected')
    };
  });
  console.log('Intensity buttons state:', intCheck);

  const step2Screenshot = path.join(__dirname, '../test_screenshots/challenge_step2_prefs.png');
  await page.screenshot({ path: step2Screenshot });
  console.log('Saved step 2 screenshot.');

  // Click Next to Duration
  console.log('Clicking Next: Select Duration...');
  await page.click('#proceedToDurationBtn');
  await new Promise(r => setTimeout(r, 500));

  const previewText = await page.evaluate(() => {
    const el = document.getElementById('challengeMetricsPreview');
    return el ? el.textContent.trim() : '';
  });
  console.log('Preview Summary in Step 3:', previewText);

  // Step 3: Test Duration Cards
  console.log('Clicking 10 Days Blitz...');
  await page.click('#durationOptionsList .setup-choice-card[data-days="10"]');
  await new Promise(r => setTimeout(r, 200));

  console.log('Clicking 25 Days Transformation...');
  await page.click('#durationOptionsList .setup-choice-card[data-days="25"]');
  await new Promise(r => setTimeout(r, 200));

  console.log('Clicking 30 Days Mastery...');
  await page.click('#durationOptionsList .setup-choice-card[data-days="30"]');
  await new Promise(r => setTimeout(r, 200));

  const durationCheck = await page.evaluate(() => {
    const d10 = document.querySelector('#durationOptionsList .setup-choice-card[data-days="10"]');
    const d25 = document.querySelector('#durationOptionsList .setup-choice-card[data-days="25"]');
    const d30 = document.querySelector('#durationOptionsList .setup-choice-card[data-days="30"]');
    return {
      d10Selected: d10.classList.contains('selected'),
      d25Selected: d25.classList.contains('selected'),
      d30Selected: d30.classList.contains('selected')
    };
  });
  console.log('Duration cards state:', durationCheck);

  const step3Screenshot = path.join(__dirname, '../test_screenshots/challenge_step3_duration.png');
  await page.screenshot({ path: step3Screenshot });
  console.log('Saved step 3 screenshot.');

  // Click Generate AI Plan
  console.log('Clicking Generate AI Plan...');
  await page.click('#generateChallengePlanBtn');
  await new Promise(r => setTimeout(r, 2000));

  const planInfo = await page.evaluate(() => {
    const active = window.activeChallengePlan;
    if (!active) return { exists: false };
    return {
      exists: true,
      totalDays: active.days?.length,
      durationDays: active.durationDays,
      motive: active.motive,
      intensity: active.intensity,
      dailyMinutes: active.dailyMinutes,
      types: active.types
    };
  });
  console.log('Generated AI Plan info:', planInfo);

  const step4Screenshot = path.join(__dirname, '../test_screenshots/challenge_step4_generated_plan.png');
  await page.screenshot({ path: step4Screenshot });
  console.log('Saved step 4 screenshot.');

  await browser.close();
  console.log('Test completed successfully.');
})();
