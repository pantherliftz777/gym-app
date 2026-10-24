const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const theme of ['light', 'dark']) {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
    await page.evaluate((th) => {
      if (typeof window.applyTheme === 'function') {
        window.applyTheme(th);
      }
    }, theme);

    await new Promise(r => setTimeout(r, 1200));

    // Audit contrast of visible text nodes
    const issues = await page.evaluate((th) => {
      const results = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let node;
      while ((node = walker.nextNode())) {
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        // Check if any ancestor is hidden or closed modal/panel
        let isAncestorHidden = false;
        let ancestor = node.parentElement;
        while (ancestor && ancestor !== document.body) {
          const aStyle = window.getComputedStyle(ancestor);
          if (aStyle.display === 'none' || aStyle.visibility === 'hidden' || aStyle.opacity === '0') {
            isAncestorHidden = true;
            break;
          }
          ancestor = ancestor.parentElement;
        }
        if (isAncestorHidden) continue;

        let directText = '';
        for (let child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
            directText += ' ' + child.textContent.trim();
          }
        }
        if (!directText.trim()) continue;

        const color = style.color;
        const rgb = color.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const [r, g, b] = rgb.map(Number);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          let bgRgb = null;
          let curr = node;
          while (curr && curr !== document.documentElement) {
            const cStyle = window.getComputedStyle(curr);
            const bg = cStyle.backgroundColor;
            const bgImg = cStyle.backgroundImage;

            // If element has a gradient background
            if (bgImg && bgImg.includes('gradient')) {
              // Parse first rgb from gradient
              const gm = bgImg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (gm) {
                bgRgb = [Number(gm[1]), Number(gm[2]), Number(gm[3])];
                break;
              }
            }

            const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (m && (m[4] === undefined || Number(m[4]) > 0.35)) {
              bgRgb = [Number(m[1]), Number(m[2]), Number(m[3])];
              break;
            }
            curr = curr.parentElement;
          }
          if (!bgRgb) {
            bgRgb = th === 'dark' ? [7, 11, 20] : [237, 242, 252];
          }

          const bgBrightness = (bgRgb[0] * 299 + bgRgb[1] * 587 + bgRgb[2] * 114) / 1000;
          const diff = Math.abs(brightness - bgBrightness);
          if (diff < 70) {
            results.push({
              tag: node.tagName,
              id: node.id,
              className: String(node.className || ''),
              text: directText.trim().slice(0, 50),
              color,
              bgColor: 'rgb(' + bgRgb.join(',') + ')',
              diff: Math.round(diff)
            });
          }
        }
      }
      return results;
    }, theme);

    console.log(`=== THEME: ${theme.toUpperCase()} LOW CONTRAST ISSUES FOUND: ${issues.length} ===`);
    issues.forEach(i => console.log(` - [${i.tag}${i.id ? '#' + i.id : ''}${i.className ? '.' + i.className.split(' ')[0] : ''}] "${i.text}" | color: ${i.color} | bg: ${i.bgColor} | diff: ${i.diff}`));
  }

  await browser.close();
})();
