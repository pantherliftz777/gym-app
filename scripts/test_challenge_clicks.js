const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Switch to challenge view
  await page.evaluate(() => switchView('challenge'));
  await new Promise(r => setTimeout(r, 400));

  // Open motive modal
  await page.evaluate(() => openModal('#challengeMotiveModal'));
  await new Promise(r => setTimeout(r, 400));

  // 1. Select motive
  console.log('Testing Motive Click:');
  const motiveRes = await page.evaluate(() => {
    const card = document.querySelector('#motiveOptionsList .setup-choice-card[data-motive*="Muscle"]');
    if (card) {
      card.click();
      return { found: true, selected: card.classList.contains('selected'), motive: window.challengeSetup?.motive };
    }
    return { found: false };
  });
  console.log('Motive result:', motiveRes);

  // Click proceedToPrefsBtn
  console.log('Clicking proceedToPrefsBtn...');
  await page.click('#proceedToPrefsBtn');
  await new Promise(r => setTimeout(r, 500));

  // Check if prefs modal is open
  const prefsOpen = await page.evaluate(() => {
    const m = document.getElementById('challengePrefsModal');
    return m ? window.getComputedStyle(m).display : 'null';
  });
  console.log('#challengePrefsModal display:', prefsOpen);

  // 2. Test Time selection: click 20 min button
  console.log('Testing Time (Minutes) Click...');
  const timeRes = await page.evaluate(() => {
    const btn = document.querySelector('#chTimeOptionsList button[data-minutes="20"]');
    if (!btn) return { found: false };
    btn.click();
    return {
      found: true,
      classes: btn.className,
      isSelected: btn.classList.contains('selected'),
      setupMinutes: window.challengeSetup?.minutes
    };
  });
  console.log('Time click result:', timeRes);

  // Also test clicking via puppeteer page.click on child elements (like <b>20 min</b> or <small>Express</small>)
  console.log('Testing Puppeteer page.click on #chTimeOptionsList button[data-minutes="60"] b...');
  try {
    await page.click('#chTimeOptionsList button[data-minutes="60"] b');
    await new Promise(r => setTimeout(r, 200));
    const time60State = await page.evaluate(() => {
      const btn = document.querySelector('#chTimeOptionsList button[data-minutes="60"]');
      return {
        classes: btn?.className,
        setupMinutes: window.challengeSetup?.minutes
      };
    });
    console.log('After clicking 60 min <b>:', time60State);
  } catch (err) {
    console.log('Error clicking 60 min:', err.message);
  }

  // 3. Test Intensity Click
  console.log('Testing Intensity Click on Hard...');
  try {
    await page.click('#chIntensityOptionsList button[data-intensity="Hard"]');
    await new Promise(r => setTimeout(r, 200));
    const intState = await page.evaluate(() => {
      const btn = document.querySelector('#chIntensityOptionsList button[data-intensity="Hard"]');
      return {
        classes: btn?.className,
        setupIntensity: window.challengeSetup?.intensity
      };
    });
    console.log('After clicking Hard:', intState);
  } catch (err) {
    console.log('Error clicking intensity:', err.message);
  }

  // Click proceedToDurationBtn
  console.log('Clicking proceedToDurationBtn...');
  await page.click('#proceedToDurationBtn');
  await new Promise(r => setTimeout(r, 500));

  // Check if duration modal is open
  const durOpen = await page.evaluate(() => {
    const m = document.getElementById('challengeDurationModal');
    return m ? window.getComputedStyle(m).display : 'null';
  });
  console.log('#challengeDurationModal display:', durOpen);

  // 4. Test Duration Days Click: click 30 Days Mastery
  console.log('Testing Duration Click on 30 Days...');
  try {
    await page.click('#durationOptionsList div[data-days="30"]');
    await new Promise(r => setTimeout(r, 200));
    const dur30State = await page.evaluate(() => {
      const card = document.querySelector('#durationOptionsList div[data-days="30"]');
      return {
        classes: card?.className,
        setupDuration: window.challengeSetup?.duration
      };
    });
    console.log('After clicking 30 Days:', dur30State);
  } catch (err) {
    console.log('Error clicking duration:', err.message);
  }

  // 5. Test clicking inside child of duration card (e.g. <b> or <small>)
  console.log('Testing click on child element of 10 Days card...');
  try {
    await page.click('#durationOptionsList div[data-days="10"] b');
    await new Promise(r => setTimeout(r, 200));
    const dur10State = await page.evaluate(() => {
      const card = document.querySelector('#durationOptionsList div[data-days="10"]');
      return {
        classes: card?.className,
        setupDuration: window.challengeSetup?.duration
      };
    });
    console.log('After clicking 10 Days <b>:', dur10State);
  } catch (err) {
    console.log('Error clicking 10 Days <b>:', err.message);
  }

  await browser.close();
})();
