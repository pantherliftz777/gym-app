const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
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

  const audit = await cdp.eval(`(() => {
    const topbar = document.querySelector('.topbar');
    const bottomNav = document.querySelector('.mobile-bottom-nav');
    const aiWidget = document.querySelector('#floatingAiWidget');
    const content = document.querySelector('.page-content');

    const topbarRect = topbar ? topbar.getBoundingClientRect() : null;
    const bottomNavRect = bottomNav ? bottomNav.getBoundingClientRect() : null;
    const aiWidgetRect = aiWidget ? aiWidget.getBoundingClientRect() : null;

    // Check intersections: Does aiWidget overlap bottomNav?
    let aiIntersectsBottomNav = false;
    if (aiWidgetRect && bottomNavRect) {
      aiIntersectsBottomNav = !(
        aiWidgetRect.right < bottomNavRect.left ||
        aiWidgetRect.left > bottomNavRect.right ||
        aiWidgetRect.bottom < bottomNavRect.top ||
        aiWidgetRect.top > bottomNavRect.bottom
      );
    }

    return {
      viewportHeight: window.innerHeight,
      topbarHeight: topbarRect ? topbarRect.height : 0,
      bottomNavHeight: bottomNavRect ? bottomNavRect.height : 0,
      aiWidgetBottom: aiWidgetRect ? aiWidgetRect.bottom : 0,
      bottomNavTop: bottomNavRect ? bottomNavRect.top : 0,
      aiIntersectsBottomNav,
      contentPaddingBottom: content ? window.getComputedStyle(content).paddingBottom : null
    };
  })()`);

  console.log('[Intersection Audit]:', JSON.stringify(audit, null, 2));

  cdp.ws.close();
  try { process.kill(chrome.pid); } catch(e){}
}
run().catch(e => { console.error(e); process.exit(1); });
