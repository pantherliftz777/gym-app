const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../public/fitfuel.js');
let code = fs.readFileSync(jsPath, 'utf8');

const startToken = 'function initChallengeSetupListeners() {';
const endToken = 'initChallengeSetupListeners();';

const startIdx = code.indexOf(startToken);
const endIdx = code.indexOf(endToken, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find boundaries for initChallengeSetupListeners in fitfuel.js');
  process.exit(1);
}

const newFunction = `function initChallengeSetupListeners() {
  // Global state mirror
  window.challengeSetup = {
    get motive() { return setupMotive; },
    set motive(v) { setupMotive = v; },
    get duration() { return setupDuration; },
    set duration(v) { setupDuration = v; },
    get minutes() { return setupMinutes; },
    set minutes(v) { setupMinutes = v; },
    get intensity() { return setupIntensity; },
    set intensity(v) { setupIntensity = v; },
    get types() { return setupTypes; },
    set types(v) { setupTypes = v; }
  };

  // Step 1: Motive Selection Cards
  $$('#motiveOptionsList .setup-choice-card').forEach(card => {
    card.onclick = (e) => {
      e.preventDefault();
      $$('#motiveOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupMotive = card.dataset.motive || 'Burn Fat & Lean Out';
    };
  });

  // Step 1 -> Step 2 (Preferences) with Validation
  if ($('#proceedToPrefsBtn')) {
    $('#proceedToPrefsBtn').onclick = (e) => {
      e.preventDefault();
      if (!setupMotive) {
        setupMotive = 'Burn Fat & Lean Out';
      }
      closeModal('#challengeMotiveModal');
      setTimeout(() => openModal('#challengePrefsModal'), 80);
    };
  }

  // Step 2 -> Back to Step 1
  if ($('#backToMotiveBtn')) {
    $('#backToMotiveBtn').onclick = (e) => {
      e.preventDefault();
      closeModal('#challengePrefsModal');
      setTimeout(() => openModal('#challengeMotiveModal'), 80);
    };
  }

  // Step 2: Types Checkboxes (Home and Gym mutually exclusive environments)
  $$('#chTypesOptionsList input[type="checkbox"]').forEach(cb => {
    cb.onchange = () => {
      if (cb.value === 'Home' && cb.checked) {
        const gymCb = $('#chTypesOptionsList input[value="Gym"]');
        if (gymCb) {
          gymCb.checked = false;
          const p = gymCb.closest('.setup-choice-card');
          if (p) p.classList.remove('selected');
        }
      } else if (cb.value === 'Gym' && cb.checked) {
        const homeCb = $('#chTypesOptionsList input[value="Home"]');
        if (homeCb) {
          homeCb.checked = false;
          const p = homeCb.closest('.setup-choice-card');
          if (p) p.classList.remove('selected');
        }
      }
      const parent = cb.closest('.setup-choice-card');
      if (parent) {
        if (cb.checked) parent.classList.add('selected');
        else parent.classList.remove('selected');
      }
      const checkedBoxes = Array.from($$('#chTypesOptionsList input[type="checkbox"]:checked'));
      setupTypes = checkedBoxes.map(b => b.value);
      if (!setupTypes.length) {
        cb.checked = true;
        if (parent) parent.classList.add('selected');
        setupTypes = [cb.value];
      }
    };
  });

  // Step 2: Minutes Selection Cards/Buttons (20, 35, 45, 60 min)
  $$('#chTimeOptionsList .setup-choice-card').forEach(card => {
    card.onclick = (e) => {
      e.preventDefault();
      $$('#chTimeOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupMinutes = Number(card.dataset.minutes) || 45;
    };
  });

  // Step 2: Intensity Selection Cards/Buttons (Mild, Moderate, Hard)
  $$('#chIntensityOptionsList .setup-choice-card').forEach(card => {
    card.onclick = (e) => {
      e.preventDefault();
      $$('#chIntensityOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupIntensity = card.dataset.intensity || 'Moderate';
    };
  });

  // Step 2 -> Step 3 (Duration Modal) with Validation & Sync
  if ($('#proceedToDurationBtn')) {
    $('#proceedToDurationBtn').onclick = (e) => {
      e.preventDefault();
      const checkedBoxes = Array.from($$('#chTypesOptionsList input[type="checkbox"]:checked'));
      if (!checkedBoxes.length) {
        if (typeof toast === 'function') toast('Please select at least one workout type (e.g. Gym or Home)');
        return;
      }
      setupTypes = checkedBoxes.map(b => b.value);
      if (!setupMinutes) setupMinutes = 45;
      if (!setupIntensity) setupIntensity = 'Moderate';

      closeModal('#challengePrefsModal');
      const prev = document.getElementById('challengeMetricsPreview');
      if (prev) {
        const typesStr = setupTypes.join(', ');
        prev.textContent = \`\${setupMinutes} Min/Day · \${setupIntensity} Intensity · \${typesStr} · \${setupMotive}\`;
      }
      setTimeout(() => openModal('#challengeDurationModal'), 80);
    };
  }

  // Step 3 -> Back to Step 2
  if ($('#backToPrefsBtn')) {
    $('#backToPrefsBtn').onclick = (e) => {
      e.preventDefault();
      closeModal('#challengeDurationModal');
      setTimeout(() => openModal('#challengePrefsModal'), 80);
    };
  }

  if ($('#editPrefsFromDurationBtn')) {
    $('#editPrefsFromDurationBtn').onclick = (e) => {
      e.preventDefault();
      closeModal('#challengeDurationModal');
      setTimeout(() => openModal('#challengePrefsModal'), 80);
    };
  }

  // Step 3: Days Selection Cards (10, 15, 25, 30 days)
  $$('#durationOptionsList .setup-choice-card').forEach(card => {
    card.onclick = (e) => {
      e.preventDefault();
      $$('#durationOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setupDuration = Number(card.dataset.days) || 15;
    };
  });

  // Generate AI Plan with full parameter validation
  if ($('#generateChallengePlanBtn')) {
    $('#generateChallengePlanBtn').onclick = (e) => {
      e.preventDefault();
      if (!setupDuration || ![10, 15, 25, 30].includes(Number(setupDuration))) {
        if (typeof toast === 'function') toast('Please select your challenge duration (10, 15, 25, or 30 days)');
        return;
      }
      if (!setupTypes || !setupTypes.length) setupTypes = ['Gym'];
      if (!setupMinutes) setupMinutes = 45;
      if (!setupIntensity) setupIntensity = 'Moderate';
      if (!setupMotive) setupMotive = 'Burn Fat & Lean Out';

      generateAIChallengePlan(setupMotive, setupDuration, setupMinutes, setupIntensity, setupTypes);
    };
  }

  // Start New Challenge button on challenge intro
  if ($('#createChallengeBtn')) {
    $('#createChallengeBtn').onclick = (e) => {
      e.preventDefault();
      openModal('#challengeMotiveModal');
    };
  }
}
initChallengeSetupListeners();`;

code = code.substring(0, startIdx) + newFunction + code.substring(endIdx + endToken.length);

if (!code.includes('window.showToast =')) {
  code = 'window.showToast = typeof toast === "function" ? toast : console.log;\n' + code;
}

fs.writeFileSync(jsPath, code, 'utf8');
console.log('Successfully updated challenge listeners in public/fitfuel.js');
