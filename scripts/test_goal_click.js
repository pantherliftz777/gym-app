const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  const result = await page.evaluate(() => {
    switchView('body-analysis');
    const cards = document.querySelectorAll('#baGoalsGrid .ba-goal-card');
    cards[1].click(); // Click Hypertrophy
    return {
      card0Active: cards[0].classList.contains('active'),
      card1Active: cards[1].classList.contains('active'),
      selectedGoal: window.baState ? window.baState.selectedGoal : 'no baState'
    };
  });

  console.log('Goal click test:', result);
  await browser.close();
})();
