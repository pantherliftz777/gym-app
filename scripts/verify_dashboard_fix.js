const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', '..', 'brain-checkpoints');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function runAudit() {
  console.log('=== STARTING AUDIT & VERIFICATION ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const viewports = [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '768x1024', width: 768, height: 1024 },
    { name: '390x844', width: 390, height: 844 }
  ];

  const results = [];

  for (const vp of viewports) {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });

      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('401')) {
          errors.push(msg.text());
        }
      });

      // Set localStorage before navigation
      await page.evaluateOnNewDocument((t) => {
        localStorage.setItem('fitfuel_theme', t);
        localStorage.setItem('fitfuel_auth', 'true');
        localStorage.setItem('fitfuel_demo_user', 'Jordan Davis');
      }, theme);

      const navUrl = 'http://localhost:3000/dashboard.html';
      const response = await page.goto(navUrl, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1500));

      // Metrics check
      const layoutData = await page.evaluate(() => {
        const appShell = document.querySelector('.app-shell');
        const sidebar = document.querySelector('.sidebar');
        const topbar = document.querySelector('.topbar');
        const viewToday = document.querySelector('#view-today');
        const giantElements = [];

        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 500 && rect.height > 500 && el.tagName === 'svg') {
            giantElements.push({ tag: el.tagName, class: el.className, w: rect.width, h: rect.height });
          }
        });

        return {
          appShellDisplay: appShell ? window.getComputedStyle(appShell).display : 'none',
          sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : 0,
          sidebarDisplay: sidebar ? window.getComputedStyle(sidebar).display : 'none',
          topbarHeight: topbar ? topbar.getBoundingClientRect().height : 0,
          viewTodayDisplay: viewToday ? window.getComputedStyle(viewToday).display : 'none',
          viewTodayHeight: viewToday ? viewToday.getBoundingClientRect().height : 0,
          todayCardsCount: document.querySelectorAll('#view-today .glass-card, #view-today .today-card, #view-today .metric-card, #view-today .hero-carousel-card').length,
          giantSvgs: giantElements
        };
      });

      const shotName = `after_dashboard_${vp.name}_${theme}.png`;
      const shotPath = path.join(outDir, shotName);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`Saved screenshot: ${shotName}`);
      console.log(`[${vp.name} - ${theme}] shell: ${layoutData.appShellDisplay}, sidebar: ${layoutData.sidebarWidth}px, today display: ${layoutData.viewTodayDisplay}, height: ${layoutData.viewTodayHeight}px, giantSvgs: ${layoutData.giantSvgs.length}, errors: ${errors.length}`);

      results.push({
        viewport: vp.name,
        theme,
        layoutData,
        errors,
        screenshot: shotName
      });

      await page.close();
    }
  }

  // Offline service worker test
  console.log('\n--- TESTING OFFLINE RELOAD ---');
  const offlinePage = await browser.newPage();
  await offlinePage.setViewport({ width: 1440, height: 900 });
  await offlinePage.goto('http://localhost:3000/dashboard.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Go offline
  await offlinePage.setOfflineMode(true);
  console.log('Set offline mode: TRUE. Reloading...');
  let offlineSuccess = false;
  try {
    await offlinePage.reload({ waitUntil: 'networkidle2', timeout: 10000 });
    offlineSuccess = true;
  } catch (err) {
    console.warn('Offline reload note:', err.message);
  }

  const offlineShot = path.join(outDir, 'after_dashboard_offline.png');
  await offlinePage.screenshot({ path: offlineShot, fullPage: false });
  console.log('Saved offline screenshot: after_dashboard_offline.png');

  await browser.close();
  console.log('=== VERIFICATION COMPLETED ===');
  return results;
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
