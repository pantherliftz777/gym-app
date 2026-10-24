const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const views = [
    'today',
    'ai-coach',
    'body-analysis',
    'activity',
    'posture',
    'food-log',
    'workouts',
    'starting-load',
    'exercise-library',
    'my-foods',
    'challenge',
    'tracking',
    'customization',
    'profile'
  ];

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  const allIssues = [];

  for (const theme of ['light', 'dark']) {
    console.log(`\n=================== TESTING THEME: ${theme.toUpperCase()} ===================`);
    await page.evaluate((th) => {
      if (typeof window.applyTheme === 'function') {
        window.applyTheme(th);
      }
    }, theme);

    await new Promise(r => setTimeout(r, 600));

    for (const v of views) {
      // Switch view
      await page.evaluate((viewName) => {
        if (typeof window.switchView === 'function') {
          window.switchView(viewName);
        }
      }, v);

      await new Promise(r => setTimeout(r, 400));

      const issues = await page.evaluate((curTheme, curView) => {
        const found = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let el;

        function getLuminance(r, g, b) {
          const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        }

        function getContrast(rgb1, rgb2) {
          const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]) + 0.05;
          const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]) + 0.05;
          return l1 > l2 ? l1 / l2 : l2 / l1;
        }

        while ((el = walker.nextNode())) {
          const s = window.getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.bottom < 0 || rect.top > window.innerHeight * 3) continue;

          // Check if inside a hidden ancestor
          let hiddenAncestor = false;
          let p = el.parentElement;
          while (p && p !== document.body) {
            const ps = window.getComputedStyle(p);
            if (ps.display === 'none' || ps.visibility === 'hidden' || ps.opacity === '0') {
              hiddenAncestor = true;
              break;
            }
            p = p.parentElement;
          }
          if (hiddenAncestor) continue;

          let text = '';
          for (let c of el.childNodes) {
            if (c.nodeType === Node.TEXT_NODE && c.textContent.trim().length > 0) {
              text += ' ' + c.textContent.trim();
            }
          }
          text = text.trim();
          if (!text || text.length < 2) continue;

          const textColor = s.color;
          const tm = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!tm) continue;
          const textRgb = [Number(tm[1]), Number(tm[2]), Number(tm[3])];

          // Walk up to find effective background color
          let bgRgb = null;
          let curr = el;
          while (curr && curr !== document.documentElement) {
            const cs = window.getComputedStyle(curr);
            const bg = cs.backgroundColor;
            const bm = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (bm) {
              const alpha = bm[4] !== undefined ? Number(bm[4]) : 1;
              if (alpha >= 0.4) {
                bgRgb = [Number(bm[1]), Number(bm[2]), Number(bm[3])];
                break;
              }
            }
            const bgImg = cs.backgroundImage;
            if (bgImg && bgImg.includes('gradient')) {
              const gm = bgImg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (gm) {
                bgRgb = [Number(gm[1]), Number(gm[2]), Number(gm[3])];
                break;
              }
            }
            curr = curr.parentElement;
          }

          if (!bgRgb) {
            bgRgb = curTheme === 'dark' ? [8, 12, 20] : [248, 250, 252];
          }

          const ratio = getContrast(textRgb, bgRgb);
          if (ratio < 2.8) {
            found.push({
              theme: curTheme,
              view: curView,
              tag: el.tagName,
              id: el.id,
              className: String(el.className || '').slice(0, 40),
              text: text.slice(0, 60),
              color: textColor,
              bgColor: 'rgb(' + bgRgb.join(',') + ')',
              ratio: Math.round(ratio * 10) / 10
            });
          }
        }
        return found;
      }, theme, v);

      if (issues.length > 0) {
        console.log(`[View: ${v}] Found ${issues.length} low-contrast elements (ratio < 2.8:1):`);
        issues.forEach(i => {
          console.log(`  - <${i.tag}> "${i.text}" | color: ${i.color} on ${i.bgColor} (contrast: ${i.ratio}:1)`);
          allIssues.push(i);
        });
      } else {
        console.log(`[View: ${v}] Contrast OK!`);
      }
    }
  }

  console.log(`\nTOTAL LOW-CONTRAST ISSUES FOUND ACROSS ALL VIEWS: ${allIssues.length}`);
  await browser.close();
})();
