const puppeteer = require('puppeteer');

(async () => {
  console.log('--- STARTING COMPREHENSIVE E2E VERIFICATION ---');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const results = {};

  // 1. BRAND UNIFICATION VERIFICATION
  const brandCheck = await page.evaluate(() => {
    const sidebarBrand = document.querySelector('#sidebar .brand');
    const heroBrand = document.querySelector('.sy-hero-brand');
    return {
      sidebarBrandText: sidebarBrand ? sidebarBrand.innerText.trim() : null,
      sidebarHtml: sidebarBrand ? sidebarBrand.innerHTML : null,
      heroBrandText: heroBrand ? heroBrand.innerText.trim() : null,
      heroHtml: heroBrand ? heroBrand.innerHTML : null
    };
  });
  results.brandUnification = {
    pass: (brandCheck.sidebarBrandText || '').replace(/\s+/g, '') === 'FitFuel' &&
          (brandCheck.heroBrandText || '').replace(/\s+/g, '') === 'FitFuel',
    details: brandCheck
  };

  // 2. DESKTOP 3-LINE SIDEBAR COLLAPSE / EXPAND
  const sidebarCheck = await page.evaluate(async () => {
    const btn = document.getElementById('mobileMenuBtn');
    const shell = document.querySelector('.app-shell');
    const sidebar = document.getElementById('sidebar');
    const initialWidth = sidebar.getBoundingClientRect().width;

    // Click collapse button
    btn.click();
    await new Promise(r => setTimeout(r, 350));
    const collapsedWidth = sidebar.getBoundingClientRect().width;
    const isShellCollapsed = shell.classList.contains('sidebar-collapsed');

    // Click again to expand
    btn.click();
    await new Promise(r => setTimeout(r, 350));
    const expandedWidth = sidebar.getBoundingClientRect().width;

    return {
      initialWidth,
      collapsedWidth,
      isShellCollapsed,
      expandedWidth,
      working: initialWidth > 150 && collapsedWidth === 0 && expandedWidth > 150
    };
  });
  results.desktopSidebarCollapse = sidebarCheck;

  // 3. FLOATING CHATBOT MINIMIZE BUTTON
  const minimizeCheck = await page.evaluate(async () => {
    const trigger = document.getElementById('floatingAiLauncher');
    const panel = document.getElementById('floatingAiPanel');
    const minBtn = document.getElementById('floatingMinimizeBtn');

    // Open chat
    trigger.click();
    await new Promise(r => setTimeout(r, 350));
    const opened = panel.classList.contains('open');

    // Minimize chat
    minBtn.click();
    await new Promise(r => setTimeout(r, 350));
    const closed = !panel.classList.contains('open');

    return { opened, closed, working: opened && closed };
  });
  results.floatingChatMinimize = minimizeCheck;

  // 4. PREMIUM PAID PLANS MODAL
  const premiumModalCheck = await page.evaluate(async () => {
    const pill = document.getElementById('syHeroProfilePill');
    const modal = document.getElementById('premiumPlansModal');
    const toggleAnnual = document.getElementById('planAnnualBtn');
    const toggleMonthly = document.getElementById('planMonthlyBtn');

    // Trigger modal
    pill.click();
    await new Promise(r => setTimeout(r, 350));
    const isModalVisible = modal && window.getComputedStyle(modal).display !== 'none';

    // Toggle annual
    if (toggleAnnual) toggleAnnual.click();
    await new Promise(r => setTimeout(r, 150));
    const isAnnualActive = toggleAnnual && toggleAnnual.classList.contains('active');

    // Select plan
    const selectProBtn = modal.querySelector('.select-plan-btn[data-plan="pro"]');
    if (selectProBtn) selectProBtn.click();
    await new Promise(r => setTimeout(r, 350));

    const isModalClosed = modal && window.getComputedStyle(modal).display === 'none';
    const tierText = document.getElementById('userTierLabel') ? document.getElementById('userTierLabel').innerText : '';

    return {
      isModalVisible,
      isAnnualActive,
      isModalClosed,
      tierText,
      working: isModalVisible && isAnnualActive && isModalClosed && tierText.toLowerCase().includes('pro')
    };
  });
  results.premiumPlansModal = premiumModalCheck;

  // 5. BODY COMPOSITION & BMI ENGINE
  const bmiEngineCheck = await page.evaluate(async () => {
    // Navigate to profile
    if (typeof showView === 'function') showView('profile');
    await new Promise(r => setTimeout(r, 350));

    const hInput = document.getElementById('pfHeightInput');
    const wInput = document.getElementById('pfWeightInput');
    const bmiCard = document.getElementById('profileBmiCategoryCard');

    // Set height 180cm, weight 90kg -> BMI ~ 27.8 (Overweight / Moderate)
    hInput.value = '180';
    hInput.dispatchEvent(new Event('input', { bubbles: true }));
    wInput.value = '90';
    wInput.dispatchEvent(new Event('input', { bubbles: true }));
    wInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 200));

    const bmiVal = document.getElementById('profileBmiVal') ? document.getElementById('profileBmiVal').innerText : '';
    const badge = document.getElementById('profileBmiBadge') ? document.getElementById('profileBmiBadge').innerText : '';
    const needle = document.getElementById('profileBmiNeedle') ? document.getElementById('profileBmiNeedle').style.left : '';

    // Test Underweight: 180cm, 55kg -> BMI ~ 17.0
    hInput.value = '180';
    wInput.value = '55';
    wInput.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 200));
    const underweightBadge = document.getElementById('profileBmiBadge') ? document.getElementById('profileBmiBadge').innerText : '';

    return {
      overweightBmi: bmiVal,
      overweightBadge: badge,
      needlePosition: needle,
      underweightBadge,
      cardVisible: bmiCard && window.getComputedStyle(bmiCard).display !== 'none',
      working: bmiVal.includes('27.8') && badge.includes('Overweight') && underweightBadge.includes('Underweight')
    };
  });
  results.bmiEngine = bmiEngineCheck;

  console.log(JSON.stringify(results, null, 2));

  await browser.close();
})();
