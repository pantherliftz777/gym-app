const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('--- STEP 1: REPRODUCE DASHBOARD ISSUE ---');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const networkRequests = [];
    page.on('request', req => {
      // track requests
    });

    page.on('response', res => {
      networkRequests.push({
        url: res.url(),
        status: res.status(),
        contentType: res.headers()['content-type'] || 'none'
      });
    });

    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    page.on('pageerror', err => {
      consoleLogs.push({
        type: 'uncaught_error',
        text: err.toString(),
        stack: err.stack
      });
    });

    console.log('Navigating to http://localhost:3000/ ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });

    console.log('Clicking "Launch Demo in 1 Click" / "Instant Demo Lifter"...');
    // Click instant demo lifter
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
      page.click('.btn-ghost.demo-lifter-trigger, .btn-demo-instant')
    ]);

    const finalUrl = page.url();
    console.log('Current URL after login:', finalUrl);

    // Give it 2 seconds to settle
    await new Promise(r => setTimeout(r, 2000));

    const outDir = path.join(__dirname, '..', '..', 'brain-checkpoints');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const screenshotPath = path.join(outDir, 'before_dashboard_reproduce.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Captured reproduce screenshot:', screenshotPath);

    // Save full page screenshot as well
    const fullScreenshotPath = path.join(outDir, 'before_dashboard_reproduce_full.png');
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });

    // Inspect the giant lime shape
    const limeElements = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const matching = [];
      for (const el of all) {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (
          style.backgroundColor.includes('206, 255, 26') ||
          style.fill.includes('206, 255, 26') ||
          style.color.includes('206, 255, 26') ||
          el.outerHTML.includes('#CEFF1A') ||
          el.outerHTML.includes('#ceff1a')
        ) {
          matching.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            zIndex: style.zIndex,
            display: style.display,
            htmlSnippet: el.outerHTML.slice(0, 200)
          });
        }
      }
      return matching;
    });

    console.log('\n--- LIME / #CEFF1A ELEMENTS FOUND ---');
    console.log(JSON.stringify(limeElements, null, 2));

    // Inspect layout computed styles of app shell, sidebar, main
    const layoutStyles = await page.evaluate(() => {
      const appShell = document.querySelector('.app-shell');
      const sidebar = document.querySelector('.sidebar');
      const topbar = document.querySelector('.topbar');
      const pageContent = document.querySelector('.page-content');
      const activeView = document.querySelector('.view.active, #view-today');

      return {
        appShellDisplay: appShell ? window.getComputedStyle(appShell).display : 'null',
        sidebarDisplay: sidebar ? window.getComputedStyle(sidebar).display : 'null',
        sidebarWidth: sidebar ? window.getComputedStyle(sidebar).width : 'null',
        topbarDisplay: topbar ? window.getComputedStyle(topbar).display : 'null',
        pageContentDisplay: pageContent ? window.getComputedStyle(pageContent).display : 'null',
        activeViewDisplay: activeView ? window.getComputedStyle(activeView).display : 'null',
      };
    });

    console.log('\n--- LAYOUT COMPUTED STYLES ---');
    console.log(JSON.stringify(layoutStyles, null, 2));

    console.log('\n--- CONSOLE LOGS ---');
    console.log(JSON.stringify(consoleLogs, null, 2));

    console.log('\n--- NETWORK REQUESTS SUMMARY ---');
    console.log(`Total requests: ${networkRequests.length}`);
    const failed = networkRequests.filter(r => r.status >= 400);
    console.log(`Failed requests (>= 400): ${failed.length}`);
    if (failed.length > 0) {
      console.log(JSON.stringify(failed, null, 2));
    }

    const cssRequests = networkRequests.filter(r => r.url.includes('.css'));
    console.log('CSS requests:', cssRequests);

    fs.writeFileSync(path.join(__dirname, 'reproduce_report.json'), JSON.stringify({
      url: finalUrl,
      limeElements,
      layoutStyles,
      consoleLogs,
      failedRequests,
      cssRequests
    }, null, 2));

  } catch (err) {
    console.error('Reproduction error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
