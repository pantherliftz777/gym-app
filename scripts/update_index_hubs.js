const fs = require('fs');

const htmlPath = 'public/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace the primary-nav in sidebar
const oldNavRegex = /<nav class="primary-nav"[\s\S]*?<\/nav>/;
const newNav = `<nav class="primary-nav" aria-label="Main navigation">
      <button class="nav-link selected" data-view="today">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>
        </svg>
        <span>Today</span>
        <span class="nav-active-dot"></span>
      </button>

      <!-- DEDICATED AI FITNESS COACH -->
      <button class="nav-link" data-view="ai-coach" id="sidebarAiCoachBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.08 6.25 5 7.42V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.58c2.92-1.17 5-4.05 5-7.42a8 8 0 0 0-8-8z"></path>
          <path d="M9 10h.01"></path><path d="M15 10h.01"></path>
        </svg>
        <span>AI Coach</span>
        <span style="font-size:0.62rem;background:rgba(22,199,154,0.18);color:#16C79A;padding:2px 6px;border-radius:99px;margin-left:auto;font-weight:800;border:1px solid rgba(22,199,154,0.35);">LIVE</span>
      </button>

      <!-- DEDICATED AI BODY ANALYSIS -->
      <button class="nav-link" data-view="body-analysis" id="sidebarBodyAnalysisBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="5" r="3"></circle>
          <path d="M12 8v8"></path>
          <path d="m8 12 4 1 4-1"></path>
          <path d="m9 21 3-5 3 5"></path>
        </svg>
        <span>Body Analysis</span>
        <span style="font-size:0.62rem;background:rgba(2,132,199,0.18);color:#0284c7;padding:2px 6px;border-radius:99px;margin-left:auto;font-weight:800;border:1px solid rgba(2,132,199,0.35);">AI SCAN</span>
      </button>

      <!-- CONSOLIDATED WORKOUTS & EXERCISES HUB -->
      <button class="nav-link" data-view="workouts" id="sidebarWorkoutsBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path>
          <path d="m2.5 21.5 1.4-1.4"></path><path d="m20.1 3.9 1.4-1.4"></path>
          <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path>
          <path d="m9.6 14.4 4.8-4.8"></path>
        </svg>
        <span>Workouts &amp; Exercises</span>
      </button>

      <!-- CONSOLIDATED NUTRITION & DIET HUB -->
      <button class="nav-link" data-view="food-log" id="sidebarNutritionBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
        <span>Nutrition &amp; Diet</span>
      </button>

      <!-- CAMERA-BASED AI POSTURE TRACKER & FORM CHECKER -->
      <button class="nav-link" data-view="posture" id="sidebarPostureBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <span>Posture AI</span>
      </button>

      <!-- LIVE ACTIVITY & GPS TRACKER -->
      <button class="nav-link" data-view="activity" id="sidebarActivityBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>
        <span>Activity &amp; GPS</span>
      </button>

      <!-- TRACKING & ANALYTICS -->
      <button class="nav-link" data-view="tracking" id="sidebarTrackingBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
        <span>Tracking</span>
      </button>

      <!-- USER PROFILE -->
      <button class="nav-link" data-view="profile" id="sidebarProfileBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 17H5"></path><path d="M19 7h-9"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>
        </svg>
        <span>Profile</span>
      </button>

      <!-- CUSTOMIZATION PANEL -->
      <button class="nav-link" data-view="customization" id="sidebarCustomizationBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>Customization</span>
      </button>

      <!-- Dedicated Admin Portal Navigation Link (Shown for Admins) -->
      <button class="nav-link admin-only-link" data-view="admin" id="sidebarAdminNavBtn" style="display:none;color:#38bdf8;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <span>Admin Portal</span>
        <span style="font-size:0.65rem;background:#1e3a8a;color:#38bdf8;padding:2px 7px;border-radius:99px;margin-left:auto;font-weight:800;border:1px solid #38bdf8;">ADMIN</span>
      </button>
    </nav>`;

