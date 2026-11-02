const assert = require('assert');
const { GYM_FEATURES, canUseGymFeature } = require('../shared/featureStatus.js');

console.log('=== RUNNING HONEST UI CAPABILITY & FEATURE STATUS ENGINE TESTS ===\n');

// 1. Single Source of Truth Catalog Validation
console.log('Test 1: GYM_FEATURES Schema & Definition Integrity');
{
  const expectedKeys = [
    'workoutTracking',
    'classBooking',
    'qrEntry',
    'macroCalculator',
    'formCorrectionAi',
    'trainerChat',
    'wearableSync',
    'mealPlanAi',
    'bodyScan3D',
    'gymCrowdMeter'
  ];

  const preExistingMergedKeys = [
    'exerciseLibrary',
    'startingLoad',
    'gymChallenges',
    'foodLogging',
    'customFoods',
    'aiCoach',
    'progressTracking',
    'bodyAnalysis',
    'gpsActivity',
    'memberPlans',
    'attendanceTracking',
    'adminPortal'
  ];

  assert(Object.keys(GYM_FEATURES).length >= 22, `Expected at least 22 merged features, got ${Object.keys(GYM_FEATURES).length}`);

  // Validate all showcase keys
  expectedKeys.forEach(k => {
    assert(GYM_FEATURES[k], `Missing expected showcase feature key: ${k}`);
  });

  // Validate all pre-existing merged keys
  preExistingMergedKeys.forEach(k => {
    assert(GYM_FEATURES[k], `Missing pre-existing merged feature key: ${k}`);
    assert.strictEqual(GYM_FEATURES[k].status, 'available', `Pre-existing feature ${k} must be marked as status: "available"`);
  });

  // Validate all features schema integrity
  Object.keys(GYM_FEATURES).forEach(k => {
    const f = GYM_FEATURES[k];
    assert(f.id === k, `Feature ${k} has mismatched id ${f.id}`);
    assert(typeof f.name === 'string' && f.name.length > 0, `Feature ${k} missing valid name`);
    assert(typeof f.tagline === 'string' && f.tagline.length > 0, `Feature ${k} missing tagline`);
    assert(['workout', 'nutrition', 'membership', 'hardware', 'community'].includes(f.category), `Feature ${k} invalid category: ${f.category}`);
    assert(typeof f.description === 'string' && f.description.length > 0, `Feature ${k} missing description`);
    assert(['available', 'beta', 'coming-soon'].includes(f.status), `Feature ${k} invalid status: ${f.status}`);
    assert(['available', 'beta', 'coming-soon'].includes(f.badgeVariant), `Feature ${k} invalid badgeVariant: ${f.badgeVariant}`);
  });

  // Verify status distributions
  const available = Object.values(GYM_FEATURES).filter(f => f.status === 'available');
  const beta = Object.values(GYM_FEATURES).filter(f => f.status === 'beta');
  const comingSoon = Object.values(GYM_FEATURES).filter(f => f.status === 'coming-soon');

  assert(available.length >= 16, `Expected at least 16 available features, got ${available.length}`);
  assert(beta.length >= 2, `Expected at least 2 beta features, got ${beta.length}`);
  assert(comingSoon.length >= 4, `Expected at least 4 coming-soon features, got ${comingSoon.length}`);

  // Coming-soon features MUST have technicalReason and estimatedArrival
  comingSoon.forEach(f => {
    assert(typeof f.technicalReason === 'string' && f.technicalReason.length > 0, `Coming-soon feature ${f.id} must have technicalReason`);
    assert(typeof f.estimatedArrival === 'string' && f.estimatedArrival.length > 0, `Coming-soon feature ${f.id} must have estimatedArrival`);
  });

  // Available features MUST have actionRoute
  available.forEach(f => {
    assert(typeof f.actionRoute === 'string' && f.actionRoute.startsWith('/app/'), `Available feature ${f.id} must have actionRoute starting with /app/`);
  });

  console.log('  [PASS] Single source of truth catalog matches all specifications.');
}

