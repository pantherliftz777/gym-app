const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.click('button[data-view="ai-coach"]');
  await new Promise(r => setTimeout(r, 600));

  const list = await page.evaluate(() => {
    const views = Array.from(document.querySelectorAll('.view'));
    return views.map(v => ({
      id: v.id,
      className: v.className,
      display: window.getComputedStyle(v).display,
      height: v.offsetHeight
    })).filter(v => v.height > 0 || v.display !== 'none');
  });
  console.log('Views with height > 0 or display != none:');
  console.log(list);
  await browser.close();
})();
