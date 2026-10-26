const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function testTopbar() {
  const screenshotsDir = path.join(__dirname, '..', 'test_screenshots', 'topbar');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const viewports = [
    { name: '1440_desktop', width: 1440, height: 900, isMobile: false },
    { name: '1280_laptop', width: 1280, height: 800, isMobile: false },
    { name: '1024_small_laptop', width: 1024, height: 768, isMobile: false },
    { name: '768_tablet', width: 768, height: 1024, isMobile: false },
    { name: '390_mobile', width: 390, height: 844, isMobile: true }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Set signed in state (like Utkarsh) so "Sign out" shows up
    await page.evaluate(() => {
      if (window.applyTheme) window.applyTheme('light');
      const authBtn = document.getElementById('topAuthBtn');
      if (authBtn) authBtn.textContent = 'Sign out';
      const greeting = document.getElementById('userGreeting');
      if (greeting) greeting.textContent = 'Good evening, Utkarsh';
    });

    await new Promise(r => setTimeout(r, 400));

    // Capture topbar element bounding box & measurements
    const metrics = await page.evaluate(() => {
      const tb = document.querySelector('.topbar');
      const search = document.querySelector('.topbar-search-wrap');
      const weather = document.querySelector('.header-weather-badge');
      const right = document.querySelector('.topbar-right-actions');
      const auth = document.getElementById('topAuthBtn');
      const greetingRow = document.querySelector('.topbar-greeting-row');

      const getBox = (el) => el ? {
        x: Math.round(el.getBoundingClientRect().x),
        y: Math.round(el.getBoundingClientRect().y),
        w: Math.round(el.getBoundingClientRect().width),
        h: Math.round(el.getBoundingClientRect().height)
      } : null;

      return {
        topbar: getBox(tb),
        search: getBox(search),
        weather: getBox(weather),
        right: getBox(right),
        auth: getBox(auth),
        greetingRow: getBox(greetingRow),
        bodyScrollWidth: document.body.scrollWidth,
        windowInnerWidth: window.innerWidth
      };
    });

    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    console.log('Metrics:', JSON.stringify(metrics, null, 2));

    const shotPath = path.join(screenshotsDir, `topbar_${vp.name}.png`);
    // Clip screenshot to topbar area (top 180px)
    await page.screenshot({
      path: shotPath,
      clip: { x: 0, y: 0, width: vp.width, height: Math.min(220, vp.height) }
    });
    console.log('Saved:', shotPath);

    await page.close();
  }

  await browser.close();
  console.log('All responsive tests done!');
}

testTopbar().catch(console.error);
