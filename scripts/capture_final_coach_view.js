const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/ai_coach_final_light.png') });

  // Toggle dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark-mode');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/ai_coach_final_dark.png') });

  await browser.close();
  console.log('Saved final screenshots for light and dark modes.');
})();
