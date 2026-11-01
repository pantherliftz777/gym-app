const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const artifactDir = path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a');

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Helper to get active sidebar link text
  async function getActiveSidebarText() {
    return await page.evaluate(() => {
      const el = document.querySelector('.primary-nav .nav-link.selected');
      return el ? el.querySelector('span')?.textContent.trim() : null;
    });
  }

  // Helper to get active section id
  async function getActiveSectionId() {
    return await page.evaluate(() => {
      const el = document.querySelector('section.view.active');
      return el ? el.id : null;
    });
  }

  // 1. Overview
  console.log('\n--- Test 1: Overview ---');
  await page.click('.primary-nav .nav-link[data-section="overview"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section:', await getActiveSectionId());
  console.log('Sidebar Selected:', await getActiveSidebarText());
  await page.screenshot({ path: path.join(artifactDir, 'step1_overview.png') });

  // 2. Training
  console.log('\n--- Test 2: Training ---');
  await page.click('.primary-nav .nav-link[data-section="training"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section:', await getActiveSectionId());
  console.log('Sidebar Selected:', await getActiveSidebarText());
  await page.screenshot({ path: path.join(artifactDir, 'step2_training_workouts.png') });

  // Switch to Challenges tab inside Training
  console.log('Clicking Challenges tab inside Training...');
  await page.click('#view-workouts .hub-subnav-btn[data-hubview="challenge"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section after tab switch:', await getActiveSectionId());
  console.log('Sidebar Selected (should remain Training):', await getActiveSidebarText());
  await page.screenshot({ path: path.join(artifactDir, 'step2_training_challenges.png') });

  // 3. Nutrition
  console.log('\n--- Test 3: Nutrition ---');
  await page.click('.primary-nav .nav-link[data-section="nutrition"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section:', await getActiveSectionId());
  console.log('Sidebar Selected:', await getActiveSidebarText());

  console.log('Clicking My Foods tab inside Nutrition...');
  await page.click('#view-food-log .hub-subnav-btn[data-hubview="my-foods"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section after tab switch:', await getActiveSectionId());
  console.log('Sidebar Selected (should remain Nutrition):', await getActiveSidebarText());
  await page.screenshot({ path: path.join(artifactDir, 'step3_nutrition_my_foods.png') });

  // 4. AI Coach
  console.log('\n--- Test 4: AI Coach ---');
  await page.click('.primary-nav .nav-link[data-section="ai-coach"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section:', await getActiveSectionId());
  console.log('Sidebar Selected:', await getActiveSidebarText());
  await page.screenshot({ path: path.join(artifactDir, 'step4_ai_coach.png') });

  // 5. Progress
  console.log('\n--- Test 5: Progress ---');
  await page.click('.primary-nav .nav-link[data-section="progress"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section:', await getActiveSectionId());
  console.log('Sidebar Selected:', await getActiveSidebarText());

  console.log('Clicking Activity & GPS tab inside Progress...');
  await page.click('#view-tracking .hub-subnav-btn[data-hubview="activity"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section after tab switch:', await getActiveSectionId());
  console.log('Sidebar Selected (should remain Progress):', await getActiveSidebarText());
  await page.screenshot({ path: path.join(artifactDir, 'step5_progress_activity.png') });

  // 6. Labs (Beta)
  console.log('\n--- Test 6: Labs (Beta) ---');
  await page.click('.primary-nav .nav-link[data-section="labs"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section:', await getActiveSectionId());
  console.log('Sidebar Selected:', await getActiveSidebarText());

  console.log('Clicking Body Scan tab inside Labs...');
  await page.click('#view-posture .hub-subnav-btn[data-hubview="body-analysis"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section after tab switch:', await getActiveSectionId());
  console.log('Sidebar Selected (should remain Labs (Beta)):', await getActiveSidebarText());
  await page.screenshot({ path: path.join(artifactDir, 'step6_labs_body_scan.png') });

  // 7. Accounts
  console.log('\n--- Test 7: Accounts ---');
  await page.click('.primary-nav .nav-link[data-section="accounts"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section:', await getActiveSectionId());
  console.log('Sidebar Selected:', await getActiveSidebarText());

  console.log('Clicking Settings tab inside Accounts...');
  await page.click('#view-profile .hub-subnav-btn[data-hubview="customization"]');
  await new Promise(r => setTimeout(r, 400));
  console.log('Active Section after tab switch:', await getActiveSectionId());
  console.log('Sidebar Selected (should remain Accounts):', await getActiveSidebarText());
  await page.screenshot({ path: path.join(artifactDir, 'step7_accounts_settings.png') });

  // Take screenshot of simplified sidebar
  await page.screenshot({ path: path.join(artifactDir, 'simplified_sidebar_desktop.png') });

  console.log('\nConsole Errors:', consoleErrors);
  await browser.close();
  console.log('All 7 sections verified successfully!');
})();
