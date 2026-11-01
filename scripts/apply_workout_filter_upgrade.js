const fs = require('fs');
const path = require('path');

console.log('--- Applying Workout Filter System Upgrade ---');

// =========================================================================
// 1. UPDATE public/index.html
// =========================================================================
let html = fs.readFileSync('public/index.html', 'utf8');

// Ensure modules/exercise-equipment-engine.js is loaded
if (!html.includes('modules/exercise-equipment-engine.js')) {
  html = html.replace(
    '<script src="modules/beta-manager.js?v=7.9.0"></script>',
    '<script src="modules/exercise-equipment-engine.js?v=7.9.0"></script>\n<script src="modules/beta-manager.js?v=7.9.0"></script>'
  );
  if (!html.includes('modules/exercise-equipment-engine.js')) {
    html = html.replace(
      '<script src="fitfuel.js',
      '<script src="modules/exercise-equipment-engine.js?v=7.9.0"></script>\n<script src="fitfuel.js'
    );
  }
}

// Upgrade #view-exercise-library filter section
const oldFilterSection = `        <!-- 1. WORKOUT TYPE (SELECT ONE OR MULTIPLE) -->
        <div class="workout-types-section">
          <div class="workout-types-header">1. WORKOUT TYPE (SELECT ONE OR MULTIPLE)</div>
          <div class="workout-types-chips" id="workoutTypeChips">
            <button type="button" class="workout-type-chip active" data-type="all">All Types</button>
            <button type="button" class="workout-type-chip" data-type="gym">Gym Workout</button>
            <button type="button" class="workout-type-chip" data-type="home">Home Workout</button>
            <button type="button" class="workout-type-chip" data-type="hiit">High Intensity (HIIT)</button>
            <button type="button" class="workout-type-chip" data-type="cardio">Cardio</button>
            <button type="button" class="workout-type-chip" data-type="stretching">Stretching &amp; Mobility</button>
          </div>
        </div>
        <div class="muscle-tabs" id="muscleTabs">
          <!-- Muscle tabs: Chest, Back, Shoulders, Arms, Core, Legs -->
        </div>

        <div class="muscle-tags" id="muscleSubTags">
          <!-- Sub-tags -->
        </div>

        <div class="library-heading" style="margin:20px 0 12px;display:flex;justify-content:space-between;">
          <div>
            <span class="section-kicker" id="libFilterHeader">LEGS &bull; QUADS / HAMSTRINGS / GLUTES</span>
            <h3 style="font-size:1.15rem;color:var(--glass-text-primary);">Exercises for you</h3>
          </div>
          <span class="result-count" id="libResultCount">Filtered results</span>
        </div>`;

