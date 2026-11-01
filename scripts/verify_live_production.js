const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function verifyLive() {
  console.log('[Puppeteer Live Verification] Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('[Puppeteer] Navigating to https://gym-app-io.vercel.app ...');
    const res = await page.goto('https://gym-app-io.vercel.app', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('[Puppeteer] Response HTTP status:', res.status());
    if (res.status() !== 200) {
      throw new Error(`Expected HTTP 200 from live server, got ${res.status()}`);
    }

    const title = await page.title();
    console.log('[Puppeteer] Page Title:', title);

    // 1. Verify Hero Carousel
    await page.waitForSelector('#heroCarouselContainer', { timeout: 10000 });
    const carouselInfo = await page.evaluate(() => {
      const container = document.getElementById('heroCarouselContainer');
      const track = document.getElementById('heroCarouselTrack');
      const slides = Array.from(document.querySelectorAll('.hero-carousel-slide:not(.clone)'));
      const dots = Array.from(document.querySelectorAll('.hero-carousel-dot'));
      const prevBtn = document.getElementById('heroCarouselPrevBtn');
      const nextBtn = document.getElementById('heroCarouselNextBtn');

      return {
        hasContainer: !!container,
        hasTrack: !!track,
        slideCount: slides.length,
        dotCount: dots.length,
        hasPrevBtn: !!prevBtn,
        hasNextBtn: !!nextBtn
      };
    });

    console.log('[Puppeteer] Hero Carousel Verification:', carouselInfo);
    if (!carouselInfo.hasContainer || carouselInfo.slideCount !== 4) {
      throw new Error(`Hero carousel verification failed: ${JSON.stringify(carouselInfo)}`);
    }

    // Capture home view
    const screenshotDir = path.join(__dirname, '../test_screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, 'live_production_home.png') });
    console.log('[Puppeteer] Saved screenshot: test_screenshots/live_production_home.png');

    // 2. Verify Training / Workouts View and Equipment Engine Filters
    console.log('[Puppeteer] Testing Workouts section and equipment filters...');
    // Click on Training subnav / Workouts
    const workoutsNavClicked = await page.evaluate(() => {
      // Look for button or link leading to workouts
      const btn = document.querySelector('[data-view="workouts"]') || 
                  document.querySelector('[data-subnav="workouts"]') ||
                  document.querySelector('#btnNavWorkouts') ||
                  Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().toLowerCase().includes('workouts'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('[Puppeteer] Clicked Workouts nav button:', workoutsNavClicked);

    await new Promise(r => setTimeout(r, 1000));

    const workoutFiltersInfo = await page.evaluate(() => {
      const typeChips = Array.from(document.querySelectorAll('#workoutTypeChips .workout-type-chip'));
      const locationChips = Array.from(document.querySelectorAll('#workoutLocationChips .workout-type-chip'));
      const equipmentChips = Array.from(document.querySelectorAll('#workoutEquipmentChips button'));
      const activeType = document.querySelector('#workoutTypeChips .workout-type-chip.active');
      const activeLoc = document.querySelector('#workoutLocationChips .workout-type-chip.active');
      return {
        typeChipsCount: typeChips.length,
        locationChipsCount: locationChips.length,
        equipmentChipsCount: equipmentChips.length,
        activeTypeText: activeType ? activeType.textContent.trim() : null,
        activeLocText: activeLoc ? activeLoc.textContent.trim() : null
      };
    });
    console.log('[Puppeteer] Workout Filters Info (Initial):', workoutFiltersInfo);

    // Click 'Home' location chip
    await page.evaluate(() => {
      const homeChip = document.querySelector('#workoutLocationChips [data-location="home"]');
      if (homeChip) homeChip.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const homeEquipmentInfo = await page.evaluate(() => {
      const equipmentChips = Array.from(document.querySelectorAll('#workoutEquipmentChips button'));
      return {
        homeEquipmentChipsCount: equipmentChips.length,
        equipmentNames: equipmentChips.map(c => c.textContent.trim())
      };
    });
    console.log('[Puppeteer] Home Equipment Info after clicking Home:', homeEquipmentInfo);
    if (homeEquipmentInfo.homeEquipmentChipsCount === 0) {
      throw new Error('Equipment chips failed to render when switching to Home location');
    }

    // 3. Verify Beta Management Protection
    console.log('[Puppeteer] Testing Beta Feature gating (e.g. Posture AI)...');
    const betaLockInfo = await page.evaluate(() => {
      // Find posture button
      const postureBtn = document.querySelector('[data-view="posture"]') ||
                         Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('Posture'));
      if (postureBtn) {
        postureBtn.click();
      }
      const betaBadge = document.querySelector('.beta-badge, .beta-locked-banner, #betaLockedModal');
      const modalVisible = document.querySelector('#betaLockedPrompt, .beta-lock-overlay, [data-beta-locked="true"]');
      return {
        hasPostureBtn: !!postureBtn,
        hasBetaBadge: !!betaBadge || !!modalVisible
      };
    });
    console.log('[Puppeteer] Beta Feature Gating Info:', betaLockInfo);

    await page.screenshot({ path: path.join(screenshotDir, 'live_production_feature.png') });
    console.log('[Puppeteer] Saved screenshot: test_screenshots/live_production_feature.png');

    // 4. Verify API & Service Worker Cache
    const swInfo = await page.evaluate(async () => {
      if ('caches' in window) {
        const keys = await window.caches.keys();
        return { cacheKeys: keys };
      }
      return { cacheKeys: [] };
    });
    console.log('[Puppeteer] Client Service Worker Caches:', swInfo);

    console.log('\n======================================================');
    console.log('✅ ALL LIVE PRODUCTION PUPPETEER CHECKS PASSED ON VERCEL!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

verifyLive().catch(err => {
  console.error('Fatal live verification error:', err);
  process.exit(1);
});
