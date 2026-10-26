const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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

  async captureScreenshot(filepath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base46', 'base64'));
  }
}

async function run() {
  console.log('[Visual Test] Spawning Chrome headless...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,1000'
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
    chrome.kill();
    throw new Error('Chrome failed to start CDP');
  }

  const target = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.ready();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  console.log('[Visual Test] Navigating to http://localhost:3000 ...');
  await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
  await wait(3000);

  // Set dark theme
  await cdp.eval(`applyTheme('dark');`);
  await wait(500);

  // 1. Topbar search & avatar capture
  console.log('[Visual Test] Capturing Topbar search & avatar (Fix 17 & 18)...');
  await cdp.eval(`
    window.scrollTo({ top: 0, behavior: 'instant' });
  `);
  await wait(500);
  const res1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'fix4_topbar_search_avatar.png'), Buffer.from(res1.data, 'base64'));

  // 2. Daily Tip Panel capture
  console.log('[Visual Test] Capturing Daily Tip Panel (Fix 19)...');
  await cdp.eval(`
    switchView('today');
    const tip = document.querySelector('#dailyTipPanel');
    if (tip) tip.scrollIntoView({ block: 'center' });
  `);
  await wait(500);
  const res2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'fix5_daily_tip_panel.png'), Buffer.from(res2.data, 'base64'));

  console.log('[Visual Test] Captured fix4 and fix5 screenshots!');
  cdp.ws.close();
  try { process.kill(chrome.pid); } catch(e) {}
}

run().catch(err => {
  console.error('[Visual Test] Error:', err);
  process.exit(1);
});
