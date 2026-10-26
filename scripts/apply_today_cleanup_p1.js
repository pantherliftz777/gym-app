const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Update sy-athlete-hero side cards: replace calories and protein with hydration and consistency streak
const oldSideCardsStart = '<!-- Right side metric cards column: Calories, Workout, Protein stacked neatly ON THE SIDE -->';
const oldSideCardsEnd = '<!-- QUICK ACCESS NAVIGATION PILLS (MATCHING IMAGE 3) -->';

const newSideCards = `<!-- Right side metric cards column: Hydration, Workout, Streak stacked neatly ON THE SIDE -->
            <div class="sy-hero-metrics-col">
              <div class="sy-metrics-stack">
                <!-- Side Card 1: Hydration -->
                <div class="sy-side-card sy-card-water" id="syFloatWaterTrigger" role="button" tabindex="0" title="Click to view hydration details">
                  <div class="sy-scard-left">
                    <div class="sy-scard-icon-badge water" style="background:rgba(2,132,199,0.12);color:#0284c7;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                      </svg>
                    </div>
                    <div class="sy-card-info">
                      <span class="sy-card-label">Hydration</span>
                      <b class="sy-card-val"><span id="syHeroWaterCurrent">1.0</span> / <span id="syHeroWaterTarget">2.8</span> <small>L</small></b>
                    </div>
                  </div>
                  <div class="sy-scard-right">
                    <div class="sy-card-ring-box">
                      <svg class="sy-circle-chart" viewBox="0 0 36 36" width="44" height="44">
                        <path class="sy-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(2,132,199,0.12)" stroke-width="3.5"/>
                        <path class="sy-circle-fill sy-cyan-stroke" stroke-dasharray="40, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round"/>
                      </svg>
                      <span class="sy-ring-pct" style="color:#0284c7;" id="syHeroWaterPct">40%</span>
                    </div>
                    <button type="button" class="sy-scard-menu-dots" aria-label="More options">•••</button>
                  </div>
                </div>

                <!-- Side Card 2: Workout -->
                <div class="sy-side-card sy-card-workout" id="syFloatWorkoutTrigger" role="button" tabindex="0" title="Click to open Back &amp; Biceps workout">
                  <div class="sy-scard-left">
                    <div class="sy-scard-icon-badge workout">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"/>
                      </svg>
                    </div>
                    <div class="sy-card-info">
                      <span class="sy-card-label">Workout</span>
                      <b class="sy-card-val" id="syHeroWorkoutName">Back &amp; Biceps</b>
                    </div>
                  </div>
                  <div class="sy-scard-right">
                    <button type="button" class="sy-card-arrow-btn" aria-label="Open Workout">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Side Card 3: Consistency Streak -->
                <div class="sy-side-card sy-card-streak" id="syFloatStreakTrigger" role="button" tabindex="0" title="Click to view habit streak tracking">
                  <div class="sy-scard-left">
                    <div class="sy-scard-icon-badge streak" style="background:rgba(245,158,11,0.12);color:#f59e0b;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                      </svg>
                    </div>
                    <div class="sy-card-info">
                      <span class="sy-card-label">Consistency</span>
                      <b class="sy-card-val"><span id="syHeroStreakDays">12</span> <small>Days Active</small></b>
                    </div>
                  </div>
                  <div class="sy-scard-right">
                    <div class="sy-card-ring-box">
                      <svg class="sy-circle-chart" viewBox="0 0 36 36" width="44" height="44">
                        <path class="sy-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(245,158,11,0.12)" stroke-width="3.5"/>
                        <path class="sy-circle-fill sy-amber-stroke" stroke-dasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
                      </svg>
                      <span class="sy-ring-pct" style="color:#f59e0b;">85%</span>
                    </div>
                    <button type="button" class="sy-scard-menu-dots" aria-label="More options">•••</button>
                  </div>
                </div>
              </div>
            </div>
          </div>\n\n          `;

const s1 = html.indexOf(oldSideCardsStart);
const e1 = html.indexOf(oldSideCardsEnd);
if (s1 !== -1 && e1 !== -1) {
  html = html.substring(0, s1) + newSideCards + html.substring(e1);
  console.log('1. Updated sy-athlete-hero side cards');
} else {
  console.log('Error finding side cards');
}

// 2. Update syQuickFoodBtn to syQuickWaterBtn
html = html.replace(
  '<button type="button" class="sy-quick-pill" id="syQuickFoodBtn">\n              <span class="sy-pill-icon blue">\n                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\n                  <path d="M18 2v20M6 2v6a3 3 0 0 0 6 0V2"/>\n                </svg>\n              </span>\n              <span>Food Analysis</span>',
  '<button type="button" class="sy-quick-pill" id="syQuickWaterBtn">\n              <span class="sy-pill-icon blue">\n                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\n                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>\n                </svg>\n              </span>\n              <span>Hydration Tracker</span>'
);

// 3. Update syBottomCardNutrition to syBottomCardWater
const oldCard2Start = '<!-- Card 2: Calorie & Nutrition (Mint theme) -->';
const oldCard2End = '<!-- Card 3: Progress Tracking (Blue theme) -->';
const newCard2 = `<!-- Card 2: Hydration Engine (Cyan/Blue theme) -->
            <div class="sy-bottom-card sy-card-cyan" id="syBottomCardWater" role="button" tabindex="0">
              <div class="sy-bcard-top-row">
                <button type="button" class="sy-bcard-menu-dots" aria-label="Options">•••</button>
              </div>
              <div class="sy-bcard-center">
                <div class="sy-bcard-big-badge cyan" style="background:rgba(2,132,199,0.12);color:#0284c7;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                </div>
                <h3 class="sy-bcard-title">Hydration Architecture</h3>
                <p class="sy-bcard-sub">Daily water calculation, weather adaptation &amp; creatine support</p>
              </div>
              <div class="sy-bcard-bottom-row">
                <button type="button" class="sy-bcard-action-btn cyan" aria-label="Go to Hydration Tracker" style="background:#0284c7;color:#fff;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
                <svg class="sy-bcard-wave" viewBox="0 0 160 36" fill="none">
                  <path d="M0 26 C 40 22, 80 34, 120 18 C 140 12, 150 16, 160 22" stroke="#0284c7" stroke-width="2.8" stroke-linecap="round"/>
                </svg>
              </div>
            </div>\n\n            `;

const s2 = html.indexOf(oldCard2Start);
const e2 = html.indexOf(oldCard2End);
if (s2 !== -1 && e2 !== -1) {
  html = html.substring(0, s2) + newCard2 + html.substring(e2);
  console.log('2. Updated bottom feature card 2 to Hydration');
} else {
  console.log('Error finding card 2');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('File written part 1');
