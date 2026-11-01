const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Switch to AI Coach view
  await page.evaluate(() => {
    if (typeof switchView === 'function') {
      switchView('ai-coach');
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Inspect the layout structure and computed styles
  const analysis = await page.evaluate(() => {
    const view = document.getElementById('view-ai-coach');
    const layout = document.querySelector('.ai-coach-page-layout');
    const stream = document.getElementById('coachChatStream');
    const inputBar = document.querySelector('.ai-chat-input-bar');
    const mainArea = document.querySelector('.main-area');
    const pageContent = document.querySelector('.page-content');
    const appShell = document.querySelector('.app-shell');

    const getMetrics = (el, name) => {
      if (!el) return { name, exists: false };
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        name,
        exists: true,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        bottom: rect.bottom,
        display: cs.display,
        flexDirection: cs.flexDirection,
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        heightStyle: cs.height,
        maxHeight: cs.maxHeight,
        minHeight: cs.minHeight,
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        scrollTop: el.scrollTop,
        scrollbarWidth: cs.scrollbarWidth
      };
    };

    return {
      windowHeight: window.innerHeight,
      appShell: getMetrics(appShell, 'appShell'),
      mainArea: getMetrics(mainArea, 'mainArea'),
      pageContent: getMetrics(pageContent, 'pageContent'),
      view: getMetrics(view, 'view'),
      layout: getMetrics(layout, 'layout'),
      stream: getMetrics(stream, 'stream'),
      inputBar: getMetrics(inputBar, 'inputBar')
    };
  });

  console.log('Layout Analysis:', JSON.stringify(analysis, null, 2));

  // Now inject a long response with table like the screenshot
  await page.evaluate(() => {
    const longMsg = `Here is your customized 4-week core progression:

| Week | Hanging Leg Raise | Cable Crunch | Ab Wheel | Dead Bug | RKC Plank |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 3x10 | 3x12 | 3x8 | 3x10/side | 3x15s |
| 2 | 3x12 | 3x15 | 3x10 | 3x12/side | 3x20s |
| 3 | 4x10 (+ankle wt) | 4x12 (+5%) | 4x8 | 4x10/side | 4x15s |
| 4 | 4x12 | 4x15 | 4x10 | 4x12/side | 4x20s |

---

### Integration Notes

• Perform **after** main compound lifts (squat, deadlift, press) or on dedicated core days.
• Maintain **neutral spine** on all movements; stop set if lumbar hyperextension occurs.
• Pair with **diaphragmatic breathing drills** (2x5 breaths) post-session to reinforce transverse abdominis tone.

### Progressive Overload Protocol
To maximize hypertrophy and core stabilization:
1. **Week 1-2**: Focus on maximum contraction and 3-second eccentric tempo.
2. **Week 3**: Introduce external micro-loading (+1-2kg on hanging leg raises).
3. **Week 4**: Peak volume before 1-week active deload.

### Nutrition & Intra-workout Hydration
Maintain adequate sodium and electrolyte balance during core-heavy training blocks. Aim for 500ml water with electrolytes 30 minutes prior.`;

    // Call addBotChatMessage
    if (typeof addBotChatMessage === 'function') {
      addBotChatMessage(longMsg);
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Take screenshot of current state
  if (!fs.existsSync('test_screenshots')) fs.mkdirSync('test_screenshots');
  await page.screenshot({ path: 'test_screenshots/debug_ai_coach_initial.png' });

  const streamAfter = await page.evaluate(() => {
    const stream = document.getElementById('coachChatStream');
    return {
      clientHeight: stream.clientHeight,
      scrollHeight: stream.scrollHeight,
      scrollTop: stream.scrollTop
    };
  });
  console.log('Stream after long message:', streamAfter);

  await browser.close();
})();
