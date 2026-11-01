const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SHOT_DIR = path.join(__dirname, '..', 'test_screenshots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 860 });

  // 1. Production User Locked State (Posture AI)
  console.log('Capturing locked beta view...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.switchView('posture'));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SHOT_DIR, '01_beta_locked_posture_view.png') });

  // 2. Admin Beta Features & Flags Tab
  console.log('Capturing admin beta features tab...');
  await page.evaluate(async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fitfuel.app', password: 'FitFuel@Admin2026!' })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('ff_token', data.token);
      if (window.FitFuelBeta) await window.FitFuelBeta.fetchBetaFeatures();
    }
    window.switchView('admin');
    document.getElementById('adminTabBetaFeatures')?.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SHOT_DIR, '02_admin_beta_features_tab.png') });

  // 3. Admin in Dark Mode
  console.log('Capturing admin beta features in dark mode...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SHOT_DIR, '03_admin_beta_features_dark.png') });

  // 4. Beta Tester Preview with Banner & Feedback Modal
  console.log('Capturing beta tester view with banner and feedback modal...');
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
    window.switchView('posture');
    if (window.FitFuelBeta) window.FitFuelBeta.openFeedbackModal('posture');
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SHOT_DIR, '04_beta_feedback_modal.png') });

  await browser.close();
  console.log('Captured all screenshots successfully in test_screenshots/ !');
}

run();
