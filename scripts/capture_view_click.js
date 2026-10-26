const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.click('button[data-view="ai-coach"]');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/ai_coach_actual_view_verified.png') });
  await browser.close();
  console.log('Saved ai_coach_actual_view_verified.png');
})();
