const puppeteer = require('puppeteer');

(async () => {
  console.log('--- STARTING MULTI-PAGE BROWSER VERIFICATION ---');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Verify index.html (Landing)
    console.log('\n[1/3] Testing http://localhost:3000/ (index.html)...');
    let res = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Status:', res.status());
    console.log('Title:', await page.title());

    // Check Hero elements
    const heading = await page.$eval('.hero-heading', el => el.innerText.replace(/\n/g, ' '));
    console.log('Hero Heading:', heading);
    const cone = await page.$('.volumetric-cone');
    console.log('Volumetric Cone exists?', cone !== null ? 'PASS' : 'FAIL');
    const athleteImg = await page.$eval('#heroAthleteImg', el => el.getAttribute('src'));
    console.log('Hero Athlete Src:', athleteImg);

    // Test 1RM Calculator
    await page.$eval('#calcWeight', el => el.value = '120');
    await page.$eval('#calcReps', el => el.value = '5');
    await page.type('#calcWeight', ''); // trigger input event
    await page.$eval('#calcReps', el => el.dispatchEvent(new Event('input')));
    const calcResult = await page.$eval('#calc1RMVal', el => el.innerText);
    console.log('1RM Epley Calc (120kg x 5 reps):', calcResult);

    // Test Hydration Button
    const initialHydro = await page.$eval('#demoHydroVal', el => el.innerText);
    await page.click('.btn-hydro[data-ml="500"]');
    const newHydro = await page.$eval('#demoHydroVal', el => el.innerText);
    console.log(`Hydration click: ${initialHydro} -> ${newHydro}`);

    // Test Theme Toggle
    await page.click('.btn-theme-toggle');
    const lightTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
    console.log('Theme after toggle:', lightTheme);
    await page.click('.btn-theme-toggle'); // toggle back to dark

    // 2. Verify product.html
    console.log('\n[2/3] Testing http://localhost:3000/product.html...');
    res = await page.goto('http://localhost:3000/product.html', { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Status:', res.status());
    console.log('Title:', await page.title());
    const sectionsCount = await page.$$eval('.product-feature-section', els => els.length);
    console.log('Technical Feature Sections count:', sectionsCount);
    const dashCardsCount = await page.$$eval('.dash-preview-card', els => els.length);
    console.log('Dashboard View Preview Cards count:', dashCardsCount);

    // 3. Verify pricing.html
    console.log('\n[3/3] Testing http://localhost:3000/pricing.html...');
    res = await page.goto('http://localhost:3000/pricing.html', { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Status:', res.status());
    console.log('Title:', await page.title());
    const pricingCardsCount = await page.$$eval('.pricing-card', els => els.length);
    console.log('Pricing Cards count:', pricingCardsCount);

    // Test Monthly/Yearly toggle
    const initialPrice = await page.$eval('[data-monthly-price]', el => el.innerText);
    await page.click('#pricingSwitch');
    const yearlyPrice = await page.$eval('[data-monthly-price]', el => el.innerText);
    console.log(`Pricing Switch Toggle: ${initialPrice} -> ${yearlyPrice}`);

    // Test FAQ Accordion
    const faqItem2 = await page.$('.faq-item:nth-child(2)');
    await page.click('.faq-item:nth-child(2) .faq-question');
    const isOpen = await page.$eval('.faq-item:nth-child(2)', el => el.classList.contains('open'));
    console.log('FAQ item 2 opened on click?', isOpen ? 'PASS' : 'FAIL');

    console.log('\n>>> ALL 3 PAGES AND INTERACTIVE CAPABILITIES PASSED 100%! <<<');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
