const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Open Prefs modal directly
  await page.evaluate(() => {
    switchView('challenge');
    openModal('#challengePrefsModal');
    // Uncheck all checkboxes
    document.querySelectorAll('#chTypesOptionsList input[type="checkbox"]').forEach(c => {
      c.checked = false;
      const p = c.closest('.setup-choice-card');
      if (p) p.classList.remove('selected');
    });
  });

  await new Promise(r => setTimeout(r, 300));

  // Try clicking proceedToDurationBtn when no workout types are checked
  console.log('Clicking proceedToDurationBtn with 0 checked types...');
  await page.click('#proceedToDurationBtn');
  await new Promise(r => setTimeout(r, 400));

  // Check if prefs modal is STILL open (did not advance)
  const stillOpen = await page.evaluate(() => {
    const m = document.getElementById('challengePrefsModal');
    return m ? window.getComputedStyle(m).display : 'none';
  });
  console.log('Prefs modal display after invalid attempt:', stillOpen);

  // Now check if toast is shown
  const toastText = await page.evaluate(() => {
    const t = document.querySelector('.toast, #toastNotification, .ff-toast');
    return t ? t.textContent : 'none';
  });
  console.log('Toast feedback:', toastText);

  await browser.close();
  console.log('Validation test finished.');
})();
