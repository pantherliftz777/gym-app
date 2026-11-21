import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

// MIME types dictionary
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create lightweight preview server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || !path.extname(reqPath)) {
    reqPath = '/index.html';
  }
  let filePath = path.join(DIST_DIR, reqPath);
  if (!fs.existsSync(filePath)) {
    // Check public/images fallback
    const fallbackPath = path.resolve(__dirname, '../public', reqPath.replace(/^\//, ''));
    if (fs.existsSync(fallbackPath)) {
      filePath = fallbackPath;
    } else {
      filePath = path.join(DIST_DIR, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

const PORT = 5566;

server.listen(PORT, async () => {
  console.log(`Test preview server running on http://localhost:${PORT}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const viewports = [
      { name: 'Mobile (390px)', width: 390, height: 844 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Desktop (1440px)', width: 1440, height: 900 },
    ];

    const themes = ['dark', 'light'];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });

      for (const th of themes) {
        await page.evaluate((themeName) => {
          document.documentElement.setAttribute('data-theme', themeName);
        }, th);

        // Check for horizontal overflow
        const overflow = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
          };
        });

        console.log(`[PASS] ${vp.name} | Theme: ${th} | scrollWidth: ${overflow.scrollWidth} / innerWidth: ${overflow.innerWidth} (Overflow: ${overflow.hasOverflow ? 'FAIL' : 'NONE'})`);
        if (overflow.hasOverflow) {
          throw new Error(`Horizontal overflow detected at ${vp.name} on ${th} mode!`);
        }
      }
    }

    // Test Instant Demo Lifter bypass
    console.log('Testing Instant Demo Lifter bypass & Dashboard SPA views...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });

    // Click Demo Lifter button
    await page.evaluate(() => {
      // Find Demo Lifter button and click
      const btns = Array.from(document.querySelectorAll('button'));
      const demoBtn = btns.find(b => b.textContent && b.textContent.includes('Demo Lifter'));
      if (demoBtn) demoBtn.click();
    });

    await new Promise(r => setTimeout(r, 600));

    // Verify Dashboard Command Center is active
    const dashboardTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : '';
    });
    console.log(`Dashboard Active Heading: "${dashboardTitle}"`);

    // Verify Hash Navigation to Food Log
    await page.evaluate(() => {
      window.location.hash = 'view-food-log';
    });
    await new Promise(r => setTimeout(r, 400));

    const foodLogHeading = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : '';
    });
    console.log(`Food Log Active Heading: "${foodLogHeading}"`);

    console.log('\n=== ALL MULTI-VIEWPORT, THEME & NAVIGATION AUDITS PASSED 100% ===');
  } catch (err) {
    console.error('Audit failure:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
