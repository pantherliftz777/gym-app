const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2ETests() {
  console.log('=== STARTING FITFUEL BETA ACCESS & BIDIRECTIONAL NAVIGATION E2E TEST ===\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passCount++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failCount++;
    }
  }

  try {
    // 1. Visit homepage
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await delay(1000);
    assert(await page.$('#view-today.active') !== null, 'FitFuel app initial load renders view-today as active');

    // Screenshot 1: Initial Dashboard with Closed Beta Hub
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_dashboard_initial.png') });

    // 2. Test Navigation to Features without Blank Screen
    console.log('\n--- Test Phase 1: Features & Sandboxes Navigation ---');
    const featuresBtn = await page.$('#sidebarFeaturesBtn');
    assert(featuresBtn !== null, 'Sidebar Features & Sandboxes button exists');

    const dataViewAttr = await page.$eval('#sidebarFeaturesBtn', el => el.getAttribute('data-view'));
    assert(dataViewAttr === 'features', 'Sidebar Features button has data-view="features" (no undefined view)');

    await page.click('#sidebarFeaturesBtn');
    await delay(800);

    const activeViewId = await page.$eval('.page-content .view.active', el => el.id);
    assert(activeViewId === 'view-features', 'Clicking sidebar features button activates view-features without blanking screen');

    const iframeSrc = await page.$eval('#featuresShowcaseFrame', el => el.getAttribute('src'));
    assert(iframeSrc === '/features', 'Features view embeds iframe with src="/features"');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_features_view_loaded.png') });

    // 3. Test Features.html Standalone and Back-To-App Navigation
    console.log('\n--- Test Phase 2: Features Page Back-to-App Buttons ---');
    await page.goto('http://localhost:3000/features', { waitUntil: 'domcontentloaded' });
    await delay(800);

    const headerBackBtn = await page.$('#headerBackToAppBtn');
    const heroBackBtn = await page.$('#heroBackToAppBtn');
    assert(headerBackBtn !== null, 'Header "← Back to FitFuel App" button exists on /features');
    assert(heroBackBtn !== null, 'Hero "← Back to FitFuel App" button exists on /features');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_features_standalone_page.png') });

    // Click back to app
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('#headerBackToAppBtn')
    ]);
    await delay(800);
    const returnedActiveView = await page.$eval('.page-content .view.active', el => el.id);
    assert(returnedActiveView === 'view-today', 'Clicking "← Back to FitFuel App" successfully navigates back to FitFuel Today view');

    // 4. Closed Beta Hub Panel and Request Flow
    console.log('\n--- Test Phase 3: Closed Beta Hub & User Application Flow ---');
    const closedBetaHub = await page.$('#closedBetaHubPanel');
    assert(closedBetaHub !== null, 'Closed Beta Early Access panel exists on user dashboard');

    // Ensure unique fresh demo user is set
    const testUserEmail = `athlete_e2e_${Date.now()}@fitfuel.test`;
    await page.evaluate((email) => {
      localStorage.setItem('fitfuel_user_email', email);
      localStorage.setItem('fitfuel_beta_demo_admin', 'false');
      if (typeof window.loadClosedBetaDashboard === 'function') {
        window.loadClosedBetaDashboard();
      }
    }, testUserEmail);
    await delay(1000);

    const cardsCount = await page.$$eval('.closed-beta-card', cards => cards.length);
    assert(cardsCount === 3, 'Dashboard renders exactly 3 closed beta feature cards (Form AI, Wearable BLE, Meal Prep AI)');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_closed_beta_cards.png') });

    // Find and click "Request Early Access" for formCorrectionAi
    const applyBtn = await page.$('button[data-beta-apply="formCorrectionAi"]');
    assert(applyBtn !== null, 'Request Early Access button exists for formCorrectionAi');

    await page.click('button[data-beta-apply="formCorrectionAi"]');
    await delay(500);

    const isApplyModalOpen = await page.$eval('#betaApplyModal', el => el.classList.contains('open'));
    assert(isApplyModalOpen, 'Clicking Request Early Access opens #betaApplyModal');

    // Fill form in modal
    await page.type('#betaApplyDeviceInput', 'Google Pixel 8 Pro (Android 14)');
    await page.type('#betaApplyReasonInput', 'Automated E2E testing for real-time barbell squat depth angle verification');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_beta_apply_modal_filled.png') });

    // Submit modal
    await page.click('#betaApplySubmitBtn');
    await delay(1200);

    const cardStateAfterApply = await page.$eval('#closedBetaCard_formCorrectionAi', el => el.textContent);
    assert(
      cardStateAfterApply.includes('Under Review') || cardStateAfterApply.includes('pending'),
      'Submitting application updates card to pulsing amber "Under Review" state'
    );
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_beta_card_pending_state.png') });

    // 5. Admin Approval Dashboard Flow
    console.log('\n--- Test Phase 4: Admin Approval Dashboard & Stats ---');
    await page.evaluate(() => {
      if (typeof window.switchView === 'function') {
        window.isBetaDemoAdminMode = true;
        window.switchView('admin');
        const adminTab = document.getElementById('adminTabBetaTesters');
        if (adminTab) adminTab.click();
      }
    });
    await delay(1200);

    const adminPaneVisible = await page.$eval('#adminBetaTestersViewPane', el => el.style.display !== 'none');
    assert(adminPaneVisible, 'Admin Closed Beta Applicants tab pane is visible');

    const totalApplicantsText = await page.$eval('#admBetaTotalApplicants', el => el.textContent.trim());
    const approvedTestersText = await page.$eval('#admBetaApprovedTesters', el => el.textContent.trim());
    const remainingSlotsText = await page.$eval('#admBetaRemainingSlots', el => el.textContent.trim());
    assert(Number(totalApplicantsText) > 0, `Admin overview stats displays total applicants: ${totalApplicantsText}`);
    assert(Number(approvedTestersText) >= 1, `Admin overview stats displays approved testers: ${approvedTestersText}`);
    assert(remainingSlotsText.includes('/ 20'), `Admin overview stats shows remaining slots format (e.g. ${remainingSlotsText})`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_admin_dashboard_view.png') });

    // Find the applicant card for testUserEmail
    const applicantRow = await page.evaluate((email) => {
      const cards = Array.from(document.querySelectorAll('#adminBetaApplicantsCardsGrid .admin-applicant-card'));
      const target = cards.find(c => c.textContent.includes(email));
      if (target) {
        const approveBtn = target.querySelector('button[data-beta-action="approve"]');
        if (approveBtn) {
          approveBtn.click();
          return true;
        }
      }
      return false;
    }, testUserEmail);
    assert(applicantRow, `Found pending application for ${testUserEmail} and clicked Approve button`);
    await delay(1500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_admin_applicant_approved.png') });

    // 6. Verification of Unlocked Feature & Floating Feedback Button
    console.log('\n--- Test Phase 5: VIP Beta Tester Unlock & In-App Feedback Button ---');
    await page.evaluate(() => {
      if (typeof window.switchView === 'function') {
        window.switchView('today');
      }
    });
    await delay(1000);

    const cardStateAfterApproval = await page.$eval('#closedBetaCard_formCorrectionAi', el => el.textContent);
    assert(
      cardStateAfterApproval.includes('VIP Beta Tester') || cardStateAfterApproval.includes('Launch VIP Beta'),
      'Card for approved feature updates to VIP Beta Tester with Launch VIP Beta button'
    );
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_beta_card_vip_unlocked.png') });

    // Launch unlocked feature
    await page.click('#closedBetaCard_formCorrectionAi button[data-beta-launch="formCorrectionAi"]');
    await delay(1000);

    const activeUnlockedView = await page.$eval('.page-content .view.active', el => el.id);
    assert(activeUnlockedView === 'view-posture', 'Clicking Launch VIP Beta successfully opens #view-posture');

    const feedbackFloatBtn = await page.$('#betaFeedbackFloatBtn_formCorrectionAi');
    assert(feedbackFloatBtn !== null, 'Floating "Report Beta Bug / Feedback" button is present inside unlocked feature view');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_unlocked_view_with_feedback_button.png') });

    // Click feedback button
    await page.click('#betaFeedbackFloatBtn_formCorrectionAi');
    await delay(500);

    const isFeedbackModalOpen = await page.$eval('#betaFeedbackModal', el => el.classList.contains('open'));
    assert(isFeedbackModalOpen, 'Clicking floating feedback button opens #betaFeedbackModal');

    await page.type('#betaFeedbackDescInput', 'Camera angle calibration and squat depth overlay worked smoothly during E2E test!');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_beta_feedback_modal.png') });

    await page.click('#betaFeedbackSubmitBtn');
    await delay(1000);

    const isFeedbackModalClosed = await page.$eval('#betaFeedbackModal', el => !el.classList.contains('open'));
    assert(isFeedbackModalClosed, 'Submitting feedback successfully closes the modal');

    // 7. Verify All 3 Closed Beta Views Render Non-Empty Functional Layouts
    console.log('\n--- Test Phase 6: Wearables & Meal Prep Views ---');
    await page.evaluate(() => {
      if (typeof window.switchView === 'function') window.switchView('wearables');
    });
    await delay(600);
    const wearablesActive = await page.$eval('#view-wearables', el => el.classList.contains('active') && el.innerHTML.length > 500);
    assert(wearablesActive, 'view-wearables activates with full live BLE telemetry layout and ECG canvas');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_wearables_telemetry_view.png') });

    await page.evaluate(() => {
      if (typeof window.switchView === 'function') window.switchView('meal-prep');
    });
    await delay(600);
    const mealPrepActive = await page.$eval('#view-meal-prep', el => el.classList.contains('active') && el.innerHTML.length > 500);
    assert(mealPrepActive, 'view-meal-prep activates with macro protein slider and recipe grocery cards');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_meal_prep_view.png') });

    // 8. Phase 7: Admin Filter, Revoke Access, and Quick Demo Toggle
    console.log('\n--- Test Phase 7: Admin Filters, Revoke Access & Demo Mode Toggle ---');
    await page.evaluate(() => {
      window.isBetaDemoAdminMode = true;
      try { localStorage.setItem('fitfuel_beta_demo_admin', 'true'); } catch (e) {}
      if (typeof window.switchView === 'function') {
        window.switchView('admin');
        const adminTab = document.getElementById('adminTabBetaTesters');
        if (adminTab) adminTab.click();
      }
    });
    await delay(1200);

    // Test feature filter dropdown
    await page.select('#betaTesterFeatureFilterSelect', 'formCorrectionAi');
    await delay(1000);
    const filteredCount = await page.$$eval('#adminBetaApplicantsCardsGrid .admin-applicant-card', cards => cards.length);
    assert(filteredCount >= 1, `Feature filter correctly isolates applicants for formCorrectionAi (found: ${filteredCount})`);

    // Test Revoke Access button on our test applicant
    const revoked = await page.evaluate((email) => {
      const cards = Array.from(document.querySelectorAll('#adminBetaApplicantsCardsGrid .admin-applicant-card'));
      const target = cards.find(c => c.textContent.includes(email));
      if (target) {
        const revokeBtn = target.querySelector('button[data-beta-action="revoke"]');
        if (revokeBtn) {
          revokeBtn.click();
          return true;
        }
      }
      return false;
    }, testUserEmail);
    assert(revoked, `Clicked Revoke Access button for ${testUserEmail}`);
    await delay(2000);

    // Verify card now shows declined/rejected badge
    const postRevokeStatus = await page.evaluate((email) => {
      const cards = Array.from(document.querySelectorAll('#adminBetaApplicantsCardsGrid .admin-applicant-card'));
      const target = cards.find(c => c.textContent.includes(email));
      return target ? target.textContent : '';
    }, testUserEmail);
    assert(postRevokeStatus.includes('Declined'), 'Applicant row updates to Declined state upon Revoke Access');

    // Test Demo Mode Toggle (Admin -> Tester -> Admin)
    await page.evaluate(() => {
      const toggle = document.getElementById('adminBetaDemoToggleBtn');
      if (toggle) toggle.click();
    });
    await delay(1200);
    const returnedToToday = await page.$eval('.page-content .view.active', el => el.id);
    assert(returnedToToday === 'view-today', 'Clicking "Switch to Tester View" navigates directly to Today dashboard');

    // User dashboard card should reflect rejected / cohort full state with re-apply option
    const cardStateAfterRevoke = await page.$eval('#closedBetaCard_formCorrectionAi', el => el.textContent);
    assert(
      cardStateAfterRevoke.includes('Cohort Full') || cardStateAfterRevoke.includes('Re-apply'),
      'User card reflects cohort full / re-apply status after access revocation'
    );

    // Test 1-click shortcut from user dashboard back to Admin Approvals
    await page.evaluate(() => {
      const shortcut = document.getElementById('closedBetaAdminShortcutBtn');
      if (shortcut) shortcut.click();
    });
    await delay(1200);
    const switchedBackToAdmin = await page.$eval('.page-content .view.active', el => el.id);
    assert(switchedBackToAdmin === 'view-admin', 'Clicking "🛡️ Admin Approvals" on Closed Beta Hub returns to Admin Portal');

  } catch (err) {
    console.error('Unhandled E2E Test Error:', err);
    failCount++;
  } finally {
    await browser.close();
  }

  console.log(`\n=== E2E TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runE2ETests();
