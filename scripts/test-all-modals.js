const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  const modalIds = [
    'authModal',
    'foodModal',
    'customFoodModal',
    'settingsModal',
    'aiPlanModal',
    'editFoodModal',
    'recipeBuilderModal',
    'notificationModal',
    'quickOptionsModal',
    'mealAnalysisModal',
    'customWorkoutModal',
    'bodyAnalysisModal',
    'exerciseDetailModal',
    'complaintModal',
    'motivationModal',
    'avatarOptionsModal',
    'weatherTempModal',
    'swapExerciseModal',
    'workoutSessionModal'
  ];

  console.log('Testing', modalIds.length, 'modals on 390x844...');

  for (const mId of modalIds) {
    const res = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return { found: false, error: 'Element not found' };

      // Open the modal
      if (typeof window.openModal === 'function') {
        window.openModal('#' + id);
      } else {
        el.classList.add('active', 'open');
        el.style.display = 'flex';
      }

      const card = el.querySelector('.modal-card, .modal-box, .modal-content') || el;
      const rect = card.getBoundingClientRect();
      const clientW = document.documentElement.clientWidth;
      const clientH = window.innerHeight;

      // Close button
      const closeBtn = el.querySelector('.modal-close, [data-close], .close-btn, button[onclick*="closeModal"]');

      const info = {
        found: true,
        id,
        rect: {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        overflowX: rect.right > clientW + 2,
        overflowY: rect.height > clientH,
        hasCloseBtn: Boolean(closeBtn),
        closeBtnRect: closeBtn ? {
          w: Math.round(closeBtn.getBoundingClientRect().width),
          h: Math.round(closeBtn.getBoundingClientRect().height)
        } : null
      };

      // Close the modal
      if (typeof window.closeModal === 'function') {
        window.closeModal();
      }
      el.classList.remove('active', 'open');
      el.style.display = 'none';

      return info;
    }, mId);

    console.log(`[${mId}]`, res.overflowX ? 'OVERFLOW_X' : 'OK_X', res.overflowY ? 'OVERFLOW_Y' : 'OK_Y', res);
  }

  await browser.close();
})();
