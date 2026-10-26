const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function verifyThemeFix() {
  const screenshotsDir = path.join(__dirname, '..', 'test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1. TEST LIGHT MODE
  console.log('\n--- TESTING LIGHT MODE ---');
  await page.evaluate(() => {
    if (window.applyTheme) {
      window.applyTheme('light');
    } else {
      localStorage.setItem('fitfuel_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  });

  // Give transitions time to complete
  await new Promise(r => setTimeout(r, 600));

  const lightMetrics = await page.evaluate(() => {
    const getCS = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage.slice(0, 100),
        borderColor: cs.borderColor
      };
    };

    return {
      body: getCS('body'),
      welcomeStrip: getCS('.welcome-strip'),
      welcomeH2: getCS('.welcome-strip h2'),
      welcomeP: getCS('.welcome-strip p'),
      welcomeOverline: getCS('.welcome-overline'),
      stripStatsB: getCS('.strip-stats b'),
      dailyMotivation: getCS('.daily-motivation-panel'),
      motivationTag: getCS('.motivation-tag'),
      quoteText: getCS('.motivation-quote-text'),
      author: getCS('.motivation-author'),
      nextQuoteBtn: getCS('.next-quote-btn')
    };
  });

  console.log('Light Mode Computed Styles:');
  console.log(JSON.stringify(lightMetrics, null, 2));

  // Scroll to motivation panel & welcome strip area
  await page.evaluate(() => {
    const el = document.querySelector('.welcome-strip');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  await new Promise(r => setTimeout(r, 500));

  const lightCardPath = path.join(screenshotsDir, 'light_mode_cards_fixed.png');
  await page.screenshot({ path: lightCardPath, fullPage: false });
  console.log('Saved Light Mode screenshot to:', lightCardPath);

  // 2. TEST DARK MODE
  console.log('\n--- TESTING DARK MODE ---');
  await page.evaluate(() => {
    if (window.applyTheme) {
      window.applyTheme('dark');
    } else {
      localStorage.setItem('fitfuel_theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    }
  });

  await new Promise(r => setTimeout(r, 600));

  const darkMetrics = await page.evaluate(() => {
    const getCS = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        borderColor: cs.borderColor
      };
    };

    return {
      body: getCS('body'),
      welcomeH2: getCS('.welcome-strip h2'),
      welcomeP: getCS('.welcome-strip p'),
      quoteText: getCS('.motivation-quote-text'),
      author: getCS('.motivation-author')
    };
  });

  console.log('Dark Mode Computed Styles:');
  console.log(JSON.stringify(darkMetrics, null, 2));

  const darkCardPath = path.join(screenshotsDir, 'dark_mode_cards_verified.png');
  await page.screenshot({ path: darkCardPath, fullPage: false });
  console.log('Saved Dark Mode screenshot to:', darkCardPath);

  await browser.close();
  console.log('\nVerification completed successfully!');
}

verifyThemeFix().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
