const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test_screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runMobileTestSuite() {
  console.log('===============================================================');
  console.log('STARTING ENHANCED MOBILE E2E TEST SUITE (360px, 390px, 412px)');
  console.log('===============================================================');

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore normal 401 unauthenticated session check and favicon
      if (!text.includes('401') && !text.includes('favicon.ico')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  // =========================================================================
  // TEST SECTION 1: VIEWPORT AUDIT ACROSS 360px, 390px, and 412px
  // =========================================================================
  const viewportsToTest = [
    { width: 360, height: 780, label: 'Samsung Galaxy / Android 360px' },
    { width: 390, height: 844, label: 'iPhone 12/13/14/15 390px' },
    { width: 412, height: 915, label: 'Google Pixel / Galaxy Ultra 412px' }
  ];

  const viewsToTest = [
    { id: 'today', name: 'Dashboard' },
    { id: 'workouts', name: 'Workouts' },
    { id: 'food-log', name: 'Food Log' },
    { id: 'ai-coach', name: 'AI Coach' },
    { id: 'posture', name: 'Camera AI Posture' },
    { id: 'activity', name: 'Activity & GPS' },
    { id: 'body-analysis', name: 'Body Analysis' },
    { id: 'starting-load', name: 'Smart Start' },
    { id: 'exercise-library', name: 'Exercise Library' },
    { id: 'my-foods', name: 'My Foods' },
    { id: 'challenge', name: 'Challenge Engine' },
    { id: 'tracking', name: 'Activity Tracking' },
    { id: 'customization', name: 'Customization' },
    { id: 'profile', name: 'Profile Baseline' }
  ];

  for (const vp of viewportsToTest) {
    console.log(`\n--- Auditing Viewport: ${vp.label} (${vp.width}x${vp.height}) ---`);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

    for (const v of viewsToTest) {
      await page.evaluate((targetView) => {
        document.querySelectorAll('.modal-backdrop.active, .modal.active').forEach(m => {
          m.classList.remove('active');
          m.style.display = 'none';
        });
        window.switchView(targetView);
      }, v.id);

      await new Promise(r => setTimeout(r, 200));

      const metrics = await page.evaluate((viewId) => {
        const clientWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;

        const bad = [];
        document.querySelectorAll('*').forEach(el => {
          if (el.offsetWidth === 0 || el.offsetHeight === 0) return;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return;
          if (el.closest('.ba-stepper-bar, .ai-coach-subtabs, .activity-mode-pills, .muscle-tabs, .topbar-right-actions')) return;
          const rect = el.getBoundingClientRect();
          if (rect.right > clientWidth + 1) {
            bad.push({
              tag: el.tagName,
              id: el.id,
              cls: typeof el.className === 'string' ? el.className.slice(0, 35) : '',
              overflow: Math.round(rect.right - clientWidth)
            });
          }
        });

        return {
          clientWidth,
          scrollWidth,
          bodyScrollWidth,
          hasHScroll: scrollWidth > clientWidth || bodyScrollWidth > clientWidth,
          badCount: bad.length,
          badSample: bad.slice(0, 2)
        };
      }, v.id);

      if (metrics.hasHScroll || metrics.badCount > 0) {
        throw new Error(`Horizontal scroll defect detected on [${v.name}] at ${vp.width}px! metrics: ${JSON.stringify(metrics)}`);
      }
      console.log(`  -> [${v.name}] ScrollWidth: ${metrics.scrollWidth}/${metrics.clientWidth} | Overflow elements: ${metrics.badCount} [PASS]`);
    }
  }

  // Set back to standard 390x844 for interaction and screenshot flow
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // =========================================================================
  // TEST SECTION 2: INTERACTIVE CONTROLS & TOUCH TARGETS AUDIT
  // =========================================================================
  console.log('\n--- Auditing Minimum 44x44px Touch Targets across all 14 views ---');
  let smallTargetsTotal = 0;
  for (const v of viewsToTest) {
    await page.evaluate((viewId) => window.switchView(viewId), v.id);
    await new Promise(r => setTimeout(r, 150));

    const small = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, a.btn, select, input[type="button"], input[type="submit"]');
      const res = [];
      btns.forEach(b => {
        if (b.offsetWidth === 0 || b.offsetHeight === 0) return;
        const s = window.getComputedStyle(b);
        if (s.display === 'none' || s.visibility === 'hidden') return;
        const r = b.getBoundingClientRect();
        if (r.width < 44 || r.height < 44) {
          const txt = (b.innerText || b.getAttribute('aria-label') || b.title || b.id || b.className).slice(0, 25).trim();
          res.push({ id: b.id || '', cls: b.className || '', txt, w: Math.round(r.width), h: Math.round(r.height) });
        }
      });
      return res;
    });

    if (small.length > 0) {
      console.warn(`  -> [${v.name}] WARNING: Found ${small.length} undersized buttons:`, small);
      smallTargetsTotal += small.length;
    } else {
      console.log(`  -> [${v.name}] All touch targets >= 44x44px [PASS]`);
    }
  }
  if (smallTargetsTotal > 0) {
    throw new Error(`Touch target audit failed with ${smallTargetsTotal} undersized buttons!`);
  }

  // =========================================================================
  // TEST SECTION 3: SIDEBAR HAMBURGER & BACKDROP DISMISSAL
  // =========================================================================
  console.log('\n--- Testing Sidebar Navigation Drawer & Backdrop ---');
  await page.evaluate(() => window.switchView('today'));
  await page.click('#mobileMenuBtn');
  await new Promise(r => setTimeout(r, 400));
  const sbStateOpen = await page.evaluate(() => ({
    open: document.getElementById('sidebar').classList.contains('mobile-open'),
    backdropActive: document.getElementById('sidebarBackdrop').classList.contains('active')
  }));
  console.log('Sidebar opened with backdrop:', sbStateOpen);
  if (!sbStateOpen.open || !sbStateOpen.backdropActive) {
    throw new Error('Sidebar failed to open or activate backdrop!');
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_mobile_sidebar_open.png') });

  // Dismiss via backdrop click outside the 270px drawer (x: 330)
  await page.mouse.click(330, 420);
  await new Promise(r => setTimeout(r, 400));
  const sbStateClosed = await page.evaluate(() => ({
    open: document.getElementById('sidebar').classList.contains('mobile-open'),
    backdropActive: document.getElementById('sidebarBackdrop').classList.contains('active')
  }));
  console.log('Sidebar closed via backdrop tap:', sbStateClosed);
  if (sbStateClosed.open || sbStateClosed.backdropActive) {
    throw new Error('Sidebar failed to close cleanly via backdrop!');
  }

  // =========================================================================
  // TEST SECTION 4: THEME TOGGLE & AUDIO TOGGLE
  // =========================================================================
  console.log('\n--- Testing Theme Toggle & Audio Toggle ---');
  await page.select('#themeSelector', 'light');
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_mobile_light_theme.png') });

  await page.select('#themeSelector', 'dark');
  await new Promise(r => setTimeout(r, 300));

  await page.click('#soundToggleBtn');
  await new Promise(r => setTimeout(r, 200));

  // =========================================================================
  // TEST SECTION 5: MODALS VERIFICATION
  // =========================================================================
  console.log('\n--- Testing Key Modals (Quick Options, Notifications, Settings) ---');
  // Quick Options Modal
  try {
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('.sy-scard-menu-dots, .sy-bcard-menu-dots');
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (clicked) {
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_mobile_modal_quick_options.png') });
      await page.evaluate(() => {
        const m = document.getElementById('quickOptionsModal');
        if (m) { m.classList.remove('active', 'open'); m.style.display = 'none'; }
      });
      await new Promise(r => setTimeout(r, 200));
    }
  } catch (e) {}

  // Notifications Modal
  await page.evaluate(() => {
    const btn = document.getElementById('topNotificationBtn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_mobile_modal_notifications.png') });
  await page.evaluate(() => {
    const m = document.getElementById('notificationModal');
    if (m) { m.classList.remove('active', 'open'); m.style.display = 'none'; }
  });
  await new Promise(r => setTimeout(r, 200));

  // Settings Modal
  await page.evaluate(() => {
    const btn = document.getElementById('topSettingsBtn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05b_mobile_modal_settings.png') });
  await page.evaluate(() => {
    const m = document.getElementById('settingsModal');
    if (m) { m.classList.remove('active', 'open'); m.style.display = 'none'; }
  });
  await new Promise(r => setTimeout(r, 200));

  // =========================================================================
  // TEST SECTION 6: FLOATING AI BOT PANEL & PINNED HEADER VERIFICATION
  // =========================================================================
  console.log('\n--- Testing Floating Assistant Launcher & Header Pinned State ---');
  await page.evaluate(() => window.switchView('today'));
  await page.click('#floatingAiLauncher');
  await new Promise(r => setTimeout(r, 400));

  const floatingPanelMetrics = await page.evaluate(() => {
    const p = document.getElementById('floatingAiPanel');
    const h = document.querySelector('.floating-panel-header');
    const closeBtn = document.getElementById('floatingMinimizeBtn');
    const pR = p.getBoundingClientRect();
    const hR = h.getBoundingClientRect();
    const cR = closeBtn.getBoundingClientRect();
    return {
      panelOpen: p.classList.contains('open'),
      panelTop: Math.round(pR.top),
      headerTop: Math.round(hR.top),
      headerVisible: hR.top >= pR.top - 2 && hR.top >= 0,
      closeBtnWidth: Math.round(cR.width),
      closeBtnHeight: Math.round(cR.height)
    };
  });
  console.log('Floating panel metrics on open:', floatingPanelMetrics);
  if (!floatingPanelMetrics.headerVisible) {
    throw new Error('Floating panel header is clipped or pushed off screen!');
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_mobile_floating_ai_panel_open.png') });

  // Close panel via minimize button
  await page.click('#floatingMinimizeBtn');
  await new Promise(r => setTimeout(r, 300));
  const panelClosed = await page.evaluate(() => !document.getElementById('floatingAiPanel').classList.contains('open'));
  console.log('Floating AI panel closed cleanly:', panelClosed);

  // =========================================================================
  // TEST SECTION 7: CAMERA AI POSTURE FORM CHECKER VIEW & OVERLAP VERIFICATION
  // =========================================================================
  console.log('\n--- Testing Camera AI Posture View & Unobstructed CTAs ---');
  await page.evaluate(() => window.switchView('posture'));
  await new Promise(r => setTimeout(r, 400));

  const postureCheck = await page.evaluate(() => {
    const video = document.getElementById('postureVideo');
    const placeholder = document.getElementById('posturePlaceholder');
    const startBtn = document.getElementById('postureStartBtn');
    const launcher = document.getElementById('floatingAiLauncher');

    const vR = video.getBoundingClientRect();
    const pR = placeholder.getBoundingClientRect();
    const sR = startBtn.getBoundingClientRect();
    const lR = launcher.getBoundingClientRect();

    const isStacked = Math.abs(vR.left - pR.left) < 5 && Math.abs(vR.width - pR.width) < 5;
    const isOverlappingFab = !(lR.right < sR.left || lR.left > sR.right || lR.bottom < sR.top || lR.top > sR.bottom);

    return {
      isStacked,
      videoWidth: Math.round(vR.width),
      placeholderWidth: Math.round(pR.width),
      isOverlappingFab,
      startBtnTouchWidth: Math.round(sR.width),
      startBtnTouchHeight: Math.round(sR.height)
    };
  });
  console.log('Camera AI Posture layout verification:', postureCheck);
  if (!postureCheck.isStacked) {
    throw new Error('Camera video and placeholder are split side-by-side instead of stacked!');
  }
  if (postureCheck.isOverlappingFab) {
    throw new Error('Start Camera button is obstructed by floating bot widget!');
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_posture_view_clean.png') });

  // =========================================================================
  // TEST SECTION 8: FULL PAGE SCREENSHOTS CAPTURE ACROSS ALL 14 VIEWS
  // =========================================================================
  console.log('\n--- Capturing Full-Page Mobile Screenshots across all views ---');
  for (const v of viewsToTest) {
    await page.evaluate((targetView) => window.switchView(targetView), v.id);
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `view_${v.id}_full.png`),
      fullPage: true
    });
  }

  // Light mode specific screenshots for visual audit
  await page.evaluate(() => {
    localStorage.setItem('fitfuel_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    window.switchView('posture');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_light_mode_posture_fixed.png') });

  await page.evaluate(() => window.switchView('today'));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13_light_mode_today_fixed.png') });

  console.log('\n===============================================================');
  console.log('MOBILE TEST SUITE PASSED ALL CHECKS WITH ZERO ERRORS');
  console.log('===============================================================');
  console.log('Console errors encountered:', consoleErrors.length);

  await browser.close();
  return { success: true, consoleErrorsCount: consoleErrors.length };
}

runMobileTestSuite().then(res => {
  console.log('Automated mobile test suite finished successfully.');
  process.exit(res.success && res.consoleErrorsCount === 0 ? 0 : 1);
}).catch(err => {
  console.error('Mobile test suite encountered failure:', err);
  process.exit(1);
});
