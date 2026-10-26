const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Switch to body-analysis view
  await page.evaluate(() => switchView('body-analysis'));
  await new Promise(r => setTimeout(r, 500));

  // Check which step is visible
  let steps = await page.evaluate(() => {
    return [1, 2, 3, 4, 5, 6].map(i => ({
      step: i,
      display: document.getElementById('baStep' + i) ? window.getComputedStyle(document.getElementById('baStep' + i)).display : 'missing'
    }));
  });
  console.log('Initial steps:', steps);

  // Click Step 1 Next
  console.log('Clicking Step 1 Next button...');
  await page.click('#baStep1NextBtn');
  await new Promise(r => setTimeout(r, 500));

  steps = await page.evaluate(() => {
    return [1, 2, 3, 4, 5, 6].map(i => ({
      step: i,
      display: document.getElementById('baStep' + i) ? window.getComputedStyle(document.getElementById('baStep' + i)).display : 'missing'
    }));
  });
  console.log('Steps after Step 1 Next:', steps);

  // Check if baLoadSamplePhotosBtn is visible and in viewport
  const btnInfo = await page.evaluate(() => {
    const btn = document.getElementById('baLoadSamplePhotosBtn');
    if (!btn) return 'not found';
    const rect = btn.getBoundingClientRect();
    return {
      rect,
      display: window.getComputedStyle(btn).display,
      visibility: window.getComputedStyle(btn).visibility,
      offsetParent: btn.offsetParent ? btn.offsetParent.tagName : null
    };
  });
  console.log('baLoadSamplePhotosBtn info:', btnInfo);

  // Click it via page.evaluate
  const clickRes = await page.evaluate(() => {
    const btn = document.getElementById('baLoadSamplePhotosBtn');
    if (btn) {
      btn.click();
      return 'clicked';
    }
    return 'not found';
  });
  console.log('Click via evaluate:', clickRes);

  await browser.close();
})();
