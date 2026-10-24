const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

(async () => {
  const screenshotsDir = path.join(__dirname, '..', 'test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  // Evaluate overflow elements
  const overflowElements = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const all = document.querySelectorAll('*');
    const results = [];

    for (const el of all) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      if (rect.right > docWidth + 2) {
        results.push({
          tag: el.tagName,
          id: el.id,
          className: el.className ? (typeof el.className === 'string' ? el.className.slice(0, 100) : '') : '',
          width: Math.round(rect.width),
          right: Math.round(rect.right),
          overflowAmount: Math.round(rect.right - docWidth),
          text: (el.innerText || '').slice(0, 40).replace(/\n/g, ' ')
        });
      }
    }
    return {
      docWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      elements: results.slice(0, 30)
    };
  });

  console.log('Document dimensions:', {
    clientWidth: overflowElements.docWidth,
    docScrollWidth: overflowElements.scrollWidth,
    bodyScrollWidth: overflowElements.bodyScrollWidth
  });
  console.log('Total overflowing elements:', overflowElements.elements.length);
  console.log(JSON.stringify(overflowElements.elements, null, 2));

  await page.screenshot({ path: path.join(screenshotsDir, 'before_fix_mobile.png'), fullPage: false });
  await page.screenshot({ path: path.join(screenshotsDir, 'before_fix_mobile_full.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots saved to test_screenshots/before_fix_mobile.png');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
