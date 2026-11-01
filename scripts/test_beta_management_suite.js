const http = require('http');
const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runApiTests() {
  console.log('\n--- 1. Testing GET /api/beta-features (Public / Guest) ---');
  const bfRes = await request('GET', '/api/beta-features');
  console.log('Status:', bfRes.status);
  console.log('User Role:', bfRes.data.userRole);
  const expectedKeys = ['posture', 'body-analysis', 'food-scanner', 'voice-coach', 'gps-activity', 'barcode-scanner'];
  expectedKeys.forEach(k => {
    const f = bfRes.data.features && bfRes.data.features[k];
    console.log(`  - ${k}: enabled=${f?.enabled}, access_level=${f?.access_level}`);
    if (!f) throw new Error(`Missing canonical feature: ${k}`);
  });

  console.log('\n--- 2. Testing 403 Forbidden Access on Disabled Endpoints (Guest) ---');
  const postureRes = await request('GET', '/api/posture/sessions');
  console.log('GET /api/posture/sessions (Guest): status =', postureRes.status, '(expected 401 or 403)');
  if (postureRes.status !== 401 && postureRes.status !== 403) throw new Error('Guest accessed posture sessions!');

  const bodyScanRes = await request('GET', '/api/body-scan/assessments');
  console.log('GET /api/body-scan/assessments (Guest): status =', bodyScanRes.status, '(expected 403)');
  if (bodyScanRes.status !== 403) throw new Error('Guest accessed body scan assessments without permission!');

  const activityRes = await request('GET', '/api/activity/sessions');
  console.log('GET /api/activity/sessions (Guest): status =', activityRes.status, '(expected 401 or 403)');
  if (activityRes.status !== 401 && activityRes.status !== 403) throw new Error('Guest accessed activity sessions!');

  console.log('\n--- 3. Testing Admin Registration / Login ---');
  const adminEmail = 'admin@fitfuel.app';
  const adminPass = 'FitFuel@Admin2026!';
  let adminLogin = await request('POST', '/api/auth/login', { email: adminEmail, password: adminPass });
  if (adminLogin.status !== 200) {
    console.log('Registering admin account...');
    await request('POST', '/api/auth/register', {
      name: 'System Administrator',
      email: adminEmail,
      contact: '9999999999',
      password: adminPass
    });
    adminLogin = await request('POST', '/api/auth/login', { email: adminEmail, password: adminPass });
  }
  const adminToken = adminLogin.data.token;
  console.log('Admin login status:', adminLogin.status, 'is_admin:', adminLogin.data.user?.is_admin);

  console.log('\n--- 4. Testing Admin Feature Flags Controls ---');
  const flagsRes = await request('GET', '/api/admin/feature-flags', null, adminToken);
  console.log('GET /api/admin/feature-flags status =', flagsRes.status, 'Total flags =', flagsRes.data.flags?.length);
  if (flagsRes.data.flags?.length !== 6) throw new Error('Expected 6 canonical feature flags!');

  // Update posture flag to all_users
  console.log('Updating "posture" flag to "all_users"...');
  const updateRes1 = await request('POST', '/api/admin/feature-flags', { key: 'posture', access_level: 'all_users' }, adminToken);
  console.log('Update status =', updateRes1.status, 'new access_level =', updateRes1.data.flag?.access_level);
  if (updateRes1.data.flag?.access_level !== 'all_users') throw new Error('Failed to update posture flag to all_users');

  // Verify guest now sees posture as enabled
  const bfRes2 = await request('GET', '/api/beta-features');
  console.log('Guest posture enabled after update:', bfRes2.data.features?.posture?.enabled);
  if (!bfRes2.data.features?.posture?.enabled) throw new Error('Guest should have access to all_users posture feature!');

  // Revert posture flag to admin_only
  console.log('Reverting "posture" flag to "admin_only"...');
  await request('POST', '/api/admin/feature-flags', { key: 'posture', access_level: 'admin_only' }, adminToken);
  const bfRes3 = await request('GET', '/api/beta-features');
  console.log('Guest posture enabled after revert:', bfRes3.data.features?.posture?.enabled);
  if (bfRes3.data.features?.posture?.enabled) throw new Error('Guest should NOT have access to admin_only posture feature!');

  console.log('\n--- 5. Testing Beta Tester Enrollment and Access Flow ---');
  const testerEmail = `tester_${Date.now()}@fitfuel.app`;
  const regTester = await request('POST', '/api/auth/register', {
    name: 'Alice Tester',
    email: testerEmail,
    contact: '1234567890',
    password: 'TesterPassword123!'
  });
  const testerToken = regTester.data.token;
  const testerUserId = regTester.data.user.id;
  console.log('Registered tester user:', testerEmail, 'id:', testerUserId);

  // Before enrollment: tester is standard user
  const testerFeat1 = await request('GET', '/api/beta-features', null, testerToken);
  console.log('Tester before enrollment:', testerFeat1.data.userRole, 'isTester:', testerFeat1.data.isTester);
  console.log('gps-activity accessible before enrollment:', testerFeat1.data.features['gps-activity']?.enabled);
  if (testerFeat1.data.features['gps-activity']?.enabled) throw new Error('GPS activity should be disabled for standard user!');

  // Admin enrolls tester
  console.log('Admin enrolling user as Beta Tester...');
  const enrollRes = await request('POST', '/api/admin/beta-testers', { user_id: testerUserId, is_beta_tester: 1 }, adminToken);
  console.log('Enroll status:', enrollRes.status, 'is_beta_tester:', enrollRes.data.is_beta_tester);

  // After enrollment: tester has access to beta_testers features
  const testerFeat2 = await request('GET', '/api/beta-features', null, testerToken);
  console.log('Tester after enrollment:', testerFeat2.data.userRole, 'isTester:', testerFeat2.data.isTester);
  console.log('gps-activity accessible after enrollment:', testerFeat2.data.features['gps-activity']?.enabled);
  if (!testerFeat2.data.features['gps-activity']?.enabled) throw new Error('GPS activity should now be accessible to enrolled Beta Tester!');

  // 6. Test Beta Feedback Submission
  console.log('\n--- 6. Testing Beta Feedback Submission ---');
  const feedbackRes = await request('POST', '/api/beta/feedback', {
    feature_key: 'gps-activity',
    feedback_type: 'ux',
    rating: '5',
    comment: 'Pace telemetry HUD works smoothly on mobile outdoors!'
  }, testerToken);
  console.log('Feedback submission status:', feedbackRes.status, 'message:', feedbackRes.data.message);
  if (feedbackRes.status !== 200) throw new Error('Failed to submit beta feedback!');

  console.log('\nALL API & ACCESS CONTROL UNIT TESTS PASSED SUCCESSFULLY!');
}