const newFilterSection = `        <!-- ================= 5-TIER WORKOUT FILTERS HIERARCHY ================= -->
        <div class="workout-filter-hierarchy" id="workoutFilterHierarchy" style="display:flex;flex-direction:column;gap:14px;margin:18px 0 16px;">
          
          <!-- 1. WORKOUT LOCATION (SINGLE SELECT) -->
          <div class="filter-tier-group" id="filterTierLocation">
            <div class="workout-types-header" style="display:flex;align-items:center;justify-content:space-between;">
              <span>1. WORKOUT LOCATION</span>
              <span style="font-size:0.72rem;font-weight:600;color:var(--glass-text-secondary);text-transform:none;letter-spacing:normal;">Where do you train?</span>
            </div>
            <div class="workout-types-chips" id="workoutLocationChips">
              <button type="button" class="workout-type-chip active" data-location="all">All Locations</button>
              <button type="button" class="workout-type-chip" data-location="gym">Gym</button>
              <button type="button" class="workout-type-chip" data-location="home">Home</button>
            </div>
          </div>

          <!-- 2. WORKOUT TYPE (MULTI-SELECT) -->
          <div class="filter-tier-group" id="filterTierType">
            <div class="workout-types-header" style="display:flex;align-items:center;justify-content:space-between;">
              <span>2. WORKOUT TYPE (SELECT ONE OR MULTIPLE)</span>
              <span style="font-size:0.72rem;font-weight:600;color:var(--glass-text-secondary);text-transform:none;letter-spacing:normal;">Modality</span>
            </div>
            <div class="workout-types-chips" id="workoutTypeChips">
              <button type="button" class="workout-type-chip active" data-type="all">All Types</button>
              <button type="button" class="workout-type-chip" data-type="strength">Strength Training</button>
              <button type="button" class="workout-type-chip" data-type="hiit">High Intensity (HIIT)</button>
              <button type="button" class="workout-type-chip" data-type="cardio">Cardio</button>
              <button type="button" class="workout-type-chip" data-type="stretching">Stretching &amp; Mobility</button>
            </div>
          </div>

          <!-- 3. EQUIPMENT AVAILABILITY (LOCATION-AWARE CONDITIONAL FILTER) -->
          <div class="filter-tier-group" id="filterTierEquipment" style="transition:all 0.3s ease;">
            <div class="workout-types-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
              <span id="equipmentSectionTitle">3. EQUIPMENT AVAILABILITY</span>
              <div id="equipmentQuickActions" style="display:flex;gap:6px;flex-wrap:wrap;">
                <!-- Populated dynamically: [No Equipment] / [Select All] for Home; [Full Gym Access] / [Customize] for Gym -->
              </div>
            </div>
            <div class="workout-types-chips" id="workoutEquipmentChips">
              <!-- Populated dynamically based on Location -->
            </div>
          </div>

          <!-- 4. TARGET MUSCLE GROUP -->
          <div class="filter-tier-group" id="filterTierMuscle">
            <div class="workout-types-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span>4. TARGET MUSCLE GROUP</span>
              <span style="font-size:0.72rem;font-weight:600;color:var(--glass-text-secondary);text-transform:none;letter-spacing:normal;">Primary focus</span>
            </div>
            <div class="muscle-tabs" id="muscleTabs" style="display:flex;flex-wrap:wrap;gap:8px;">
              <!-- Populated dynamically: Chest, Back, Shoulders, Arms, Legs, Core, Full Body -->
            </div>
          </div>

          <!-- 5. SUB-MUSCLE GROUP -->
          <div class="filter-tier-group" id="filterTierSubMuscle">
            <div class="workout-types-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span>5. SUB-MUSCLE GROUP</span>
              <span style="font-size:0.72rem;font-weight:600;color:var(--glass-text-secondary);text-transform:none;letter-spacing:normal;">Specific anatomy</span>
            </div>
            <div class="muscle-tags" id="muscleSubTags" style="display:flex;flex-wrap:wrap;gap:8px;">
              <!-- Sub-tags populated dynamically -->
            </div>
          </div>

        </div>

        <div class="library-heading" style="margin:20px 0 12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <span class="section-kicker" id="libFilterHeader">LEGS &bull; QUADS / HAMSTRINGS / GLUTES</span>
            <h3 style="font-size:1.15rem;color:var(--glass-text-primary);margin:0;">Exercises for you</h3>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <button type="button" id="resetWorkoutFiltersBtn" class="outline-button small" style="padding:5px 12px;font-size:0.75rem;border-radius:99px;" title="Reset all filters to default">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              Reset Filters
            </button>
            <span class="result-count" id="libResultCount">Filtered results</span>
          </div>
        </div>`;

if (html.includes(oldFilterSection.replace(/\n/g, '\r\n'))) {
  html = html.replace(oldFilterSection.replace(/\n/g, '\r\n'), newFilterSection.replace(/\n/g, '\r\n'));
  console.log('✔ Replaced old filter section in index.html (CRLF)');
} else if (html.includes(oldFilterSection)) {
  html = html.replace(oldFilterSection, newFilterSection);
  console.log('✔ Replaced old filter section in index.html (LF)');
} else {
  console.warn('⚠ Could not find exact oldFilterSection string in index.html. Checking alternate match...');
  const startIdx = html.indexOf('<!-- 1. WORKOUT TYPE (SELECT ONE OR MULTIPLE) -->');
  const endIdx = html.indexOf('<div class="exercise-cards" id="exerciseCardsContainer">');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    html = html.substring(0, startIdx) + newFilterSection + '\n\n        ' + html.substring(endIdx);
    console.log('✔ Sliced and replaced filter section in index.html');
  } else {
    console.error('❌ Failed to locate filter section boundaries in index.html');
  }
}

fs.writeFileSync('public/index.html', html, 'utf8');

// =========================================================================
// 2. UPDATE public/styles.css
// =========================================================================
let css = fs.readFileSync('public/styles.css', 'utf8');