if (oldNavRegex.test(html)) {
  html = html.replace(oldNavRegex, newNav);
  console.log('Sidebar primary-nav updated.');
} else {
  console.error('Could not find primary-nav in index.html');
}

// 2. Hub HTML templates
const workoutHubHtml = `
        <!-- WORKOUTS & EXERCISES UNIFIED HUB TAB BAR -->
        <div class="hub-tabs-container">
          <div class="hub-segmented-control" role="tablist" aria-label="Workouts &amp; Exercises Navigation">
            <button type="button" class="hub-tab-btn" data-hub-target="workouts" role="tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path><path d="m2.5 21.5 1.4-1.4"></path><path d="m20.1 3.9 1.4-1.4"></path><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path><path d="m9.6 14.4 4.8-4.8"></path></svg>
              <span>Training Plans</span>
            </button>
            <button type="button" class="hub-tab-btn" data-hub-target="challenge" role="tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
              <span>Challenges</span>
              <span class="hub-tab-badge">30D</span>
            </button>
            <button type="button" class="hub-tab-btn" data-hub-target="starting-load" role="tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              <span>Smart Start</span>
            </button>
            <button type="button" class="hub-tab-btn" data-hub-target="exercise-library" role="tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
              <span>Exercise Library</span>
              <span class="hub-tab-badge">1,318+</span>
            </button>
          </div>
        </div>`;

const nutritionHubHtml = `
        <!-- NUTRITION & DIET UNIFIED HUB TAB BAR -->
        <div class="hub-tabs-container">
          <div class="hub-segmented-control" role="tablist" aria-label="Nutrition &amp; Diet Navigation">
            <button type="button" class="hub-tab-btn" data-hub-target="food-log" role="tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
              <span>Daily Food Log</span>
            </button>
            <button type="button" class="hub-tab-btn" data-hub-target="my-foods" role="tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.528V3a1 1 0 0 1 1-1h0"></path><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"></path></svg>
              <span>My Foods &amp; Custom</span>
            </button>
            <button type="button" class="hub-tab-btn" data-hub-target="food-log" data-tab-action="open-recipes" role="tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" y1="17" x2="18" y2="17"></line></svg>
              <span>Fitness Recipes</span>
            </button>
            <button type="button" class="hub-tab-btn" data-hub-target="food-log" data-tab-action="open-water" role="tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
              <span>Hydration Tracker</span>
            </button>
          </div>
        </div>`;

// Insert workoutHubHtml at top of #view-workouts, #view-challenge, #view-starting-load, #view-exercise-library
const workoutViews = ['id="view-workouts"', 'id="view-challenge"', 'id="view-starting-load"', 'id="view-exercise-library"'];
workoutViews.forEach(vId => {
  const idx = html.indexOf(vId);
  if (idx !== -1) {
    const afterOpenTag = html.indexOf('>', idx) + 1;
    // Check if hub is already added
    if (!html.slice(afterOpenTag, afterOpenTag + 300).includes('hub-tabs-container')) {
      html = html.slice(0, afterOpenTag) + '\n' + workoutHubHtml + '\n' + html.slice(afterOpenTag);
      console.log('Added workoutHubHtml to ' + vId);
    }
  }
});

// Insert nutritionHubHtml at top of #view-food-log, #view-my-foods
const foodViews = ['id="view-food-log"', 'id="view-my-foods"'];
foodViews.forEach(vId => {
  const idx = html.indexOf(vId);
  if (idx !== -1) {
    const afterOpenTag = html.indexOf('>', idx) + 1;
    if (!html.slice(afterOpenTag, afterOpenTag + 300).includes('hub-tabs-container')) {
      html = html.slice(0, afterOpenTag) + '\n' + nutritionHubHtml + '\n' + html.slice(afterOpenTag);
      console.log('Added nutritionHubHtml to ' + vId);
    }
  }
});

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Updated index.html successfully.');
