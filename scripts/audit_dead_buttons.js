const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push({ type: 'pageerror', text: err.toString() }));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ type: 'console.error', text: msg.text() });
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Get all views
  const views = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.view')).map(v => v.id.replace('view-', ''));
  });

  const deadButtons = [];
  const functioningButtons = [];

  for (const viewId of views) {
    await page.evaluate((vid) => {
      if (typeof switchView === 'function') switchView(vid);
    }, viewId);
    await new Promise(r => setTimeout(r, 200));

    const buttonsInfo = await page.evaluate((vid) => {
      const v = document.getElementById('view-' + vid);
      if (!v) return [];
      const btns = Array.from(v.querySelectorAll('button, [role="button"], a[href^="#"], .nav-link'));
      return btns.map((b, i) => {
        let sel = '';
        if (b.id) sel = '#' + b.id;
        else if (b.className) sel = '.' + b.className.split(' ').filter(Boolean).join('.');
        return {
          viewId: vid,
          index: i,
          id: b.id,
          text: (b.innerText || b.getAttribute('aria-label') || b.title || '').trim().replace(/\s+/g, ' ').slice(0, 40),
          selector: sel,
          hasDirectClick: typeof b.onclick === 'function' || !!b.getAttribute('onclick') || !!b.dataset.view || !!b.dataset.hubTarget
        };
      });
    }, viewId);

    for (const b of buttonsInfo) {
      // Test clicking and observe any effect (view change, modal open, class change, text change, network, etc.)
      const beforeHash = await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('.modal.active, .modal[style*="display: block"], .modal[style*="display: flex"]')).map(m => m.id);
        const activeView = Array.from(document.querySelectorAll('.view.active')).map(v => v.id)[0] || '';
        return { modals, activeView, bodyHtmlLen: document.body.innerHTML.length };
      });

      let clicked = false;
      let error = null;
      try {
        await page.evaluate((vid, idx) => {
          const v = document.getElementById('view-' + vid);
          if (!v) return;
          const btns = Array.from(v.querySelectorAll('button, [role="button"], a[href^="#"], .nav-link'));
          if (btns[idx]) {
            btns[idx].click();
          }
        }, b.viewId, b.index);
        clicked = true;
      } catch (e) {
        error = e.message;
      }
      await new Promise(r => setTimeout(r, 100));

      const afterHash = await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('.modal.active, .modal[style*="display: block"], .modal[style*="display: flex"]')).map(m => m.id);
        const activeView = Array.from(document.querySelectorAll('.view.active')).map(v => v.id)[0] || '';
        return { modals, activeView, bodyHtmlLen: document.body.innerHTML.length };
      });

      // Close any modal opened
      await page.evaluate(() => {
        if (typeof closeModal === 'function') closeModal();
        document.querySelectorAll('.modal').forEach(m => {
          m.classList.remove('active');
          if (m.style.display !== 'none') m.style.display = 'none';
        });
      });

      // Reset view back if it changed
      if (afterHash.activeView !== beforeHash.activeView) {
        await page.evaluate((vid) => switchView(vid), b.viewId);
        await new Promise(r => setTimeout(r, 50));
      }

      const hadEffect = (afterHash.modals.length !== beforeHash.modals.length) ||
                        (afterHash.activeView !== beforeHash.activeView) ||
                        (afterHash.bodyHtmlLen !== beforeHash.bodyHtmlLen) ||
                        b.hasDirectClick;

      if (!hadEffect && !b.hasDirectClick) {
        deadButtons.push({ ...b, error });
      } else {
        functioningButtons.push({ ...b, hadEffect });
      }
    }
  }

  console.log(`\n================ AUDIT SUMMARY ================`);
  console.log(`Functioning buttons: ${functioningButtons.length}`);
  console.log(`Potentially DEAD/UNCONNECTED buttons: ${deadButtons.length}`);
  console.log('\n--- Dead Buttons List ---');
  deadButtons.forEach(b => {
    console.log(`[View: ${b.viewId}] ID: "${b.id || 'NO_ID'}" | Text: "${b.text}" | Selector: "${b.selector}"`);
  });

  console.log('\n--- Captured Errors ---');
  console.log(errors);

  await browser.close();
})();
