const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push({ type: 'pageerror', text: err.toString() }));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ type: 'console.error', text: msg.text() });
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  const views = [
    'today', 'ai-coach', 'posture', 'activity', 'body-analysis',
    'workouts', 'exercise-library', 'starting-load',
    'food-log', 'my-foods',
    'challenge', 'tracking', 'customization', 'admin', 'profile'
  ];

  for (const v of views) {
    const success = await page.evaluate((viewId) => {
      try {
        switchView(viewId);
        const section = document.getElementById('view-' + viewId);
        return section && section.classList.contains('active');
      } catch (e) {
        return false;
      }
    }, v);
    console.log(`View [${v}]: ${success ? 'OK' : 'FAILED'}`);
  }

  console.log('Errors during view switches:', errors);
  await browser.close();
})();
