const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Update dashMetricsGridV2
const oldMetricsStart = '<!-- CARD 1: CALORIES -->';
const oldMetricsEnd = '<!-- CARD 3: WORKOUTS -->';

const newMetrics = `<!-- CARD 1: HYDRATION -->
          <div class="metric-card-v2" id="metricCardWaterTrigger" style="cursor:pointer;" title="Click to view hydration breakdown">
            <div class="metric-info">
              <span class="metric-label" style="display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:700;color:var(--ff-text-secondary);text-transform:uppercase;letter-spacing:.04em;">
                <span style="width:24px;height:24px;border-radius:50%;background:rgba(2,132,199,0.12);display:flex;align-items:center;justify-content:center;color:#0284c7;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                </span>
                Hydration
              </span>
              <div style="margin:6px 0 2px;">
                <span class="metric-val" id="metricV2WaterVal" style="font-size:1.65rem;font-weight:900;color:var(--ff-text-primary);letter-spacing:-.02em;">1.0</span>
                <span style="font-size:.86rem;color:var(--ff-text-muted);font-weight:600;"> / <span id="metricV2WaterGoalVal">2.8</span> L</span>
              </div>
              <span class="metric-sub" id="metricV2WaterSub" style="font-size:.76rem;color:#0284c7;font-weight:700;">1.8 L remaining · Optimal</span>
            </div>
            <div class="progress-circle-wrap" style="width:52px;height:52px;position:relative;">
              <svg viewBox="0 0 36 36" style="width:52px;height:52px;">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(207, 229, 255, 0.4)" stroke-width="3.5" />
                <path id="metricV2WaterCircle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0284c7" stroke-width="3.5" stroke-dasharray="36, 100" stroke-linecap="round" />
              </svg>
              <span class="pct-text" id="metricV2WaterPct" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:var(--ff-text-primary);">36%</span>
            </div>
          </div>

          <!-- CARD 2: ACTIVE ENERGY -->
          <div class="metric-card-v2" id="metricCardEnergyTrigger" style="cursor:pointer;" title="Click to view activity details">
            <div class="metric-info">
              <span class="metric-label" style="display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:700;color:var(--ff-text-secondary);text-transform:uppercase;letter-spacing:.04em;">
                <span style="width:24px;height:24px;border-radius:50%;background:rgba(245,158,11,0.12);display:flex;align-items:center;justify-content:center;color:#f59e0b;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                </span>
                Active Burn
              </span>
              <div style="margin:6px 0 2px;">
                <span class="metric-val" id="metricV2EnergyVal" style="font-size:1.65rem;font-weight:900;color:var(--ff-text-primary);letter-spacing:-.02em;">420</span>
                <span style="font-size:.86rem;color:var(--ff-text-muted);font-weight:600;"> kcal</span>
              </div>
              <span class="metric-sub" id="metricV2EnergySub" style="font-size:.76rem;color:#f59e0b;font-weight:700;">Daily Movement &amp; Workout</span>
            </div>
            <div class="progress-circle-wrap" style="width:52px;height:52px;position:relative;">
              <svg viewBox="0 0 36 36" style="width:52px;height:52px;">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(207, 229, 255, 0.4)" stroke-width="3.5" />
                <path id="metricV2EnergyCircle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="70, 100" stroke-linecap="round" />
              </svg>
              <span class="pct-text" id="metricV2EnergyPct" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:var(--ff-text-primary);">70%</span>
            </div>
          </div>\n\n          `;

const sm = html.indexOf(oldMetricsStart);
const em = html.indexOf(oldMetricsEnd);
if (sm !== -1 && em !== -1) {
  html = html.substring(0, sm) + newMetrics + html.substring(em);
  console.log('1. Updated dashMetricsGridV2 to Hydration & Active Burn');
} else {
  console.log('Error updating metrics grid');
}

// 2. In dashAnalyticsRowV2: replace Card 1 (Calorie Intake) and Card 2 (Macro Distribution) with Water Intake Panel!
const oldAnalyticsStart = '<div class="dash-analytics-row-v2" id="dashAnalyticsRowV2">\n          <!-- CARD 1: CALORIE INTAKE VS GOAL (BAR CHART) -->';
const oldAnalyticsEnd = '<!-- CARD 3: 3D BODY COMPOSITION & ANATOMY -->';

