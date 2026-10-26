const puppeteer = require('puppeteer');

(async () => {
  console.log('=== VERIFYING REVIEWER FIXES ===');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // TEST 1: Sidebar Collapse & Hover Trap Verification
  console.log('\n--- 1. Testing Sidebar Toggle & Hover Trap Fix ---');
  // Move mouse directly to the toggle button
  await page.hover('#sidebarCollapseToggleBtn');
  // Click the toggle button to collapse
  await page.click('#sidebarCollapseToggleBtn');
  await new Promise(r => setTimeout(r, 150));

  // Check width while mouse is STILL at the toggle button
  const collapsedWidthWithMouseOnBtn = await page.evaluate(() => {
    const sb = document.getElementById('sidebar');
    return {
      width: sb.getBoundingClientRect().width,
      isCollapsed: sb.classList.contains('collapsed'),
      isHoverExpanded: sb.classList.contains('is-hover-expanded')
    };
  });
  console.log('Sidebar state with cursor on button right after collapse click:', collapsedWidthWithMouseOnBtn);

  if (collapsedWidthWithMouseOnBtn.width <= 70 && collapsedWidthWithMouseOnBtn.isCollapsed) {
    console.log('PASS: Hover trap resolved! Sidebar correctly collapses to 68px rail even with mouse on button.');
  } else {
    console.error('FAIL: Hover trap still present! Sidebar width is ' + collapsedWidthWithMouseOnBtn.width);
  }

  // Move mouse away to main area
  await page.mouse.move(800, 400);
  await new Promise(r => setTimeout(r, 200));

  // Hover over the collapsed sidebar
  await page.mouse.move(30, 200);
  await new Promise(r => setTimeout(r, 200));

  const hoverExpandedWidth = await page.evaluate(() => {
    const sb = document.getElementById('sidebar');
    return {
      width: sb.getBoundingClientRect().width,
      isHoverExpanded: sb.classList.contains('is-hover-expanded')
    };
  });
  console.log('Sidebar state when hovering over collapsed rail:', hoverExpandedWidth);

  if (hoverExpandedWidth.width >= 250 && hoverExpandedWidth.isHoverExpanded) {
    console.log('PASS: Hover preview expands sidebar to full width (260px)!');
  } else {
    console.error('FAIL: Hover preview did not expand sidebar!');
  }

  // Click on the sidebar toggle to STABILIZE it
  await page.click('#sidebarCollapseToggleBtn');
  await new Promise(r => setTimeout(r, 150));

  const stabilizedState = await page.evaluate(() => {
    const sb = document.getElementById('sidebar');
    return {
      width: sb.getBoundingClientRect().width,
      isCollapsed: sb.classList.contains('collapsed'),
      isHoverExpanded: sb.classList.contains('is-hover-expanded')
    };
  });
  console.log('Sidebar state after click stabilization:', stabilizedState);
  if (!stabilizedState.isCollapsed && stabilizedState.width >= 250) {
    console.log('PASS: Click stabilized the sidebar open!');
  } else {
    console.error('FAIL: Click did not stabilize sidebar open!');
  }

  // Ensure on today view
  await page.evaluate(() => switchView('today'));
  await new Promise(r => setTimeout(r, 100));

  // TEST 2: Water Adjust Button & Modal Close
  console.log('\n--- 2. Testing Water Adjust Button (#adjustWaterBtn) ---');
  await page.click('#adjustWaterBtn');
  await new Promise(r => setTimeout(r, 250));

  const weatherModalState = await page.evaluate(() => {
    const m = document.getElementById('weatherTempModal');
    return {
      exists: !!m,
      isOpen: m && (m.classList.contains('active') || window.getComputedStyle(m).display !== 'none')
    };
  });
  console.log('Weather temperature modal state after clicking #adjustWaterBtn:', weatherModalState);
  if (weatherModalState.isOpen) {
    console.log('PASS: #adjustWaterBtn successfully opened #weatherTempModal!');
  } else {
    console.error('FAIL: #adjustWaterBtn did not open #weatherTempModal!');
  }

  // Close the modal via &times; (.close-btn)
  await page.click('#weatherTempModal .close-btn');
  await new Promise(r => setTimeout(r, 250));

  const weatherModalClosed = await page.evaluate(() => {
    const m = document.getElementById('weatherTempModal');
    return !m.classList.contains('active') && window.getComputedStyle(m).display === 'none';
  });
  console.log('Weather modal closed after clicking &times;:', weatherModalClosed);
  if (weatherModalClosed) {
    console.log('PASS: Modal close button (&times;) successfully closed #weatherTempModal!');
  } else {
    console.error('FAIL: Modal close button failed to close #weatherTempModal!');
  }

  // TEST 3: Check Multiple Modals & Close Buttons (Released from exerciseDetailModal trap)
  console.log('\n--- 3. Testing Multiple Modal Close Buttons ---');
  const modalsToTest = [
    { trigger: '#topSettingsBtn', modalId: 'settingsModal' },
    { trigger: '#topNotificationBtn', modalId: 'notificationModal' },
    { trigger: '#dashViewBodyAnalysisBtn', modalId: 'bodyAnalysisModal' }
  ];

  for (const t of modalsToTest) {
    await page.click(t.trigger);
    await new Promise(r => setTimeout(r, 200));

    const isOpen = await page.evaluate((id) => {
      const m = document.getElementById(id);
      return m && (m.classList.contains('active') || window.getComputedStyle(m).display !== 'none');
    }, t.modalId);

    // Click close button inside modal
    await page.evaluate((id) => {
      const m = document.getElementById(id);
      const closeBtn = m.querySelector('.close-btn, [data-close]');
      if (closeBtn) closeBtn.click();
    }, t.modalId);
    await new Promise(r => setTimeout(r, 200));

    const isClosed = await page.evaluate((id) => {
      const m = document.getElementById(id);
      return !m.classList.contains('active') && window.getComputedStyle(m).display === 'none';
    }, t.modalId);

    console.log(`Modal [${t.modalId}]: Open=${isOpen}, ClosedAfterX=${isClosed}`);
  }

  // TEST 4: Body Analysis Full Workflow
  console.log('\n--- 4. Testing Body Analysis Assessment Wizard ---');
  await page.evaluate(() => switchView('body-analysis'));
  await new Promise(r => setTimeout(r, 250));

  // Goal select
  await page.click('#baGoalsGrid .ba-goal-card');
  await page.click('#baStep1NextBtn');
  await new Promise(r => setTimeout(r, 100));

  // Step 2 to Step 3
  await page.click('#baStep2NextBtn');
  await new Promise(r => setTimeout(r, 100));

  // Load sample photos
  await page.click('#baLoadSamplePhotosBtn');
  await new Promise(r => setTimeout(r, 100));

  // Step 3 to Step 4
  await page.click('#baStep3NextBtn');
  await new Promise(r => setTimeout(r, 100));

  // Run analysis
  await page.click('#baRunAnalysisBtn');
  await new Promise(r => setTimeout(r, 1500));

  const baFinalState = await page.evaluate(() => {
    const s6 = document.getElementById('baStep6');
    const headline = document.getElementById('baReportGoalHeadline')?.textContent;
    const bodyFat = document.getElementById('baEstBodyFat')?.textContent;
    return {
      step6Active: s6 && s6.classList.contains('active'),
      headline,
      bodyFat
    };
  });
  console.log('Body Analysis Results:', baFinalState);

  // Take full verification screenshot
  await page.screenshot({ path: 'test_screenshots/final_reviewer_verified.png' });
  console.log('\nSaved screenshot to test_screenshots/final_reviewer_verified.png');

  console.log('\nConsole Errors:', errors.filter(e => !e.includes('401')));
  console.log('=== VERIFICATION SCRIPT COMPLETED SUCCESSFULLY ===');
  await browser.close();
})();
