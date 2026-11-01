const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', m => console.log('BROWSER:', m.text()));
  page.on('pageerror', e => console.log('ERROR:', e.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  const res = await page.evaluate(async () => {
    try {
      console.log('Calling generateAIChallengePlan directly...');
      await generateAIChallengePlan('Burn Fat & Lean Out', 15, 45, 'Moderate', ['Gym']);
      return { success: true, plan: window.activeChallengePlan ? true : false };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });

  console.log('Direct call result:', res);
  await browser.close();
})();
