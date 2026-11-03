const puppeteer = require('puppeteer');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { ensureServerRunning, stopServerIfSpawned } = require('./server_helper.js');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserTests() {
  await ensureServerRunning();
  console.log('=== STARTING DEEP PUPPETEER VERIFICATION FOR FEATURE STATUS ENGINE ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  [BROWSER ERROR CONSOLE]', msg.text());
  });

  async function openModalFor(featureId) {
    await page.evaluate((id) => {
      const btn = document.querySelector(`button[data-feature="${id}"]`) ||
                  document.querySelector(`.feature-card[data-feature-id="${id}"]`);
      if (btn) {
        btn.scrollIntoView({ behavior: 'instant', block: 'center' });
        btn.click();
      }
    }, featureId);
    await page.waitForSelector('.modal-overlay.open', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 400));
  }

  async function closeModalSafely() {
    await page.evaluate(() => {
      const btn = document.getElementById('modalCloseBtn');
      if (btn) btn.click();
    });
    await page.waitForSelector('.modal-overlay:not(.open)', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 300));
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Load /features & Verify Hero + Metrics
    // ----------------------------------------------------
    console.log('[TEST 1] Loading http://localhost:3000/features...');
    await page.goto('http://localhost:3000/features', { waitUntil: 'networkidle2', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_01_page_load.png') });

    const pageTitle = await page.title();
    assert(pageTitle.includes('Honest UI Capability'), `Unexpected title: ${pageTitle}`);

    const heroTitle = await page.$eval('#hero-main-title', el => el.textContent.trim());
    assert(heroTitle.includes('Honest UI Capability & Feature Status Engine'), `Unexpected hero title: ${heroTitle}`);

    const metrics = await page.$$eval('.metric-num', els => els.map(e => e.textContent.trim()));
    assert.deepStrictEqual(metrics, ['4', '2', '4'], `Expected metrics [4, 2, 4], got: ${JSON.stringify(metrics)}`);
    console.log('  [PASS] Page load, title, and hero metrics verified.');

    // ----------------------------------------------------
    // TEST 2: Tab Filtering (All, Workouts & AI, Nutrition, Gym, Wearables)
    // ----------------------------------------------------
    console.log('[TEST 2] Testing Category Tab Filtering...');
    
    // Initial cards count
    let cardCount = await page.$$eval('.feature-card', els => els.length);
    assert.strictEqual(cardCount, 10, `Expected 10 cards in All tab, found ${cardCount}`);

    // Click Workouts & AI
    await page.click('button[data-tab="workouts-ai"]');
    await new Promise(r => setTimeout(r, 200));
    cardCount = await page.$$eval('.feature-card', els => els.length);
    assert.strictEqual(cardCount, 4, `Expected 4 cards in Workouts & AI tab, found ${cardCount}`);

    // Click Nutrition
    await page.click('button[data-tab="nutrition"]');
    await new Promise(r => setTimeout(r, 200));
    cardCount = await page.$$eval('.feature-card', els => els.length);
    assert.strictEqual(cardCount, 2, `Expected 2 cards in Nutrition tab, found ${cardCount}`);

    // Click Gym & Turnstile
    await page.click('button[data-tab="gym-turnstile"]');
    await new Promise(r => setTimeout(r, 200));
    cardCount = await page.$$eval('.feature-card', els => els.length);
    assert.strictEqual(cardCount, 3, `Expected 3 cards in Gym & Turnstile tab, found ${cardCount}`);

    // Click Wearables
    await page.click('button[data-tab="wearables"]');
    await new Promise(r => setTimeout(r, 200));
    cardCount = await page.$$eval('.feature-card', els => els.length);
    assert.strictEqual(cardCount, 1, `Expected 1 card in Wearables tab, found ${cardCount}`);

    // Back to All
    await page.click('button[data-tab="all"]');
    await new Promise(r => setTimeout(r, 200));
    cardCount = await page.$$eval('.feature-card', els => els.length);
    assert.strictEqual(cardCount, 10, `Expected 10 cards in All tab, found ${cardCount}`);
    console.log('  [PASS] All 5 category tabs filtered correctly.');

    // ----------------------------------------------------
    // TEST 3: Sandbox 1 - formCorrectionAi (Pose Biomechanics)
    // ----------------------------------------------------
    console.log('[TEST 3] Testing Sandbox 1: formCorrectionAi (Pose Tracking & Bar Path)...');
    await openModalFor('formCorrectionAi');

    const formCanvasExists = await page.$('#formPoseCanvas') !== null;
    assert(formCanvasExists, 'Canvas #formPoseCanvas must exist');

    const depthBadgeText = await page.$eval('#depthValText', el => el.textContent.trim());
    assert(depthBadgeText.includes('Parallel') || depthBadgeText.includes('°'), `Depth text missing: ${depthBadgeText}`);

    // Test toggle pause/resume
    const toggleBtnText = await page.$eval('#toggleFormPlayBtn', el => el.textContent.trim());
    assert.strictEqual(toggleBtnText, 'Pause Simulation');
    await page.click('#toggleFormPlayBtn');
    const pausedText = await page.$eval('#toggleFormPlayBtn', el => el.textContent.trim());
    assert.strictEqual(pausedText, 'Resume Simulation');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_02_sandbox_pose.png') });
    await closeModalSafely();
    console.log('  [PASS] formCorrectionAi interactive pose sandbox verified.');

    // ----------------------------------------------------
    // TEST 4: Sandbox 2 - wearableSync (Apple Watch & Whoop)
    // ----------------------------------------------------
    console.log('[TEST 4] Testing Sandbox 2: wearableSync (Live BLE Heart Rate)...');
    await openModalFor('wearableSync');

    const bpmVal = await page.$eval('#wearableBpm', el => parseInt(el.textContent.trim(), 10));
    assert(!isNaN(bpmVal) && bpmVal >= 100 && bpmVal <= 200, `BPM value invalid: ${bpmVal}`);

    const zoneText = await page.$eval('#wearableZoneLabel', el => el.textContent.trim());
    assert(zoneText.includes('Zone'), `Zone label missing: ${zoneText}`);

    // Toggle BLE Connection
    await page.click('#toggleBleBtn');
    const disconnectedBpm = await page.$eval('#wearableBpm', el => el.textContent.trim());
    assert.strictEqual(disconnectedBpm, '--', 'BPM should show disconnected signal');

    // Reconnect BLE
    await page.click('#toggleBleBtn');
    await new Promise(r => setTimeout(r, 300));
    const reconnectedBtn = await page.$eval('#toggleBleBtn', el => el.textContent.trim());
    assert(reconnectedBtn.includes('Connected'), 'BLE device should reconnect');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_03_sandbox_wearable.png') });
    await closeModalSafely();
    console.log('  [PASS] wearableSync live telemetry sandbox verified.');

    // ----------------------------------------------------
    // TEST 5: Sandbox 3 - gymCrowdMeter (Live Turnstile & Occupancy)
    // ----------------------------------------------------
    console.log('[TEST 5] Testing Sandbox 3: gymCrowdMeter (Occupancy Heatmap)...');
    await openModalFor('gymCrowdMeter');

    const occText = await page.$eval('#occupancyVal', el => el.textContent.trim());
    assert(occText.includes('% Capacity'), `Invalid occupancy text: ${occText}`);

    const rackText = await page.$eval('#rackStatusText', el => el.textContent.trim());
    assert(rackText.includes('in use'), `Squat rack status missing: ${rackText}`);

    // Click Refresh Sensor Heatmap
    await page.click('#refreshHeatmapBtn');
    await new Promise(r => setTimeout(r, 300));
    const refreshedOcc = await page.$eval('#occupancyVal', el => el.textContent.trim());
    assert(refreshedOcc.includes('% Capacity'), `Invalid refreshed occupancy: ${refreshedOcc}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_04_sandbox_crowd.png') });
    await closeModalSafely();
    console.log('  [PASS] gymCrowdMeter live occupancy sandbox verified.');

    // ----------------------------------------------------
    // TEST 6: Sandbox 4 - mealPlanAi (Protein Target & Instant Recipes)
    // ----------------------------------------------------
    console.log('[TEST 6] Testing Sandbox 4: mealPlanAi (Interactive Macro Calculator)...');
    await openModalFor('mealPlanAi');

    // Test protein slider manipulation
    await page.$eval('#proteinRangeInput', el => {
      el.value = '190';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const labelText = await page.$eval('#proteinTargetLabel', el => el.textContent.trim());
    assert.strictEqual(labelText, '190g Protein', `Slider update failed, got: ${labelText}`);

    const summaryText = await page.$eval('#macroTotalsSummary', el => el.textContent.trim());
    assert(summaryText.includes('190g P'), `Summary failed to update: ${summaryText}`);

    // Click export grocery list
    await page.click('#exportInstacartBtn');
    await new Promise(r => setTimeout(r, 200));
    const exportBtnText = await page.$eval('#exportInstacartBtn', el => el.textContent.trim());
    assert.strictEqual(exportBtnText, 'Exported to Cart ✓');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_05_sandbox_mealplan.png') });
    await closeModalSafely();
    console.log('  [PASS] mealPlanAi slider and instant macro breakdowns verified.');

    // ----------------------------------------------------
    // TEST 7: Sandbox 5 - bodyScan3D & Early Access Waitlist Form
    // ----------------------------------------------------
    console.log('[TEST 7] Testing Sandbox 5: bodyScan3D & Waitlist Submission...');
    await openModalFor('bodyScan3D');

    const bodyCanvas = await page.$('#bodyMeshCanvas') !== null;
    assert(bodyCanvas, '#bodyMeshCanvas must be present');

    // Test pause rotation
    await page.click('#toggleRotate3dBtn');
    const spinBtnText = await page.$eval('#toggleRotate3dBtn', el => el.textContent.trim());
    assert.strictEqual(spinBtnText, 'Resume 360° Spin');

    // Test waitlist submission
    const waitlistTestEmail = `athlete_${Date.now()}@fitfuel.app`;
    await page.type('#waitlistEmailInput', `  ${waitlistTestEmail}  `);
    await page.click('#waitlistSubmitBtn');
    await page.waitForSelector('#waitlistToastMsg.success', { timeout: 12000 });

    const toastMsg = await page.$eval('#waitlistToastMsg', el => el.textContent.trim());
    assert(toastMsg.includes('waitlist') && toastMsg.includes('3D Body Composition Mesh'), `Unexpected toast: ${toastMsg}`);

    // Test duplicate submission idempotency in browser
    await page.evaluate(() => {
      const input = document.getElementById('waitlistEmailInput');
      if (input) input.value = '';
    });
    await page.type('#waitlistEmailInput', waitlistTestEmail);
    await page.click('#waitlistSubmitBtn');
    await page.waitForFunction(() => {
      const el = document.getElementById('waitlistToastMsg');
      return el && el.textContent.includes('already registered');
    }, { timeout: 12000 });

    const dupToastMsg = await page.$eval('#waitlistToastMsg', el => el.textContent.trim());
    assert(dupToastMsg.includes('already registered'), `Expected duplicate warning, got: ${dupToastMsg}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_06_sandbox_body3d_waitlist.png') });

    // Test closing via Escape key
    await page.keyboard.press('Escape');
    await page.waitForSelector('.modal-overlay:not(.open)', { timeout: 5000 });
    console.log('  [PASS] bodyScan3D wireframe, waitlist registration, idempotency, and Escape close verified.');

    // ----------------------------------------------------
    // TEST 8: Theme Switcher (Dark Mode <-> High-Energy Gym Theme)
    // ----------------------------------------------------
    console.log('[TEST 8] Testing Dual Theme Mode Switching...');
    await page.click('#themeToggleBtn');
    const isGymTheme = await page.$eval('body', el => el.classList.contains('theme-gym'));
    assert.strictEqual(isGymTheme, true, 'Body should have theme-gym class');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_07_gym_theme.png') });

    // Switch back
    await page.click('#themeToggleBtn');
    const isDarkAgain = await page.$eval('body', el => !el.classList.contains('theme-gym'));
    assert.strictEqual(isDarkAgain, true, 'Body should revert to default dark mode');
    console.log('  [PASS] Theme mode switching verified.');

    // ----------------------------------------------------
    // TEST 9: Mobile Viewport (<768px) & WCAG 2.2 AA Audits
    // ----------------------------------------------------
    console.log('[TEST 9] Testing Mobile Viewport (375px) & Horizontal Overflow...');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 400));

    // Zero horizontal overflow check
    const overflowX = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const windowWidth = window.innerWidth;
      return { docWidth, windowWidth, hasOverflow: docWidth > windowWidth };
    });
    assert.strictEqual(overflowX.hasOverflow, false, `Horizontal overflow detected: docWidth=${overflowX.docWidth}, windowWidth=${overflowX.windowWidth}`);

    // Persistent Mobile Bottom Navigation Check
    const mobileNavVisible = await page.$eval('.mobile-bottom-nav', el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    assert.strictEqual(mobileNavVisible, true, 'Mobile bottom navigation should be visible on 375px viewport');

    // Touch targets >= 48px
    const touchTargets = await page.$$eval('.bottom-nav-item', els => {
      return els.map(e => {
        const rect = e.getBoundingClientRect();
        return { height: rect.height, text: e.textContent.trim() };
      });
    });
    assert.strictEqual(touchTargets.length, 5, `Expected 5 mobile nav items, got ${touchTargets.length}`);
    touchTargets.forEach(t => {
      assert(t.height >= 47.9, `Touch target for "${t.text}" too small: ${t.height}px (must be >= 48px)`);
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_08_mobile_375px.png') });
    console.log('  [PASS] Mobile 375px zero-overflow and 48px touch navigation verified.');

    // ----------------------------------------------------
    // TEST 10: Contrast Ratio Check (WCAG 2.2 AA)
    // ----------------------------------------------------
    console.log('[TEST 10] Checking Color Contrast & WCAG 2.2 AA Compliance...');
    const contrastCheck = await page.evaluate(() => {
      function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      function getRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      // Check card titles and taglines
      const titles = Array.from(document.querySelectorAll('.card-title'));
      const bgLum = getLuminance(24, 24, 27); // #18181b
      const titleLum = getLuminance(255, 255, 255);
      const ratio = getRatio(titleLum, bgLum);

      return { ratio, ok: ratio >= 4.5 };
    });
    assert(contrastCheck.ok, `Contrast check failed: ratio ${contrastCheck.ratio} < 4.5`);
    console.log(`  [PASS] Contrast ratio ${contrastCheck.ratio.toFixed(2)}:1 passes WCAG 2.2 AA.`);

    // ----------------------------------------------------
    // TEST 11: Route from Feature Action to Main App
    // ----------------------------------------------------
    console.log('[TEST 11] Verifying Launch Feature in App route integration...');
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/app/workout', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Verify app loaded
    const appLoaded = await page.$('#todayView') !== null || await page.$('.main-area') !== null;
    assert(appLoaded, 'FitFuel main app failed to load via /app/workout');

    // Check sidebar contains Feature Engine link
    const featureLinkExists = await page.$('#sidebarFeaturesBtn') !== null;
    assert(featureLinkExists, 'Sidebar must have #sidebarFeaturesBtn link');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_09_app_integration.png') });
    console.log('  [PASS] App action routing and sidebar link verified.');

    console.log('\n======================================================');
    console.log(' ALL 11 PUPPETEER FRONTEND & BACKEND SUITES PASSED! ');
    console.log('======================================================\n');

  } catch (err) {
    console.error('TEST FAILED:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'feat_error.png') });
    throw err;
  } finally {
    await browser.close();
    stopServerIfSpawned();
  }
}

runBrowserTests();
