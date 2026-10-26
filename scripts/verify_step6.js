const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => switchView('body-analysis'));
  await new Promise(r => setTimeout(r, 400));

  // Step 1 -> 2
  await page.click('#baStep1NextBtn');
  await new Promise(r => setTimeout(r, 300));

  // Step 2 -> 3
  await page.click('#baStep2NextBtn');
  await new Promise(r => setTimeout(r, 300));

  // Step 3: load samples -> 4
  await page.click('#baLoadSamplePhotosBtn');
  await new Promise(r => setTimeout(r, 300));
  await page.click('#baStep3NextBtn');
  await new Promise(r => setTimeout(r, 300));

  // Step 4: Run analysis
  await page.click('#baRunAnalysisBtn');
  console.log('Clicked baRunAnalysisBtn, waiting 3.5s...');
  await new Promise(r => setTimeout(r, 3500));

  const state = await page.evaluate(() => {
    return {
      currentStep: window.baState?.currentStep,
      activeStepElement: document.querySelector('.ba-wizard-step.active')?.id,
      step6Display: window.getComputedStyle(document.getElementById('baStep6')).display,
      reportFatVal: document.getElementById('baMetricBodyFatVal')?.textContent,
      reportMuscleVal: document.getElementById('baMetricMuscleVal')?.textContent
    };
  });
  console.log('Resulting Step 6 State:', state);

  await page.screenshot({ path: 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/ba_step6_verified.png', fullPage: false });
  console.log('Screenshot of Step 6 taken');

  await browser.close();
})();
