const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Switch to light mode
  await page.evaluate(() => {
    localStorage.setItem('fitfuel_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  });

  // 1. Posture in Light Mode
  await page.evaluate(() => window.switchView('posture'));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', 'final_light_posture_390.png') });

  // 2. Today in Light Mode
  await page.evaluate(() => window.switchView('today'));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', 'final_light_today_390.png') });

  // 3. Floating AI Panel Open
  await page.click('#floatingAiLauncher');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', 'final_floating_ai_panel_open.png') });
  await page.click('#floatingMinimizeBtn');
  await new Promise(r => setTimeout(r, 300));

  // 4. Sidebar Open
  await page.click('#mobileMenuBtn');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', 'final_sidebar_open.png') });
  
  // Close sidebar cleanly via programmatic dismissal
  await page.evaluate(() => {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarBackdrop').classList.remove('active');
  });
  await new Promise(r => setTimeout(r, 400));

  // 5. Test 360px viewport on Today
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.switchView('today'));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', 'final_light_today_360.png') });

  // 6. Test 412px viewport on Posture
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.switchView('posture'));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', 'final_light_posture_412.png') });

  await browser.close();
  console.log('Fresh verification screenshots captured cleanly.');
})();
