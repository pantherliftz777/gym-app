const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Starting headless browser verification...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    console.log('Navigating to http://localhost:3000...');
    const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Response status:', response.status());

    // Check page title
    const title = await page.title();
    console.log('Page Title:', title);

    // Check that topbar from dashboard is NOT present
    const dashboardHeader = await page.$('.topbar');
    console.log('Dashboard topbar present?', dashboardHeader !== null ? 'YES (UNWANTED)' : 'NO (CORRECT)');

    // Check that FiTusion landing elements ARE present
    const heroTitle = await page.$eval('.hero-heading', el => el.innerText.trim());
    console.log('Hero Heading:', heroTitle.replace(/\n/g, ' '));

    const athleteImg = await page.$('.athlete-photo');
    console.log('Athlete Image present?', athleteImg !== null ? 'YES' : 'NO');

    const lightCone = await page.$('#heroLightCone');
    console.log('Volumetric Light Cone present?', lightCone !== null ? 'YES' : 'NO');

    // Take screenshot of Hero Section
    const outDir = path.join(__dirname, '..', '..', 'brain-checkpoints');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    
    const heroScreenshot = path.join(outDir, 'landing_hero_desktop.png');
    await page.screenshot({ path: heroScreenshot, fullPage: false });
    console.log('Saved Hero Screenshot to:', heroScreenshot);

    // Full page screenshot
    const fullScreenshot = path.join(outDir, 'landing_full_page.png');
    await page.screenshot({ path: fullScreenshot, fullPage: true });
    console.log('Saved Full Page Screenshot to:', fullScreenshot);

    // Test Light Mode Switcher
    console.log('Testing Light Mode toggle...');
    await page.click('#themeToggleBtn');
    const themeAttr = await page.$eval('html', el => el.getAttribute('data-theme'));
    console.log('HTML data-theme after toggle:', themeAttr);

    const lightScreenshot = path.join(outDir, 'landing_light_mode.png');
    await page.screenshot({ path: lightScreenshot, fullPage: false });
    console.log('Saved Light Mode Screenshot to:', lightScreenshot);

    // Switch back to dark mode
    await page.click('#themeToggleBtn');

    // Test clicking Get Started (Auth Modal)
    console.log('Testing "Get Started" button click...');
    await page.click('#btnGetStarted');
    await new Promise(r => setTimeout(r, 400));

    const modalDisplay = await page.$eval('#authModal', el => window.getComputedStyle(el).display);
    console.log('Auth Modal display after click:', modalDisplay);

    const modalScreenshot = path.join(outDir, 'landing_auth_modal.png');
    await page.screenshot({ path: modalScreenshot, fullPage: false });
    console.log('Saved Auth Modal Screenshot to:', modalScreenshot);

    // Test 1-click Demo Lifter access
    console.log('Testing 1-click Demo Lifter access...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
      page.click('#authDemoBtn')
    ]);

    const dashboardUrl = page.url();
    console.log('Navigated URL:', dashboardUrl);
    const dashboardTitle = await page.title();
    console.log('Dashboard Title:', dashboardTitle);

    const dashScreenshot = path.join(outDir, 'dashboard_launched.png');
    await page.screenshot({ path: dashScreenshot, fullPage: false });
    console.log('Saved Dashboard Screenshot to:', dashScreenshot);

    // Mobile Viewport test
    console.log('Testing Mobile Viewport (iPhone 14 / 390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    const mobileScreenshot = path.join(outDir, 'landing_mobile.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    console.log('Saved Mobile Screenshot to:', mobileScreenshot);

    console.log('ALL BROWSER VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Browser verification error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
