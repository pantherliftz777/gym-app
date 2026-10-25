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
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
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

  // Fix 1: Exercise Library Prescription Boxes & Tempo Badges
  console.log('[Visual Test] Capturing Exercise Library Cards (Fix 1)...');
  await cdp.eval(`
    switchView('exercise-library');
    if (typeof selectExerciseCategory === 'function') selectExerciseCategory('Legs');
    const box = document.querySelector('.exercise-prescription-box');
    if (box) box.scrollIntoView({ block: 'center' });
  `);
  await wait(500);
  await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'fix1_exercise_tempo_cards.png'));

  // Fix 2: Workout Move List with View Visual & Sub Badges
  console.log('[Visual Test] Capturing Workout Move List (Fix 2)...');
  await cdp.eval(`
    switchView('workouts');
    const move = document.querySelector('.workout-move-item');
    if (move) move.scrollIntoView({ block: 'center' });
  `);
  await wait(500);
  await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'fix2_workout_move_items.png'));

  // Fix 3: Weekly Streak & Tracking Card
  console.log('[Visual Test] Capturing Weekly Streak Card (Fix 3)...');
  await cdp.eval(`
    switchView('today');
    const sc = document.querySelector('.streak-card-inner');
    if (sc) sc.scrollIntoView({ block: 'center' });
  `);
  await wait(500);
  await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'fix3_weekly_streak_card.png'));

  console.log('[Visual Test] All 3 latest screenshots captured!');
  cdp.ws.close();
  try { process.kill(chrome.pid); } catch(e) {}
}

run().catch(err => {
  console.error('[Visual Test] Error:', err);
  process.exit(1);
});
