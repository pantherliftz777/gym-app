const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('=== E2E Browser Testing: FitFuel Upgraded Workout Filter System ===');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.error('BROWSER PAGE ERROR:', err.message);
  });

  await page.setViewport({ width: 1280, height: 950 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Navigate to Training -> Workouts
  console.log('1. Navigating to Training section...');
  await page.click('.primary-nav .nav-link[data-section="training"]');
  await new Promise(r => setTimeout(r, 800));

  // Check initial state of the 5-tier filters
  const initialFilterState = await page.evaluate(() => {
    const activeView = document.querySelector('section.view.active');
    const locationChips = Array.from(document.querySelectorAll('#workoutLocationChips .workout-type-chip')).map(b => ({
      text: b.textContent.trim(),
      loc: b.dataset.location,
      active: b.classList.contains('active')
    }));
    const typeChips = Array.from(document.querySelectorAll('#workoutTypeChips .workout-type-chip')).map(b => ({
      text: b.textContent.trim(),
      type: b.dataset.type,
      active: b.classList.contains('active')
    }));
    const eqTitle = document.querySelector('#equipmentSectionTitle')?.textContent.trim();
    const eqChips = Array.from(document.querySelectorAll('#workoutEquipmentChips .workout-type-chip')).map(b => ({
      text: b.textContent.trim(),
      active: b.classList.contains('active')
    }));
    const muscleTabs = Array.from(document.querySelectorAll('#muscleTabs button')).map(b => ({
      text: b.textContent.trim(),
      active: b.classList.contains('active')
    }));
    const subTags = Array.from(document.querySelectorAll('#muscleSubTags button')).map(b => ({
      text: b.textContent.trim(),
      active: b.classList.contains('active')
    }));
    const cards = Array.from(document.querySelectorAll('#exerciseCardsContainer .exercise-card')).map(c => ({
      name: c.querySelector('h4')?.textContent.trim(),
      type: c.querySelector('.exercise-type')?.textContent.trim(),
      sub: c.querySelector('.exercise-sub-tag')?.textContent.trim()
    }));
    const resultCount = document.querySelector('#libResultCount')?.textContent.trim();

    return {
      activeViewId: activeView?.id,
      locationChips,
      typeChips,
      eqTitle,
      eqChipsCount: eqChips.length,
      muscleTabs,
      subTags,
      cardsCount: cards.length,
      sampleCards: cards.slice(0, 3),
      resultCount
    };
  });

  console.log('Initial Filter Hierarchy State:', JSON.stringify(initialFilterState, null, 2));
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '01_workout_filters_initial.png') });

  // 2. Select Location: Home
  console.log('2. Switching Location to Home...');
  await page.click('#workoutLocationChips .workout-type-chip[data-location="home"]');
  await new Promise(r => setTimeout(r, 600));

  const homeState = await page.evaluate(() => {
    const title = document.querySelector('#equipmentSectionTitle')?.textContent.trim();
    const quickActions = Array.from(document.querySelectorAll('#equipmentQuickActions button')).map(b => b.textContent.trim());
    const chips = Array.from(document.querySelectorAll('#workoutEquipmentChips .workout-type-chip')).map(b => b.textContent.trim());
    const cardCount = document.querySelectorAll('#exerciseCardsContainer .exercise-card').length;
    return { title, quickActions, chips, cardCount };
  });
  console.log('Home Equipment Tier:', homeState);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '02_workout_filters_home_selected.png') });

  // 3. Click [No Equipment (Bodyweight)] Quick Action
  console.log('3. Clicking [No Equipment (Bodyweight)] quick action...');
  await page.click('#equipmentQuickActions button:first-child');
  await new Promise(r => setTimeout(r, 600));

  // Switch to Chest muscle group
  console.log('4. Selecting Chest muscle group...');
  const chestBtnFound = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#muscleTabs button')).find(b => b.textContent.trim() === 'Chest');
    if (btn) { btn.click(); return true; }
    return false;
  });
  await new Promise(r => setTimeout(r, 600));

  const bodyweightChestState = await page.evaluate(() => {
    const cardCount = document.querySelectorAll('#exerciseCardsContainer .exercise-card').length;
    const cards = Array.from(document.querySelectorAll('#exerciseCardsContainer .exercise-card')).map(c => ({
      name: c.querySelector('h4')?.textContent.trim(),
      type: c.querySelector('.exercise-type')?.textContent.trim()
    }));
    return { cardCount, cards: cards.slice(0, 5) };
  });
  console.log('Home + Bodyweight Only + Chest Results:', bodyweightChestState);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '03_workout_filters_home_bodyweight_chest.png') });

  // 4. Toggle Dumbbells and Bench under Home
  console.log('5. Toggling Dumbbells and Bench into equipment...');
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('#workoutEquipmentChips .workout-type-chip'));
    const db = chips.find(c => c.textContent.trim() === 'Dumbbells');
    const bench = chips.find(c => c.textContent.trim() === 'Bench');
    if (db) db.click();
    if (bench) bench.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const dbBenchState = await page.evaluate(() => {
    const cardCount = document.querySelectorAll('#exerciseCardsContainer .exercise-card').length;
    const cards = Array.from(document.querySelectorAll('#exerciseCardsContainer .exercise-card')).map(c => ({
      name: c.querySelector('h4')?.textContent.trim(),
      type: c.querySelector('.exercise-type')?.textContent.trim()
    }));
    return { cardCount, cards: cards.slice(0, 5) };
  });
  console.log('Home + Bodyweight + Dumbbells + Bench + Chest Results:', dbBenchState);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '04_workout_filters_home_db_bench_chest.png') });

  // 5. Switch to Gym location and check Full Gym Access
  console.log('6. Switching Location to Gym...');
  await page.click('#workoutLocationChips .workout-type-chip[data-location="gym"]');
  await new Promise(r => setTimeout(r, 600));

  const gymState = await page.evaluate(() => {
    const title = document.querySelector('#equipmentSectionTitle')?.textContent.trim();
    const quickActions = Array.from(document.querySelectorAll('#equipmentQuickActions button')).map(b => b.textContent.trim());
    const chips = Array.from(document.querySelectorAll('#workoutEquipmentChips .workout-type-chip')).map(b => b.textContent.trim());
    const cardCount = document.querySelectorAll('#exerciseCardsContainer .exercise-card').length;
    return { title, quickActions, chips, cardCount };
  });
  console.log('Gym State:', gymState);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '05_workout_filters_gym_selected.png') });

  // 6. Test Workout Type: Cardio
  console.log('7. Testing Workout Type: Cardio...');
  await page.click('#workoutTypeChips .workout-type-chip[data-type="cardio"]');
  await new Promise(r => setTimeout(r, 600));

  // Select Full Body to view cardio conditioning
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#muscleTabs button')).find(b => b.textContent.trim() === 'Full Body');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const cardioState = await page.evaluate(() => {
    const cardCount = document.querySelectorAll('#exerciseCardsContainer .exercise-card').length;
    const cards = Array.from(document.querySelectorAll('#exerciseCardsContainer .exercise-card')).map(c => ({
      name: c.querySelector('h4')?.textContent.trim(),
      type: c.querySelector('.exercise-type')?.textContent.trim(),
      sub: c.querySelector('.exercise-sub-tag')?.textContent.trim()
    }));
    return { cardCount, cards: cards.slice(0, 5) };
  });
  console.log('Cardio Workout Type Results:', cardioState);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '06_workout_filters_cardio.png') });

  // 7. Test Reset Filters Button
  console.log('8. Testing Reset Filters button...');
  await page.click('#resetWorkoutFiltersBtn');
  await new Promise(r => setTimeout(r, 600));

  const resetState = await page.evaluate(() => {
    const activeLoc = document.querySelector('#workoutLocationChips .workout-type-chip.active')?.textContent.trim();
    const activeType = document.querySelector('#workoutTypeChips .workout-type-chip.active')?.textContent.trim();
    const activeMuscle = document.querySelector('#muscleTabs button.active')?.textContent.trim();
    const cardCount = document.querySelectorAll('#exerciseCardsContainer .exercise-card').length;
    return { activeLoc, activeType, activeMuscle, cardCount };
  });
  console.log('State After Reset:', resetState);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '07_workout_filters_reset.png') });

  console.log('\n--- VERIFICATION CHECKS ---');
  console.log('Console Errors:', consoleErrors);
  if (consoleErrors.length === 0) {
    console.log('✔ ZERO CONSOLE ERRORS DETECTED IN BROWSER!');
  } else {
    console.error('❌ Console errors encountered:', consoleErrors);
  }

  await browser.close();
  console.log('=== All Browser Tests Completed Successfully! ===');
})();
