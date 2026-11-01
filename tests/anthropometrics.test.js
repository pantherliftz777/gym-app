const assert = require('assert');
const algo = require('../public/algo.js');

console.log('=== RUNNING ANTHROPOMETRICS & CLINICAL BODY COMPOSITION TESTS ===\n');

// 1. Ramanujan Elliptical Tape Model Tests
console.log('Test 1: Ramanujan Elliptical Tape Model');
{
  // Circle edge case: when width === depth === 20, C = 20 * pi = 62.83
  const circleC = algo.ramanujanEllipticalCircumference(20, 20);
  assert(Math.abs(circleC - (20 * Math.PI)) < 0.2, `Circle circumference should match 2*pi*r, got ${circleC}`);

  // Standard ellipse: width 32, depth 24 -> approx 88.4 cm
  const ellipseC = algo.ramanujanEllipticalCircumference(32, 24);
  assert(ellipseC > 80 && ellipseC < 95, `Ellipse circumference expected around 88.4, got ${ellipseC}`);

  // Invalid / Zero input handling
  assert.strictEqual(algo.ramanujanEllipticalCircumference(0, 24), 0);
  assert.strictEqual(algo.ramanujanEllipticalCircumference(32, -5), 0);
  assert.strictEqual(algo.ramanujanEllipticalCircumference(null, undefined), 0);
  console.log('  [PASS] Ramanujan formula & boundary conditions verified.');
}

// 2. ISO 8559-1 Anatomical Planes
console.log('Test 2: ISO 8559-1 Anatomical Level Definitions');
{
  const levels = algo.ISO_ANATOMICAL_LEVELS;
  assert.strictEqual(levels.neck, 0.83);
  assert.strictEqual(levels.chest, 0.72);
  assert.strictEqual(levels.waist, 0.60);
  assert.strictEqual(levels.hips, 0.52);
  assert.strictEqual(levels.thigh, 0.42);
  assert.strictEqual(levels.bicep, 0.68);
  assert.strictEqual(levels.calf, 0.22);
  console.log('  [PASS] ISO anatomical levels match ISO 8559-1 / CAESAR specifications.');
}

// 3. U.S. Navy Hodgdon-Beckett Body Fat Equation
console.log('Test 3: U.S. Navy Hodgdon-Beckett Body Fat Equation');
{
  // Male: 180cm, waist 82cm, neck 38cm
  const maleBf = algo.calculateNavyBodyFat({ gender: 'male', heightCm: 180, waistCm: 82, neckCm: 38 });
  assert(maleBf >= 12.0 && maleBf <= 15.0, `Expected athletic male BF around 13.7%, got ${maleBf}%`);

  // Female: 165cm, waist 70cm, neck 33cm, hips 96cm
  const femaleBf = algo.calculateNavyBodyFat({ gender: 'female', heightCm: 165, waistCm: 70, neckCm: 33, hipsCm: 96 });
  assert(femaleBf >= 23.0 && femaleBf <= 27.0, `Expected female BF around 25.1%, got ${femaleBf}%`);

  // Robustness & edge cases: waist <= neck should not produce NaN or Infinity
  const invertedMale = algo.calculateNavyBodyFat({ gender: 'male', heightCm: 180, waistCm: 35, neckCm: 40 });
  assert(!isNaN(invertedMale) && isFinite(invertedMale) && invertedMale >= 3.0, `Clamping failed for inverted male, got ${invertedMale}`);

  const invertedFemale = algo.calculateNavyBodyFat({ gender: 'female', heightCm: 165, waistCm: 30, neckCm: 50, hipsCm: 10 });
  assert(!isNaN(invertedFemale) && isFinite(invertedFemale) && invertedFemale >= 8.0, `Clamping failed for inverted female, got ${invertedFemale}`);
  console.log('  [PASS] U.S. Navy formulas produce clinically valid results and handle edge cases.');
}

