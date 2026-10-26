const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Audit all buttons in the document
  const audit = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button, .nav-link, [role="button"], a[href^="#"]'));
    const results = [];

    allButtons.forEach((btn, index) => {
      const id = btn.id || '';
      const text = (btn.innerText || btn.getAttribute('aria-label') || btn.title || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      const classes = btn.className;
      const dataView = btn.dataset.view || '';
      const onclickAttr = btn.getAttribute('onclick') || '';
      const closestView = btn.closest('.view') ? btn.closest('.view').id : 'global';

      results.push({
        index,
        id,
        text,
        classes,
        dataView,
        onclickAttr,
        closestView,
        tagName: btn.tagName.toLowerCase()
      });
    });

    return { total: allButtons.length, results };
  });

  console.log(`Found ${audit.total} interactive buttons/links across the app.`);

  // Let's test specific buttons in view-body-analysis and view-today
  const bodyAnalysisTest = await page.evaluate(() => {
    if (typeof switchView === 'function') switchView('body-analysis');
    const ba = document.getElementById('view-body-analysis');
    const isVisible = ba && ba.classList.contains('active');
    
    // Check buttons
    const wizardBtn = document.getElementById('baTabWizardBtn');
    const dashBtn = document.getElementById('baTabDashboardBtn');
    const histBtn = document.getElementById('baTabHistoryBtn');
    const sampleBtn = document.getElementById('baLoadSamplePhotosBtn');
    const runBtn = document.getElementById('baRunAnalysisBtn');

    return {
      isVisible,
      hasWizardBtn: !!wizardBtn,
      hasDashBtn: !!dashBtn,
      hasHistBtn: !!histBtn,
      hasSampleBtn: !!sampleBtn,
      hasRunBtn: !!runBtn
    };
  });

  console.log('Body Analysis View Status:', bodyAnalysisTest);

  // Check buttons in today view:
  const todayButtons = audit.results.filter(r => r.closestView === 'view-today');
  console.log(`Today view has ${todayButtons.length} buttons.`);
  todayButtons.forEach(b => console.log(`  [${b.id || 'no-id'}] "${b.text}" (onclick: ${!!b.onclickAttr})`));

  // Check body analysis buttons:
  const baButtons = audit.results.filter(r => r.closestView === 'view-body-analysis');
  console.log(`Body Analysis view has ${baButtons.length} buttons.`);
  baButtons.forEach(b => console.log(`  [${b.id || 'no-id'}] "${b.text}" (onclick: ${!!b.onclickAttr})`));

  console.log('Page Errors so far:', pageErrors);

  await browser.close();
})();
