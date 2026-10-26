const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const consoleErrors = [];
  page.on('pageerror', err => consoleErrors.push(err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Get all views
  const views = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.view')).map(v => v.id.replace('view-', ''));
  });
  console.log('Views to audit:', views);

  // Analyze buttons per view
  for (const viewId of views) {
    await page.evaluate((vid) => {
      if (typeof switchView === 'function') switchView(vid);
    }, viewId);
    await new Promise(r => setTimeout(r, 200));

    const viewButtons = await page.evaluate((vid) => {
      const v = document.getElementById('view-' + vid);
      if (!v) return [];
      const btns = Array.from(v.querySelectorAll('button, a.btn, [role="button"], .card-action, .quick-action, .action-btn'));
      return btns.map(b => {
        return {
          id: b.id,
          text: (b.innerText || b.getAttribute('aria-label') || b.title || '').trim().replace(/\s+/g, ' ').slice(0, 50),
          className: b.className,
          tagName: b.tagName.toLowerCase(),
          hasOnclickAttr: !!b.getAttribute('onclick'),
          hasDataView: b.dataset.view || null,
          hasDataModal: b.dataset.modal || null,
          disabled: b.disabled || false
        };
      });
    }, viewId);

    console.log(`\n=== View: ${viewId} (${viewButtons.length} buttons) ===`);
    viewButtons.forEach(b => {
      console.log(`  - [${b.id || 'NO_ID'}] "${b.text}" (onclickAttr: ${b.hasOnclickAttr}, dataView: ${b.hasDataView}, dataModal: ${b.hasDataModal}, disabled: ${b.disabled})`);
    });
  }

  // Also check modals and header buttons
  const globalButtons = await page.evaluate(() => {
    const headerBtns = Array.from(document.querySelectorAll('header button, .top-bar button, .global-header button, .user-menu button, .modal button')).map(b => ({
      id: b.id,
      text: (b.innerText || b.getAttribute('aria-label') || b.title || '').trim().replace(/\s+/g, ' ').slice(0, 50),
      className: b.className,
      closest: b.closest('.modal') ? b.closest('.modal').id : (b.closest('header') ? 'header' : 'other'),
      onclickAttr: !!b.getAttribute('onclick')
    }));
    return headerBtns;
  });
  console.log(`\n=== Global / Header / Modal Buttons (${globalButtons.length}) ===`);
  globalButtons.forEach(b => {
    console.log(`  - [${b.id || 'NO_ID'}] "${b.text}" in ${b.closest} (onclickAttr: ${b.onclickAttr})`);
  });

  await browser.close();
})();
