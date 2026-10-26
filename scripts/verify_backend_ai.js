async function testBackend() {
  console.log('=== STARTING FITFUEL BACKEND AI INTEGRATION TEST ===\n');

  let passed = 0;
  let failed = 0;

  // 1. Test POST /api/ai/chat with Nemotron model shorthand alias
  console.log('[TEST 1] Testing POST /api/ai/chat with Nemotron shorthand alias (nvidia/nemotron-3-ultra:free)...');
  try {
    const t0 = Date.now();
    const res = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'What are the top 3 compound exercises for building quadriceps and glutes?',
        selectedModel: 'nvidia/nemotron-3-ultra:free'
      })
    });
    const data = await res.json();
    const latency = Date.now() - t0;
    if (res.ok && data.ok && data.content && data.content.length > 20) {
      console.log(`-> SUCCESS! Provider: ${data.provider}, Model: ${data.model}, Latency: ${latency}ms`);
      console.log(`-> Sample response: ${data.content.slice(0, 100).replace(/\n/g, ' ')}...\n`);
      passed++;
    } else {
      console.error('-> FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('-> EXCEPTION in /api/ai/chat:', e.message);
    failed++;
  }

  // 2. Test POST /api/ai-coach with Nemotron model shorthand alias
  console.log('[TEST 2] Testing POST /api/ai-coach with Nemotron shorthand alias (nvidia/nemotron-3-nano-omni:free)...');
  try {
    const t0 = Date.now();
    const res = await fetch('http://localhost:3000/api/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'How many grams of protein should an 80kg lifter consume per meal?',
        selectedModel: 'nvidia/nemotron-3-nano-omni:free'
      })
    });
    const data = await res.json();
    const latency = Date.now() - t0;
    if (res.ok && data.ok && data.content && data.content.length > 20) {
      console.log(`-> SUCCESS! Provider: ${data.provider}, Model: ${data.model}, Latency: ${latency}ms`);
      console.log(`-> Sample response: ${data.content.slice(0, 100).replace(/\n/g, ' ')}...\n`);
      passed++;
    } else {
      console.error('-> FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('-> EXCEPTION in /api/ai-coach:', e.message);
    failed++;
  }

  // 3. Test POST /api/ai-plan
  console.log('[TEST 3] Testing POST /api/ai-plan (Workout & Diet Plan Generator)...');
  try {
    const t0 = Date.now();
    const res = await fetch('http://localhost:3000/api/ai-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileData: {
          wKg: 78,
          hCm: 182,
          goal: 'Build muscle and power',
          days: 4,
          creatine: 'yes',
          units: 'Metric',
          dietPref: 'High Protein Balanced',
          focus: 'Chest, Delts & Back',
          note: 'Focus on progressive overload'
        }
      })
    });
    const data = await res.json();
    const latency = Date.now() - t0;
    if (res.ok && data.ok && data.plan && data.plan.cal && data.plan.meals && data.plan.workout) {
      console.log(`-> SUCCESS! Provider: ${data.provider}, Model: ${data.model}, Latency: ${latency}ms`);
      console.log(`-> Plan Calories: ${data.plan.cal} kcal, Protein: ${data.plan.p}g`);
      console.log(`-> Meals Generated: ${data.plan.meals.length}`);
      console.log(`-> Workout Routine: "${data.plan.workout.name}", Moves: ${data.plan.workout.moves?.length}\n`);
      passed++;
    } else {
      console.error('-> FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('-> EXCEPTION in /api/ai-plan:', e.message);
    failed++;
  }

  // 4. Test POST /api/body-scan/analyze
  console.log('[TEST 4] Testing POST /api/body-scan/analyze (4D Body Transformation & Biomechanics)...');
  try {
    const t0 = Date.now();
    const res = await fetch('http://localhost:3000/api/body-scan/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: 'lean_athletic',
        preferences: {
          age: 27,
          weight: 75,
          height: 180,
          daysPerWeek: 4,
          durationMin: 50,
          equipment: 'gym',
          dietary: 'balanced'
        },
        images: []
      })
    });
    const data = await res.json();
    const latency = Date.now() - t0;
    const a = data.analysis;
    if (res.ok && data.ok && a && a.assessmentSummary && a.posture_observations && a.estimated_physical_characteristics && a.weeklyWorkoutSchedule) {
      console.log(`-> SUCCESS! Provider: ${data.provider}, Model: ${data.model}, Latency: ${latency}ms`);
      console.log(`-> Summary: ${a.assessmentSummary.slice(0, 100)}...`);
      console.log(`-> Estimated BF: ${a.estimated_physical_characteristics.estimated_body_fat_range}`);
      console.log(`-> Workout Split Days: ${a.weeklyWorkoutSchedule.length}`);
      console.log(`-> Nutrition Calories: ${a.macronutrient_distribution?.daily_calories || a.nutritionGuidance?.daily_calories}\n`);
      passed++;
    } else {
      console.error('-> FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('-> EXCEPTION in /api/body-scan/analyze:', e.message);
    failed++;
  }

  console.log(`=== BACKEND TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

testBackend();