const additionalCss = `
/* ==========================================================================
   ENHANCED WORKOUT FILTERS & EQUIPMENT AWARE STYLES
   ========================================================================== */
.workout-filter-hierarchy {
  margin: 18px 0 16px;
}

.quick-action-pill {
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.25);
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.quick-action-pill:hover {
  background: rgba(37, 99, 235, 0.16);
  border-color: #2563eb;
  transform: translateY(-1px);
}

html.dark .quick-action-pill,
[data-theme="dark"] .quick-action-pill {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}

html.dark .quick-action-pill:hover,
[data-theme="dark"] .quick-action-pill:hover {
  background: rgba(56, 189, 248, 0.22);
}

.filter-pill-empty-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}
`;

if (!css.includes('.quick-action-pill')) {
  css += '\n' + additionalCss;
  fs.writeFileSync('public/styles.css', css, 'utf8');
  console.log('✔ Appended filter styling to public/styles.css');
}

// =========================================================================
// 3. UPDATE public/fitfuel.js
// =========================================================================
let js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Update MUSCLE_GROUPS: remove Cardio
const oldMuscleGroups = `const MUSCLE_GROUPS = {
  Chest: ['All Chest', 'Upper chest', 'Mid chest', 'Lower chest'],
  Back: ['All Back', 'Lats', 'Upper back & Traps', 'Lower back'],
  Shoulders: ['All Shoulders', 'Front delts', 'Side delts', 'Rear delts'],
  Arms: ['All Arms', 'Biceps', 'Triceps', 'Forearms'],
  Legs: ['All Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Core: ['All Core', 'Upper abs', 'Lower abs', 'Obliques'],
  Cardio: ['All Cardio', 'Bodyweight Cardio', 'High Intensity & Plyo', 'Cardio Machines & Gear'],
  'Full Body': ['All Full Body', 'Compound Strength', 'Conditioning']
};`;

const newMuscleGroups = `const MUSCLE_GROUPS = {
  Chest: ['All Chest', 'Upper chest', 'Mid chest', 'Lower chest'],
  Back: ['All Back', 'Lats', 'Upper back & Traps', 'Lower back'],
  Shoulders: ['All Shoulders', 'Front delts', 'Side delts', 'Rear delts'],
  Arms: ['All Arms', 'Biceps', 'Triceps', 'Forearms'],
  Legs: ['All Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Core: ['All Core', 'Upper abs', 'Lower abs', 'Obliques'],
  'Full Body': ['All Full Body', 'Compound Strength', 'Conditioning']
};`;

if (js.includes(oldMuscleGroups.replace(/\n/g, '\r\n'))) {
  js = js.replace(oldMuscleGroups.replace(/\n/g, '\r\n'), newMuscleGroups.replace(/\n/g, '\r\n'));
  console.log('✔ Updated MUSCLE_GROUPS in fitfuel.js (CRLF)');
} else if (js.includes(oldMuscleGroups)) {
  js = js.replace(oldMuscleGroups, newMuscleGroups);
  console.log('✔ Updated MUSCLE_GROUPS in fitfuel.js (LF)');
}

// Replace the Exercise Library rendering block with the complete 5-filter system
const oldExLibStart = '/* ---------- Exercise Library View Rendering ---------- */';
const oldExLibEnd = '/* ---------- My Foods View Rendering ---------- */';

const startIdx = js.indexOf(oldExLibStart);
const endIdx = js.indexOf(oldExLibEnd);

