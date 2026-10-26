const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Click #dashViewBodyAnalysisBtn to open bodyAnalysisModal
  await page.click('#dashViewBodyAnalysisBtn');
  await new Promise(r => setTimeout(r, 600));

  // Click load sample photos
  console.log('Clicking load sample photos button...');
  await page.click('#loadSample4DPhotosBtn');
  await new Promise(r => setTimeout(r, 600));

  // Check if photos loaded
  const previewImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.body-comp-slot-preview')).map(p => ({
      visible: window.getComputedStyle(p).display,
      src: p.querySelector('img')?.src?.slice(-30)
    }));
  });
  console.log('Preview images state:', previewImgs);

  // Click Analyze button
  console.log('Clicking btnRun4DAnalysis...');
  await page.click('#btnRun4DAnalysis');
  await new Promise(r => setTimeout(r, 3500));

  // Check if result section is displayed
  const reportDisplay = await page.evaluate(() => {
    const r = document.querySelector('#bodyAnalysisReportSection');
    return r ? window.getComputedStyle(r).display : 'none';
  });
  console.log('#bodyAnalysisReportSection display:', reportDisplay);

  await browser.close();
})();
