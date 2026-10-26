const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Initial active view
  let active = await page.evaluate(() => document.querySelector('.view.active')?.id);
  console.log('Initial active view:', active);

  // Click #dashViewBodyAnalysisBtn
  await page.click('#dashViewBodyAnalysisBtn');
  await new Promise(r => setTimeout(r, 500));
  active = await page.evaluate(() => document.querySelector('.view.active')?.id);
  console.log('Active view after clicking #dashViewBodyAnalysisBtn:', active);

  // Check if bodyAnalysisModal is opened
  let modalOpen = await page.evaluate(() => {
    const m = document.querySelector('#bodyAnalysisModal');
    return m ? window.getComputedStyle(m).display : 'not found';
  });
  console.log('#bodyAnalysisModal display:', modalOpen);

  // Close modal
  await page.evaluate(() => closeModal('#bodyAnalysisModal'));
  await new Promise(r => setTimeout(r, 300));

  // Now check tabs in body analysis
  console.log('Testing #baTabDashboardBtn click:');
  await page.click('#baTabDashboardBtn');
  await new Promise(r => setTimeout(r, 400));
  let state = await page.evaluate(() => {
    return {
      dash: document.querySelector('#baDashboardView')?.style.display,
      hist: document.querySelector('#baHistoryView')?.style.display,
      wiz: document.querySelector('#baWizardView')?.style.display,
      dashClasses: document.querySelector('#baTabDashboardBtn')?.className
    };
  });
  console.log('Tab Dashboard click state:', state);

  console.log('Testing #baTabHistoryBtn click:');
  await page.click('#baTabHistoryBtn');
  await new Promise(r => setTimeout(r, 400));
  state = await page.evaluate(() => {
    return {
      dash: document.querySelector('#baDashboardView')?.style.display,
      hist: document.querySelector('#baHistoryView')?.style.display,
      wiz: document.querySelector('#baWizardView')?.style.display,
      histClasses: document.querySelector('#baTabHistoryBtn')?.className
    };
  });
  console.log('Tab History click state:', state);

  console.log('Testing #baTabWizardBtn click:');
  await page.click('#baTabWizardBtn');
  await new Promise(r => setTimeout(r, 400));
  state = await page.evaluate(() => {
    return {
      dash: document.querySelector('#baDashboardView')?.style.display,
      hist: document.querySelector('#baHistoryView')?.style.display,
      wiz: document.querySelector('#baWizardView')?.style.display,
      wizClasses: document.querySelector('#baTabWizardBtn')?.className
    };
  });
  console.log('Tab Wizard click state:', state);

  await browser.close();
})();