if (startIdx !== -1 && endIdx !== -1) {
  const newExLibCode = `/* ---------- Exercise Library View Rendering ---------- */
// MUSCLE_GROUPS initialized at top level

let filterLocation = 'all'; // 'all' | 'gym' | 'home'
let filterWorkoutTypes = new Set(['all']); // Set of 'all', 'strength', 'hiit', 'cardio', 'stretching'
let filterHomeEquipment = new Set([
  'Bodyweight', 'Dumbbells', 'Resistance Bands', 'Bench', 'Pull-up Bar', 'Kettlebells', 'Skipping Rope', 'Exercise Mat', 'Chair'
]);
let filterGymEquipment = new Set([
  'Bodyweight', 'Dumbbells', 'Barbells', 'Weight Machines', 'Cable Machines', 'Smith Machine', 'Bench', 'Pull-up Bar', 'Kettlebells', 'Treadmill', 'Stationary Bike', 'Elliptical'
]);

function getActiveEquipmentSet() {
  if (filterLocation === 'home') return filterHomeEquipment;
  if (filterLocation === 'gym') return filterGymEquipment;
  // 'all': union of both
  return new Set([...filterHomeEquipment, ...filterGymEquipment]);
}

function initWorkoutFilters() {
  initWorkoutLocationChips();
  initWorkoutTypeChips();
  initEquipmentChips();
  initResetButton();
}

function initWorkoutLocationChips() {
  const container = $('#workoutLocationChips');
  if (!container || container.dataset.initialized) return;
  container.dataset.initialized = 'true';

  container.querySelectorAll('.workout-type-chip').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const loc = btn.dataset.location;
      if (filterLocation === loc) return;
      
      const prevLoc = filterLocation;
      filterLocation = loc;

      // Smart equipment transition:
      // When switching to Home from Gym, ensure gym-only equipment is removed
      if (loc === 'home' && prevLoc === 'gym') {
        const homeList = (window.FitFuelExerciseEngine && window.FitFuelExerciseEngine.HOME_EQUIPMENT) || [
          'Bodyweight', 'Dumbbells', 'Resistance Bands', 'Bench', 'Pull-up Bar', 'Kettlebells', 'Skipping Rope', 'Exercise Mat', 'Chair'
        ];
        filterHomeEquipment = new Set(Array.from(filterGymEquipment).filter(eq => homeList.includes(eq)));
        if (filterHomeEquipment.size === 0) filterHomeEquipment.add('Bodyweight');
      } else if (loc === 'gym' && prevLoc === 'home') {
        // Switching to Gym: default to full gym equipment
        const gymList = (window.FitFuelExerciseEngine && window.FitFuelExerciseEngine.GYM_EQUIPMENT) || [
          'Bodyweight', 'Dumbbells', 'Barbells', 'Weight Machines', 'Cable Machines', 'Smith Machine', 'Bench', 'Pull-up Bar', 'Kettlebells', 'Treadmill', 'Stationary Bike', 'Elliptical'
        ];
        filterGymEquipment = new Set(gymList);
      }

      container.querySelectorAll('.workout-type-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.location === filterLocation);
      });

      renderEquipmentChips();
      if (typeof soundFX !== 'undefined' && soundFX && soundFX.pop) soundFX.pop();
      renderExerciseLibrary();
    };
  });
}

function initWorkoutTypeChips() {
  const container = $('#workoutTypeChips');
  if (!container || container.dataset.initialized) return;
  container.dataset.initialized = 'true';

  container.querySelectorAll('.workout-type-chip').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const type = btn.dataset.type;
      if (type === 'all') {
        filterWorkoutTypes.clear();
        filterWorkoutTypes.add('all');
      } else {
        filterWorkoutTypes.delete('all');
        if (filterWorkoutTypes.has(type)) {
          filterWorkoutTypes.delete(type);
        } else {
          filterWorkoutTypes.add(type);
        }
        if (filterWorkoutTypes.size === 0) {
          filterWorkoutTypes.add('all');
        }
      }
      container.querySelectorAll('.workout-type-chip').forEach(b => {
        b.classList.toggle('active', filterWorkoutTypes.has(b.dataset.type));
      });
      if (typeof soundFX !== 'undefined' && soundFX && soundFX.pop) soundFX.pop();
      renderExerciseLibrary();
    };
  });
}

function initEquipmentChips() {
  renderEquipmentChips();
}

function renderEquipmentChips() {
  const container = $('#workoutEquipmentChips');
  const title = $('#equipmentSectionTitle');
  const quickActions = $('#equipmentQuickActions');
  if (!container) return;

  const engine = window.FitFuelExerciseEngine;
  const homeList = (engine && engine.HOME_EQUIPMENT) || [
    'Bodyweight', 'Dumbbells', 'Resistance Bands', 'Bench', 'Pull-up Bar', 'Kettlebells', 'Skipping Rope', 'Exercise Mat', 'Chair'
  ];
  const gymList = (engine && engine.GYM_EQUIPMENT) || [
    'Bodyweight', 'Dumbbells', 'Barbells', 'Weight Machines', 'Cable Machines', 'Smith Machine', 'Bench', 'Pull-up Bar', 'Kettlebells', 'Treadmill', 'Stationary Bike', 'Elliptical'
  ];

  let displayList = [];
  let activeSet = null;

  if (filterLocation === 'home') {
    if (title) title.textContent = '3. AVAILABLE HOME EQUIPMENT';
    displayList = homeList;
    activeSet = filterHomeEquipment;
    if (quickActions) {
      quickActions.innerHTML = \`
        <button type="button" class="quick-action-pill" onclick="quickSelectNoEquipment()">[No Equipment (Bodyweight)]</button>
        <button type="button" class="quick-action-pill" onclick="quickSelectAllHomeEquipment()">[Select All Available]</button>
      \`;
    }
  } else if (filterLocation === 'gym') {
    if (title) title.textContent = '3. AVAILABLE GYM EQUIPMENT';
    displayList = gymList;
    activeSet = filterGymEquipment;
    if (quickActions) {
      quickActions.innerHTML = \`
        <button type="button" class="quick-action-pill" onclick="quickSelectFullGym()">[Full Gym Access]</button>
        <button type="button" class="quick-action-pill" onclick="quickSelectDumbbellsOnly()">[Dumbbells Only]</button>
      \`;
    }
  } else {
    // All Locations
    if (title) title.textContent = '3. EQUIPMENT AVAILABILITY (ALL LOCATIONS)';
    displayList = (engine && engine.ALL_EQUIPMENT) || Array.from(new Set([...homeList, ...gymList]));
    activeSet = getActiveEquipmentSet();
    if (quickActions) {
      quickActions.innerHTML = \`
        <button type="button" class="quick-action-pill" onclick="quickSelectAllEquipment()">[Full Access (All Gear)]</button>
      \`;
    }
  }

  container.innerHTML = displayList.map(eq => {
    const isActive = activeSet.has(eq);
    return \`<button type="button" class="workout-type-chip \${isActive ? 'active' : ''}" data-eq="\${escapeHtml(eq)}" onclick="toggleEquipmentItem('\${escapeHtml(eq)}')">\${escapeHtml(eq)}</button>\`;
  }).join('');
}

window.toggleEquipmentItem = function(eq) {
  let targetSet = null;
  if (filterLocation === 'home') targetSet = filterHomeEquipment;
  else if (filterLocation === 'gym') targetSet = filterGymEquipment;
  else {
    // In All Locations, toggle in both
    if (filterHomeEquipment.has(eq)) filterHomeEquipment.delete(eq);
    else filterHomeEquipment.add(eq);
    if (filterGymEquipment.has(eq)) filterGymEquipment.delete(eq);
    else filterGymEquipment.add(eq);
    renderEquipmentChips();
    renderExerciseLibrary();
    return;
  }

  if (targetSet.has(eq)) {
    targetSet.delete(eq);
  } else {
    targetSet.add(eq);
  }
  // Ensure at least Bodyweight remains if empty
  if (targetSet.size === 0) {
    targetSet.add('Bodyweight');
  }

  renderEquipmentChips();
  if (typeof soundFX !== 'undefined' && soundFX && soundFX.pop) soundFX.pop();
  renderExerciseLibrary();
};

window.quickSelectNoEquipment = function() {
  filterHomeEquipment.clear();
  filterHomeEquipment.add('Bodyweight');
  renderEquipmentChips();
  if (typeof soundFX !== 'undefined' && soundFX && soundFX.pop) soundFX.pop();
  renderExerciseLibrary();
  toast('Equipment set to: Bodyweight Only (No Gear)');
};

window.quickSelectAllHomeEquipment = function() {
  const engine = window.FitFuelExerciseEngine;
  const list = (engine && engine.HOME_EQUIPMENT) || [
    'Bodyweight', 'Dumbbells', 'Resistance Bands', 'Bench', 'Pull-up Bar', 'Kettlebells', 'Skipping Rope', 'Exercise Mat', 'Chair'
  ];
  filterHomeEquipment = new Set(list);
  renderEquipmentChips();
  if (typeof soundFX !== 'undefined' && soundFX && soundFX.pop) soundFX.pop();
  renderExerciseLibrary();
  toast('All Home Equipment Selected');
};

window.quickSelectFullGym = function() {
  const engine = window.FitFuelExerciseEngine;
  const list = (engine && engine.GYM_EQUIPMENT) || [
    'Bodyweight', 'Dumbbells', 'Barbells', 'Weight Machines', 'Cable Machines', 'Smith Machine', 'Bench', 'Pull-up Bar', 'Kettlebells', 'Treadmill', 'Stationary Bike', 'Elliptical'
  ];
  filterGymEquipment = new Set(list);
  renderEquipmentChips();
  if (typeof soundFX !== 'undefined' && soundFX && soundFX.pop) soundFX.pop();
  renderExerciseLibrary();
  toast('Full Gym Access Activated');
};

window.quickSelectDumbbellsOnly = function() {
  filterGymEquipment.clear();
  filterGymEquipment.add('Bodyweight');
  filterGymEquipment.add('Dumbbells');
  renderEquipmentChips();
  if (typeof soundFX !== 'undefined' && soundFX && soundFX.pop) soundFX.pop();
  renderExerciseLibrary();
  toast('Gym Equipment set to: Dumbbells & Bodyweight');
};

window.quickSelectAllEquipment = function() {
  const engine = window.FitFuelExerciseEngine;
  if (engine) {
    filterHomeEquipment = new Set(engine.HOME_EQUIPMENT);
    filterGymEquipment = new Set(engine.GYM_EQUIPMENT);
  }
  renderEquipmentChips();
  renderExerciseLibrary();
  toast('Full Equipment Access Enabled');
};

function initResetButton() {
  const btn = $('#resetWorkoutFiltersBtn');
  if (btn && !btn.dataset.initialized) {
    btn.dataset.initialized = 'true';
    btn.onclick = () => resetWorkoutFilters();
  }
}

window.resetWorkoutFilters = function() {
  filterLocation = 'all';
  filterWorkoutTypes = new Set(['all']);
  
  const engine = window.FitFuelExerciseEngine;
  if (engine) {
    filterHomeEquipment = new Set(engine.HOME_EQUIPMENT);
    filterGymEquipment = new Set(engine.GYM_EQUIPMENT);
  }
  
  selectedExerciseCategory = 'Legs';
  selectedSubMuscle = 'All Legs';

  const locContainer = $('#workoutLocationChips');
  if (locContainer) {
    locContainer.querySelectorAll('.workout-type-chip').forEach(b => {
      b.classList.toggle('active', b.dataset.location === 'all');
    });
  }

  const typeContainer = $('#workoutTypeChips');
  if (typeContainer) {
    typeContainer.querySelectorAll('.workout-type-chip').forEach(b => {
      b.classList.toggle('active', b.dataset.type === 'all');
    });
  }

  if ($('#exerciseSearchInput')) $('#exerciseSearchInput').value = '';

  renderEquipmentChips();
  renderExerciseLibrary();
  if (typeof soundFX !== 'undefined' && soundFX && soundFX.pop) soundFX.pop();
  toast('Filters reset to defaults');
};

function renderExerciseLibrary() {
  initWorkoutFilters();

  const tabs = $('#muscleTabs');
  if (tabs) {
    tabs.innerHTML = Object.keys(MUSCLE_GROUPS).map(cat => \`
      <button type="button" class="workout-type-chip \${cat === selectedExerciseCategory ? 'active' : ''}" onclick="selectExerciseCategory('\${cat}')">\${cat}</button>
    \`).join('');
  }

  const subTags = $('#muscleSubTags');
  if (subTags) {
    const list = MUSCLE_GROUPS[selectedExerciseCategory] || [];
    subTags.innerHTML = list.map(sub => \`
      <button type="button" class="workout-type-chip \${sub === selectedSubMuscle ? 'active' : ''}" onclick="selectSubMuscle('\${sub}')">\${sub}</button>
    \`).join('');
  }

  const q = ($('#exerciseSearchInput') ? $('#exerciseSearchInput').value.toLowerCase().trim() : '');
  const activeEq = getActiveEquipmentSet();
  const engine = window.FitFuelExerciseEngine;

  const filtered = EXERCISES_LIBRARY.filter(e => {
    if (engine) {
      return engine.matchesFilter(e, {
        query: q,
        location: filterLocation,
        workoutTypes: filterWorkoutTypes,
        selectedEquipment: activeEq,
        muscleGroup: selectedExerciseCategory,
        subMuscle: selectedSubMuscle
      });
    }

    // Fallback if engine script is still loading
    if (q) {
      return (e.name && e.name.toLowerCase().includes(q)) || 
             (e.sub && e.sub.toLowerCase().includes(q)) ||
             (e.category && e.category.toLowerCase().includes(q));
    }
    return e.category === selectedExerciseCategory;
  });

  if ($('#libFilterHeader')) {
    const currentSubText = selectedSubMuscle ? selectedSubMuscle.toUpperCase() : selectedExerciseCategory.toUpperCase();
    const locText = filterLocation === 'all' ? 'ALL LOCATIONS' : filterLocation.toUpperCase();
    $('#libFilterHeader').textContent = \`\${locText} · \${selectedExerciseCategory.toUpperCase()} · \${currentSubText}\`;
  }
  if ($('#libResultCount')) {
    $('#libResultCount').textContent = q ? \`\${filtered.length} matching moves\` : \`\${filtered.length} exercises targeting \${selectedSubMuscle || selectedExerciseCategory}\`;
  }

  const cardsContainer = $('#exerciseCardsContainer');
  if (cardsContainer) {
    if (filtered.length === 0) {
      // SMART EMPTY STATE WITH ALTERNATIVES
      cardsContainer.innerHTML = \`
        <div class="empty-state-card" style="grid-column: 1 / -1; padding: 40px 24px; text-align: center; background: var(--glass-surface); border: 1px dashed var(--glass-border); border-radius: 24px; margin: 16px 0;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🏋️‍♂️</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--glass-text-primary); margin-bottom: 8px;">No exercises match your current equipment filter</h3>
          <p style="font-size: 0.92rem; color: var(--glass-text-secondary); max-width: 540px; margin: 0 auto 20px; line-height: 1.5;">
            You have selected <b>\${filterLocation.toUpperCase()}</b> training targeting <b>\${escapeHtml(selectedExerciseCategory)} (\${escapeHtml(selectedSubMuscle)})</b>, but your active equipment set does not have the gear required for these exercises.
          </p>
          <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 24px;">
            <button type="button" class="solid-button" onclick="resetWorkoutFilters()" style="background:#2563eb;font-weight:700;font-size:0.85rem;padding:9px 18px;">
              Reset All Filters
            </button>
            <button type="button" class="outline-button" onclick="quickSelectAllHomeEquipment()" style="font-weight:700;font-size:0.85rem;padding:9px 18px;">
              Select All Home Gear
            </button>
            <button type="button" class="outline-button" onclick="quickSelectNoEquipment()" style="font-weight:700;font-size:0.85rem;padding:9px 18px;">
              Show Bodyweight Moves Only
            </button>
          </div>
          <div style="text-align: left; max-width: 600px; margin: 0 auto; background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.18); border-radius: 14px; padding: 14px 18px;">
            <div style="font-size: 0.8rem; font-weight: 800; color: #2563eb; text-transform: uppercase; margin-bottom: 6px;">💡 Smart Alternatives &amp; Recommendations</div>
            <ul style="font-size: 0.84rem; color: var(--glass-text-secondary); margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Try switching to <b>Full Body</b> or <b>Chest</b> to see genuine bodyweight push movements.</li>
              <li>Toggle <b>Bench</b> or <b>Dumbbells</b> in the equipment row above to unlock weighted exercises.</li>
              <li>Use the <b>Search bar</b> to find specific exercises by name across all categories.</li>
            </ul>
          </div>
        </div>
      \`;
    } else {
      cardsContainer.innerHTML = filtered.map(ex => {
        const meta = (engine && engine.resolveExerciseMetadata(ex)) || { canonicalEquipment: [ex.type || 'Bodyweight'], workoutTypes: ['strength'], alternatives: [] };
        return \`
        <article class="panel exercise-card" style="display:flex;flex-direction:column;justify-content:space-between;">
          \${ex.gif ? \`<div class="ex-card-gif-wrap"><img src="\${escapeHtml(ex.gif)}" alt="\${escapeHtml(ex.name)}" class="gif-img" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onload="this.classList.add('loaded')" onerror="this.closest('.ex-card-gif-wrap').style.display='none'"></div>\` : ''}
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:6px;flex-wrap:wrap;">
              <span class="exercise-type" style="display:inline-flex;align-items:center;gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/></svg>
                \${meta.canonicalEquipment.join(' + ')}
              </span>
              <span class="exercise-sub-tag">\${ex.sub || ex.muscle || ''}</span>
            </div>
            <h4 class="exercise-card-heading" onclick="openExerciseDetailModal('\${ex.name.replace(/'/g, "\\\\'")}')" title="Click to view visual illustration and full execution guide">
              \${ex.name}
            </h4>
            
            <!-- Scientific Prescription Box -->
            <div class="exercise-prescription-box" style="cursor:pointer;" onclick="openExerciseDetailModal('\${ex.name.replace(/'/g, "\\\\'")}')" title="Click for visual breakdown">
              <div class="rx-header">
                <span class="rx-sets-reps">\${ex.rxSetsReps || '3 sets × 8-10 reps · 90s rest'}</span>
                <span class="rx-tempo">\${ex.rxTempo || 'Tempo: 2-0-1'}</span>
              </div>
              <p class="rx-why"><b>Why this works:</b> \${ex.rxWhy || ex.benefit || 'Optimizes motor unit recruitment and progressive overload.'}</p>
            </div>

            \${meta.alternatives && meta.alternatives.length > 0 ? \`
              <div style="margin-top:8px;font-size:0.75rem;padding:6px 10px;background:rgba(22,199,154,0.08);border:1px solid rgba(22,199,154,0.25);border-radius:8px;color:#16C79A;">
                <b>Alt gear options:</b> \${meta.alternatives.slice(0, 2).join(', ')}
              </div>
            \` : ''}

            <p class="exercise-benefit" style="margin-top:8px;font-size:.84rem;color:var(--glass-text-secondary);"> \${ex.steps || ex.instructions_en || 'Execute with strict control throughout full range of motion.'}</p>
          </div>

          <div style="margin-top:14px;display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;gap:6px;">
              <button type="button" class="solid-button small" style="flex:1;background:#2563eb;justify-content:center;font-size:.78rem;padding:7px 6px;" onclick="startCustomExerciseTimer('\${ex.name.replace(/'/g, "\\\\'")}', '\${escapeHtml(ex.rxSetsReps || '3 sets × 10-12 reps')}', '60')">
                Start Set
              </button>
              <button type="button" class="outline-button small" style="flex:1;justify-content:center;font-size:.78rem;padding:7px 6px;" onclick="addExerciseToDailyRoutine('\${ex.name.replace(/'/g, "\\\\'")}', '\${escapeHtml(ex.rxSetsReps || '3 sets × 10-12 reps')}')">
                + Add to Workout
              </button>
            </div>
            <div style="display:flex;gap:6px;">
              <button type="button" class="outline-button small ex-btn-visual" style="flex:1;font-size:.75rem;padding:6px;color:var(--glass-text-secondary);" onclick="openExerciseDetailModal('\${ex.name.replace(/'/g, "\\\\'")}')">
                Visual Guide
              </button>
              <button type="button" class="outline-button small ex-btn-ai" style="flex:1;font-size:.75rem;padding:6px;color:var(--glass-text-secondary);" onclick="askAiAboutExercise('\${ex.name.replace(/'/g, "\\\\'")}', '\${(ex.sub || '').replace(/'/g, "\\\\'")}')">
                AI Coach
              </button>
            </div>
          </div>
        </article>
      \`;
      }).join('');
    }
  }
}

window.selectExerciseCategory = function(cat) {
  selectedExerciseCategory = cat;
  selectedSubMuscle = 'All ' + cat;
  if ($('#exerciseSearchInput')) $('#exerciseSearchInput').value = '';
  renderExerciseLibrary();
};

window.selectSubMuscle = function(sub) {
  selectedSubMuscle = sub;
  renderExerciseLibrary();
};

window.logExerciseCompleted = function(name) {
  workoutsDone.push({ name, date: today(), at: Date.now() });
  store.set('workoutsDone', workoutsDone);
  recordDailyActivity('workout');
  renderDashboard();
  toast(\`Great job! Completed "\${name}"\`);
};

window.askAiAboutExercise = function(name, sub) {
  openAiChat(\`What is the optimal biomechanical execution, sets, reps, and progression strategy for "\${name}" targeting \${sub}?\`);
};

if ($('#exerciseSearchInput')) {
  $('#exerciseSearchInput').oninput = () => renderExerciseLibrary();
}

`;

  js = js.substring(0, startIdx) + newExLibCode + js.substring(endIdx);
  fs.writeFileSync('public/fitfuel.js', js, 'utf8');
  console.log('✔ Replaced Exercise Library rendering logic in public/fitfuel.js');
} else {
  console.error('❌ Could not locate start/end markers for Exercise Library in fitfuel.js');
}

console.log('--- Workout Filter Upgrade applied successfully! ---');
