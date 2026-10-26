const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.click('button[data-view="ai-coach"]');
  await new Promise(r => setTimeout(r, 600));

  const siblings = await page.evaluate(() => {
    const coach = document.getElementById('view-ai-coach');
    const parent = coach.parentElement;
    const children = Array.from(parent.children);
    return children.map(c => ({
      tagName: c.tagName,
      id: c.id,
      className: c.className,
      offsetHeight: c.offsetHeight
    })).filter(c => c.offsetHeight > 0);
  });
  console.log('Parent children with offsetHeight > 0:', siblings);
  await browser.close();
})();
