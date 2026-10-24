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

  // Navigate to ai-coach
  await page.evaluate(() => {
    window.switchView('ai-coach');
  });
  await new Promise(r => setTimeout(r, 600));

  const info = await page.evaluate(() => {
    const layout = document.querySelector('.ai-coach-page-layout');
    const headerCard = document.querySelector('.ai-coach-header-card');
    const stream = document.getElementById('coachChatStream');
    return {
      layout: {
        rect: layout.getBoundingClientRect(),
        computed: {
          display: window.getComputedStyle(layout).display,
          gridTemplateColumns: window.getComputedStyle(layout).gridTemplateColumns,
          width: window.getComputedStyle(layout).width
        }
      },
      headerCard: {
        rect: headerCard.getBoundingClientRect(),
        computed: {
          width: window.getComputedStyle(headerCard).width,
          maxWidth: window.getComputedStyle(headerCard).maxWidth
        }
      },
      firstCol: {
        rect: layout.children[0].getBoundingClientRect(),
        computed: {
          width: window.getComputedStyle(layout.children[0]).width,
          minWidth: window.getComputedStyle(layout.children[0]).minWidth
        }
      },
      secondCol: {
        rect: layout.children[1].getBoundingClientRect(),
        computed: {
          width: window.getComputedStyle(layout.children[1]).width
        }
      }
    };
  });

  console.log('AI coach analysis:', JSON.stringify(info, null, 2));
  await browser.close();
})().catch(console.error);
