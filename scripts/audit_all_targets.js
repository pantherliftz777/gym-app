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

  const views = [
    'today', 'workouts', 'food-log', 'ai-coach', 'posture', 'activity',
    'body-analysis', 'starting-load', 'exercise-library', 'my-foods',
    'challenge', 'tracking', 'customization', 'profile'
  ];

  let totalSmall = 0;

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

    console.log(`[${v}] Small targets count: ${small.length}`);
    if (small.length > 0) {
      console.log(small);
      totalSmall += small.length;
    }
  }

  console.log(`\nTOTAL SMALL TARGETS ACROSS ALL 14 VIEWS: ${totalSmall}`);
  await browser.close();
  process.exit(totalSmall === 0 ? 0 : 1);
})();