const newWaterInAnalytics = `<div class="dash-analytics-row-v2" id="dashAnalyticsRowV2">
          <!-- CARD 1: DAILY HYDRATION ARCHITECTURE & WATER INTAKE -->
          <article class="panel water-panel" id="todayWaterIntakePanel" style="padding:20px 22px;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div class="panel-heading" style="margin-bottom:12px;">
                <div>
                  <span class="section-kicker" style="color:#0284c7;font-weight:800;letter-spacing:0.05em;">DAILY HYDRATION ARCHITECTURE</span>
                  <h3 style="font-size:1.15rem;font-weight:800;color:var(--ff-text-primary);margin:2px 0 0;">Water Intake &amp; Balance</h3>
                </div>
                <button class="quiet-icon" aria-label="Reset water intake" id="resetWaterBtn" title="Reset water intake" style="cursor:pointer;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path>
                  </svg>
                </button>
              </div>

              <!-- FRONT SCREEN DAILY WATER ESTIMATE & WEATHER ADVISORY -->
              <div class="front-water-advisory-card" id="frontWaterAdvisoryCard" style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                  <div>
                    <span style="font-size:.72rem;font-weight:800;color:#1d4ed8;text-transform:uppercase;letter-spacing:.05em;">PERSONALIZED HYDRATION TARGET</span>
                    <div style="font-size:1.25rem;font-weight:900;color:var(--glass-text-primary);margin-top:2px;">
                      Target: <span id="frontCalculatedWaterL">2.8</span> L / day
                    </div>
                  </div>
                  <button type="button" class="header-weather-temp" id="frontWeatherBadgeBtn" title="Click to adjust climate temperature" style="cursor:pointer;">
                    <span id="frontWeatherIcon">☀️</span> <span id="frontWeatherTemp">29°C</span> · <span id="frontWeatherLabel">Warm</span>
                  </button>
                </div>

                <!-- Interactive Creatine Input & Weather Breakdown -->
                <div class="front-water-breakdown-row" style="margin-top:10px;">
                  <div class="front-water-pill">
                    <span>Base Demand</span>
                    <b id="waterBreakdownBase">2.4 L</b>
                  </div>
                  <div class="front-water-pill">
                    <span>Creatine Added</span>
                    <div style="display:flex;align-items:center;gap:4px;margin-top:3px;">
                      <input type="number" id="frontCreatineGramsInput" min="0" max="30" step="1" value="5" style="width:48px;padding:2px 4px;font-weight:800;border:1.5px solid #cbd5e1;border-radius:6px;font-size:.85rem;color:var(--glass-text-primary);background:#fff;" title="Grams of creatine taken today" />
                      <span style="font-size:.74rem;font-weight:700;color:var(--glass-text-secondary);">g (<span id="waterBreakdownCreatine">+500</span>ml)</span>
                    </div>
                  </div>
                  <div class="front-water-pill">
                    <span>Weather Impact</span>
                    <b id="waterBreakdownWeather">+250 ml (Warm)</b>
                  </div>
                  <div class="front-water-pill">
                    <span>Workout Demand</span>
                    <b id="waterBreakdownWorkout">+300 ml</b>
                  </div>
                </div>
              </div>

              <!-- Water Readout & Progress -->
              <div class="water-readout" style="display:flex;align-items:baseline;justify-content:space-between;margin:12px 0 8px;">
                <div>
                  <strong id="waterDisplay" style="font-size:1.85rem;font-weight:900;color:#0284c7;">1.0<small style="font-size:1rem;color:var(--ff-text-muted);"> L</small></strong>
                  <span style="font-size:0.85rem;color:var(--ff-text-secondary);margin-left:6px;">of <span id="waterGoalDisplay">2.8</span> L goal</span>
                </div>
                <!-- Quick Log Action Pills -->
                <div style="display:flex;gap:6px;">
                  <button type="button" class="solid-button small" id="quickAddWater250Btn" style="padding:4px 10px;font-size:0.75rem;background:rgba(2,132,199,0.12);color:#0284c7;border:1px solid rgba(2,132,199,0.3);border-radius:99px;" title="Quick log one 250ml glass">+250 ml</button>
                  <button type="button" class="solid-button small" id="quickAddWater500Btn" style="padding:4px 10px;font-size:0.75rem;background:#0284c7;color:#fff;border:none;border-radius:99px;" title="Quick log a 500ml shaker">+500 ml</button>
                </div>
              </div>

              <!-- 12 Interactive Water Glasses -->
              <div class="water-cups" id="waterCups" style="margin:10px 0;">
                <!-- Dynamically populated 12 cups with glass SVG -->
              </div>
            </div>

            <div class="water-foot" style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:0.76rem;color:var(--ff-text-muted);">Smart dynamic tracking (250 ml / glass)</span>
              <button type="button" id="adjustWaterBtn" style="cursor:pointer;background:none;border:none;color:#0284c7;font-weight:700;font-size:0.82rem;display:inline-flex;align-items:center;gap:4px;">
                Adjust Climate / Target
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </article>\n\n          `;

