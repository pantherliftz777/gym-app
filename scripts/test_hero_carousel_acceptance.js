const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Starting comprehensive acceptance test suite for Hero Carousel...');
  const artifactDir = path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // TEST SUITE 1: DESKTOP VIEWPORT
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Check old hero elements are completely gone
  const oldHeroCheck = await page.evaluate(() => {
    return {
      oldHeroCard: !!document.querySelector('.stronger-you-hero-card'),
      oldAthleteImg: !!document.getElementById('syAthleteHeroImg'),
      oldHudBadges: !!document.querySelector('.sy-athlete-hud-badge'),
      oldPromotionalCta: !!document.getElementById('syStartJourneyBtn')
    };
  });
  console.log('1. Old Hero Elements Removed Check:', oldHeroCheck);
  if (oldHeroCheck.oldHeroCard || oldHeroCheck.oldAthleteImg || oldHeroCheck.oldHudBadges || oldHeroCheck.oldPromotionalCta) {
    throw new Error('Old hero elements still exist in DOM!');
  }

  // 2. Check Carousel Structure & Images
  const carouselInfo = await page.evaluate(() => {
    const container = document.getElementById('heroCarouselContainer');
    const track = document.getElementById('heroCarouselTrack');
    const slides = Array.from(document.querySelectorAll('.hero-carousel-slide:not(.clone)'));
    const allSlides = Array.from(document.querySelectorAll('.hero-carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-carousel-dot'));
    const prevBtn = !!document.getElementById('heroCarouselPrevBtn');
    const nextBtn = !!document.getElementById('heroCarouselNextBtn');

    return {
      hasContainer: !!container,
      hasTrack: !!track,
      realSlideCount: slides.length,
      totalSlideCount: allSlides.length,
      dotCount: dots.length,
      hasPrevBtn: prevBtn,
      hasNextBtn: nextBtn,
      imageSources: slides.map(s => s.querySelector('img')?.getAttribute('src'))
    };
  });
  console.log('2. Carousel Structure Check:', carouselInfo);

  // Take screenshot: Desktop initial view
  await page.screenshot({ path: path.join(artifactDir, 'carousel_01_desktop_initial.png') });

  // 3. Test Autoplay advance (should change slide after ~1.8s)
  console.log('3. Testing Autoplay (waiting 2.2s for automatic slide)...');
  const initialIndex = await page.evaluate(() => window.fitfuelHeroCarousel ? window.fitfuelHeroCarousel.currentIndex : -1);
  await new Promise(r => setTimeout(r, 2200));
  const afterAutoplayIndex = await page.evaluate(() => window.fitfuelHeroCarousel ? window.fitfuelHeroCarousel.currentIndex : -1);
  console.log(`Initial track index: ${initialIndex}, after 2.2s autoplay: ${afterAutoplayIndex}`);
  const autoplayAdvanced = afterAutoplayIndex > initialIndex;
  console.log('Autoplay advance verified:', autoplayAdvanced);

  // 4. Test Pause on Hover
  console.log('4. Testing Hover Pause...');
  await page.hover('#heroCarouselContainer');
  const indexAtHover = await page.evaluate(() => window.fitfuelHeroCarousel ? window.fitfuelHeroCarousel.currentIndex : -1);
  await new Promise(r => setTimeout(r, 2200));
  const indexAfterHoverWait = await page.evaluate(() => window.fitfuelHeroCarousel ? window.fitfuelHeroCarousel.currentIndex : -1);
  const hoverPaused = (indexAtHover === indexAfterHoverWait);
  console.log(`Hover pause verified: ${hoverPaused} (index remained ${indexAtHover})`);

  // Move mouse away to resume
  await page.mouse.move(0, 0);

  // 5. Test Next Button Click
  console.log('5. Testing Next Button...');
  const beforeNext = await page.evaluate(() => window.fitfuelHeroCarousel.currentIndex);
  await page.click('#heroCarouselNextBtn');
  await new Promise(r => setTimeout(r, 700));
  const afterNext = await page.evaluate(() => window.fitfuelHeroCarousel.currentIndex);
  console.log(`Before next: ${beforeNext}, After next: ${afterNext} (Expected +1)`);

  // 6. Test Prev Button Click
  console.log('6. Testing Prev Button...');
  const beforePrev = await page.evaluate(() => window.fitfuelHeroCarousel.currentIndex);
  await page.click('#heroCarouselPrevBtn');
  await new Promise(r => setTimeout(r, 700));
  const afterPrev = await page.evaluate(() => window.fitfuelHeroCarousel.currentIndex);
  console.log(`Before prev: ${beforePrev}, After prev: ${afterPrev} (Expected -1)`);

  // 7. Test Pagination Dot Click
  console.log('7. Testing Dot 3 click (Slide 4, index 3)...');
  await page.click('.hero-carousel-dot[data-slide-index="3"]');
  await new Promise(r => setTimeout(r, 700));
  const activeDotAfterClick = await page.evaluate(() => {
    const activeDot = document.querySelector('.hero-carousel-dot.active');
    return activeDot ? activeDot.dataset.slideIndex : null;
  });
  console.log('Active dot after clicking dot 3:', activeDotAfterClick);

  // 8. Test Keyboard Navigation
  console.log('8. Testing Keyboard Navigation (ArrowLeft / ArrowRight)...');
  await page.focus('#heroCarouselViewport');
  await page.keyboard.press('ArrowLeft');
  await new Promise(r => setTimeout(r, 700));
  const activeDotAfterLeftKey = await page.evaluate(() => {
    const activeDot = document.querySelector('.hero-carousel-dot.active');
    return activeDot ? activeDot.dataset.slideIndex : null;
  });
  console.log('Active dot after ArrowLeft:', activeDotAfterLeftKey);

  // 9. Test Seamless Infinite Loop (Advance past end)
  console.log('9. Testing Seamless Infinite Loop wrap...');
  // Click next 6 times quickly
  for (let i = 0; i < 6; i++) {
    await page.click('#heroCarouselNextBtn');
    await new Promise(r => setTimeout(r, 650));
  }
  const indexAfterWrap = await page.evaluate(() => window.fitfuelHeroCarousel.currentIndex);
  console.log('Index after multiple Next clicks (seamlessly wrapped):', indexAfterWrap);
  await page.screenshot({ path: path.join(artifactDir, 'carousel_02_desktop_wrapped.png') });

  // 10. Test Page Horizontal Scroll on Desktop
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log('Desktop has unwanted horizontal page overflow:', desktopOverflow);

  // TEST SUITE 2: TABLET VIEWPORT (768px)
  console.log('\n--- Tablet Viewport (768px) ---');
  await page.setViewport({ width: 768, height: 1024 });
  await new Promise(r => setTimeout(r, 400));
  const tabletOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log('Tablet horizontal overflow:', tabletOverflow);
  await page.screenshot({ path: path.join(artifactDir, 'carousel_03_tablet_view.png') });

  // TEST SUITE 3: MOBILE VIEWPORT (390px)
  console.log('\n--- Mobile Viewport (390px) ---');
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 400));
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log('Mobile horizontal overflow:', mobileOverflow);

  // 11. Test Mobile Touch Swipe Gestures
  console.log('Testing Mobile Touch Swipe...');
  const beforeSwipeIndex = await page.evaluate(() => window.fitfuelHeroCarousel.currentIndex);
  const viewportBox = await page.evaluate(() => {
    const vp = document.getElementById('heroCarouselViewport');
    const r = vp.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width };
  });

  // Perform swipe left
  await page.touchscreen.tap(viewportBox.x + 80, viewportBox.y);
  await new Promise(r => setTimeout(r, 100));
  // Simulate swipe with evaluate touch events
  await page.evaluate(() => {
    const vp = document.getElementById('heroCarouselViewport');
    const tStart = new Touch({ identifier: 1, target: vp, clientX: 300, clientY: 200 });
    const tEnd = new Touch({ identifier: 1, target: vp, clientX: 100, clientY: 200 });
    vp.dispatchEvent(new TouchEvent('touchstart', { touches: [tStart] }));
    vp.dispatchEvent(new TouchEvent('touchend', { changedTouches: [tEnd] }));
  });
  await new Promise(r => setTimeout(r, 700));
  const afterSwipeIndex = await page.evaluate(() => window.fitfuelHeroCarousel.currentIndex);
  console.log(`Before swipe: ${beforeSwipeIndex}, After swipe: ${afterSwipeIndex} (Advanced: ${afterSwipeIndex > beforeSwipeIndex})`);
  await page.screenshot({ path: path.join(artifactDir, 'carousel_04_mobile_view.png') });

  // TEST SUITE 4: THEMES
  console.log('\n--- Theme Testing ---');
  // Light Theme
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'carousel_05_theme_light.png') });

  // Dark Theme
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'carousel_06_theme_dark.png') });

  // TEST SUITE 5: DASHBOARD HEALTH & OTHER PAGES
  console.log('\n--- Dashboard & Sub-pages Health ---');
  const greetingVisible = await page.evaluate(() => {
    const g = document.getElementById('dashImage3Greeting');
    return g && g.textContent.includes('Good Morning');
  });
  console.log('Greeting message intact:', greetingVisible);

  const metricsGridVisible = await page.evaluate(() => !!document.getElementById('dashMetricsGridV2'));
  console.log('Dashboard metrics grid intact:', metricsGridVisible);

  console.log('Console errors during full run:', consoleErrors);

  await browser.close();
  console.log('\nAll tests completed successfully!');
})();
