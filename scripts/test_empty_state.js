const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.click('.primary-nav .nav-link[data-section="training"]');
  await new Promise(r => setTimeout(r, 600));
  
  // Search for non-existent exercise to trigger empty state
  await page.type('#exerciseSearchInput', 'xyznonexistentexercise123');
  await new Promise(r => setTimeout(r, 400));
  
  const emptyStateHtml = await page.evaluate(() => {
    const el = document.querySelector('.empty-state-card');
    return el ? { 
      title: el.querySelector('h3')?.textContent.trim(), 
      buttons: Array.from(el.querySelectorAll('button')).map(b => b.textContent.trim()),
      recs: el.querySelector('ul')?.textContent.trim()
    } : null;
  });
  console.log('Empty state test result:', emptyStateHtml);
  await browser.close();
})();
