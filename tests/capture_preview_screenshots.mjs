import puppeteer from '../gym-app/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/harsh/.gemini/antigravity/brain/dfd5eca1-3489-42fb-95fd-f7ccc9c9bfb0';
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 1. Landing Dark Mode
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_landing_dark.png') });
  console.log('Saved preview_landing_dark.png');

  // 2. Landing Light Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_landing_light.png') });
  console.log('Saved preview_landing_light.png');

  // 3. Switch back to Dark & Trigger Instant Demo to go to Dashboard Command Center
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btns = Array.from(document.querySelectorAll('button'));
    const demoBtn = btns.find(b => b.textContent && b.textContent.includes('Demo Lifter'));
    if (demoBtn) demoBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_dashboard_today.png') });
  console.log('Saved preview_dashboard_today.png');

  // 4. Workout Tracker View
  await page.evaluate(() => {
    window.location.hash = 'view-tracking';
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_dashboard_workout.png') });
  console.log('Saved preview_dashboard_workout.png');

  // 5. Posture & AI Form Check View
  await page.evaluate(() => {
    window.location.hash = 'view-posture';
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_dashboard_posture.png') });
  console.log('Saved preview_dashboard_posture.png');

  // 6. Facility & Optical QR Turnstile View
  await page.evaluate(() => {
    window.location.hash = 'view-facility';
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_dashboard_facility.png') });
  console.log('Saved preview_dashboard_facility.png');

  // 7. Mobile Viewport (390px) Command Center
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    window.location.hash = 'view-today';
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'preview_mobile_today.png') });
  console.log('Saved preview_mobile_today.png');

  await browser.close();
  console.log('All preview captures completed!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