async function runBrowserTests() {
  console.log('\n--- 7. Running Browser UI & Interaction Tests (Puppeteer) ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // 1. Visit as Guest
    console.log('Loading FitFuel app at http://localhost:3000...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // Verify switchView to locked feature displays locked card (NO empty page)
    console.log('Testing direct switchView("posture") for Guest...');
    await page.evaluate(() => window.switchView('posture'));
    await new Promise(r => setTimeout(r, 600));

    const postureLocked = await page.evaluate(() => {
      const v = document.getElementById('view-posture');
      const card = v ? v.querySelector('.beta-locked-card') : null;
      return {
        isActive: v?.classList.contains('active'),
        hasLockedCard: Boolean(card),
        cardTitle: card?.querySelector('.beta-locked-title')?.textContent || ''
      };
    });
    console.log('Posture View Locked State:', postureLocked);
    if (!postureLocked.hasLockedCard || !postureLocked.cardTitle.includes('Beta Access Required')) {
      throw new Error('Expected polished locked card in posture view for unauthorized user!');
    }

    // Verify body-analysis locked state
    console.log('Testing direct switchView("body-analysis") for Guest...');
    await page.evaluate(() => window.switchView('body-analysis'));
    await new Promise(r => setTimeout(r, 600));
    const bodyLocked = await page.evaluate(() => {
      const v = document.getElementById('view-body-analysis');
      const card = v ? v.querySelector('.beta-locked-card') : null;
      return Boolean(card);
    });
    console.log('Body Analysis View Locked State:', bodyLocked);
    if (!bodyLocked) throw new Error('Expected locked card in body-analysis view!');

    // Verify returning to today view works cleanly
    console.log('Switching back to Today overview...');
    await page.evaluate(() => window.switchView('today'));
    await new Promise(r => setTimeout(r, 600));
    const todayActive = await page.evaluate(() => document.getElementById('view-today')?.classList.contains('active'));
    console.log('Today view active:', todayActive);
    if (!todayActive) throw new Error('Failed to return to Today overview!');

    // 2. Test Admin Portal Beta Features Tab
    console.log('\nLogging in as Admin in browser to inspect Admin Beta Features Tab...');
    await page.evaluate(() => {
      // Simulate admin login
      localStorage.setItem('ff_token', 'mock_admin_token');
    });

    // Make an admin login call in browser context
    const adminLoginResult = await page.evaluate(async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@fitfuel.app', password: 'FitFuel@Admin2026!' })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('ff_token', data.token);
        if (window.FitFuelBeta) await window.FitFuelBeta.fetchBetaFeatures();
      }
      return data;
    });
    console.log('Browser admin login ok:', Boolean(adminLoginResult.token));

    // Switch to admin view and click Beta Features tab
    await page.evaluate(() => {
      window.switchView('admin');
      document.getElementById('adminTabBetaFeatures')?.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const adminCheck = await page.evaluate(() => {
      const pane = document.getElementById('adminBetaFeaturesViewPane');
      const cards = pane ? pane.querySelectorAll('.beta-admin-flag-card') : [];
      const testers = pane ? pane.querySelectorAll('.beta-tester-user-row') : [];
      return {
        paneVisible: pane?.style.display !== 'none',
        cardCount: cards.length,
        testerCount: testers.length
      };
    });
    console.log('Admin Beta Features Tab Check:', adminCheck);
    if (!adminCheck.paneVisible || adminCheck.cardCount !== 6) {
      throw new Error(`Admin Beta Tab failed check: cards=${adminCheck.cardCount}`);
    }

    // 3. Test Beta Feedback Modal
    console.log('\nOpening Beta Feedback Modal...');
    await page.evaluate(() => {
      if (window.FitFuelBeta) window.FitFuelBeta.openFeedbackModal('posture');
    });
    await new Promise(r => setTimeout(r, 500));

    const modalCheck = await page.evaluate(() => {
      const modal = document.getElementById('betaFeedbackModal');
      const featName = document.getElementById('betaFeedbackFeatureName')?.textContent || '';
      return {
        hasOpen: modal?.classList.contains('open') || modal?.classList.contains('active'),
        featName
      };
    });
    console.log('Feedback Modal Check:', modalCheck);
    if (!modalCheck.hasOpen || !modalCheck.featName.includes('Posture')) {
      throw new Error('Feedback modal did not open with correct feature context!');
    }

    // Close modal
    await page.evaluate(() => {
      if (window.FitFuelBeta) window.FitFuelBeta.closeFeedbackModal();
    });

    console.log('\nALL BROWSER AUTOMATION & UI VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    await runApiTests();
    await runBrowserTests();
    console.log('\n======================================================');
    console.log('🎉 COMPLETE BETA FEATURE MANAGEMENT SUITE PASSED! 🎉');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

main();
