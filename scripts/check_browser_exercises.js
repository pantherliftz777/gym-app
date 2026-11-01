const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  const stats = await page.evaluate(() => {
    return {
      libCount: window.EXERCISES_LIBRARY ? window.EXERCISES_LIBRARY.length : 0,
      jsonCount: window.EXERCISES_JSON_MAP ? Object.keys(window.EXERCISES_JSON_MAP).length : 0,
      sampleLib: window.EXERCISES_LIBRARY ? window.EXERCISES_LIBRARY.slice(0, 3) : []
    };
  });

  console.log('Browser exercise stats:', stats);
  await browser.close();
})();
