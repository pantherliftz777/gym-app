const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  for (const vid of ['today', 'body-analysis']) {
    const btns = await page.evaluate((v) => {
      if (typeof switchView === 'function') switchView(v);
      const el = document.getElementById('view-' + v);
      return Array.from(el.querySelectorAll('button, a.btn, [role="button"]')).map(b => ({
        id: b.id,
        text: (b.innerText || b.getAttribute('aria-label') || b.title || '').trim().replace(/\s+/g, ' ').slice(0, 50),
        onclickAttr: b.getAttribute('onclick'),
        dataView: b.dataset.view
      }));
    }, vid);
    console.log(vid, JSON.stringify(btns, null, 2));
  }
  await browser.close();
})();
