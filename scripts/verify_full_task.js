const puppeteer = require('puppeteer');

(async () => {
  console.log('=== STARTING COMPREHENSIVE FITFUEL VERIFICATION ===');
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

  // TEST 1: Sidebar Structure and Groupings
  const sidebarCheck = await page.evaluate(() => {
    const sb = document.getElementById('sidebar');
    const brand = document.querySelector('.sidebar-brand-wrapper');
    const partition = document.querySelector('.sidebar-partition-line');
    const toggleBar = document.querySelector('.sidebar-control-bar');
    const toggleBtn = document.getElementById('sidebarCollapseToggleBtn');
    const primaryNav = document.getElementById('sidebarPrimaryNav');

    // Section headers
    const groupHeaders = Array.from(document.querySelectorAll('.nav-group-header')).map(h => h.textContent.trim());

    // Nav links
    const links = Array.from(document.querySelectorAll('.primary-nav .nav-link')).map(l => ({
      view: l.dataset.view,
      text: (l.querySelector('span:not(.nav-active-dot):not(.nav-badge-pill)') || l).textContent.trim(),
      badge: l.querySelector('.nav-badge-pill') ? l.querySelector('.nav-badge-pill').textContent.trim() : null
    }));

    // Scroll styles
    const navComputed = window.getComputedStyle(primaryNav);

    return {
      hasSidebar: !!sb,
      hasBrand: !!brand,
      hasPartition: !!partition,
      hasToggleBar: !!toggleBar,
      hasToggleBtn: !!toggleBtn,
      groupHeaders,
      links,
      overflowY: navComputed.overflowY,
      flex: navComputed.flex
    };
  });

  console.log('\n--- 1. Sidebar Structure ---');
  console.log('Group headers:', sidebarCheck.groupHeaders);
  console.log('Total links:', sidebarCheck.links.length);
  sidebarCheck.links.forEach(l => console.log(`  [${l.view}] "${l.text}" (badge: ${l.badge || 'none'})`));
  console.log('Overflow Y:', sidebarCheck.overflowY);

  // TEST 2: Sidebar 3-Lines Toggle, Collapse, Hover Preview, and Stabilization
  const toggleTest = await page.evaluate(async () => {
    const sb = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarCollapseToggleBtn');

    const initialCollapsed = sb.classList.contains('collapsed');
    
    // Click toggle to collapse
    toggleBtn.click();
    const afterClickCollapsed = sb.classList.contains('collapsed');
    const toggleBtnVisibleWhenCollapsed = window.getComputedStyle(toggleBtn).display !== 'none';
    const sbWidthCollapsed = sb.getBoundingClientRect().width;

    // Simulate mouseenter on collapsed sidebar
    sb.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    const isHoverExpanded = sb.classList.contains('is-hover-expanded');

    // Click inside while hovering to stabilize open
    sb.click();
    const stabilizedOpen = !sb.classList.contains('collapsed');
    const sbWidthStabilized = sb.getBoundingClientRect().width;

    // Click toggle again to verify re-collapse
    toggleBtn.click();
    const reCollapsed = sb.classList.contains('collapsed');

    // Restore to open
    toggleBtn.click();

    return {
      initialCollapsed,
      afterClickCollapsed,
      toggleBtnVisibleWhenCollapsed,
      sbWidthCollapsed,
      isHoverExpanded,
      stabilizedOpen,
      sbWidthStabilized,
      reCollapsed,
      finalCollapsed: sb.classList.contains('collapsed')
    };
  });

  console.log('\n--- 2. Sidebar Toggle & Hover Test ---', toggleTest);

  // TEST 3: Today View Modifications (Removal of Calories and Today's Fuel, Water Intake adjusted)
  const todayViewCheck = await page.evaluate(() => {
    if (typeof switchView === 'function') switchView('today');
    const todayView = document.getElementById('view-today');
    const calPanel = todayView.querySelector('.calories-panel');
    const mealsPanel = todayView.querySelector('.meals-panel');
    const waterPanel = todayView.querySelector('.water-panel');
    const workoutPanel = todayView.querySelector('.workout-panel');
    const dashGrid = todayView.querySelector('.dashboard-grid');

    const gridComputed = window.getComputedStyle(dashGrid);
    const waterCups = document.getElementById('waterCups');

    return {
      hasCalPanel: !!calPanel,
      hasMealsPanel: !!mealsPanel,
      hasWaterPanel: !!waterPanel,
      hasWorkoutPanel: !!workoutPanel,
      gridColumns: gridComputed.gridTemplateColumns,
      waterCupsCount: waterCups ? waterCups.children.length : 0
    };
  });

  console.log('\n--- 3. Today View Panels ---', todayViewCheck);

  // TEST 4: Body Analysis Interactions
  const baTest = await page.evaluate(async () => {
    if (typeof switchView === 'function') switchView('body-analysis');
    const results = {};

    // 1. Goal selection
    const goals = document.querySelectorAll('#baGoalsGrid .ba-goal-card');
    if (goals.length >= 2) {
      goals[1].click();
      results.goalSelected = goals[1].classList.contains('active');
    }

    // 2. Step transitions
    const step1Next = document.getElementById('baStep1NextBtn');
    step1Next.click();
    results.step2Active = document.getElementById('baStep2').classList.contains('active');

    const step2Next = document.getElementById('baStep2NextBtn');
    step2Next.click();
    results.step3Active = document.getElementById('baStep3').classList.contains('active');

    // 3. Load sample photos
    const sampleBtn = document.getElementById('baLoadSamplePhotosBtn');
    sampleBtn.click();
    const frontImg = document.getElementById('baImgFront');
    results.samplePhotosLoaded = frontImg && frontImg.style.display !== 'none';

    // 4. Step 3 Next -> Step 4
    const step3Next = document.getElementById('baStep3NextBtn');
    step3Next.click();
    results.step4Active = document.getElementById('baStep4').classList.contains('active');

    // 5. Run AI Analysis
    const runBtn = document.getElementById('baRunAnalysisBtn');
    runBtn.click(); // should auto-acknowledge consent and run
    results.consentChecked = document.getElementById('baConsentCheck').checked;

    // 6. Test Latest Dashboard Tab
    const tabDash = document.getElementById('baTabDashboardBtn');
    tabDash.click();
    results.tabDashActive = tabDash.classList.contains('active');
    results.step6Active = document.getElementById('baStep6').classList.contains('active');

    // 7. Test History Tab
    const tabHist = document.getElementById('baTabHistoryBtn');
    tabHist.click();
    results.tabHistActive = tabHist.classList.contains('active');
    results.historyWrapVisible = document.getElementById('baHistoryWrap').style.display !== 'none';

    // 8. Test Wizard Tab
    const tabWiz = document.getElementById('baTabWizardBtn');
    tabWiz.click();
    results.tabWizActive = tabWiz.classList.contains('active');
    results.wizardWrapVisible = document.getElementById('baWizardWrap').style.display !== 'none';

    return results;
  });

  console.log('\n--- 4. Body Analysis Interactions ---', baTest);

  // TEST 5: Site-wide Button Connections
  const buttonTests = await page.evaluate(() => {
    switchView('today');
    const tests = [];

    function testBtn(id, targetViewExpected) {
      const el = document.getElementById(id);
      if (!el) {
        tests.push({ id, status: 'NOT_FOUND' });
        return;
      }
      el.click();
      const currentActive = document.querySelector('.view.active') ? document.querySelector('.view.active').id.replace('view-', '') : 'none';
      tests.push({
        id,
        targetViewExpected,
        currentActive,
        success: currentActive === targetViewExpected
      });
    }

    testBtn('dashViewBodyAnalysisBtn', 'body-analysis');
    testBtn('dashViewAllActivityBtn', 'activity');
    testBtn('metricCardCalTrigger', 'food-log');
    testBtn('metricCardWorkoutsTrigger', 'workouts');
    testBtn('metricCardWeightTrigger', 'tracking');
    testBtn('sidebarAiCoachBtn', 'ai-coach');
    testBtn('coachPlanAddToWorkoutBtn', 'workouts');
    testBtn('sidebarSmartStartBtn', 'starting-load');
    testBtn('sidebarExerciseLibraryBtn', 'exercise-library');
    testBtn('sidebarMyFoodsBtn', 'my-foods');
    testBtn('sidebarChallengeBtn', 'challenge');
    testBtn('sidebarCustomizationBtn', 'customization');
    testBtn('sidebarTodayBtn', 'today');

    return tests;
  });

  console.log('\n--- 5. Site-wide Button Tests ---');
  buttonTests.forEach(t => console.log(`  [${t.id}] -> ${t.currentActive} (Success: ${t.success})`));

  console.log('\n--- Page Errors ---');
  console.log(errors.length === 0 ? 'ZERO ERRORS!' : errors);

  // Take screenshot for visual validation
  await page.screenshot({ path: 'test_screenshots/final_verification.png', fullPage: false });
  console.log('Saved screenshot to test_screenshots/final_verification.png');

  await browser.close();
  console.log('\n=== VERIFICATION COMPLETE ===');
})();
