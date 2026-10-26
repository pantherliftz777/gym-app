const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Open modal
  await page.click('#dashViewBodyAnalysisBtn');
  await new Promise(r => setTimeout(r, 500));

  // Click load sample
  await page.click('#loadSample4DPhotosBtn');
  await new Promise(r => setTimeout(r, 500));

  // Run analysis and log errors in page evaluate
  const result = await page.evaluate(async () => {
    try {
      console.log('Directly executing #btnRun4DAnalysis onclick...');
      const btn = document.getElementById('btnRun4DAnalysis');
      if (!btn) return 'btn not found';
      await btn.onclick();
      return 'onclick finished successfully';
    } catch (err) {
      return 'ERROR in onclick: ' + err.message + '\n' + err.stack;
    }
  });

  console.log('Result of execution:', result);

  const reportDisplay = await page.evaluate(() => {
    const r = document.querySelector('#bodyAnalysisReportSection');
    return r ? {
      display: window.getComputedStyle(r).display,
      html: r.innerHTML.slice(0, 200)
    } : 'null';
  });
  console.log('Report section:', reportDisplay);

  await browser.close();
})();
