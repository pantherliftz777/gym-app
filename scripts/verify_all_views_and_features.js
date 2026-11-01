const puppeteer = require('puppeteer');

(async () => {
  console.log('=== RUNNING FULL END-TO-END SYSTEM HEALTH CHECK ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text());
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const views = [
    'view-today',
    'view-body-analysis',
    'view-food-log',
    'view-workouts',
    'view-starting-load',
    'view-exercise-library',
    'view-my-foods',
    'view-profile',
    'view-challenge',
    'view-tracking',
    'view-ai-coach',
    'view-activity',
    'view-posture',
    'view-customization'
  ];

  console.log(`\nTesting seamless navigation across ${views.length} primary views...`);
  const viewResults = [];
  for (const v of views) {
    const viewName = v.replace('view-', '');
    const res = await page.evaluate((target) => {
      if (typeof switchView === 'function') {
        switchView(target);
        const el = document.getElementById('view-' + target);
        return {
          view: target,
          visible: el ? el.classList.contains('active') : false,
          hasContent: el ? el.children.length > 0 : false
        };
      }
      return { view: target, visible: false, hasContent: false };
    }, viewName);
    viewResults.push(res);
    await new Promise(r => setTimeout(r, 150));
  }

  console.log('View navigation results:');
  viewResults.forEach(r => {
    console.log(`  ${r.visible ? '✅' : '❌'} [${r.view}]: visible=${r.visible}, elements=${r.hasContent}`);
  });

  // Verify Athlete Hero HUD on Today View
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 300));
  const hudCheck = await page.evaluate(() => {
    const hero = document.querySelector('.hero-banner') || document.querySelector('#todayViewHero') || document.querySelector('.sy-athlete-card');
    const water = document.querySelector('#waterDisplay');
    const threeDots = document.querySelector('#topbarMoreDotsBtn') || document.querySelector('.sy-bcard-menu-dots');
    return {
      heroPresent: !!hero,
      waterDisplay: water ? water.textContent : null,
      threeDotsMenu: !!threeDots
    };
  });
  console.log('\nToday Dashboard & Athlete HUD Check:', hudCheck);

  console.log('\nTotal Console/Runtime Errors Detected:', errors.length);
  if (errors.length > 0) {
    console.error('Errors encountered:');
    errors.forEach(e => console.error('  - ' + e));
  } else {
    console.log('✅ ZERO RUNTIME ERRORS OR CONSOLE EXCEPTIONS ACROSS ENTIRE PROJECT!');
  }

  await browser.close();
  console.log('=== HEALTH CHECK COMPLETE ===');
})();
