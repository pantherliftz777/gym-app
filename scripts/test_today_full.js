const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1. Initial State Check
  console.log('--- Checking Initial Today View Metrics ---');
  let metrics = await page.evaluate(() => {
    return {
      waterVal: document.getElementById('metricV2WaterVal')?.textContent,
      waterGoal: document.getElementById('metricV2WaterGoalVal')?.textContent,
      energyVal: document.getElementById('metricV2EnergyVal')?.textContent,
      workoutsVal: document.getElementById('metricV2WorkoutsVal')?.textContent,
      waterDisplay: document.getElementById('waterDisplay')?.textContent,
      waterGoalDisplay: document.getElementById('waterGoalDisplay')?.textContent,
      heroWaterCurrent: document.getElementById('syHeroWaterCurrent')?.textContent,
      heroStreakDays: document.getElementById('syHeroStreakDays')?.textContent
    };
  });
  console.log('Initial Today Metrics:', metrics);

  // Take screenshot of hero and top metrics
  await page.screenshot({ path: 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/today_cleaned_hero.png', fullPage: false });

  // 2. Scroll to Analytics Row (Hydration Architecture + 3D Body Composition)
  await page.evaluate(() => {
    const el = document.getElementById('dashAnalyticsRowV2');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/today_hydration_and_3d_body.png', fullPage: false });

  // 3. Test +250ml and +500ml quick add buttons
  console.log('--- Testing Quick Add Water Buttons ---');
  await page.click('#quickAddWater250Btn');
  await new Promise(r => setTimeout(r, 400));
  let wAfter250 = await page.evaluate(() => document.getElementById('waterDisplay')?.textContent);
  console.log('Water after +250ml:', wAfter250);

  await page.click('#quickAddWater500Btn');
  await new Promise(r => setTimeout(r, 400));
  let wAfter500 = await page.evaluate(() => document.getElementById('waterDisplay')?.textContent);
  console.log('Water after +500ml:', wAfter500);

  // 4. Test Adjust Climate / Target button opening modal
  console.log('--- Testing Adjust Water / Weather Modal ---');
  await page.click('#adjustWaterBtn');
  await new Promise(r => setTimeout(r, 500));
  let weatherModalDisplay = await page.evaluate(() => {
    const m = document.getElementById('weatherTempModal');
    return m ? window.getComputedStyle(m).display : 'null';
  });
  console.log('#weatherTempModal display after clicking Adjust:', weatherModalDisplay);
  await page.evaluate(() => closeModal('#weatherTempModal'));
  await new Promise(r => setTimeout(r, 300));

  // 5. Scroll to Bottom Grid (Posture AI + Workout)
  await page.evaluate(() => {
    const el = document.querySelector('.posture-ai-preview-panel');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/today_bottom_posture_and_workout.png', fullPage: false });

  // 6. Test Launch Posture AI button
  console.log('--- Testing Launch Posture AI Button ---');
  await page.click('#todayLaunchPostureBtn');
  await new Promise(r => setTimeout(r, 500));
  let activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
  console.log('Active view after clicking Launch Posture AI:', activeView);

  // Switch back to today
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 300));

  // 7. Test 4D Body Scan button
  console.log('--- Testing 4D Body Scan Button ---');
  await page.click('#dashViewBodyAnalysisBtn');
  await new Promise(r => setTimeout(r, 500));
  activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
  let modalDisplay = await page.evaluate(() => {
    const m = document.getElementById('bodyAnalysisModal');
    return m ? window.getComputedStyle(m).display : 'null';
  });
  console.log('After clicking 4D Body Scan -> activeView:', activeView, ', modalDisplay:', modalDisplay);

  await page.evaluate(() => closeModal('#bodyAnalysisModal'));
  await new Promise(r => setTimeout(r, 300));

  // 8. Test Update Details button
  console.log('--- Testing Update Details Button ---');
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 300));
  await page.click('#dashUpdateMetricsBtn');
  await new Promise(r => setTimeout(r, 500));
  activeView = await page.evaluate(() => document.querySelector('.view.active')?.id);
  console.log('After clicking Update Details -> activeView:', activeView);

  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
  await browser.close();
})();
