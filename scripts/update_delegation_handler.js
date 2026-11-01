const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../public/fitfuel.js');
let code = fs.readFileSync(jsPath, 'utf8');

const targetBlock = `  // 8. Challenge Prefs Step 2 -> Step 3
  const proceedDurationBtn = e.target.closest('#proceedToDurationBtn');
  if (proceedDurationBtn) {
    e.preventDefault();
    const prev = document.getElementById('challengeMetricsPreview');
    if (prev) {
      const typesStr = (Array.isArray(setupTypes) && setupTypes.length) ? setupTypes.join(', ') : 'Home';
      prev.textContent = \`\${setupMinutes || 45} Total Min/Day · \${setupIntensity || 'Moderate'} Intensity · \${typesStr} · \${setupMotive || 'Burn Fat'}\`;
    }
    if (typeof closeModal === 'function') closeModal('#challengePrefsModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengeDurationModal');
    }, 100);
    return;
  }

  // 9. Duration Days Card Click
  const durCard = e.target.closest('#durationOptionsList .setup-choice-card');
  if (durCard) {
    document.querySelectorAll('#durationOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
    durCard.classList.add('selected');
    setupDuration = Number(durCard.dataset.days) || 15;
    return;
  }

  // 10. Back from Duration to Prefs
  const backPrefsBtn = e.target.closest('#backToPrefsBtn');
  if (backPrefsBtn) {
    e.preventDefault();
    if (typeof closeModal === 'function') closeModal('#challengeDurationModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengePrefsModal');
    }, 100);
    return;
  }

  // 11. Generate Challenge Plan
  const genChallengeBtn = e.target.closest('#generateChallengePlanBtn');
  if (genChallengeBtn) {
    e.preventDefault();
    if (typeof generateAIChallengePlan === 'function') {
      generateAIChallengePlan(setupMotive, setupDuration, setupMinutes, setupIntensity, setupTypes);
    }
    return;
  }`;

const replacementBlock = `  // 8. Challenge Prefs Step 2 -> Step 3 with Validation
  const proceedDurationBtn = e.target.closest('#proceedToDurationBtn');
  if (proceedDurationBtn) {
    e.preventDefault();
    const checkedBoxes = Array.from(document.querySelectorAll('#chTypesOptionsList input[type="checkbox"]:checked'));
    if (!checkedBoxes.length) {
      if (typeof showToast === 'function') showToast('Please select at least one workout type (e.g. Gym or Home)');
      return;
    }
    setupTypes = checkedBoxes.map(b => b.value);
    if (!setupMinutes) setupMinutes = 45;
    if (!setupIntensity) setupIntensity = 'Moderate';

    const prev = document.getElementById('challengeMetricsPreview');
    if (prev) {
      const typesStr = setupTypes.join(', ');
      prev.textContent = \`\${setupMinutes} Min/Day · \${setupIntensity} Intensity · \${typesStr} · \${setupMotive || 'Burn Fat'}\`;
    }
    if (typeof closeModal === 'function') closeModal('#challengePrefsModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengeDurationModal');
    }, 80);
    return;
  }

  // 9. Duration Days Card Click (10, 15, 25, 30 days)
  const durCard = e.target.closest('#durationOptionsList .setup-choice-card');
  if (durCard) {
    e.preventDefault();
    document.querySelectorAll('#durationOptionsList .setup-choice-card').forEach(c => c.classList.remove('selected'));
    durCard.classList.add('selected');
    setupDuration = Number(durCard.dataset.days) || 15;
    return;
  }

  // 10. Back from Duration to Prefs / Edit Settings
  const backPrefsBtn = e.target.closest('#backToPrefsBtn, #editPrefsFromDurationBtn');
  if (backPrefsBtn) {
    e.preventDefault();
    if (typeof closeModal === 'function') closeModal('#challengeDurationModal');
    setTimeout(() => {
      if (typeof openModal === 'function') openModal('#challengePrefsModal');
    }, 80);
    return;
  }

  // 11. Generate Challenge Plan with strict Validation
  const genChallengeBtn = e.target.closest('#generateChallengePlanBtn');
  if (genChallengeBtn) {
    e.preventDefault();
    if (!setupDuration || ![10, 15, 25, 30].includes(Number(setupDuration))) {
      if (typeof showToast === 'function') showToast('Please select your challenge duration (10, 15, 25, or 30 days)');
      return;
    }
    if (!setupTypes || !setupTypes.length) setupTypes = ['Gym'];
    if (!setupMinutes) setupMinutes = 45;
    if (!setupIntensity) setupIntensity = 'Moderate';
    if (!setupMotive) setupMotive = 'Burn Fat & Lean Out';

    if (typeof generateAIChallengePlan === 'function') {
      generateAIChallengePlan(setupMotive, setupDuration, setupMinutes, setupIntensity, setupTypes);
    }
    return;
  }`;

// Replace CRLF-safely
const normalize = s => s.replace(/\r\n/g, '\n');
const normCode = normalize(code);
const normTarget = normalize(targetBlock);

if (normCode.includes(normTarget)) {
  const normRepl = normalize(replacementBlock);
  code = normCode.replace(normTarget, normRepl);
  fs.writeFileSync(jsPath, code, 'utf8');
  console.log('Successfully updated delegation handler in fitfuel.js');
} else {
  console.error('Target block not found in fitfuel.js delegation handler');
  process.exit(1);
}
