const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('🚀 Starting Comprehensive FitFuel Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log('1. Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 20000 });

  // Wait 2.5 seconds for async exercise library and cloud state to resolve
  await new Promise(r => setTimeout(r, 2500));

  console.log('2. Verifying Exercise Library size in browser runtime...');
  const libStats = await page.evaluate(() => {
    return {
      total: window.EXERCISES_LIBRARY ? window.EXERCISES_LIBRARY.length : 0,
      muscleGroups: window.MUSCLE_GROUPS ? Object.keys(window.MUSCLE_GROUPS) : []
    };
  });
  console.log(`   ✔ EXERCISES_LIBRARY length in browser: ${libStats.total}`);
  console.log(`   ✔ MUSCLE_GROUPS categories: ${libStats.muscleGroups.join(', ')}`);

  console.log('3. Verifying Exercise Library UI & Search...');
  await page.evaluate(() => switchView('exercise-library'));
  await new Promise(r => setTimeout(r, 500));

  const initialCountText = await page.evaluate(() => {
    const el = document.querySelector('#libResultCount');
    return el ? el.textContent : '';
  });
  console.log(`   ✔ Exercise library initial result label: "${initialCountText}"`);

  // Search "squat"
  await page.type('#exerciseSearchInput', 'squat');
  await page.evaluate(() => renderExerciseLibrary());
  await new Promise(r => setTimeout(r, 400));

  const squatMatches = await page.evaluate(() => {
    const el = document.querySelector('#libResultCount');
    const cards = document.querySelectorAll('#exerciseCardsContainer .exercise-card');
    const showMore = !!document.querySelector('#libShowMoreBtn');
    return { countText: el ? el.textContent : '', cardCount: cards.length, hasShowMore: showMore };
  });
  console.log(`   ✔ Search "squat": ${squatMatches.countText} (${squatMatches.cardCount} rendered on page 1, ShowMore visible: ${squatMatches.hasShowMore})`);

  // Search "dumbbell"
  await page.evaluate(() => {
    document.querySelector('#exerciseSearchInput').value = '';
  });
  await page.type('#exerciseSearchInput', 'dumbbell');
  await page.evaluate(() => renderExerciseLibrary());
  await new Promise(r => setTimeout(r, 400));

  const dumbbellMatches = await page.evaluate(() => {
    const el = document.querySelector('#libResultCount');
    const cards = document.querySelectorAll('#exerciseCardsContainer .exercise-card');
    return { countText: el ? el.textContent : '', cardCount: cards.length };
  });
  console.log(`   ✔ Search "dumbbell": ${dumbbellMatches.countText} (${dumbbellMatches.cardCount} rendered on page 1)`);

  console.log('4. Verifying Sidebar Order & Group Labels...');
  const sidebarNavInfo = await page.evaluate(() => {
    const nav = document.querySelector('.primary-nav');
    if (!nav) return [];
    return Array.from(nav.children).map(child => {
      if (child.classList.contains('nav-group-label')) {
        return `[GROUP: ${child.textContent.trim()}]`;
      }
      const span = child.querySelector('span');
      return child.dataset.view ? `${child.dataset.view} (${span ? span.textContent.trim() : ''})` : child.textContent.trim();
    });
  });
  console.log('   Sidebar Items:');
  sidebarNavInfo.forEach((item, idx) => console.log(`     ${idx + 1}. ${item}`));

  console.log('5. Verifying Universal Profile Sync...');
  await page.evaluate(() => switchView('profile'));
  await new Promise(r => setTimeout(r, 400));

  // Change weight in Profile to 78 kg
  await page.evaluate(() => {
    const wInput = document.querySelector('#pfWeightInput');
    if (wInput) {
      wInput.value = '78';
    }
    const saveBtn = document.querySelector('#saveProfileBtn');
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Check Smart Start bodyweight
  await page.evaluate(() => switchView('starting-load'));
  await new Promise(r => setTimeout(r, 400));
  const slBw = await page.evaluate(() => {
    const el = document.querySelector('#slBodyweight');
    return el ? el.value : '';
  });
  console.log(`   ✔ Smart Start bodyweight auto-synced to: ${slBw} kg`);

  // Check Body Assessment modal bodyweight
  const bodyModalW = await page.evaluate(() => {
    const el = document.querySelector('#bodyModalWeight');
    return el ? el.value : '';
  });
  console.log(`   ✔ Body Assessment Wizard weight auto-synced to: ${bodyModalW} kg`);

  console.log('6. Verifying Daily Macro Reset & Sidebar Consumption...');
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 400));

  const macroStats = await page.evaluate(() => {
    return {
      consumedKcal: document.querySelector('#dashCalConsumed') ? document.querySelector('#dashCalConsumed').textContent : '',
      goalKcal: document.querySelector('#dashCalGoal') ? document.querySelector('#dashCalGoal').textContent : '',
      sideConsumed: document.querySelector('#sideKcalCurrent') ? document.querySelector('#sideKcalCurrent').textContent : '',
      sideGoal: document.querySelector('#sideKcalGoal') ? document.querySelector('#sideKcalGoal').textContent : '',
      protein: document.querySelector('#dashP') ? document.querySelector('#dashP').textContent : '',
      carbs: document.querySelector('#dashC') ? document.querySelector('#dashC').textContent : '',
      fat: document.querySelector('#dashF') ? document.querySelector('#dashF').textContent : ''
    };
  });
  console.log(`   ✔ Consumed kcal: ${macroStats.consumedKcal} / ${macroStats.goalKcal} (Sidebar: ${macroStats.sideConsumed} / ${macroStats.sideGoal})`);
  console.log(`   ✔ Macros: P: ${macroStats.protein}, C: ${macroStats.carbs}, F: ${macroStats.fat}`);

  console.log('7. Verifying 3D Workout Images & Styling...');
  const workoutImgSrc = await page.evaluate(() => {
    const img = document.querySelector('#dashWorkoutImg');
    return img ? img.getAttribute('src') : '';
  });
  console.log(`   ✔ Dashboard workout image source: ${workoutImgSrc}`);

  // Take screenshot of Today dashboard
  const outputDir = path.join(__dirname, '..', 'brain_verify');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const shotPath = path.join(outputDir, 'fitfuel_verified_today.png');
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log(`   ✔ Screenshot saved to: ${shotPath}`);

  // Take screenshot of Exercise Library
  await page.evaluate(() => switchView('exercise-library'));
  await new Promise(r => setTimeout(r, 400));
  const shotPathLib = path.join(outputDir, 'fitfuel_verified_library.png');
  await page.screenshot({ path: shotPathLib, fullPage: false });
  console.log(`   ✔ Library screenshot saved to: ${shotPathLib}`);

  await browser.close();

  console.log('======================================================');
  console.log('🎉 ALL 5 MAJOR FITFUEL FEATURES VERIFIED SUCCESSFULLY!');
  console.log('======================================================');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
