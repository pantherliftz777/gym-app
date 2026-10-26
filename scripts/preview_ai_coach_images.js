const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Navigate to AI Coach view
  await page.evaluate(() => {
    if (typeof switchView === 'function') switchView('ai-coach');
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot the entire AI Coach view
  const shotFull = path.join(ARTIFACT_DIR, 'ai_coach_view_with_new_images.png');
  await page.screenshot({ path: shotFull });
  console.log('Saved full view screenshot:', shotFull);

  // Screenshot specifically the header with avatar
  const headerElem = await page.$('.ai-coach-hero-header');
  if (headerElem) {
    const shotHeader = path.join(ARTIFACT_DIR, 'ai_coach_header_avatar_verified.png');
    await headerElem.screenshot({ path: shotHeader });
    console.log('Saved header avatar screenshot:', shotHeader);
  }

  // Screenshot the visual card with hero image
  const visualCard = await page.$('.ai-coach-visual-card');
  if (visualCard) {
    const shotCard = path.join(ARTIFACT_DIR, 'ai_coach_visual_card_hero_verified.png');
    await visualCard.screenshot({ path: shotCard });
    console.log('Saved visual card screenshot:', shotCard);
  }

  await browser.close();
  console.log('Finished capturing screenshots.');
})();
