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

  // Step 1
  console.log('1. Clicking Step 1 Next...');
  await page.click('#baStep1NextBtn');
  await new Promise(r => setTimeout(r, 400));

  // Step 2
  console.log('2. Clicking Step 2 Next...');
  await page.click('#baStep2NextBtn');
  await new Promise(r => setTimeout(r, 400));

  // Step 3
  console.log('3. Loading sample photos in Step 3...');
  await page.click('#baLoadSamplePhotosBtn');
  await new Promise(r => setTimeout(r, 400));

  console.log('4. Clicking Step 3 Next...');
  await page.click('#baStep3NextBtn');
  await new Promise(r => setTimeout(r, 400));

  // Step 4
  console.log('5. Clicking Run Analysis in Step 4...');
  await page.click('#baRunAnalysisBtn');
  console.log('Waiting 5s for AI Biomechanical analysis...');
  await new Promise(r => setTimeout(r, 5500));

  // Check Step 5 / Results
  const resultState = await page.evaluate(() => {
    return {
      step5Display: document.getElementById('baStep5')?.style.display,
      step4Display: document.getElementById('baStep4')?.style.display,
      resultsDashboard: document.getElementById('baResultsDashboard') ? window.getComputedStyle(document.getElementById('baResultsDashboard')).display : 'null',
      planHeadline: document.querySelector('.ba-plan-headline')?.textContent,
      fatScore: document.querySelector('#baResultFat')?.textContent,
      muscleScore: document.querySelector('#baResultMuscle')?.textContent
    };
  });
  console.log('Analysis result state:', resultState);

  await browser.close();
})();
