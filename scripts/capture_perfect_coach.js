const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 600));

  // Find the avatar element and its container
  const header = await page.$('.ai-coach-header-card');
  if (header) {
    await header.screenshot({ path: path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/ai_coach_header_card_perfect.png') });
  }

  const avatar = await page.$('.ai-coach-avatar-lg');
  if (avatar) {
    await avatar.screenshot({ path: path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/ai_coach_avatar_circle_only.png') });
  }

  const visualCard = await page.$('.ai-coach-visual-card');
  if (visualCard) {
    await visualCard.screenshot({ path: path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/ai_coach_visual_card_perfect.png') });
  }

  await browser.close();
  console.log('Saved perfect screenshots.');
})();
