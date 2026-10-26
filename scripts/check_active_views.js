const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.click('button[data-view="ai-coach"]');
  await new Promise(r => setTimeout(r, 600));

  const viewStates = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.view')).map(v => ({
      id: v.id,
      className: v.className,
      display: window.getComputedStyle(v).display
    }));
  });
  console.log('Visible / Active Views:', viewStates.filter(v => v.className.includes('active') || v.display !== 'none'));
  await browser.close();
})();