// 2. canUseGymFeature Runtime Capability Checker
console.log('Test 2: canUseGymFeature Capability Checker');
{
  // Available features should return ok: true
  const availRes = canUseGymFeature('workoutTracking');
  assert.strictEqual(availRes.ok, true, 'Available feature should return ok: true');
  assert.strictEqual(availRes.reason, undefined, 'Available feature should have undefined reason');

  // Beta features should return ok: true
  const betaRes = canUseGymFeature('formCorrectionAi');
  assert.strictEqual(betaRes.ok, true, 'Beta feature should return ok: true');

  // Coming soon features should return ok: false with technical reason
  const csRes = canUseGymFeature('wearableSync');
  assert.strictEqual(csRes.ok, false, 'Coming soon feature should return ok: false');
  assert(csRes.reason && csRes.reason.includes('Apple HealthKit'), `Expected technical reason, got: ${csRes.reason}`);

  // Edge cases: null, undefined, empty string, non-string
  const nullRes = canUseGymFeature(null);
  assert.strictEqual(nullRes.ok, false);
  assert.strictEqual(nullRes.reason, 'Unknown feature.');

  const undefRes = canUseGymFeature(undefined);
  assert.strictEqual(undefRes.ok, false);
  assert.strictEqual(undefRes.reason, 'Unknown feature.');

  const emptyRes = canUseGymFeature('');
  assert.strictEqual(emptyRes.ok, false);
  assert.strictEqual(emptyRes.reason, 'Unknown feature.');

  const numRes = canUseGymFeature(12345);
  assert.strictEqual(numRes.ok, false);
  assert.strictEqual(numRes.reason, 'Unknown feature.');

  console.log('  [PASS] canUseGymFeature handles available, beta, coming-soon, and unknown cases correctly.');
}

// 3. Waitlist API & Capability Endpoint Validation
console.log('Test 3: /api/features & /api/features/waitlist Endpoint Integrity');
(async () => {
  const http = require('http');

  function makeRequest(urlPath, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: urlPath,
        method: method,
        headers: { 'Content-Type': 'application/json' }
      };
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  // 3a. GET /api/features
  const featRes = await makeRequest('/api/features');
  assert.strictEqual(featRes.status, 200);
  assert.strictEqual(featRes.data.ok, true);
  assert(Object.keys(featRes.data.features).length >= 22, `Expected at least 22 features, got ${Object.keys(featRes.data.features).length}`);
  console.log(`  [PASS] GET /api/features returns complete merged ${Object.keys(featRes.data.features).length}-feature catalog.`);

  // 3b. Waitlist rejection for available features
  const availWaitlist = await makeRequest('/api/features/waitlist', 'POST', {
    email: 'test@example.com',
    featureId: 'workoutTracking'
  });
  assert.strictEqual(availWaitlist.status, 400);
  assert.strictEqual(availWaitlist.data.ok, false);
  assert(availWaitlist.data.error.includes('already live in production'));
  console.log('  [PASS] Waitlist rejects available production features honestly.');

  // 3c. Waitlist rejection for invalid/empty emails
  const invalidEmail = await makeRequest('/api/features/waitlist', 'POST', {
    email: 'not-an-email',
    featureId: 'wearableSync'
  });
  assert.strictEqual(invalidEmail.status, 400);
  assert.strictEqual(invalidEmail.data.ok, false);
  console.log('  [PASS] Waitlist rejects malformed emails.');

  // 3d. Whitespace email trimming
  const uniqueTestEmail = `test_trim_${Date.now()}@fitfuel.test`;
  const trimmedRes = await makeRequest('/api/features/waitlist', 'POST', {
    email: `  ${uniqueTestEmail}  `,
    featureId: 'wearableSync'
  });
  assert.strictEqual(trimmedRes.status, 200);
  assert.strictEqual(trimmedRes.data.ok, true);
  assert.strictEqual(trimmedRes.data.alreadyRegistered, false);
  console.log('  [PASS] Waitlist trims whitespace around email and registers.');

  // 3e. Duplicate submission idempotency
  const dupRes = await makeRequest('/api/features/waitlist', 'POST', {
    email: uniqueTestEmail,
    featureId: 'wearableSync'
  });
  assert.strictEqual(dupRes.status, 200);
  assert.strictEqual(dupRes.data.ok, true);
  assert.strictEqual(dupRes.data.alreadyRegistered, true);
  assert.strictEqual(dupRes.data.queuePosition, trimmedRes.data.queuePosition);
  console.log('  [PASS] Duplicate submission returns stable queue position without inflating count.');

  console.log('\n=== ALL UNIT & INTEGRITY CHECKS PASSED ===\n');
})();
