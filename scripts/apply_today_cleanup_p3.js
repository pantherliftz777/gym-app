const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. In dashAnalyticsRowV2: replace from CARD 1 up to CARD 3 with Water Intake Panel
const startTag = 'id="dashAnalyticsRowV2"';
const card1Marker = '<!-- CARD 1: CALORIE INTAKE VS GOAL';
const card3Marker = '<!-- CARD 3: 3D BODY COMPOSITION & ANATOMY -->';

const idxStart = html.indexOf(card1Marker);
const idxEnd = html.indexOf(card3Marker);

console.log('idxStart:', idxStart, 'idxEnd:', idxEnd);

const newWaterInAnalytics = `<!-- CARD 1: DAILY HYDRATION ARCHITECTURE & WATER INTAKE -->
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
                  <button type="button" class="solid-button small" id="quickAddWater250Btn" style="padding:4px 10px;font-size:0.75rem;background:rgba(2,132,199,0.12);color:#0284c7;border:1px solid rgba(2,132,199,0.3);border-radius:99px;cursor:pointer;" title="Quick log one 250ml glass">+250 ml</button>
                  <button type="button" class="solid-button small" id="quickAddWater500Btn" style="padding:4px 10px;font-size:0.75rem;background:#0284c7;color:#fff;border:none;border-radius:99px;cursor:pointer;" title="Quick log a 500ml shaker">+500 ml</button>
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
          </article>\r\n\r\n          `;

if (idxStart !== -1 && idxEnd !== -1) {
  html = html.substring(0, idxStart) + newWaterInAnalytics + html.substring(idxEnd);
  console.log('Replaced Card 1 and Card 2 with Water Panel in dashAnalyticsRowV2');
}

// 2. In dashboard-grid: replace old water-panel with Posture AI panel
const oldGridWaterMarker = '<!-- CALORIES PANEL -->';
const gridStartIdx = html.indexOf(oldGridWaterMarker);
const workoutMarker = '<!-- WORKOUT PANEL -->';
const gridWorkoutIdx = html.indexOf(workoutMarker);

console.log('gridStartIdx:', gridStartIdx, 'gridWorkoutIdx:', gridWorkoutIdx);

const newPosturePanelInGrid = `<!-- AI MOTION & POSTURE PREVIEW PANEL -->
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
          </article>\r\n\r\n          `;

if (gridStartIdx !== -1 && gridWorkoutIdx !== -1) {
  html = html.substring(0, gridStartIdx) + newPosturePanelInGrid + html.substring(gridWorkoutIdx);
  console.log('Replaced bottom water panel with Posture AI panel');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Saved index.html successfully!');
