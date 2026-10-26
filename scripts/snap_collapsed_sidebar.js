const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Click the 3 lines toggle button to collapse the sidebar
  await page.click('#sidebarCollapseToggleBtn');
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/sidebar_collapsed_rail.png', fullPage: false });
  console.log('Collapsed rail screenshot taken');

  await browser.close();
})();
