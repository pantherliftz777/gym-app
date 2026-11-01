const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => switchView('exercise-library'));
  await new Promise(r => setTimeout(r, 1200));

  const info = await page.evaluate(async () => {
    if (window.exercisesLoadedPromise) {
      await window.exercisesLoadedPromise;
    }
    return {
      libLength: window.EXERCISES_LIBRARY ? window.EXERCISES_LIBRARY.length : 'undefined',
      muscleGroups: window.MUSCLE_GROUPS ? Object.keys(window.MUSCLE_GROUPS) : 'undefined',
      selectedExerciseCategory: window.selectedExerciseCategory,
      tabsCount: document.querySelectorAll('#muscleTabs button').length,
      cardsCount: document.querySelectorAll('#exerciseCardsContainer .exercise-card').length
    };
  });
  console.log('Browser Evaluation Info:', info);
  await browser.close();
})();
