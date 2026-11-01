const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

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

  // 1. Check Training section (Workouts)
  await page.evaluate(() => switchView('workouts'));
  await new Promise(r => setTimeout(r, 600));

  const workoutsTabs = await page.evaluate(() => {
    const activeSection = document.getElementById('view-workouts');
    const btns = activeSection.querySelectorAll('.hub-subnav-btn');
    return Array.from(btns).map(b => ({
      text: b.querySelector('span')?.textContent.trim(),
      view: b.dataset.hubview,
      active: b.classList.contains('active')
    }));
  });
  console.log('1. Training subnav in view-workouts:', JSON.stringify(workoutsTabs, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'verify_01_training_subnav.png'), fullPage: false });

  // 2. Check AI Coach section (ai-coach)
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 600));

  const aiCoachTabs = await page.evaluate(() => {
    const activeSection = document.getElementById('view-ai-coach');
    const btns = activeSection.querySelectorAll('.hub-subnav-btn');
    return Array.from(btns).map(b => ({
      text: b.querySelector('span')?.textContent.trim(),
      view: b.dataset.hubview,
      active: b.classList.contains('active')
    }));
  });
  console.log('2. AI Coach subnav in view-ai-coach:', JSON.stringify(aiCoachTabs, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'verify_02_ai_coach_subnav.png'), fullPage: false });

  // 3. Check Progress section (Activity & GPS)
  await page.evaluate(() => switchView('activity'));
  await new Promise(r => setTimeout(r, 600));

  const progressTabs = await page.evaluate(() => {
    const activeSection = document.getElementById('view-activity');
    const btns = activeSection.querySelectorAll('.hub-subnav-btn');
    return Array.from(btns).map(b => ({
      text: b.querySelector('span')?.textContent.trim(),
      view: b.dataset.hubview,
      active: b.classList.contains('active')
    }));
  });
  console.log('3. Progress subnav in view-activity:', JSON.stringify(progressTabs, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'verify_03_progress_subnav.png'), fullPage: false });

  // 4. Check Labs section (Posture AI)
  await page.evaluate(() => switchView('posture'));
  await new Promise(r => setTimeout(r, 600));

  const labsTabs = await page.evaluate(() => {
    const activeSection = document.getElementById('view-posture');
    const btns = activeSection.querySelectorAll('.hub-subnav-btn');
    return Array.from(btns).map(b => ({
      text: b.querySelector('span')?.textContent.trim(),
      view: b.dataset.hubview,
      active: b.classList.contains('active')
    }));
  });
  console.log('4. Labs subnav in view-posture:', JSON.stringify(labsTabs, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'verify_04_labs_subnav.png'), fullPage: false });

  // 5. Check Body Scan view
  await page.evaluate(() => switchView('body-analysis'));
  await new Promise(r => setTimeout(r, 600));

  const bodyScanTabs = await page.evaluate(() => {
    const activeSection = document.getElementById('view-body-analysis');
    const btns = activeSection.querySelectorAll('.hub-subnav-btn');
    return Array.from(btns).map(b => ({
      text: b.querySelector('span')?.textContent.trim(),
      view: b.dataset.hubview,
      active: b.classList.contains('active')
    }));
  });
  console.log('5. Labs subnav in view-body-analysis:', JSON.stringify(bodyScanTabs, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'verify_05_body_scan_view.png'), fullPage: false });

  // 6. Test subnav button clicking to Challenge
  await page.evaluate(() => switchView('workouts'));
  await new Promise(r => setTimeout(r, 400));
  await page.click('#view-workouts .hub-subnav-btn[data-hubview="challenge"]');
  await new Promise(r => setTimeout(r, 600));
  const activeViewAfterClick = await page.evaluate(() => {
    const visibleView = document.querySelector('section.view.active');
    return visibleView ? visibleView.id : 'none';
  });
  console.log('6. Clicked Challenges button -> Active view is:', activeViewAfterClick);

  console.log('Console errors during run:', consoleErrors);
  await browser.close();
  console.log('Verification finished successfully!');
})();
