const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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
}

async function run() {
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
    try { targets = await getJson('http://localhost:9222/json/list'); if (targets && targets.length) break; } catch(e){}
  }
  const target = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.ready();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
  await wait(2500);

  const desktopCheck = await cdp.eval(`(() => {
    return {
      bottomNavDisplay: window.getComputedStyle(document.querySelector('.mobile-bottom-nav')).display,
      sidebarDisplay: window.getComputedStyle(document.querySelector('.sidebar')).display,
      sidebarWidth: window.getComputedStyle(document.querySelector('.sidebar')).width,
      mainAreaMarginLeft: window.getComputedStyle(document.querySelector('.main-area')).marginLeft,
      topbarBrandDisplay: window.getComputedStyle(document.querySelector('.topbar-mobile-brand')).display
    };
  })()`);

  console.log('[Desktop Integrity Check]:', JSON.stringify(desktopCheck, null, 2));

  cdp.ws.close();
  try { process.kill(chrome.pid); } catch(e){}
}
run().catch(e => { console.error(e); process.exit(1); });
