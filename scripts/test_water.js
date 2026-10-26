const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Initial water level
  const initialWater = await page.evaluate(() => document.getElementById('waterDisplay')?.innerText);
  console.log('Initial water display:', initialWater);

  // Click cup 1
  await page.click('#waterCups .water-cup');
  await new Promise(r => setTimeout(r, 200));

  const afterClickWater = await page.evaluate(() => document.getElementById('waterDisplay')?.innerText);
  console.log('After clicking cup 1:', afterClickWater);

  // Click adjust water button
  await page.click('#adjustWaterBtn');
  await new Promise(r => setTimeout(r, 200));

  const isSettingsModalOpen = await page.evaluate(() => {
    const m = document.getElementById('settingsModal');
    return m && (m.classList.contains('active') || window.getComputedStyle(m).display !== 'none');
  });
  console.log('Adjust water opened settings modal:', isSettingsModalOpen);

  console.log('Errors:', errors);
  await browser.close();
})();
