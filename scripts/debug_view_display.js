const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.click('button[data-view="ai-coach"]');
  await new Promise(r => setTimeout(r, 600));

  const info = await page.evaluate(() => {
    const today = document.getElementById('view-today');
    const coach = document.getElementById('view-ai-coach');
    return {
      todayClasses: today ? today.className : 'null',
      todayDisplay: today ? window.getComputedStyle(today).display : 'null',
      coachClasses: coach ? coach.className : 'null',
      coachDisplay: coach ? window.getComputedStyle(coach).display : 'null',
      todayOffsetTop: today ? today.offsetTop : 0,
      coachOffsetTop: coach ? coach.offsetTop : 0
    };
  });
  console.log('DOM info:', info);
  await browser.close();
})();
