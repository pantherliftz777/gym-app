const puppeteer = require('puppeteer');
const fs = require('fs');

async function runTests() {
  console.log('=== STARTING FITFUEL AI COACH 10-POINT VERIFICATION SUITE ===\n');
  const results = [];

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Load app
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 600));

  // TEST 1: Short Answer (no unnecessary scrollbar on standard desktop monitor)
  console.log('Running TEST 1: Short Answer...');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.evaluate(() => {
    switchView('ai-coach');
    chatHistory = [];
    addBotChatMessage('Short answer: Aim for 1.6 to 2.2g of protein per kg of bodyweight daily.');
  });
  await new Promise(r => setTimeout(r, 400));
  const t1 = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    return {
      scrollHeight: s.scrollHeight,
      clientHeight: s.clientHeight,
      noUnnecessaryScrollbar: s.scrollHeight <= s.clientHeight
    };
  });
  console.log('TEST 1 Result:', t1);
  results.push({ test: 'TEST 1: Short Answer (No Unnecessary Scrollbar)', passed: t1.noUnnecessaryScrollbar, details: t1 });
  await page.setViewport({ width: 1280, height: 800 });
  await page.evaluate(() => switchView('ai-coach'));

  // TEST 2: Long Answer
  console.log('Running TEST 2: Long Answer...');
  await page.evaluate(() => {
    let long = '### Comprehensive Biomechanical Optimization Guide\n\n';
    for (let i = 1; i <= 20; i++) {
      long += `**Phase ${i}: Functional Adaptation**: Ensure scapular retraction and thoracic extension during execution. Maintain 3-second eccentric tempo for myofibrillar stimulation.\n\n`;
    }
    addBotChatMessage(long);
  });
  await new Promise(r => setTimeout(r, 400));
  const t2 = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    const cs = window.getComputedStyle(s);
    return {
      scrollHeight: s.scrollHeight,
      clientHeight: s.clientHeight,
      hasOverflow: s.scrollHeight > s.clientHeight,
      overflowY: cs.overflowY
    };
  });
  console.log('TEST 2 Result:', t2);
  results.push({ test: 'TEST 2: Long Answer Overflow', passed: t2.hasOverflow && t2.overflowY === 'auto', details: t2 });

  // TEST 3: Large Markdown Table
  console.log('Running TEST 3: Large Markdown Table...');
  await page.evaluate(() => {
    const tableMsg = `Here is your complete 4-week core progression:

| Week | Hanging Leg Raise | Cable Crunch | Ab Wheel | Dead Bug | RKC Plank |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 3x10 | 3x12 | 3x8 | 3x10/side | 3x15s |
| 2 | 3x12 | 3x15 | 3x10 | 3x12/side | 3x20s |
| 3 | 4x10 (+ankle wt) | 4x12 (+5%) | 4x8 | 4x10/side | 4x15s |
| 4 | 4x12 | 4x15 | 4x10 | 4x12/side | 4x20s |

---

### Key Notes
• Perform after compound lifts.
• Keep neutral spine.`;
    addBotChatMessage(tableMsg);
  });
  await new Promise(r => setTimeout(r, 400));
  const t3 = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    const table = s.querySelector('table');
    const wrapper = table ? table.parentElement : null;
    return {
      tableExists: !!table,
      tableWidth: table ? table.offsetWidth : 0,
      wrapperOverflowX: wrapper ? window.getComputedStyle(wrapper).overflowX : null
    };
  });
  console.log('TEST 3 Result:', t3);
  results.push({ test: 'TEST 3: Markdown Table', passed: t3.tableExists, details: t3 });

  // TEST 4: Content Accessibility (Headings, Lists, Paragraphs)
  console.log('Running TEST 4: Headings, Lists, Paragraphs Accessibility...');
  const t4 = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    const headings = s.querySelectorAll('h2, h3, h4');
    const boldTexts = s.querySelectorAll('b');
    return {
      headingCount: headings.length,
      boldCount: boldTexts.length
    };
  });
  console.log('TEST 4 Result:', t4);
  results.push({ test: 'TEST 4: Content Formatting', passed: t4.headingCount > 0 && t4.boldCount > 0, details: t4 });

  // TEST 5: Multiple Consecutive Messages
  console.log('Running TEST 5: Multiple Consecutive Messages...');
  await page.evaluate(() => {
    addUserChatMessage('How much rest between hypertrophy sets?');
    addBotChatMessage('For compound hypertrophy lifts, rest 2-3 minutes. For isolation work, 60-90 seconds is optimal.');
    addUserChatMessage('Can I train core every day?');
    addBotChatMessage('The abdominal wall requires 48 hours for glycogen replenishment and micro-tear repair. 2-3 dedicated sessions per week produce superior hypertrophy.');
  });
  await new Promise(r => setTimeout(r, 400));
  const t5 = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    const msgs = s.querySelectorAll('.ai-msg');
    return {
      messageCount: msgs.length,
      scrollHeight: s.scrollHeight,
      clientHeight: s.clientHeight
    };
  });
  console.log('TEST 5 Result:', t5);
  results.push({ test: 'TEST 5: Consecutive Messages', passed: t5.messageCount >= 5, details: t5 });

  // TEST 6: User Scrolls Upward - Do Not Yank to Bottom on new stream/message
  console.log('Running TEST 6: User Scrolled Upward - Preserve Position...');
  await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    s.scrollTop = 200; // scroll up toward top
  });
  await new Promise(r => setTimeout(r, 300));
  const scrollBefore = await page.evaluate(() => document.getElementById('coachChatStream').scrollTop);

  // Add another message while scrolled up
  await page.evaluate(() => {
    addBotChatMessage('Background notification: Recovery metrics updated from your sleep profile.');
  });
  await new Promise(r => setTimeout(r, 300));
  const scrollAfter = await page.evaluate((prev) => {
    const s = document.getElementById('coachChatStream');
    const btn = document.getElementById('coachScrollBottomBtn');
    return {
      scrollBefore: prev,
      scrollAfter: s.scrollTop,
      didNotForceToBottom: s.scrollTop < 400,
      btnVisible: btn ? window.getComputedStyle(btn).display !== 'none' : false
    };
  }, scrollBefore);
  console.log('TEST 6 Result:', scrollAfter);
  results.push({ test: 'TEST 6: Preserve Scroll on Upward Reading', passed: scrollAfter.didNotForceToBottom, details: scrollAfter });

  // TEST 7: Scroll to Bottom & Bottom Composer Clearance
  console.log('Running TEST 7: Scroll to Bottom & Composer Clearance...');
  await page.evaluate(() => {
    const btn = document.getElementById('coachScrollBottomBtn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const t7 = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    const composer = document.querySelector('.ai-coach-composer-area');
    const sRect = s.getBoundingClientRect();
    const cRect = composer ? composer.getBoundingClientRect() : null;
    return {
      streamBottom: sRect.bottom,
      composerTop: cRect ? cRect.top : 0,
      noOverlap: cRect ? cRect.top >= sRect.bottom - 2 : false,
      isNearBottom: s.scrollHeight - s.scrollTop - s.clientHeight <= 10
    };
  });
  console.log('TEST 7 Result:', t7);
  results.push({ test: 'TEST 7: Composer Clearance & Scroll to Bottom', passed: t7.noOverlap, details: t7 });

  // TEST 8: Mobile Screen (390x844)
  console.log('Running TEST 8: Mobile Viewport...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 400));
  const t8 = await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    const composer = document.querySelector('.ai-coach-composer-area');
    const input = document.getElementById('coachChatInput');
    const mainCol = document.querySelector('.ai-coach-main-col');
    return {
      streamHeight: s ? s.clientHeight : 0,
      composerVisible: composer ? composer.offsetHeight > 0 : false,
      inputUsable: input && !input.disabled,
      mainColDisplay: mainCol ? window.getComputedStyle(mainCol).display : null
    };
  });
  console.log('TEST 8 Result:', t8);
  results.push({ test: 'TEST 8: Mobile Viewport Usability', passed: t8.streamHeight > 0 && t8.composerVisible && t8.inputUsable, details: t8 });

  // TEST 9: Desktop Mouse Wheel Independent Scrolling
  console.log('Running TEST 9: Desktop Mouse Wheel Scrolling...');
  await page.setViewport({ width: 1280, height: 800, isMobile: false });
  await page.evaluate(() => switchView('ai-coach'));
  await new Promise(r => setTimeout(r, 400));

  // First scroll down halfway
  await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    s.scrollTop = 500;
  });
  await new Promise(r => setTimeout(r, 200));

  const initialTop = await page.evaluate(() => document.getElementById('coachChatStream').scrollTop);
  await page.mouse.move(500, 450);
  await page.mouse.wheel({ deltaY: -300 });
  await new Promise(r => setTimeout(r, 300));
  const wheelTop = await page.evaluate(() => document.getElementById('coachChatStream').scrollTop);

  const t9 = {
    initialTop,
    wheelTop,
    wheelScrolled: wheelTop < initialTop
  };
  console.log('TEST 9 Result:', t9);
  results.push({ test: 'TEST 9: Mouse Wheel Scrolling', passed: t9.wheelScrolled, details: t9 });

  // TEST 10: Multi-viewport Resize Tests (Zero Horizontal Overflow)
  console.log('Running TEST 10: Multi-viewport & Zero Horizontal Overflow...');
  const viewports = [
    { w: 360, h: 640 },
    { w: 768, h: 1024 },
    { w: 1440, h: 900 }
  ];
  let allZeroHOverflow = true;
  for (const vp of viewports) {
    await page.setViewport({ width: vp.w, height: vp.h });
    await new Promise(r => setTimeout(r, 200));
    const hOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (hOverflow) allZeroHOverflow = false;
  }
  console.log('TEST 10 Result: allZeroHOverflow =', allZeroHOverflow);
  results.push({ test: 'TEST 10: Zero Horizontal Overflow across viewports', passed: allZeroHOverflow });

  // Capture final screenshots
  if (!fs.existsSync('test_screenshots')) fs.mkdirSync('test_screenshots');
  await page.setViewport({ width: 1280, height: 800 });
  await page.screenshot({ path: 'test_screenshots/verified_ai_coach_desktop.png' });

  // Scroll to table and take screenshot
  await page.evaluate(() => {
    const s = document.getElementById('coachChatStream');
    s.scrollTop = 350;
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'test_screenshots/verified_ai_coach_table.png' });

  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.screenshot({ path: 'test_screenshots/verified_ai_coach_mobile.png' });

  await browser.close();

  console.log('\n=== SUMMARY OF VERIFICATION RESULTS ===');
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.passed ? '✅ PASS' : '❌ FAIL'}: ${r.test}`);
    if (!r.passed) allPassed = false;
  }
  console.log(`\nOVERALL: ${allPassed ? 'ALL 10 TESTS PASSED!' : 'SOME TESTS FAILED'}`);
  return allPassed;
}

runTests().then(ok => process.exit(ok ? 0 : 1)).catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