const sa = html.indexOf(oldAnalyticsStart);
const ea = html.indexOf(oldAnalyticsEnd);
if (sa !== -1 && ea !== -1) {
  html = html.substring(0, sa) + newWaterInAnalytics + html.substring(ea);
  console.log('2. Moved Water Panel into dashAnalyticsRowV2 in place of nutrition cards');
} else {
  console.log('Error updating analytics row');
}

// 3. Update dashBottomGridV2: replace food tasks with daily fitness and health habits
const oldTasksStart = '<h3 style="font-size:1.05rem;font-weight:800;margin:0;">Today\'s Plan</h3>';
const oldTasksEnd = '<!-- 2. RECENT ACTIVITY -->';

const newTasks = `<h3 style="font-size:1.05rem;font-weight:800;margin:0;">Today's Plan</h3>
              <span style="font-size:0.75rem;color:#16c79a;font-weight:700;">4 Tasks</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <!-- Task 1 -->
              <div class="plan-item-v2" style="padding:8px 10px;border-radius:10px;background:var(--glass-surface-subtle);border:1px solid var(--glass-border-subtle);display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.84rem;font-weight:600;display:flex;align-items:center;gap:8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Morning Hydration (500 ml water)
                </span>
                <span style="font-size:0.7rem;background:rgba(2,132,199,0.15);color:#0284c7;padding:2px 7px;border-radius:99px;font-weight:800;">DONE</span>
              </div>
              <!-- Task 2 -->
              <div class="plan-item-v2" style="padding:8px 10px;border-radius:10px;background:var(--glass-surface-subtle);border:1px solid var(--glass-border-subtle);display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.84rem;font-weight:600;display:flex;align-items:center;gap:8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16C79A" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Mobility &amp; Dynamic Core Warmup
                </span>
                <span style="font-size:0.7rem;background:rgba(22,199,154,0.15);color:var(--glass-accent-mint);padding:2px 7px;border-radius:99px;font-weight:800;">DONE</span>
              </div>
              <!-- Task 3 -->
              <div class="plan-item-v2" style="padding:8px 10px;border-radius:10px;background:var(--glass-surface-subtle);border:1px solid var(--glass-border-subtle);display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.84rem;font-weight:600;display:flex;align-items:center;gap:8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                  Workout: Back &amp; Biceps Hypertrophy
                </span>
                <span style="font-size:0.7rem;background:rgba(37,99,235,0.12);color:#2563eb;padding:2px 7px;border-radius:99px;font-weight:800;">IN PROGRESS</span>
              </div>
              <!-- Task 4 -->
              <div class="plan-item-v2" style="padding:8px 10px;border-radius:10px;background:var(--glass-surface-subtle);border:1px solid var(--glass-border-subtle);display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.84rem;font-weight:600;display:flex;align-items:center;gap:8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                  Evening Posture Recovery &amp; Walk
                </span>
                <span style="font-size:0.7rem;color:var(--ff-text-muted);font-weight:600;">UPCOMING</span>
              </div>
            </div>
          </div>\n\n          `;

