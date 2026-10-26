const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push({ type: 'pageerror', msg: err.toString() }));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ type: 'console.error', msg: msg.text() });
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  await page.evaluate(() => {
    switchView('body-analysis');
  });
  await new Promise(r => setTimeout(r, 400));

  const elementsCheck = await page.evaluate(() => {
    const ids = ['baAssessmentWizardWrap', 'baTransformationDashboardWrap', 'baScanHistoryWrap', 'baStep1', 'baStep2', 'baStep3', 'baStep4', 'baStep5', 'baStep6'];
    const res = {};
    ids.forEach(id => res[id] = !!document.getElementById(id));
    return res;
  });
  console.log('Body Analysis container IDs present:', elementsCheck);

  // Check buttons
  const buttons = await page.evaluate(() => {
    const ba = document.getElementById('view-body-analysis');
    const all = Array.from(ba.querySelectorAll('button, [role="button"], .ba-goal-card'));
    return all.map((el, i) => ({
      index: i,
      id: el.id,
      text: (el.innerText || '').slice(0, 30).trim(),
      hasClick: typeof el.onclick === 'function' || !!el.getAttribute('onclick')
    }));
  });

  console.log(`Auditing ${buttons.length} buttons in body-analysis:`);
  for (const b of buttons) {
    console.log(`  Button #${b.index} [${b.id || 'NO_ID'}] "${b.text}" (hasDirectClick: ${b.hasClick})`);
  }

  await browser.close();
})();
