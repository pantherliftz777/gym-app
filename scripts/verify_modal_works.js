const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Open modal
  await page.click('#dashViewBodyAnalysisBtn');
  await new Promise(r => setTimeout(r, 500));

  // Load sample photos
  await page.click('#loadSample4DPhotosBtn');
  await new Promise(r => setTimeout(r, 500));

  // Click Analyze button
  await page.click('#btnRun4DAnalysis');
  await new Promise(r => setTimeout(r, 1000));

  const report = await page.evaluate(() => {
    const el = document.getElementById('bodyCompReportContainer');
    return {
      display: window.getComputedStyle(el).display,
      timeline: document.getElementById('reportTimelineVal')?.textContent,
      fat: document.getElementById('reportFatVal')?.textContent,
      muscle: document.getElementById('reportMuscleVal')?.textContent
    };
  });
  console.log('bodyCompReportContainer result:', report);

  // Click Apply New Metrics button
  console.log('Clicking #btnApply4DMetrics...');
  await page.click('#btnApply4DMetrics');
  await new Promise(r => setTimeout(r, 500));

  const modalOpenAfterApply = await page.evaluate(() => {
    const m = document.getElementById('bodyAnalysisModal');
    return window.getComputedStyle(m).display;
  });
  console.log('Modal display after apply:', modalOpenAfterApply);

  await browser.close();
})();
