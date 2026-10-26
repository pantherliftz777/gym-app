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

  async captureScreenshot(name) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, name), Buffer.from(res.data, 'base64'));
    console.log(`[Mobile Test] Saved ${name}`);
  }
}

async function run() {
  console.log('[Mobile Test] Launching Chrome in mobile emulation (390x844)...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=390,844'
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
    throw new Error('Chrome failed to start');
  }

  const target = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.ready();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  // Set device emulation metrics to standard iPhone 14/15 (390 x 844, 2x dpr)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });

  console.log('[Mobile Test] Navigating to http://localhost:3000 ...');
  await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
  await wait(3000);

  // Apply dark theme
  await cdp.eval(`applyTheme('dark');`);
  await wait(500);

  // Check topbar horizontal overflow
  const overflowCheck = await cdp.eval(`(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      topbarScrollWidth: document.querySelector('.topbar')?.scrollWidth,
      topbarClientWidth: document.querySelector('.topbar')?.clientWidth,
      sidebarVisible: window.getComputedStyle(document.querySelector('.sidebar')).display,
      bottomNavVisible: !!document.querySelector('.mobile-bottom-nav, .mobile-nav-bar')
    };
  })()`);
  console.log('[Mobile Test] Overflow and Navigation Check:', overflowCheck);

  // 1. Capture Today tab on mobile
  await cdp.captureScreenshot('mobile_view_today.png');

  // 2. Switch to Workouts view
  await cdp.eval(`switchView('workouts');`);
  await wait(800);
  await cdp.captureScreenshot('mobile_view_workouts.png');

  // 3. Switch to Food Log view
  await cdp.eval(`switchView('food-log');`);
  await wait(800);
  await cdp.captureScreenshot('mobile_view_nutrition.png');

  cdp.ws.close();
  try { process.kill(chrome.pid); } catch(e) {}
  console.log('[Mobile Test] Done captures!');
}

run().catch(err => {
  console.error('[Mobile Test] Error:', err);
  process.exit(1);
});
