const fs = require('fs');

let js = fs.readFileSync('public/fitfuel.js', 'utf8');

const sIdx = js.indexOf('function switchView(viewName) {');
if (sIdx === -1) {
  console.error('function switchView not found!');
  process.exit(1);
}

// Find closing of the forEach block
const forEachEnd = js.indexOf('});', sIdx);
if (forEachEnd === -1) {
  console.error('forEach block end not found!');
  process.exit(1);
}

const replacement = `const SECTION_VIEW_MAP = {
  'overview': ['today'],
  'training': ['workouts', 'challenge', 'exercise-library', 'starting-load'],
  'nutrition': ['food-log', 'my-foods'],
  'ai-coach': ['ai-coach'],
  'progress': ['tracking', 'activity'],
  'labs': ['posture', 'body-analysis'],
  'accounts': ['profile', 'customization'],
  'admin': ['admin']
};

function switchView(viewName) {
  activeView = viewName;
  $$('.primary-nav .nav-link').forEach(btn => {
    const sec = btn.dataset.section;
    const isTarget = btn.dataset.view === viewName || (sec && SECTION_VIEW_MAP[sec] && SECTION_VIEW_MAP[sec].includes(viewName));
    btn.classList.toggle('selected', isTarget);
    let dot = btn.querySelector('.nav-active-dot');
    if (isTarget && !dot) {
      const d = document.createElement('span');
      d.className = 'nav-active-dot';
      btn.appendChild(d);
    } else if (!isTarget && dot) {
      dot.remove();
    }
  });`.replace(/\n/g, '\r\n');

js = js.substring(0, sIdx) + replacement + js.substring(forEachEnd + 3);
fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('✔ Successfully replaced switchView primary-nav logic in public/fitfuel.js');
