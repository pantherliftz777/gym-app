const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => switchView('ai-coach'));

  // Inject prototype CSS
  await page.addStyleTag({
    content: `
      /* Fix panel overriding overflow on coachChatStream */
      #coachChatStream.ai-coach-chat-stream,
      .ai-coach-chat-stream {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain;
        scrollbar-gutter: stable;
        -webkit-overflow-scrolling: touch;
      }

      /* Custom scrollbar */
      .ai-coach-chat-stream::-webkit-scrollbar {
        width: 8px;
      }
      .ai-coach-chat-stream::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }
      .ai-coach-chat-stream::-webkit-scrollbar-thumb {
        background: rgba(100, 116, 139, 0.45);
        border-radius: 20px;
      }
      .ai-coach-chat-stream::-webkit-scrollbar-thumb:hover {
        background: rgba(22, 199, 154, 0.75);
      }
      .ai-coach-chat-stream {
        scrollbar-width: thin;
        scrollbar-color: rgba(100, 116, 139, 0.55) transparent;
      }

      /* Structure left column */
      .ai-coach-main-col {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 245px);
        height: calc(100dvh - 245px);
        min-height: 480px;
        position: relative;
      }
      .ai-coach-top-section {
        flex: 0 0 auto;
      }
      .ai-coach-header-card {
        margin-bottom: 8px;
        padding: 12px 18px;
      }
      .ai-coach-subtabs {
        margin-bottom: 8px;
        padding-bottom: 2px;
      }
      .ai-coach-chat-stream {
        flex: 1 1 auto;
        min-height: 0;
        height: auto !important;
      }
      .ai-coach-composer-area {
        flex: 0 0 auto;
        margin-top: 6px;
      }
    `
  });

  // Inject wrappers if needed
  await page.evaluate(() => {
    const layout = document.querySelector('.ai-coach-page-layout');
    const leftCol = layout.children[0];
    leftCol.classList.add('ai-coach-main-col');

    const header = leftCol.querySelector('.ai-coach-header-card');
    const tabs = leftCol.querySelector('.ai-coach-subtabs');
    const stream = leftCol.querySelector('#coachChatStream');
    const imgBar = leftCol.querySelector('#coachSelectedImagePreviewBar');
    const cmds = leftCol.querySelector('.coach-quick-commands-bar');
    const inputBar = leftCol.querySelector('.ai-chat-input-bar');

    // Group top
    const topWrap = document.createElement('div');
    topWrap.className = 'ai-coach-top-section';
    leftCol.insertBefore(topWrap, stream);
    topWrap.appendChild(header);
    topWrap.appendChild(tabs);

    // Group bottom
    const bottomWrap = document.createElement('div');
    bottomWrap.className = 'ai-coach-composer-area';
    leftCol.appendChild(bottomWrap);
    if (imgBar) bottomWrap.appendChild(imgBar);
    if (cmds) bottomWrap.appendChild(cmds);
    if (inputBar) bottomWrap.appendChild(inputBar);
  });

  // Test with long markdown table message
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
3. **Week 4**: Peak volume before 1-week active deload.`;

    addBotChatMessage(longMsg);
  });

  await new Promise(r => setTimeout(r, 600));

  const initialMetrics = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    const cs = window.getComputedStyle(s);
    return {
      overflowY: cs.overflowY,
      clientHeight: s.clientHeight,
      scrollHeight: s.scrollHeight,
      scrollTop: s.scrollTop
    };
  });
  console.log('Metrics after fix:', initialMetrics);

  // Now test mouse wheel scrolling up
  await page.mouse.move(500, 450);
  await page.mouse.wheel({ deltaY: -600 });
  await new Promise(r => setTimeout(r, 300));

  const afterScrollUp = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    return {
      scrollTop: s.scrollTop,
      scrolledSuccessfully: s.scrollTop < 200
    };
  });
  console.log('After wheel scroll up:', afterScrollUp);

  // Scroll up to top to see table
  await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    s.scrollTop = 400; // where table is located
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'test_screenshots/prototype_table_view.png' });

  // Scroll to bottom
  await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    s.scrollTop = s.scrollHeight;
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'test_screenshots/prototype_fixed_desktop.png' });
  await browser.close();
})();
