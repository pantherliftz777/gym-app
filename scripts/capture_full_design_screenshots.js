const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = 'C:\\Users\\harsh\\.gemini\\antigravity\\brain\\0305ca67-13ca-4c12-89d6-28dd966c99ee';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Home Page 1440x900 Dark Mode
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => localStorage.setItem('fitfuel_theme', 'dark'));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'home_hero_1440x900_dark.png'), fullPage: false });
  console.log('Saved: home_hero_1440x900_dark.png');

  // 2. Home Page 1440x900 Light Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('fitfuel_theme', 'light');
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'home_hero_1440x900_light.png'), fullPage: false });
  console.log('Saved: home_hero_1440x900_light.png');

  // 3. Home Page Full Scroll Dark Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('fitfuel_theme', 'dark');
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'home_page_full_dark.png'), fullPage: true });
  console.log('Saved: home_page_full_dark.png');

  // 4. Dashboard 1440x900 Dark Mode (No Showcase Tab, Overview Active)
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('fitfuel_theme', 'dark');
    localStorage.setItem('fitfuel_auth', 'true');
    localStorage.setItem('fitfuel_demo_user', 'Jordan Davis');
  });
  await page.goto('http://localhost:3000/dashboard.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'dashboard_overview_1440x900_dark.png'), fullPage: false });
  console.log('Saved: dashboard_overview_1440x900_dark.png');

  // 5. Mobile Home Page 390x844 Dark Mode
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'home_mobile_390x844_dark.png'), fullPage: false });
  console.log('Saved: home_mobile_390x844_dark.png');

  await browser.close();
  console.log('All design screenshots captured successfully!');
})();
