const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', m => console.log('BROWSER:', m.text()));
  page.on('pageerror', e => console.log('ERROR:', e.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Evaluate challenge generation directly
  const res = await page.evaluate(async () => {
    try {
      console.log('setupMotive:', window.challengeSetup?.motive);
      console.log('setupDuration:', window.challengeSetup?.duration);
      console.log('setupMinutes:', window.challengeSetup?.minutes);
      console.log('setupIntensity:', window.challengeSetup?.intensity);
      console.log('setupTypes:', window.challengeSetup?.types);

      // Open challenge duration modal and click generate button
      const btn = document.getElementById('generateChallengePlanBtn');
      console.log('Btn found:', !!btn, btn?.onclick?.toString().slice(0, 100));
      if (btn) btn.click();

      await new Promise(r => setTimeout(r, 1000));
      return {
        active: window.activeChallengePlan ? true : false,
        btnText: btn?.textContent
      };
    } catch (err) {
      return { error: err.message, stack: err.stack };
    }
  });

  console.log('Result:', res);
  await browser.close();
})();
