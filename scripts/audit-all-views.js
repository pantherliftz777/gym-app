const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function runAudit() {
  const screenshotsDir = path.join(__dirname, '..', 'test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  const views = [
    'today',
    'ai-coach',
    'body-analysis',
    'activity',
    'posture',
    'food-log',
    'workouts',
    'starting-load',
    'exercise-library',
    'my-foods',
    'challenge',
    'tracking',
    'customization',
    'profile'
  ];

  console.log('Auditing mobile responsiveness for all', views.length, 'views at 390x844...');
  const auditReport = {};

  for (const view of views) {
    // Close any open modals first
    await page.evaluate(() => {
      document.querySelectorAll('.modal-backdrop.active, .modal.active, [id$="Modal"].active').forEach(m => {
        m.classList.remove('active');
        m.style.display = 'none';
      });
      // Also close quick options or notif if open
      const qo = document.getElementById('quickOptionsModal');
      if (qo) { qo.classList.remove('active'); qo.style.display = 'none'; }
      const notif = document.getElementById('notificationModal');
      if (notif) { notif.classList.remove('active'); notif.style.display = 'none'; }
      const wsModal = document.getElementById('workoutSessionModal');
      if (wsModal) { wsModal.classList.remove('active'); wsModal.style.display = 'none'; }
    });

    // Switch to view
    await page.evaluate((targetView) => {
      // Find button for this view
      const btn = document.querySelector(`.nav-link[data-view="${targetView}"]`);
      if (btn) {
        btn.click();
      } else if (window.switchView) {
        window.switchView(targetView);
      }
    }, view);

    // Wait 500ms for UI transition and DOM updates
    await new Promise(r => setTimeout(r, 600));

    // Measure view dimensions and overflow
    const viewMetrics = await page.evaluate((targetView) => {
      const clientWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      const hasHorizontalScroll = scrollWidth > clientWidth || bodyScrollWidth > clientWidth;

      // Find overflowing elements
      const overflowing = [];
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (rect.right > clientWidth + 2) {
          const id = el.id ? `#${el.id}` : '';
          const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
          overflowing.push({
            selector: `${el.tagName.toLowerCase()}${id}${cls}`,
            width: Math.round(rect.width),
            right: Math.round(rect.right),
            overflow: Math.round(rect.right - clientWidth)
          });
        }
      }

      return {
        view: targetView,
        clientWidth,
        scrollWidth,
        bodyScrollWidth,
        hasHorizontalScroll,
        overflowingElementsCount: overflowing.length,
        overflowingTop5: overflowing.slice(0, 5)
      };
    }, view);

    auditReport[view] = viewMetrics;
    console.log(`[${view}] Scroll: ${viewMetrics.scrollWidth} / ${viewMetrics.clientWidth} | Overflowing: ${viewMetrics.overflowingElementsCount}`);
    if (viewMetrics.overflowingElementsCount > 0) {
      console.log('  Top culprits:', JSON.stringify(viewMetrics.overflowingTop5));
    }

    // Save screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, `view_${view}_mobile.png`),
      fullPage: false
    });
  }

  console.log('\nAudit summary complete.');
  await browser.close();
  return auditReport;
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