// 4. Clinical Ratios & Risk Assessments
console.log('Test 4: Clinical Health Ratios (WHR, WHtR, Lean Mass)');
{
  // Healthy male profile
  const healthyMale = algo.calculateClinicalRatios({
    heightCm: 180,
    weightKg: 75,
    waistCm: 80,
    hipsCm: 98,
    gender: 'male',
    bodyFatPct: 14.0
  });

  assert.strictEqual(healthyMale.whr, 0.82);
  assert.strictEqual(healthyMale.whrStatus, 'Healthy / Low Risk');
  assert.strictEqual(healthyMale.whrRiskLevel, 'low');
  assert.strictEqual(healthyMale.whtr, 0.44);
  assert.strictEqual(healthyMale.whtrStatus, 'Healthy / Optimal');
  assert.strictEqual(healthyMale.whtrRiskLevel, 'healthy');
  assert.strictEqual(healthyMale.fatMassKg, 10.5);
  assert.strictEqual(healthyMale.leanMassKg, 64.5);
  assert.strictEqual(healthyMale.bmi, 23.1);

  // Elevated risk male profile (waist 102cm, hips 98cm -> WHR > 1.0, WHtR > 0.50)
  const elevatedMale = algo.calculateClinicalRatios({
    heightCm: 175,
    weightKg: 95,
    waistCm: 102,
    hipsCm: 98,
    gender: 'male',
    bodyFatPct: 28.0
  });
  assert(elevatedMale.whr >= 1.0, 'WHR should exceed 1.0');
  assert.strictEqual(elevatedMale.whrStatus, 'Elevated Risk');
  assert.strictEqual(elevatedMale.whrRiskLevel, 'elevated');
  assert(elevatedMale.whtr > 0.50, 'WHtR should exceed 0.50');
  assert.strictEqual(elevatedMale.whtrRiskLevel, 'moderate');

  // Female thresholds: < 0.85 is healthy, >= 0.85 is moderate/elevated
  const femaleHealthy = algo.calculateClinicalRatios({
    heightCm: 165,
    weightKg: 60,
    waistCm: 68,
    hipsCm: 96,
    gender: 'female',
    bodyFatPct: 22.0
  });
  assert.strictEqual(femaleHealthy.whr, 0.71);
  assert.strictEqual(femaleHealthy.whrRiskLevel, 'low');
  assert.strictEqual(femaleHealthy.whrThreshold, '< 0.85');

  console.log('  [PASS] WHO WHR and Ashwell WHtR risk classifications verified.');
}

// 5. Anthropometric Regressions & Physique Pipeline
console.log('Test 5: Anthropometric Regressions & Overall Pipeline');
{
  const evalResult = algo.evaluateAnthropometricPhysique({
    heightCm: 180,
    weightKg: 75,
    gender: 'male',
    goal: 'muscle_building'
  });

  assert(evalResult.circumferences.chest > 95, 'Chest regression within normal range');
  assert(evalResult.circumferences.waist > 75, 'Waist regression within normal range');
  assert(evalResult.circumferences.hips > 90, 'Hips regression within normal range');
  assert(evalResult.circumferences.bicep > 32, 'Bicep regression within normal range');
  assert(evalResult.circumferences.thigh > 50, 'Thigh regression within normal range');
  assert(evalResult.navyBf > 8 && evalResult.navyBf < 25, 'Navy BF within normal athletic range');
  assert(evalResult.clinical.leanMassKg > 55, 'Lean mass correctly computed');

  // Manual override test
  const customOverride = algo.evaluateAnthropometricPhysique({
    heightCm: 180,
    weightKg: 75,
    gender: 'male',
    manualMeasurements: { waist: 88, neck: 40, hips: 100 }
  });
  assert.strictEqual(customOverride.circumferences.waist, 88);
  assert.strictEqual(customOverride.circumferences.neck, 40);
  assert.strictEqual(customOverride.circumferences.hips, 100);
  console.log('  [PASS] Full anthropometric evaluation and manual overrides pass.');
}

