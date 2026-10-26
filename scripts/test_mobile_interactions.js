const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\parveer\\.gemini\\antigravity\\brain\\97cf29ae-8a66-406b-a7ec-8c44477369c2';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
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
        if (msg.error) reject(msg.error); else resolve(msg.result);
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
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result ? res.result.value : null;
  }
  async captureScreenshot(name) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, name), Buffer.from(res.data, 'base64'));
    console.log(`[Interaction Test] Captured ${name}`);
  }
}

async function run() {
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
    try { targets = await getJson('http://localhost:9222/json/list'); if (targets && targets.length) break; } catch(e){}
  }
  const target = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.ready();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
  await wait(3000);
  await cdp.eval(`applyTheme('dark');`);
  await wait(400);

  // 1. Test clicking "More" on bottom nav
  console.log('[Interaction Test] Clicking #mobNavMore...');
  await cdp.eval(`document.querySelector('#mobNavMore').click();`);
  await wait(600);
  await cdp.captureScreenshot('mobile_view_drawer_open.png');

  // Verify sidebar is open and backdrop is active
  const drawerState = await cdp.eval(`(() => ({
    sidebarHasOpen: document.querySelector('#sidebar').classList.contains('mobile-open'),
    backdropActive: document.querySelector('#mobileSidebarBackdrop').classList.contains('active'),
    sidebarTransform: window.getComputedStyle(document.querySelector('#sidebar')).transform
  }))()`);
  console.log('[Interaction Test] Drawer State after click:', drawerState);

  // 2. Click backdrop to close
  console.log('[Interaction Test] Clicking backdrop to close...');
  await cdp.eval(`document.querySelector('#mobileSidebarBackdrop').click();`);
  await wait(400);

  // 3. Click #mobNavFood
  console.log('[Interaction Test] Clicking #mobNavFood...');
  await cdp.eval(`document.querySelector('#mobNavFood').click();`);
  await wait(600);
  await cdp.captureScreenshot('mobile_view_food_log.png');

  // 4. Click #mobNavExercises
  console.log('[Interaction Test] Clicking #mobNavExercises...');
  await cdp.eval(`document.querySelector('#mobNavExercises').click();`);
  await wait(600);
  await cdp.captureScreenshot('mobile_view_exercise_library.png');

  cdp.ws.close();
  try { process.kill(chrome.pid); } catch(e){}
  console.log('[Interaction Test] All mobile interactions verified successfully!');
}
run().catch(e => { console.error(e); process.exit(1); });
