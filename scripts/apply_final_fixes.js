const fs = require('fs');

let js = fs.readFileSync('public/fitfuel.js', 'utf8');
const isCrlf = js.includes('\r\n');
const eol = isCrlf ? '\r\n' : '\n';

// 1. Expose baState
if (!js.includes('window.baState = baState')) {
  const baTarget = `  analysisTimer: null${eol}};`;
  const baReplace = `  analysisTimer: null${eol}};${eol}if (typeof window !== 'undefined') {${eol}  window.baState = baState;${eol}  window.renderTransformationDashboard = renderTransformationDashboard;${eol}}`;
  if (js.includes(baTarget)) {
    js = js.replace(baTarget, baReplace);
    console.log('Exposed baState on window!');
  } else {
    console.error('baTarget not found');
  }
}

// 2. Coach buttons in renderChatMessages
const coachTarget = `<button type="button" class="ai-chat-btn-mini primary" onclick="switchView('workouts')">View Active Workout</button>`;
const coachReplace = `<button type="button" class="ai-chat-btn-mini primary" id="coachPlanAddToWorkoutBtn" onclick="switchView('workouts')">View Active Workout</button>`;

if (js.includes(coachTarget)) {
  js = js.replace(coachTarget, coachReplace);
  console.log('Added id coachPlanAddToWorkoutBtn!');
}

const coachFormTarget = `<button type="button" class="ai-chat-btn-mini" onclick="switchView('posture')">Check Exercise Form</button>`;
const coachFormReplace = `<button type="button" class="ai-chat-btn-mini" id="coachPlanInspectFormBtn" onclick="switchView('posture')">Check Exercise Form</button>`;

if (js.includes(coachFormTarget)) {
  js = js.replace(coachFormTarget, coachFormReplace);
  console.log('Added id coachPlanInspectFormBtn!');
}

const coachVolTarget = `<button type="button" class="ai-chat-btn-mini" onclick="openModal('#customWorkoutModal')">Customize Volume</button>`;
const coachVolReplace = `<button type="button" class="ai-chat-btn-mini" id="coachPlanModifyVolBtn" onclick="openModal('#customWorkoutModal')">Customize Volume</button>`;

if (js.includes(coachVolTarget)) {
  js = js.replace(coachVolTarget, coachVolReplace);
  console.log('Added id coachPlanModifyVolBtn!');
}

// 3. baRunAnalysisBtn clickability
const runBtnTarget = `  const consentCheck = $('#baConsentCheck');${eol}  const runBtn = $('#baRunAnalysisBtn');${eol}  if (consentCheck && runBtn) {`;
const runBtnReplace = `  const consentCheck = $('#baConsentCheck');${eol}  const runBtn = $('#baRunAnalysisBtn');${eol}  if (runBtn) {${eol}    runBtn.disabled = false;${eol}    runBtn.classList.remove('disabled');${eol}  }${eol}  if (consentCheck && runBtn) {`;

if (js.includes(runBtnTarget)) {
  js = js.replace(runBtnTarget, runBtnReplace);
  console.log('Updated baRunAnalysisBtn clickability!');
} else {
  console.log('runBtnTarget not found, searching alternative...');
  const idx = js.indexOf("const consentCheck = $('#baConsentCheck');");
  console.log('idx of consentCheck:', idx);
}

fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('fitfuel.js written!');
