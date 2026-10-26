const fs = require('fs');

const jsPath = 'public/fitfuel.js';
let js = fs.readFileSync(jsPath, 'utf8');

// 1. Update switchView
const sIdx = js.indexOf('function switchView(viewName)');
if (sIdx !== -1) {
  const forEachIdx = js.indexOf("$$('.primary-nav .nav-link').forEach(btn => {", sIdx);
  const endForEachIdx = js.indexOf("});\r\n\r\n  $$('.page-content .view')", forEachIdx);
  const endForEachIdxUnix = js.indexOf("});\n\n  $$('.page-content .view')", forEachIdx);
  const endPos = (endForEachIdx !== -1) ? endForEachIdx + 3 : ((endForEachIdxUnix !== -1) ? endForEachIdxUnix + 3 : -1);

  if (forEachIdx !== -1 && endPos !== -1) {
    const replacement = `const WORKOUT_VIEWS = ['workouts', 'challenge', 'starting-load', 'exercise-library'];
  const FOOD_VIEWS = ['food-log', 'my-foods'];

  let parentNavView = viewName;
  if (WORKOUT_VIEWS.includes(viewName)) {
    parentNavView = 'workouts';
  } else if (FOOD_VIEWS.includes(viewName)) {
    parentNavView = 'food-log';
  }

  $$('.primary-nav .nav-link').forEach(btn => {
    const isTarget = btn.dataset.view === parentNavView || btn.dataset.view === viewName;
    btn.classList.toggle('selected', isTarget);
    let dot = btn.querySelector('.nav-active-dot');
    if (isTarget && !dot) {
      const d = document.createElement('span');
      d.className = 'nav-active-dot';
      btn.appendChild(d);
    } else if (!isTarget && dot) {
      dot.remove();
    }
  });

  // Sync all hub tabs
  $$('.hub-tab-btn').forEach(tab => {
    const isTabActive = tab.dataset.hubTarget === viewName;
    tab.classList.toggle('active', isTabActive);
  });`;

    js = js.slice(0, forEachIdx) + replacement + js.slice(endPos);
    console.log('Successfully replaced switchView navigation sync!');
  } else {
    console.log('Indices for switchView:', forEachIdx, endPos);
  }
}

// 2. Attach openModal, closeModal, switchView to window right after closeModal
const cIdx = js.indexOf('function closeModal(selector)');
if (cIdx !== -1) {
  const timeoutPos = js.indexOf('160);', cIdx);
  if (timeoutPos !== -1) {
    const closeBracePos = js.indexOf('}', timeoutPos + 5);
    if (closeBracePos !== -1) {
      const insertPos = closeBracePos + 1;
      const exportStr = '\r\n\r\nwindow.openModal = openModal;\r\nwindow.closeModal = closeModal;\r\nwindow.switchView = switchView;\r\n';
      if (!js.includes('window.openModal = openModal;')) {
        js = js.slice(0, insertPos) + exportStr + js.slice(insertPos);
        console.log('Attached openModal, closeModal, switchView to window!');
      }
    }
  }
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Saved fitfuel.js successfully.');
