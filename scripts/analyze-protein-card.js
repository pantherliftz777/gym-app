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

  const info = await page.evaluate(() => {
    const card = document.getElementById('metricCardProteinTrigger');
    if (!card) return 'Not found';
    const parent = card.parentElement;
    const gparent = parent ? parent.parentElement : null;
    return {
      card: {
        rect: card.getBoundingClientRect(),
        computed: {
          width: window.getComputedStyle(card).width,
          gridCol: window.getComputedStyle(card).gridColumn,
          margin: window.getComputedStyle(card).margin
        }
      },
      parent: {
        tag: parent.tagName,
        className: parent.className,
        rect: parent.getBoundingClientRect(),
        computed: {
          display: window.getComputedStyle(parent).display,
          gridTemplateColumns: window.getComputedStyle(parent).gridTemplateColumns,
          width: window.getComputedStyle(parent).width,
          overflow: window.getComputedStyle(parent).overflow
        }
      },
      gparent: gparent ? {
        tag: gparent.tagName,
        className: gparent.className,
        rect: gparent.getBoundingClientRect(),
        computed: {
          display: window.getComputedStyle(gparent).display,
          width: window.getComputedStyle(gparent).width
        }
      } : null
    };
  });

  console.log('Protein card analysis:', JSON.stringify(info, null, 2));
  await browser.close();
})().catch(console.error);
