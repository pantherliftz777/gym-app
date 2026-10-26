const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Take screenshot of today view
  await page.screenshot({ path: 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/today_view_current.png', fullPage: false });

  // Scroll down a bit to see analytics row
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.screenshot({ path: 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/today_view_middle.png', fullPage: false });

  // Scroll down to water panel
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.screenshot({ path: 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/today_view_bottom.png', fullPage: false });

  console.log('Screenshots taken');
  await browser.close();
})();
