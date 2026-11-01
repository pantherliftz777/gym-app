const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Testing upgraded Workouts in Training section...');
  const artifactDir = path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Click Training in sidebar
  console.log('1. Clicking Training in sidebar...');
  await page.click('.primary-nav .nav-link[data-section="training"]');
  await new Promise(r => setTimeout(r, 600));

  const trainingState = await page.evaluate(() => {
    const activeView = document.querySelector('section.view.active');
    const subnavBtns = Array.from(activeView.querySelectorAll('.hub-subnav-btn')).map(b => ({
      text: b.querySelector('span')?.textContent.trim(),
      view: b.dataset.hubview,
      active: b.classList.contains('active')
    }));
    const heading = activeView.querySelector('h2')?.textContent.trim();
    const chips = Array.from(activeView.querySelectorAll('.workout-type-chip')).map(c => ({
      type: c.dataset.type,
      text: c.textContent.trim(),
      active: c.classList.contains('active')
    }));
    const muscleTabs = Array.from(activeView.querySelectorAll('#muscleTabs button')).map(b => b.textContent.trim());
    const cardCount = activeView.querySelectorAll('.exercise-card').length;

    return {
      activeViewId: activeView.id,
      heading,
      subnavBtns,
      chips,
      muscleTabs,
      cardCount
    };
  });

  console.log('Training Section State:', JSON.stringify(trainingState, null, 2));

  // Screenshot initial Workouts view
  await page.screenshot({ path: path.join(artifactDir, 'upgraded_workouts_01_all_types.png') });

  // 2. Click "Home Workout" chip (matching image 1)
  console.log('2. Clicking Home Workout chip...');
  await page.click('.workout-type-chip[data-type="home"]');
  await new Promise(r => setTimeout(r, 500));

  const homeChipState = await page.evaluate(() => {
    const activeChip = document.querySelector('.workout-type-chip.active')?.textContent.trim();
    const cardCount = document.querySelectorAll('#exerciseCardsContainer .exercise-card').length;
    const firstCardName = document.querySelector('.exercise-card h4')?.textContent.trim();
    return { activeChip, cardCount, firstCardName };
  });
  console.log('Home Workout Filter State:', homeChipState);
  await page.screenshot({ path: path.join(artifactDir, 'upgraded_workouts_02_home_workout.png') });

  // 3. Click "Cardio" chip
  console.log('3. Clicking Cardio chip...');
  await page.click('.workout-type-chip[data-type="cardio"]');
  await new Promise(r => setTimeout(r, 500));
  const cardioCardCount = await page.evaluate(() => document.querySelectorAll('#exerciseCardsContainer .exercise-card').length);
  console.log('Cardio Exercises Found:', cardioCardCount);

  // 4. Test Subnav Navigation
  console.log('4. Testing Subnav Navigation: Click Challenges...');
  await page.click('section.view.active .hub-subnav-btn[data-hubview="challenge"]');
  await new Promise(r => setTimeout(r, 600));
  const activeViewAfterChallenge = await page.evaluate(() => document.querySelector('section.view.active')?.id);
  console.log('Active view after clicking Challenges:', activeViewAfterChallenge);

  console.log('Clicking Workouts in Subnav...');
  await page.click('section.view.active .hub-subnav-btn[data-hubview="exercise-library"]');
  await new Promise(r => setTimeout(r, 600));
  const activeViewAfterWorkouts = await page.evaluate(() => document.querySelector('section.view.active')?.id);
  console.log('Active view after clicking Workouts:', activeViewAfterWorkouts);

  console.log('Console Errors:', consoleErrors);
  await browser.close();
  console.log('All tests finished successfully!');
})();
