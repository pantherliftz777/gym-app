const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  console.log('--- Testing Body Analysis Buttons from Today ---');
  // 1. Click 4D Body Scan in Today view
  const bodyScanBtn = await page.$('#dashViewBodyAnalysisBtn');
  if (bodyScanBtn) {
    await bodyScanBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const activeView = await page.evaluate(() => {
      const v = document.querySelector('.view:not([style*="display: none"]):not([style*="display:none"])');
      return v ? v.id : 'none';
    });
    console.log('After clicking #dashViewBodyAnalysisBtn, active view is:', activeView);
  } else {
    console.log('ERROR: #dashViewBodyAnalysisBtn not found!');
  }

  // 2. Click Update Details in Today view
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 300));
  const updateMetricsBtn = await page.$('#dashUpdateMetricsBtn');
  if (updateMetricsBtn) {
    await updateMetricsBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const modalVisible = await page.evaluate(() => {
      const m = document.querySelector('#bodyStatsModal');
      return m ? window.getComputedStyle(m).display : 'none';
    });
    console.log('After clicking #dashUpdateMetricsBtn, #bodyStatsModal display is:', modalVisible);
  }

  // 3. Switch to body-analysis view directly
  await page.evaluate(() => switchView('body-analysis'));
  await new Promise(r => setTimeout(r, 500));

  // Test tabs
  console.log('--- Testing Body Analysis Internal Tabs ---');
  await page.click('#baTabDashboardBtn');
  await new Promise(r => setTimeout(r, 300));
  let dashVisible = await page.evaluate(() => {
    const d = document.querySelector('#baDashboardView');
    return d ? window.getComputedStyle(d).display : 'none';
  });
  console.log('baTabDashboardBtn clicked -> #baDashboardView display:', dashVisible);

  await page.click('#baTabHistoryBtn');
  await new Promise(r => setTimeout(r, 300));
  let histVisible = await page.evaluate(() => {
    const h = document.querySelector('#baHistoryView');
    return h ? window.getComputedStyle(h).display : 'none';
  });
  console.log('baTabHistoryBtn clicked -> #baHistoryView display:', histVisible);

  await page.click('#baTabWizardBtn');
  await new Promise(r => setTimeout(r, 300));
  let wizVisible = await page.evaluate(() => {
    const w = document.querySelector('#baWizardView');
    return w ? window.getComputedStyle(w).display : 'none';
  });
  console.log('baTabWizardBtn clicked -> #baWizardView display:', wizVisible);

  // Test Wizard Step Progression
  console.log('--- Testing Wizard Steps ---');
  // Click Step 1 Next
  const s1Btn = await page.$('#baStep1NextBtn');
  console.log('Step 1 Next button exists:', !!s1Btn);
  if (s1Btn) {
    await s1Btn.click();
    await new Promise(r => setTimeout(r, 300));
    const step2Visible = await page.evaluate(() => {
      const s = document.querySelector('#baStep2');
      return s ? window.getComputedStyle(s).display : 'none';
    });
    console.log('Step 1 clicked -> #baStep2 display:', step2Visible);
  }

  // Click Sample Photos button
  const sampleBtn = await page.$('#baLoadSamplePhotosBtn');
  console.log('Sample Photos button exists:', !!sampleBtn);
  if (sampleBtn) {
    await sampleBtn.click();
    await new Promise(r => setTimeout(r, 500));
    console.log('Sample photos clicked');
  }

  // Click Step 2 Next
  const s2Btn = await page.$('#baStep2NextBtn');
  console.log('Step 2 Next button exists:', !!s2Btn);
  if (s2Btn) {
    await s2Btn.click();
    await new Promise(r => setTimeout(r, 300));
    const step3Visible = await page.evaluate(() => {
      const s = document.querySelector('#baStep3');
      return s ? window.getComputedStyle(s).display : 'none';
    });
    console.log('Step 2 clicked -> #baStep3 display:', step3Visible);
  }

  // Click Step 3 Next
  const s3Btn = await page.$('#baStep3NextBtn');
  console.log('Step 3 Next button exists:', !!s3Btn);
  if (s3Btn) {
    await s3Btn.click();
    await new Promise(r => setTimeout(r, 300));
    const step4Visible = await page.evaluate(() => {
      const s = document.querySelector('#baStep4');
      return s ? window.getComputedStyle(s).display : 'none';
    });
    console.log('Step 3 clicked -> #baStep4 display:', step4Visible);
  }

  // Click Run Analysis
  const runBtn = await page.$('#baRunAnalysisBtn');
  console.log('Run Analysis button exists:', !!runBtn);
  if (runBtn) {
    await runBtn.click();
    console.log('Run Analysis clicked, waiting 3s...');
    await new Promise(r => setTimeout(r, 3500));
    const resultsVisible = await page.evaluate(() => {
      const s = document.querySelector('#baResultsDashboard');
      return s ? window.getComputedStyle(s).display : 'none';
    });
    console.log('After Run Analysis, #baResultsDashboard display:', resultsVisible);
  }

  await browser.close();
})();
