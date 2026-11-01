const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => switchView('ai-coach'));

  await page.addStyleTag({
    content: `
      #coachChatStream.ai-coach-chat-stream,
      .ai-coach-chat-stream {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain;
        scrollbar-gutter: stable;
        -webkit-overflow-scrolling: touch;
      }

      .ai-coach-main-col {
        display: flex;
        flex-direction: column;
        height: calc(100dvh - 140px);
        min-height: 440px;
        position: relative;
        margin-bottom: 24px;
      }
      .ai-coach-top-section {
        flex: 0 0 auto;
      }
      .ai-coach-header-card {
        padding: 12px 16px;
        margin-bottom: 8px;
        gap: 12px;
      }
      .ai-coach-avatar-lg {
        width: 44px;
        height: 44px;
      }
      .ai-coach-header-info h2 {
        font-size: 1.15rem;
      }
      .ai-coach-subtabs {
        margin-bottom: 8px;
        padding-bottom: 4px;
      }
      .ai-coach-chat-stream {
        flex: 1 1 auto;
        min-height: 0;
        height: auto !important;
        padding: 12px 14px;
      }
      .ai-coach-composer-area {
        flex: 0 0 auto;
        margin-top: 6px;
      }
    `
  });

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

    const topWrap = document.createElement('div');
    topWrap.className = 'ai-coach-top-section';
    leftCol.insertBefore(topWrap, stream);
    topWrap.appendChild(header);
    topWrap.appendChild(tabs);

    const bottomWrap = document.createElement('div');
    bottomWrap.className = 'ai-coach-composer-area';
    leftCol.appendChild(bottomWrap);
    if (imgBar) bottomWrap.appendChild(imgBar);
    if (cmds) bottomWrap.appendChild(cmds);
    if (inputBar) bottomWrap.appendChild(inputBar);

    // Scroll window to AI coach header
    const topOffset = document.querySelector('.ai-coach-main-col').getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, topOffset - 10);
  });

  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'test_screenshots/mobile_scrolled_to_coach.png' });
  await browser.close();
})();
