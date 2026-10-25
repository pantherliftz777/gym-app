const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\parveer\\.gemini\\antigravity\\brain\\97cf29ae-8a66-406b-a7ec-8c44477369c2';

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
    this.ws.on('message', raw => {
      const msg = JSON.parse(raw);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    });
  }

  ready() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.pending.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async captureClip(clip) {
    const res = await this.send('Page.captureScreenshot', { format: 'png', clip });
    return Buffer.from(res.data, 'base64');
  }
}

async function run() {
  console.log('[Verify] Spawning Chrome headless...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800'
  ], { stdio: 'ignore' });

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await wait(300);
    try {
      targets = await getJson('http://localhost:9222/json/list');
      if (targets && targets.length) break;
    } catch (e) {}
  }

  if (!targets || !targets.length) {
    try { process.kill(chrome.pid); } catch(e) {}
    throw new Error('Chrome failed to start CDP');
  }

  const target = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.ready();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  console.log('[Verify] Loading page http://localhost:3000 ...');
  await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
  await wait(3000);

  // Set dark theme
  await cdp.eval(`applyTheme('dark');`);
  await wait(500);

  // Check topbar metrics & computed styles
  const stylesCheck = await cdp.eval(`(() => {
    const input = document.querySelector('#topbarSearchInput');
    const wrap = document.querySelector('.topbar-search-wrap');
    const weather = document.querySelector('.header-weather-temp');
    const weatherLabel = document.querySelector('#headerWeatherLabel');
    const weatherBadge = document.querySelector('#topbarLiveBadge');

    const inputCs = window.getComputedStyle(input);
    const wrapCs = window.getComputedStyle(wrap);
    const weatherCs = window.getComputedStyle(weather);
    const labelCs = window.getComputedStyle(weatherLabel);

    input.focus();
    const inputFocusCs = window.getComputedStyle(input);

    const r1 = wrap.getBoundingClientRect();
    const r2 = weatherBadge.getBoundingClientRect();

    return {
      inputUnfocused: {
        border: inputCs.border,
        boxShadow: inputCs.boxShadow,
        borderRadius: inputCs.borderRadius,
        background: inputCs.backgroundColor
      },
      inputFocused: {
        border: inputFocusCs.border,
        boxShadow: inputFocusCs.boxShadow,
        borderRadius: inputFocusCs.borderRadius,
        background: inputFocusCs.backgroundColor
      },
      weatherPill: {
        whiteSpace: weatherCs.whiteSpace,
        display: weatherCs.display,
        borderRadius: weatherCs.borderRadius
      },
      weatherLabel: {
        whiteSpace: labelCs.whiteSpace,
        text: weatherLabel.textContent
      },
      wrapRect: { x: r1.x, y: r1.y, width: r1.width, height: r1.height },
      badgeRect: { x: r2.x, y: r2.y, width: r2.width, height: r2.height }
    };
  })()`);

  console.log('[Verify] Styles Check:', JSON.stringify(stylesCheck, null, 2));

  // Focus input and capture search pill
  await cdp.eval(`document.querySelector('#topbarSearchInput').focus();`);
  await wait(300);

  const wrapRect = stylesCheck.wrapRect;
  const searchBuf = await cdp.captureClip({
    x: Math.max(0, wrapRect.x - 20),
    y: Math.max(0, wrapRect.y - 10),
    width: wrapRect.width + 40,
    height: wrapRect.height + 20,
    scale: 2
  });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'preview_topbar_search_fixed.png'), searchBuf);
  console.log('[Verify] Saved preview_topbar_search_fixed.png');

  // Capture weather badge
  const badgeRect = stylesCheck.badgeRect;
  const weatherBuf = await cdp.captureClip({
    x: Math.max(0, badgeRect.x - 20),
    y: Math.max(0, badgeRect.y - 10),
    width: badgeRect.width + 40,
    height: badgeRect.height + 20,
    scale: 2
  });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'preview_weather_fixed.png'), weatherBuf);
  console.log('[Verify] Saved preview_weather_fixed.png');

  cdp.ws.close();
  try { process.kill(chrome.pid); } catch(e) {}
  console.log('[Verify] Verification complete!');
}

run().catch(err => {
  console.error('[Verify] Error:', err);
  process.exit(1);
});
