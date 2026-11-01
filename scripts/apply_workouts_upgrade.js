const fs = require('fs');

// 1. Update public/index.html
let html = fs.readFileSync('public/index.html', 'utf8');

// Update sidebar Training button data-view="exercise-library"
html = html.replace(
  '<button class="nav-link" data-view="workouts" data-section="training" title="Training">',
  '<button class="nav-link" data-view="exercise-library" data-section="training" title="Training">'
);

// Update view-exercise-library heading
html = html.replace(
  '<h2>Workouts &amp; Movement Library</h2>\r\n            <p>Explore gym and at-home exercises by muscle group.</p>',
  '<h2>Workouts</h2>\r\n            <p>Explore gym, home, HIIT, cardio, and mobility workouts by movement &amp; muscle group.</p>'
);
html = html.replace(
  '<h2>Workouts &amp; Movement Library</h2>\n            <p>Explore gym and at-home exercises by muscle group.</p>',
  '<h2>Workouts</h2>\n            <p>Explore gym, home, HIIT, cardio, and mobility workouts by movement &amp; muscle group.</p>'
);

// Update search input placeholder
html = html.replace(
  'placeholder="Search exercises..."',
  'placeholder="Search workouts &amp; exercises..."'
);

// Update mobile nav button if needed
html = html.replace(
  /<button type="button" class="mobile-nav-btn" data-view="exercise-library" id="mobNavExercises"[^>]*>[\s\S]*?<span>[^<]*<\/span>\s*<\/button>/,
  `<button type="button" class="mobile-nav-btn" data-view="exercise-library" id="mobNavExercises" aria-label="Workouts">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path>
        <path d="m2.5 21.5 1.4-1.4"></path><path d="m20.1 3.9 1.4-1.4"></path>
        <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path>
        <path d="m9.6 14.4 4.8-4.8"></path>
      </svg>
      <span>Workouts</span>
    </button>`
);

// Remove the old dead comment <!-- ================= VIEW 3: WORKOUTS ================= -->
html = html.replace('<!-- ================= VIEW 3: WORKOUTS ================= -->\r\n      ', '');
html = html.replace('<!-- ================= VIEW 3: WORKOUTS ================= -->\n      ', '');

// Bump query version in index.html
html = html.replace(/fitfuel\.js\?v=[\d\.]+/g, 'fitfuel.js?v=7.9.0');
html = html.replace(/styles\.css\?v=[\d\.]+/g, 'styles.css?v=7.9.0');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✔ Updated public/index.html');

// 2. Update public/fitfuel.js
let js = fs.readFileSync('public/fitfuel.js', 'utf8');

// In switchView: alias 'workouts' to 'exercise-library'
const switchViewOld = `function switchView(viewName) {
  activeView = viewName;`;

const switchViewNew = `function switchView(viewName) {
  if (viewName === 'workouts') {
    viewName = 'exercise-library';
  }
  activeView = viewName;`;

if (js.includes(switchViewOld.replace(/\n/g, '\r\n'))) {
  js = js.replace(switchViewOld.replace(/\n/g, '\r\n'), switchViewNew.replace(/\n/g, '\r\n'));
} else if (js.includes(switchViewOld)) {
  js = js.replace(switchViewOld, switchViewNew);
}

// In SECTION_VIEW_MAP:
const sectionMapOld = `'training': ['workouts', 'challenge', 'exercise-library', 'starting-load']`;
const sectionMapNew = `'training': ['exercise-library', 'challenge', 'starting-load', 'workouts']`;
if (js.includes(sectionMapOld)) {
  js = js.replace(sectionMapOld, sectionMapNew);
}

// Make sure renderWorkouts calls renderExerciseLibrary
const renderWorkoutsTarget = 'function renderWorkouts() {';
if (js.includes(renderWorkoutsTarget)) {
  const rwIdx = js.indexOf(renderWorkoutsTarget);
  // find closing brace of renderWorkouts
  // We can prepend renderExerciseLibrary() call inside renderWorkouts
  js = js.substring(0, rwIdx + renderWorkoutsTarget.length) + '\r\n  renderExerciseLibrary();' + js.substring(rwIdx + renderWorkoutsTarget.length);
}

fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('✔ Updated public/fitfuel.js');

// 3. Update public/sw.js cache
let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/CACHE_NAME\s*=\s*'[^']+'/, "CACHE_NAME = 'fitfuel-cache-v7.9.0'");
fs.writeFileSync('public/sw.js', sw, 'utf8');
console.log('✔ Updated public/sw.js cache to v7.9.0');
