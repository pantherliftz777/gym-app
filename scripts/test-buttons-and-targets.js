const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Check buttons on initial page
  const buttonAudit = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, a.btn, input[type="button"], select');
    const smallTargets = [];
    const hiddenOrClipped = [];

    buttons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (rect.width === 0 || rect.height === 0) return;

      const text = (btn.innerText || btn.getAttribute('aria-label') || btn.title || btn.id || '').slice(0, 30).trim();
      const id = btn.id ? '#' + btn.id : '';
      const cls = typeof btn.className === 'string' ? '.' + btn.className.trim().split(/\s+/)[0] : '';
      const name = `${btn.tagName.toLowerCase()}${id}${cls} ("${text}")`;

      if (rect.width < 38 || rect.height < 38) {
        smallTargets.push({ name, width: Math.round(rect.width), height: Math.round(rect.height) });
      }

      if (rect.right > document.documentElement.clientWidth) {
        hiddenOrClipped.push({ name, right: Math.round(rect.right), viewport: document.documentElement.clientWidth });
      }
    });

    return {
      totalButtons: buttons.length,
      smallTargetsCount: smallTargets.length,
      smallTargets: smallTargets.slice(0, 15),
      hiddenOrClippedCount: hiddenOrClipped.length,
      hiddenOrClipped: hiddenOrClipped.slice(0, 15)
    };
  });

  console.log('Button audit results:', JSON.stringify(buttonAudit, null, 2));
  await browser.close();
})().catch(console.error);
