const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 600));

  const card = await page.$('.ai-coach-header-card');
  if (card) {
    await card.screenshot({ path: path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/ai_coach_header_avatar_verified.png') });
    console.log('Saved header avatar screenshot successfully');
  }
  await browser.close();
})();
