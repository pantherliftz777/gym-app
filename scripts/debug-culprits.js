const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  for (const v of ['ai-coach', 'activity', 'body-analysis', 'posture', 'today']) {
    await page.evaluate((view) => {
      const btn = document.querySelector('.nav-link[data-view="' + view + '"]');
      if (btn) btn.click();
    }, v);
    await new Promise(r => setTimeout(r, 600));

    const data = await page.evaluate((view) => {
      const clientW = document.documentElement.clientWidth;
      const results = [];
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return;
        const rect = el.getBoundingClientRect();
        if (rect.right > clientW + 2 || rect.width > clientW + 2) {
          results.push({
            tag: el.tagName,
            id: el.id,
            cls: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
            w: Math.round(rect.width),
            r: Math.round(rect.right),
            overflow: Math.round(rect.right - clientW),
            flex: style.flex,
            minWidth: style.minWidth,
            width: style.width
          });
        }
      });
      return { view, badEls: results.filter(r => r.overflow > 10).slice(0, 15) };
    }, v);
    console.log('=== VIEW:', v, '===');
    console.log(JSON.stringify(data.badEls, null, 2));
  }
  await browser.close();
})().catch(console.error);
