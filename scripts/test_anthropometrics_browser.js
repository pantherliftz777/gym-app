const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== RUNNING PUPPETEER BROWSER VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 850 });

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  });

  console.log('1. Loading FitFuel web app at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Switch to Body Analysis view
  console.log('2. Switching to view-body-analysis...');
  await page.evaluate(() => switchView('body-analysis'));
  await new Promise(r => setTimeout(r, 600));

  // Step 1: Select goal
  console.log('3. Completing Step 1 (Goal Selection)...');
  await page.evaluate(() => {
    const card = document.querySelector('.ba-goal-card[data-goal-id="lean_athletic"]');
    if (card) card.click();
    const nextBtn = document.getElementById('baStep1NextBtn');
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Step 2: Verify Anthropometric Tape Measurements Card
  console.log('4. Verifying Step 2 Anthropometric Tape Card & Auto-Estimate...');
  const step2Check = await page.evaluate(() => {
    const card = document.getElementById('baTapeMeasureCard');
    const autoBtn = document.getElementById('baAutoCalcTapeBtn');
    const neckInput = document.getElementById('baTapeNeck');
    const waistInput = document.getElementById('baTapeWaist');
    const unitCmBtn = document.getElementById('baTapeUnitCm');
    const unitInBtn = document.getElementById('baTapeUnitIn');

    if (!card || !autoBtn || !neckInput || !waistInput) {
      return { ok: false, error: 'Tape elements missing' };
    }

    // Click Auto-Estimate
    autoBtn.click();
    const estNeck = neckInput.value;
    const estWaist = waistInput.value;

    // Toggle unit to inches
    if (unitInBtn) unitInBtn.click();
    const inchWaist = waistInput.value;

    // Toggle back to cm
    if (unitCmBtn) unitCmBtn.click();
    const cmWaist = waistInput.value;

    // Go to next step
    const nextBtn = document.getElementById('baStep2NextBtn');
    if (nextBtn) nextBtn.click();

    return {
      ok: true,
      estNeck,
      estWaist,
      inchWaist,
      cmWaist
    };
  });

  console.log('   Step 2 check result:', step2Check);
  if (!step2Check.ok) throw new Error('Step 2 check failed: ' + step2Check.error);
  await new Promise(r => setTimeout(r, 400));

  // Step 3: Load sample poses and go to Step 4
  console.log('5. Completing Step 3 (Sample Photos)...');
  await page.evaluate(() => {
    const sampleBtn = document.getElementById('baLoadSamplePhotosBtn');
    if (sampleBtn) sampleBtn.click();
    const nextBtn = document.getElementById('baStep3NextBtn');
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Step 4: Consent and Run Analysis
  console.log('6. Completing Step 4 (Consent & Run Analysis)...');
  await page.evaluate(() => {
    const consent = document.getElementById('baConsentCheck');
    if (consent) {
      consent.checked = true;
      consent.dispatchEvent(new Event('change'));
    }
    const runBtn = document.getElementById('baRunAnalysisBtn');
    if (runBtn) runBtn.click();
  });

  // Wait for Step 6 to appear (analysis completes)
  console.log('7. Waiting for Step 6 Transformation Dashboard...');
  await page.waitForFunction(() => {
    const s6 = document.getElementById('baStep6');
    return s6 && s6.classList.contains('active');
  }, { timeout: 15000 });

  await new Promise(r => setTimeout(r, 1000));

  // Verify Step 6 Anthropometric & Clinical Cards
  console.log('8. Verifying Step 6 Anthropometric Circumferences and Clinical Risk Cards...');
  const step6Data = await page.evaluate(() => {
    const chest = document.getElementById('baCircChest')?.textContent;
    const waist = document.getElementById('baCircWaist')?.textContent;
    const hips = document.getElementById('baCircHips')?.textContent;
    const neck = document.getElementById('baCircNeck')?.textContent;
    const bicep = document.getElementById('baCircBicep')?.textContent;
    const thigh = document.getElementById('baCircThigh')?.textContent;
    const calf = document.getElementById('baCircCalf')?.textContent;

    const whr = document.getElementById('baEstWhr')?.textContent;
    const whrBadge = document.getElementById('baEstWhrBadge')?.textContent;
    const whtr = document.getElementById('baEstWhtr')?.textContent;
    const whtrBadge = document.getElementById('baEstWhtrBadge')?.textContent;
    const navyBf = document.getElementById('baEstNavyBf')?.textContent;
    const lbm = document.getElementById('baEstLbm')?.textContent;

    return {
      chest, waist, hips, neck, bicep, thigh, calf,
      whr, whrBadge, whtr, whtrBadge, navyBf, lbm
    };
  });

  console.log('   Step 6 Dashboard Results:');
  console.log(JSON.stringify(step6Data, null, 2));

  if (!step6Data.chest || !step6Data.waist || !step6Data.whr || !step6Data.navyBf) {
    throw new Error('Step 6 dashboard elements were not properly populated!');
  }

  // Test Interactive Tape Measure Modal
  console.log('9. Testing Interactive Tape Measure Modal...');
  const modalTest = await page.evaluate(() => {
    const editBtn = document.getElementById('baEditCircumferencesBtn');
    if (editBtn) editBtn.click();

    const modal = document.getElementById('baTapeMeasureModal');
    const isVisible = modal && modal.style.display !== 'none';

    // Drag waist slider to 78 cm
    const waistSlider = document.getElementById('baModalWaist');
    if (waistSlider) {
      waistSlider.value = 78;
      waistSlider.dispatchEvent(new Event('input'));
    }

    const liveBf = document.getElementById('baModalLiveBf')?.textContent;
    const liveWhr = document.getElementById('baModalLiveWhr')?.textContent;

    // Test unit toggle inside modal: toggle to inches
    const modalUnitInBtn = document.getElementById('baModalUnitIn');
    const modalUnitCmBtn = document.getElementById('baModalUnitCm');
    if (modalUnitInBtn) modalUnitInBtn.click();
    const inchWaistInModal = waistSlider ? waistSlider.value : null;

    // Toggle back to cm
    if (modalUnitCmBtn) modalUnitCmBtn.click();
    const cmWaistInModal = waistSlider ? waistSlider.value : null;

    // Test reset button inside modal
    const resetBtn = document.getElementById('baTapeModalResetBtn');
    if (resetBtn) resetBtn.click();
    const resetWaist = waistSlider ? waistSlider.value : null;

    // Re-adjust waist to 78 cm and apply
    if (waistSlider) {
      waistSlider.value = 78;
      waistSlider.dispatchEvent(new Event('input'));
    }

    // Apply
    const applyBtn = document.getElementById('baTapeModalApplyBtn');
    if (applyBtn) applyBtn.click();

    const modalClosed = modal && modal.style.display === 'none';
    const updatedDashboardWaist = document.getElementById('baCircWaist')?.textContent;
    const updatedDashboardWhr = document.getElementById('baEstWhr')?.textContent;

    return {
      modalOpened: isVisible,
      liveBf,
      liveWhr,
      inchWaistInModal,
      cmWaistInModal,
      resetWaist,
      modalClosed,
      updatedDashboardWaist,
      updatedDashboardWhr
    };
  });

  console.log('   Modal Test Results:', modalTest);
  if (!modalTest.modalOpened || !modalTest.modalClosed) {
    throw new Error('Tape measure modal interaction failed!');
  }
  if (Math.abs(parseFloat(modalTest.inchWaistInModal) - 30.7) > 0.6) {
    throw new Error(`Modal inch conversion failed! Expected ~30.7, got ${modalTest.inchWaistInModal}`);
  }
  if (Math.abs(parseFloat(modalTest.cmWaistInModal) - 78) > 0.6) {
    throw new Error(`Modal cm conversion failed! Expected ~78, got ${modalTest.cmWaistInModal}`);
  }
  if (parseFloat(modalTest.resetWaist) < 80) {
    throw new Error(`Modal reset failed! Expected ~81.5, got ${modalTest.resetWaist}`);
  }

  // Test 9b: Opening modal while in inches mode
  console.log('9b. Testing opening modal when tapeUnit is inches...');
  const inchModalTest = await page.evaluate(() => {
    // Switch app tapeUnit to inches
    setTapeUnit('in');
    const editBtn = document.getElementById('baEditCircumferencesBtn');
    if (editBtn) editBtn.click();

    const waistSlider = document.getElementById('baModalWaist');
    const inchVal = waistSlider ? parseFloat(waistSlider.value) : null;
    const modalUnitInBtn = document.getElementById('baModalUnitIn');
    const inActive = modalUnitInBtn && modalUnitInBtn.classList.contains('active');

    const closeBtn = document.getElementById('baTapeModalCloseBtn');
    if (closeBtn) closeBtn.click();

    // Revert tape unit to cm for clean state
    setTapeUnit('cm');

    return {
      inchVal,
      inActive
    };
  });
  console.log('   Inches Modal Test Results:', inchModalTest);
  if (!inchModalTest.inActive) {
    throw new Error('Modal did not inherit inches unit!');
  }
  if (inchModalTest.inchVal > 40 || inchModalTest.inchVal < 25) {
    throw new Error(`Opening modal in inches mode corrupted slider value: ${inchModalTest.inchVal} in`);
  }

  // Screenshot in Dark Theme
  const outDir = path.join(__dirname, '..', 'test_screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, 'anthropometrics_dark_theme.png'), fullPage: true });
  console.log('10. Saved screenshot: anthropometrics_dark_theme.png');

  // Screenshot in Light Theme
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, 'anthropometrics_light_theme.png'), fullPage: true });
  console.log('11. Saved screenshot: anthropometrics_light_theme.png');

  console.log('Page Errors count:', pageErrors.length);
  if (pageErrors.length > 0) {
    console.error('Page errors encountered:', pageErrors);
  }

  await browser.close();
  console.log('\nPUPPETEER BROWSER VERIFICATION COMPLETED WITH SUCCESS!');
})().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
