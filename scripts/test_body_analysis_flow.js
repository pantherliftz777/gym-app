const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Switch to body analysis
  await page.evaluate(() => switchView('body-analysis'));
  await new Promise(r => setTimeout(r, 500));

  // Let's test clicking each button in body analysis:
  const testResults = await page.evaluate(async () => {
    const results = [];
    
    // 1. Goal selection
    const goalCards = document.querySelectorAll('.ba-goal-card');
    results.push({ test: 'Goal cards count', count: goalCards.length });
    if (goalCards.length > 0) {
      goalCards[0].click();
      results.push({ test: 'First goal selected', selected: goalCards[0].classList.contains('selected') });
    }

    // 2. Step 1 Next
    const step1Next = document.getElementById('baStep1NextBtn');
    if (step1Next) {
      step1Next.click();
      const step2 = document.getElementById('baStep2');
      results.push({ test: 'Step 1 Next clicked -> step2 visible', visible: step2 ? !step2.classList.contains('hidden') : false });
    }

    // 3. Step 2 Next
    const step2Next = document.getElementById('baStep2NextBtn');
    if (step2Next) {
      step2Next.click();
      const step3 = document.getElementById('baStep3');
      results.push({ test: 'Step 2 Next clicked -> step3 visible', visible: step3 ? !step3.classList.contains('hidden') : false });
    }

    // 4. Sample photos button
    const sampleBtn = document.getElementById('baLoadSamplePhotosBtn');
    if (sampleBtn) {
      sampleBtn.click();
      const thumbs = document.querySelectorAll('.ba-photo-slot.has-image');
      results.push({ test: 'Load sample photos clicked', thumbsLoaded: thumbs.length });
    }

    // 5. Step 3 Next
    const step3Next = document.getElementById('baStep3NextBtn');
    if (step3Next) {
      step3Next.click();
      const step4 = document.getElementById('baStep4');
      results.push({ test: 'Step 3 Next clicked -> step4 visible', visible: step4 ? !step4.classList.contains('hidden') : false });
    }

    // 6. Check Run Analysis button
    const runBtn = document.getElementById('baRunAnalysisBtn');
    results.push({
      test: 'Run Analysis Button',
      exists: !!runBtn,
      disabled: runBtn ? runBtn.disabled : null,
      classList: runBtn ? runBtn.className : ''
    });

    // 7. Check Tab buttons: Latest Dashboard, History
    const tabDash = document.getElementById('baTabDashboardBtn');
    if (tabDash) {
      tabDash.click();
      const dashView = document.getElementById('baDashboardPanel');
      results.push({ test: 'Tab Dashboard clicked', active: tabDash.classList.contains('active'), dashVisible: dashView ? !dashView.classList.contains('hidden') : false });
    }

    const tabHist = document.getElementById('baTabHistoryBtn');
    if (tabHist) {
      tabHist.click();
      const histView = document.getElementById('baHistoryPanel');
      results.push({ test: 'Tab History clicked', active: tabHist.classList.contains('active'), histVisible: histView ? !histView.classList.contains('hidden') : false });
    }

    const tabWiz = document.getElementById('baTabWizardBtn');
    if (tabWiz) {
      tabWiz.click();
      const wizView = document.getElementById('baWizardPanel');
      results.push({ test: 'Tab Wizard clicked', active: tabWiz.classList.contains('active'), wizVisible: wizView ? !wizView.classList.contains('hidden') : false });
    }

    return results;
  });

  console.log('Body Analysis Functional Tests:', JSON.stringify(testResults, null, 2));
  console.log('Errors during test:', errors);

  await browser.close();
})();
