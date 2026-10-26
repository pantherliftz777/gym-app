const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  await page.evaluate(() => switchView('body-analysis'));
  await page.click('#baStep1NextBtn');
  await new Promise(r => setTimeout(r, 500));

  const chain = await page.evaluate(() => {
    let el = document.getElementById('baLoadSamplePhotosBtn');
    const parents = [];
    while (el) {
      parents.push({
        tag: el.tagName,
        id: el.id,
        className: el.className,
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
        opacity: window.getComputedStyle(el).opacity,
        height: window.getComputedStyle(el).height
      });
      el = el.parentElement;
    }
    return parents;
  });
  console.log('Ancestor chain:', chain);

  await browser.close();
})();
