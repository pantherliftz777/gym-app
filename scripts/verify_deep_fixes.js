const puppeteer = require('puppeteer');

(async () => {
  console.log('=== RUNNING DEEP VERIFICATION FOR ALL TASK REQUIREMENTS ===\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));

  let passed = 0;
  let failed = 0;

  function assert(desc, condition) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Posture AI Camera Auto-Start Removal
  // -------------------------------------------------------------
  console.log('--- TEST 1: Posture AI Camera Auto-Start & Permission ---');
  await page.evaluate(() => switchView('posture'));
  await new Promise(r => setTimeout(r, 400));

  const cameraState = await page.evaluate(() => {
    const video = document.querySelector('#postureVideo');
    const startBtn = document.querySelector('#postureStartBtn');
    const placeholder = document.querySelector('#posturePlaceholder');
    return {
      streamIsNull: window.postureStream === null || window.postureStream === undefined,
      videoSrcObject: video ? video.srcObject : 'no video',
      startBtnText: startBtn ? startBtn.textContent.trim() : '',
      startBtnVisible: startBtn ? getComputedStyle(startBtn).display !== 'none' : false,
      placeholderVisible: placeholder ? getComputedStyle(placeholder).display !== 'none' : false
    };
  });

  assert('Webcam stream is null when entering Posture view (NO auto-start)', cameraState.streamIsNull);
  assert('Video element srcObject is null', cameraState.videoSrcObject === null);
  assert('Start button is visible with text "Start Camera & Form Analysis"', cameraState.startBtnText.includes('Start Camera & Form Analysis'));
  assert('Camera placeholder is visible instructing user to start camera', cameraState.placeholderVisible);

  // -------------------------------------------------------------
  // TEST 2: Expanded Workout Options (12 Exercises & Criteria)
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Posture AI Workout Selection (12 Camera Exercises) ---');
  const exerciseOptions = await page.evaluate(() => {
    const select = document.querySelector('#postureExerciseSelect');
    if (!select) return [];
    return Array.from(select.options).map(o => ({ value: o.value, text: o.text }));
  });
  console.log(`  Found ${exerciseOptions.length} exercises in dropdown.`);
  assert('Has at least 8+ options (12 supported)', exerciseOptions.length >= 10);

  const requiredExercises = [
    'squat', 'lunge', 'pushup', 'jumping_jacks', 'bicep_curls',
    'overhead_press', 'lateral_raises', 'plank', 'glute_bridge',
    'high_knees', 'mountain_climbers', 'standing_side_bends'
  ];
  for (const exKey of requiredExercises) {
    const found = exerciseOptions.some(o => o.value === exKey);
    assert(`Exercise option "${exKey}" is present in select`, found);
  }

  // Verify criteria UI updates when switching exercise
  const criteriaCheck = await page.evaluate(() => {
    const select = document.querySelector('#postureExerciseSelect');
    select.value = 'glute_bridge';
    select.dispatchEvent(new Event('change'));
    const criteriaText = document.querySelector('#postureCriteriaList').textContent;
    return criteriaText;
  });
  assert('Criteria card updates for glute_bridge', criteriaCheck.includes('Pelvic Extension Lockout'));

  // -------------------------------------------------------------
  // TEST 3: Speech Synthesis Termination on View Navigation
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Speech Synthesis Background Cancellation ---');
  // Start demo mode in Posture AI so speech queue is active
  await page.evaluate(() => {
    startPostureCamera(true);
    speakPostureCue("Stand tall. Step back until your full body is in frame for form analysis.");
  });
  await new Promise(r => setTimeout(r, 200));

  const speechStatusBefore = await page.evaluate(() => {
    return {
      activeView: window.activeView,
      isDemoMode: window.isPostureDemoMode
    };
  });
  console.log('  Posture active before navigation:', speechStatusBefore);

  // Navigate all the way to Profile!
  await page.evaluate(() => switchView('profile'));
  await new Promise(r => setTimeout(r, 300));

  const speechStatusAfter = await page.evaluate(() => {
    return {
      activeView: window.activeView,
      isDemoMode: window.isPostureDemoMode,
      speaking: window.speechSynthesis ? window.speechSynthesis.speaking : false,
      pending: window.speechSynthesis ? window.speechSynthesis.pending : false,
      cameraStream: window.postureStream
    };
  });
  assert('Active view switched to profile', speechStatusAfter.activeView === 'profile');
  assert('Camera demo mode halted', speechStatusAfter.isDemoMode === false);
  assert('Camera stream is null', speechStatusAfter.cameraStream === null);
  assert('Speech synthesis queue is cleared (speaking === false)', speechStatusAfter.speaking === false);
  assert('Speech synthesis pending is empty (pending === false)', speechStatusAfter.pending === false);

  // Test that speakPostureCue is rejected when not in posture view
  const rejectedSpeech = await page.evaluate(() => {
    speakPostureCue("Should not speak while on profile page");
    return window.speechSynthesis ? window.speechSynthesis.speaking : false;
  });
  assert('speakPostureCue strictly rejects utterances when activeView !== "posture"', rejectedSpeech === false);

  // -------------------------------------------------------------
  // TEST 4: Multi-Zone IR Rep Counting & Depth Hold Preservation
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Multi-Zone IR Method & Kinematics Engine ---');
  await page.evaluate(() => {
    switchView('posture');
    const select = document.querySelector('#postureExerciseSelect');
    select.value = 'squat';
    select.dispatchEvent(new Event('change'));
    startPostureCamera(true); // Demo mode for deterministic verification
  });
  await new Promise(r => setTimeout(r, 300));

  // Verify IR Multi-Zone and Inflection state machine transitions
  const repStateTransitions = await page.evaluate(() => {
    const conf = POSTURE_EXERCISES.squat;
    const history = [];

    // Step 1: Start lockout (170°)
    evaluateExerciseRepIR(conf, 170);
    history.push({ angle: 170, state: window.postureState, reps: window.postureReps });

    // Step 2: In descent (130°)
    evaluateExerciseRepIR(conf, 130);
    history.push({ angle: 130, state: window.postureState, reps: window.postureReps });

    // Step 3: Bottom parallel depth achieved (92°)
    evaluateExerciseRepIR(conf, 92);
    history.push({ angle: 92, state: window.postureState, reps: window.postureReps });

    // Step 4: Stationary bottom pause (holding depth 92° - velocity 0)
    evaluateExerciseRepIR(conf, 92);
    history.push({ angle: 92, state: window.postureState, reps: window.postureReps });

    // Step 5: Ascent / returning to lockout (140°)
    evaluateExerciseRepIR(conf, 140);
    history.push({ angle: 140, state: window.postureState, reps: window.postureReps });

    // Step 6: Full standing lockout (168°) -> completes rep!
    window.postureLastRepTime = 0; // bypass cadence debounce for test
    evaluateExerciseRepIR(conf, 168);
    history.push({ angle: 168, state: window.postureState, reps: window.postureReps });

    return history;
  });

  console.log('  State transitions:', repStateTransitions.map(s => `${s.angle}° -> ${s.state} (reps: ${s.reps})`).join(' | '));
  assert('State transitioned to IN_PROGRESS at 130°', repStateTransitions[1].state === 'IN_PROGRESS');
  assert('State transitioned to TARGET_ACHIEVED at parallel 92°', repStateTransitions[2].state === 'TARGET_ACHIEVED');
  assert('Holding depth pause preserved TARGET_ACHIEVED state (anti-zero hold)', repStateTransitions[3].state === 'TARGET_ACHIEVED');
  assert('Ascending transitioned to RETURNING', repStateTransitions[4].state === 'RETURNING');
  assert('Lockout completion incremented reps to 1', repStateTransitions[5].reps === 1);

  await page.evaluate(() => stopPostureCamera());

  // -------------------------------------------------------------
  // TEST 5: Challenge Generator (Home Workout & Cardio Customization)
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Challenge Generator (Home Workout + Cardio) ---');

  const challengeTest = await page.evaluate(async () => {
    // Generate a 15-day challenge for Home + Cardio, 45 min, Moderate intensity
    const motive = 'Burn Fat & Lean Out';
    const durationDays = 15;
    const targetMinutes = 45;
    const intensity = 'Moderate';
    const workoutTypes = ['Home', 'Cardio'];

    const planDays = buildDayByDayRoutines(motive, durationDays, 70, 175, targetMinutes, intensity, workoutTypes);

    const GYM_TERMS = window.GYM_FORBIDDEN_TERMS || [
      'barbell', 'cable', 'smith machine', 'leverage machine', 'leg press',
      'hack squat', 'lat pulldown', 'seated row machine', 't-bar', 'pec deck',
      'chest press machine', 'shoulder press machine', 'leg curl machine',
      'leg extension machine', 'calf machine', 'preacher bench', 'assisted pull-up machine',
      'treadmill', 'stair climber', 'elliptical', 'rower', 'battle ropes', 'cable row', 'rack'
    ];

    let gymViolations = [];
    let allExercises = [];
    let uniqueDayTitles = new Set();

    planDays.forEach(day => {
      uniqueDayTitles.add(day.title);
      day.exercises.forEach(ex => {
        allExercises.push(ex);
        const nameLower = (ex.name + ' ' + (ex.subMuscle || '') + ' ' + (ex.category || '')).toLowerCase();
        if (GYM_TERMS.some(term => nameLower.includes(term))) {
          gymViolations.push({ day: day.dayNumber, exercise: ex.name, term: term });
        }
        if (!isHomeExercise(ex)) {
          gymViolations.push({ day: day.dayNumber, exercise: ex.name, reason: 'failed isHomeExercise' });
        }
      });
    });

    return {
      daysCount: planDays.length,
      totalExercisesCount: allExercises.length,
      sampleDay1Title: planDays[0].title,
      sampleDay1Exercises: planDays[0].exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps })),
      sampleDay2Exercises: planDays[1].exercises.map(e => e.name),
      gymViolations,
      uniqueDayTitles: Array.from(uniqueDayTitles)
    };
  });

  console.log('  Challenge days generated:', challengeTest.daysCount);
  console.log('  Total exercises generated:', challengeTest.totalExercisesCount);
  console.log('  Day 1 title:', challengeTest.sampleDay1Title);
  console.log('  Day 1 exercises:', challengeTest.sampleDay1Exercises);
  console.log('  Day 2 exercises:', challengeTest.sampleDay2Exercises);
  console.log('  Gym violations:', challengeTest.gymViolations);

  assert('Generated exactly 15 days', challengeTest.daysCount === 15);
  assert('Generated exercises tailored to 45 min session (5 exercises/day)', challengeTest.sampleDay1Exercises.length === 5);
  assert('Zero gym equipment violations in Home Cardio challenge (0 barbells, cables, machines)', challengeTest.gymViolations.length === 0);
  assert('Exercise repetition across days is varied (Day 1 vs Day 2 differ)', challengeTest.sampleDay1Exercises[0].name !== challengeTest.sampleDay2Exercises[0].name);

  // Test Home vs Gym mutual exclusivity in setup UI checkboxes
  const exclusivityTest = await page.evaluate(() => {
    // Check Home
    const homeCb = Array.from(document.querySelectorAll('#chTypesOptionsList input')).find(i => i.value === 'Home');
    const gymCb = Array.from(document.querySelectorAll('#chTypesOptionsList input')).find(i => i.value === 'Gym');
    if (!homeCb || !gymCb) return { error: 'checkboxes missing' };

    homeCb.checked = true;
    homeCb.dispatchEvent(new Event('change'));

    const gymCheckedAfterHome = gymCb.checked;

    // Check Gym
    gymCb.checked = true;
    gymCb.dispatchEvent(new Event('change'));
    const homeCheckedAfterGym = homeCb.checked;

    return {
      gymCheckedAfterHome,
      homeCheckedAfterGym
    };
  });
  console.log('  Exclusivity UI check:', exclusivityTest);
  assert('Checking "Home" unchecks "Gym"', exclusivityTest.gymCheckedAfterHome === false);
  assert('Checking "Gym" unchecks "Home"', exclusivityTest.homeCheckedAfterGym === false);

  console.log(`\n=== VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED ===`);
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