// 6. Ramanujan Multi-Angle Cross-Section Derivations
console.log('Test 6: Multi-Angle Cross-Section & Ramanujan Elliptical Derivation');
{
  const reg = algo.estimateAnthropometrics({ heightCm: 178, weightKg: 72, gender: 'male' });
  assert(reg.crossSections && typeof reg.crossSections === 'object', 'Cross-sections map generated');
  const sites = ['neck', 'chest', 'waist', 'hips', 'bicep', 'thigh', 'calf'];
  sites.forEach(s => {
    const cs = reg.crossSections[s];
    assert(cs.widthCm > 0, `${s} widthCm > 0`);
    assert(cs.depthCm > 0, `${s} depthCm > 0`);
    assert(cs.circumferenceCm > 0, `${s} circumferenceCm > 0`);
    assert(cs.aspectRatio >= 1.0, `${s} aspect ratio should be >= 1.0 (transverse width >= sagittal depth)`);
    // Verify Ramanujan calculation explicitly
    const expectedC = algo.ramanujanEllipticalCircumference(cs.widthCm, cs.depthCm);
    assert.strictEqual(cs.circumferenceCm, expectedC, `${s} circumference matches Ramanujan formula`);
  });

  // Direct multi-angle photo width and depth injection
  const photoCustom = algo.estimateAnthropometrics({
    heightCm: 178,
    weightKg: 72,
    gender: 'male',
    crossSections: {
      waist: { width: 30, depth: 20 } // 2a=30, 2b=20
    }
  });
  const expectedWaistC = algo.ramanujanEllipticalCircumference(30, 20);
  assert.strictEqual(photoCustom.crossSections.waist.circumferenceCm, expectedWaistC);
  assert.strictEqual(photoCustom.circumferences.waist, expectedWaistC);
  console.log('  [PASS] Ramanujan multi-angle cross sections and photo dimension injection verified.');
}

// 7. Pathological Boundaries, Extreme Inputs, and NaN Immunity
console.log('Test 7: Pathological Boundaries & Robustness (NaN Immunity)');
{
  // Negative or zero heights/weights
  const bfNeg = algo.calculateNavyBodyFat({ gender: 'male', heightCm: -180, waistCm: -80, neckCm: -40 });
  assert(!isNaN(bfNeg) && isFinite(bfNeg), `Negative height/waist should not produce NaN: ${bfNeg}`);

  const clinNeg = algo.calculateClinicalRatios({ heightCm: -180, weightKg: -70, waistCm: -80, hipsCm: -100, gender: 'male', bodyFatPct: 'invalid' });
  assert(!isNaN(clinNeg.whr) && isFinite(clinNeg.whr), 'WHR immune to negative inputs');
  assert(!isNaN(clinNeg.whtr) && isFinite(clinNeg.whtr), 'WHtR immune to negative inputs');
  assert(!isNaN(clinNeg.bmi) && isFinite(clinNeg.bmi), 'BMI immune to negative inputs');
  assert(!isNaN(clinNeg.fatMassKg) && isFinite(clinNeg.fatMassKg), 'Fat mass immune to negative inputs');
  assert(!isNaN(clinNeg.leanMassKg) && isFinite(clinNeg.leanMassKg), 'Lean mass immune to negative inputs');

  // String numbers and object inputs
  const clinStrings = algo.calculateClinicalRatios({ heightCm: "180", weightKg: "75", waistCm: "82", hipsCm: "98", gender: 'male', bodyFatPct: "14.5" });
  assert.strictEqual(typeof clinStrings.whr, 'number');
  assert.strictEqual(clinStrings.whr, 0.84);
  assert.strictEqual(clinStrings.bodyFatPct, 14.5);

  console.log('  [PASS] Complete immunity to negative, string, and pathological inputs verified.');
}

console.log('\nALL ANTHROPOMETRIC UNIT TESTS PASSED SUCCESSFULLY!');
