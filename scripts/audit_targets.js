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

  const views = ['today', 'workouts', 'food-log', 'ai-coach', 'posture', 'activity', 'body-analysis'];

  for (const v of views) {
    await page.evaluate((viewId) => window.switchView(viewId), v);
    await new Promise(r => setTimeout(r, 200));

    const small = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, a.btn, select, input[type="button"], input[type="submit"]');
      const res = [];
      btns.forEach(b => {
        if (b.offsetWidth === 0 || b.offsetHeight === 0) return;
        const s = window.getComputedStyle(b);
        if (s.display === 'none' || s.visibility === 'hidden') return;
        const r = b.getBoundingClientRect();
        if (r.width < 44 || r.height < 44) {
          const txt = (b.innerText || b.getAttribute('aria-label') || b.title || b.id || b.className).slice(0, 25).trim();
          res.push({
            id: b.id || '',
            cls: typeof b.className === 'string' ? b.className.split(' ')[0] : '',
            txt,
            w: Math.round(r.width),
            h: Math.round(r.height)
          });
        }
      });
      return res;
    });

    const pageSpecific = small.filter(b => !b.id.startsWith('floating') && !['themeSelector','soundToggleBtn','topAuthBtn','topAdminBtn','topNotificationBtn','topSettingsBtn','topAvatar'].includes(b.id));
    console.log(`=== ${v} (non-header small count: ${pageSpecific.length}) ===`);
    console.log(pageSpecific);
  }

  await browser.close();
})();
