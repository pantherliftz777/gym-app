const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const artifactDir = path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Call applyTheme('light')
  await page.evaluate(() => {
    applyTheme('light');
  });

  // Click Training
  await page.click('.primary-nav .nav-link[data-section="training"]');
  await new Promise(r => setTimeout(r, 500));

  // Click Home Workout chip
  await page.click('.workout-type-chip[data-type="home"]');
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(artifactDir, 'upgraded_workouts_03_light_theme.png') });
  await browser.close();
  console.log('Light theme screenshot captured!');
})();
