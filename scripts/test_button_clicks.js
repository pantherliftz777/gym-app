const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  const testButtons = [
    'dashViewBodyAnalysisBtn',
    'dashUpdateMetricsBtn',
    'bodyCompScanBadge',
    'viewBodyDetailsBtn',
    'dashViewAllActivityBtn',
    'insightsShortcutBtn',
    'metricCardCalTrigger',
    'metricCardProteinTrigger',
    'metricCardWorkoutsTrigger',
    'metricCardWeightTrigger',
    'syStartJourneyBtn',
    'syFloatCaloriesTrigger',
    'syFloatWorkoutTrigger',
    'syFloatProteinTrigger',
    'syQuickFoodBtn',
    'syQuickBodyBtn',
    'syQuickProgressBtn',
    'syBottomCardWorkout',
    'syBottomCardNutrition',
    'syBottomCardProgress',
    'dashStartWorkoutBtn',
    'quickCheckInBtn',
    'nextDailyTipBtn'
  ];

  const results = await page.evaluate((btnIds) => {
    return btnIds.map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, status: 'NOT_FOUND' };
      
      const hasOnclick = typeof el.onclick === 'function';
      // let's test clicking it and check what happens
      const viewBefore = document.querySelector('.view.active') ? document.querySelector('.view.active').id : 'none';
      try {
        el.click();
      } catch (e) {
        return { id, status: 'CLICK_ERROR: ' + e.message };
      }
      const viewAfter = document.querySelector('.view.active') ? document.querySelector('.view.active').id : 'none';
      const openModal = document.querySelector('.modal.active, .modal.open, [id$="Modal"].active');

      return {
        id,
        status: 'OK',
        hasOnclick,
        viewBefore,
        viewAfter,
        viewChanged: viewBefore !== viewAfter,
        modalOpened: openModal ? openModal.id : null
      };
    });
  }, testButtons);

  console.log('Button Click Test Results:');
  results.forEach(r => {
    console.log(`[${r.id}] ${r.status} (hasOnclick: ${r.hasOnclick}) -> viewChanged: ${r.viewChanged} (${r.viewBefore} -> ${r.viewAfter}), modal: ${r.modalOpened}`);
  });

  await browser.close();
})();