const st = html.indexOf(oldTasksStart);
const et = html.indexOf(oldTasksEnd);
if (st !== -1 && et !== -1) {
  html = html.substring(0, st) + newTasks + html.substring(et);
  console.log('3. Updated Today\'s Plan tasks to fitness & hydration');
} else {
  console.log('Error updating tasks');
}

// 4. In dashboard-grid: now that water-panel is moved to middle row, replace old water-panel with AI Posture & Motion panel
const oldGridStart = '<div class="dashboard-grid">\n          <!-- CALORIES PANEL -->\n          <!-- WATER PANEL -->\n          <article class="panel water-panel">';
const oldGridEnd = '<!-- WORKOUT PANEL -->';

const newPosturePanelInGrid = `<div class="dashboard-grid">
          <!-- AI MOTION & POSTURE PREVIEW PANEL -->
          <article class="panel posture-ai-preview-panel" style="padding:20px 22px;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div class="panel-heading" style="margin-bottom:12px;">
                <div>
                  <span class="section-kicker" style="color:#8b5cf6;font-weight:800;letter-spacing:0.05em;">AI MOTION &amp; REPS</span>
                  <h3 style="font-size:1.15rem;font-weight:800;color:var(--ff-text-primary);margin:2px 0 0;">Posture AI Form Detector</h3>
                </div>
                <span class="card-dropdown-pill" style="background:rgba(139,92,246,0.12);color:#8b5cf6;font-weight:700;">IR Rep Track</span>
              </div>

              <div style="background:var(--glass-surface-subtle);border:1px solid var(--glass-border-subtle);border-radius:12px;padding:14px;margin-bottom:14px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:38px;height:38px;border-radius:10px;background:rgba(139,92,246,0.15);display:flex;align-items:center;justify-content:center;color:#8b5cf6;flex-shrink:0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <b style="font-size:0.92rem;color:var(--ff-text-primary);display:block;">Precision Form Guidance</b>
                    <span style="font-size:0.78rem;color:var(--ff-text-secondary);display:block;line-height:1.4;">
                      Computer-vision posture scoring, infrared-accuracy rep counting, and audio feedback.
                    </span>
                  </div>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">
                  <span style="font-size:.72rem;background:rgba(37,99,235,0.1);color:#2563eb;padding:2px 8px;border-radius:99px;font-weight:700;">Barbell Squats</span>
                  <span style="font-size:.72rem;background:rgba(22,199,154,0.1);color:#16c79a;padding:2px 8px;border-radius:99px;font-weight:700;">Push-ups</span>
                  <span style="font-size:.72rem;background:rgba(139,92,246,0.1);color:#8b5cf6;padding:2px 8px;border-radius:99px;font-weight:700;">Lunges</span>
                  <span style="font-size:.72rem;background:rgba(245,158,11,0.1);color:#f59e0b;padding:2px 8px;border-radius:99px;font-weight:700;">Plank Hold</span>
                </div>
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
              <span style="font-size:0.76rem;color:var(--ff-text-muted);">Real-time camera form evaluation</span>
              <button type="button" class="solid-button small" id="todayLaunchPostureBtn" onclick="switchView('posture');" style="background:#8b5cf6;color:#fff;border-radius:99px;padding:6px 14px;font-weight:700;font-size:0.8rem;cursor:pointer;">
                Launch Posture AI →
              </button>
            </div>
          </article>\n\n          `;

// Replace from old water panel up to workout panel
const oldWaterArticleStart = html.indexOf('<div class="dashboard-grid">\n          <!-- CALORIES PANEL -->');
const oldWorkoutArticleStart = html.indexOf('<!-- WORKOUT PANEL -->');

if (oldWaterArticleStart !== -1 && oldWorkoutArticleStart !== -1) {
  html = html.substring(0, oldWaterArticleStart) + newPosturePanelInGrid + html.substring(oldWorkoutArticleStart);
  console.log('4. Replaced bottom water panel with Posture AI panel');
} else {
  console.log('Error replacing bottom water panel');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('File written part 2 successfully');
