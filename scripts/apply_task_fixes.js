const fs = require('fs');
const path = require('path');

// 1. UPDATE index.html
let html = fs.readFileSync('public/index.html', 'utf8');

// Replace sidebar navigation block
const sbStart = html.indexOf('<aside class="sidebar" id="sidebar">');
const sbEnd = html.indexOf('<div class="sidebar-bottom">', sbStart);

if (sbStart !== -1 && sbEnd !== -1) {
  const newSidebarHtml = `<aside class="sidebar" id="sidebar">
    <!-- Brand / Logo Section (Slid higher) -->
    <div class="sidebar-brand-wrapper">
      <div class="brand">
        <span class="brand-mark">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16c79a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity">
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
          </svg>
        </span>
        <span class="brand-title">Fit<span class="mint" style="color:#16c79a;font-weight:900;">Fuel</span></span>
      </div>
    </div>

    <!-- Partition divider line below logo & brand -->
    <div class="sidebar-partition-line"></div>

    <!-- Three lines toggle button bar -->
    <div class="sidebar-control-bar">
      <button type="button" class="sidebar-collapse-toggle-btn" id="sidebarCollapseToggleBtn" title="Toggle Your Space (Click to stabilize/close, hover to preview)" aria-label="Toggle navigation">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <span class="sidebar-space-title">YOUR SPACE</span>
    </div>

    <!-- Smoothly scrollable primary navigation -->
    <nav class="primary-nav" id="sidebarPrimaryNav" aria-label="Main navigation">
      <!-- 1. OVERVIEW -->
      <div class="nav-group-header">OVERVIEW</div>
      <button class="nav-link selected" data-view="today" id="sidebarTodayBtn" title="Today Overview">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>
        </svg>
        <span>Today</span>
        <span class="nav-active-dot"></span>
      </button>

      <!-- 2. AI & MOTION -->
      <div class="nav-group-header">AI &amp; MOTION</div>
      <button class="nav-link" data-view="ai-coach" id="sidebarAiCoachBtn" title="AI Fitness Coach">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.08 6.25 5 7.42V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.58c2.92-1.17 5-4.05 5-7.42a8 8 0 0 0-8-8z"></path>
          <path d="M9 10h.01"></path><path d="M15 10h.01"></path>
        </svg>
        <span>AI Coach</span>
        <span class="nav-badge-pill live">LIVE</span>
      </button>

      <button class="nav-link" data-view="posture" id="sidebarPostureBtn" title="Camera Posture AI">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <span>Posture AI</span>
      </button>

      <button class="nav-link" data-view="activity" id="sidebarActivityBtn" title="Activity & GPS Tracker">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>
        <span>Activity &amp; GPS</span>
      </button>

      <button class="nav-link" data-view="body-analysis" id="sidebarBodyAnalysisBtn" title="AI Body Analysis & Scan">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="5" r="3"></circle>
          <path d="M12 8v8"></path>
          <path d="m8 12 4 1 4-1"></path>
          <path d="m9 21 3-5 3 5"></path>
        </svg>
        <span>Body Analysis</span>
        <span class="nav-badge-pill scan">AI SCAN</span>
      </button>

      <!-- 3. TRAINING -->
      <div class="nav-group-header">TRAINING</div>
      <button class="nav-link" data-view="workouts" id="sidebarWorkoutsBtn" title="Workouts & Training Plans">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path>
          <path d="m2.5 21.5 1.4-1.4"></path><path d="m20.1 3.9 1.4-1.4"></path>
          <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path>
          <path d="m9.6 14.4 4.8-4.8"></path>
        </svg>
        <span>Workouts</span>
      </button>

      <button class="nav-link" data-view="exercise-library" id="sidebarExerciseLibraryBtn" title="Exercise Library">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        <span>Exercise library</span>
      </button>

      <button class="nav-link" data-view="starting-load" id="sidebarSmartStartBtn" title="Smart Start Calculator">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 2 10 5-10 5-10-5Z"></path>
          <path d="m2 12 10 5 10-5"></path>
          <path d="m2 17 10 5 10-5"></path>
        </svg>
        <span>Smart Start</span>
      </button>

      <!-- 4. NUTRITION -->
      <div class="nav-group-header">NUTRITION</div>
      <button class="nav-link" data-view="food-log" id="sidebarFoodLogBtn" title="Daily Food Log">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
        <span>Food log</span>
      </button>

      <button class="nav-link" data-view="my-foods" id="sidebarMyFoodsBtn" title="My Foods & Custom Recipes">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
          <path d="M10 2c1 .5 2 2 2 5"></path>
        </svg>
        <span>My foods</span>
      </button>

      <!-- 5. OTHER -->
      <div class="nav-group-header">OTHER</div>
      <button class="nav-link" data-view="challenge" id="sidebarChallengeBtn" title="30-Day Fitness Challenge">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
        <span>Challenge</span>
      </button>

      <button class="nav-link" data-view="tracking" id="sidebarTrackingBtn" title="Progress & Body Tracking">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
        <span>Tracking</span>
      </button>

      <button class="nav-link" data-view="customization" id="sidebarCustomizationBtn" title="Settings & Customization">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>Customization</span>
      </button>

      <!-- Admin Portal (Shown for Admins) -->
      <button class="nav-link admin-only-link" data-view="admin" id="sidebarAdminNavBtn" style="display:none;color:#38bdf8;" title="Admin Portal">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <span>Admin Portal</span>
        <span class="nav-badge-pill admin">ADMIN</span>
      </button>
    </nav>
`;
  html = html.slice(0, sbStart) + newSidebarHtml + html.slice(sbEnd);
  console.log('Successfully updated Sidebar HTML!');
} else {
  console.error('Could not locate sidebar in index.html');
}

// 2. Remove calories-panel and meals-panel in Today View
const dashGridIdx = html.indexOf('<div class="dashboard-grid">');
const calPanelIdx = html.indexOf('<article class="panel calories-panel">', dashGridIdx);
const waterPanelIdx = html.indexOf('<!-- WATER PANEL -->', dashGridIdx);
const mealsPanelIdx = html.indexOf('<!-- MEALS & SNACKS PANEL -->', dashGridIdx);
const workoutPanelIdx = html.indexOf('<!-- WORKOUT PANEL -->', dashGridIdx);

if (calPanelIdx !== -1 && waterPanelIdx !== -1 && mealsPanelIdx !== -1 && workoutPanelIdx !== -1) {
  // Remove calories-panel: from calPanelIdx to waterPanelIdx
  html = html.slice(0, calPanelIdx) + html.slice(waterPanelIdx);
  
  // Re-find mealsPanel and workoutPanel after first slice
  const mIdx = html.indexOf('<!-- MEALS & SNACKS PANEL -->');
  const wIdx = html.indexOf('<!-- WORKOUT PANEL -->');
  html = html.slice(0, mIdx) + html.slice(wIdx);

  console.log('Successfully removed Calories and Today Fuel panels from Today View!');
} else {
  console.error('Could not locate Today panels in index.html');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Wrote updated public/index.html');
