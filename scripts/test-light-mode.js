const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function testLightMode() {
  const screenshotsDir = path.join(__dirname, '..', 'test_screenshots');

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=390,844']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Set Light Mode
  await page.evaluate(() => {
    localStorage.setItem('fitfuel_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    const sel = document.getElementById('themeSelector');
    if (sel) sel.value = 'light';
  });

  await new Promise(r => setTimeout(r, 400));

  const views = ['today', 'posture', 'ai-coach', 'activity', 'body-analysis', 'workouts', 'food-log', 'profile'];

  for (const v of views) {
    await page.evaluate((targetView) => {
      document.querySelectorAll('.modal-backdrop.active, .modal.active').forEach(m => {
        m.classList.remove('active');
        m.style.display = 'none';
      });
      window.switchView(targetView);
    }, v);

    await new Promise(r => setTimeout(r, 600));

    const check = await page.evaluate(() => {
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth
      };
    });

    console.log(`[Light Mode - ${v}] Client: ${check.clientWidth}, Scroll: ${check.scrollWidth}`);

    await page.screenshot({
      path: path.join(screenshotsDir, `light_view_${v}_mobile.png`),
      fullPage: false
    });
  }

  await browser.close();
  console.log('All Light Mode screenshots saved!');
}

testLightMode().catch(console.error);
