const fs = require('fs');

// 1. UPDATE public/index.html
let html = fs.readFileSync('public/index.html', 'utf8');

// A. Pre-paint inline script in head
if (!html.includes('ff_sidebar_collapsed')) {
  const targetHeadScript = `      } catch (e) {}
    })();
  </script>`;
  const replacementHeadScript = `      } catch (e) {}
      try {
        if (localStorage.getItem('ff_sidebar_collapsed') === 'true') {
          document.documentElement.classList.add('sidebar-collapsed');
        }
      } catch (e) {}
    })();
  </script>`;
  if (html.includes(targetHeadScript)) {
    html = html.replace(targetHeadScript, replacementHeadScript);
    console.log('✔ Added pre-paint sidebar-collapsed script to <head>');
  } else {
    // Try CRLF
    const targetHeadScriptCRLF = targetHeadScript.replace(/\n/g, '\r\n');
    const replacementHeadScriptCRLF = replacementHeadScript.replace(/\n/g, '\r\n');
    html = html.replace(targetHeadScriptCRLF, replacementHeadScriptCRLF);
    console.log('✔ Added pre-paint sidebar-collapsed script to <head> (CRLF)');
  }
}

// B. Version bumps
html = html.replace(/styles\.css\?v=7\.5\.0/g, 'styles.css?v=7.6.0');
html = html.replace(/fitfuel\.js\?v=7\.5\.0/g, 'fitfuel.js?v=7.6.0');
console.log('✔ Bumped asset version query params to v=7.6.0 in index.html');

// C. Replace sidebar navigation
const sidebarStartMarker = '<!-- ================= SIDEBAR ================= -->';
const sidebarBottomMarker = '<div class="sidebar-bottom">';

const newSidebarTopAndNav = `<!-- ================= SIDEBAR ================= -->
  <aside class="sidebar" id="sidebar">
    <div class="brand">
      <span class="brand-mark">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity">
          <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
        </svg>
      </span>
      <span class="brand-title">Fit<span class="mint" style="color:#16C79A;">Fuel</span></span>
    </div>

    <div class="sidebar-heading-row">
      <h2 class="sidebar-main-heading">Dashboard</h2>
    </div>

    <div class="sidebar-toggle-row">
      <button type="button" id="sidebarToggle" class="sidebar-toggle-btn" aria-label="Toggle dashboard menu" aria-controls="sidebar" aria-expanded="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <nav class="primary-nav" aria-label="Main navigation">
      <!-- 1. OVERVIEW -->
      <div class="sidebar-label">OVERVIEW</div>
      <button class="nav-link selected" data-view="today">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>
        </svg>
        <span>Today</span>
        <span class="nav-active-dot"></span>
      </button>

      <!-- 2. TRAINING -->
      <div class="sidebar-label">TRAINING</div>
      <button class="nav-link" data-view="workouts">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path>
          <path d="m2.5 21.5 1.4-1.4"></path><path d="m20.1 3.9 1.4-1.4"></path>
          <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path>
          <path d="m9.6 14.4 4.8-4.8"></path>
        </svg>
        <span>Workouts</span>
      </button>

      <button class="nav-link" data-view="challenge">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
        <span>Challenge</span>
      </button>

      <button class="nav-link" data-view="exercise-library">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
        </svg>
        <span>Exercise Library</span>
      </button>

      <button class="nav-link" data-view="starting-load">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path>
        </svg>
        <span>Starting Weight</span>
      </button>

      <!-- 3. NUTRITION -->
      <div class="sidebar-label">NUTRITION</div>
      <button class="nav-link" data-view="food-log">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
        <span>Food Log</span>
      </button>

      <button class="nav-link" data-view="my-foods">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6.528V3a1 1 0 0 1 1-1h0"></path><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"></path>
        </svg>
        <span>My Foods</span>
      </button>

      <!-- 4. AI COACH -->
      <div class="sidebar-label">AI COACH</div>
      <button class="nav-link" data-view="ai-coach" id="sidebarAiCoachBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.08 6.25 5 7.42V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.58c2.92-1.17 5-4.05 5-7.42a8 8 0 0 0-8-8z"></path>
          <path d="M9 10h.01"></path><path d="M15 10h.01"></path>
        </svg>
        <span>AI Coach</span>
        <span class="sidebar-badge-live">LIVE</span>
      </button>

      <!-- 5. PROGRESS -->
      <div class="sidebar-label">PROGRESS</div>
      <button class="nav-link" data-view="tracking">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
        <span>Tracking</span>
      </button>

      <button class="nav-link" data-view="activity" id="sidebarActivityBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>
        <span>Activity &amp; GPS</span>
      </button>

      <!-- 6. LABS (BETA) -->
      <div class="sidebar-label">LABS (BETA)</div>
      <button class="nav-link" data-view="posture" id="sidebarPostureBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <span>Posture AI</span>
      </button>

      <button class="nav-link" data-view="body-analysis" id="sidebarBodyAnalysisBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="5" r="3"></circle>
          <path d="M12 8v8"></path>
          <path d="m8 12 4 1 4-1"></path>
          <path d="m9 21 3-5 3 5"></path>
        </svg>
        <span>Body Scan</span>
      </button>

      <!-- 7. ACCOUNT -->
      <div class="sidebar-label">ACCOUNT</div>
      <button class="nav-link" data-view="profile">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 17H5"></path><path d="M19 7h-9"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>
        </svg>
        <span>Profile</span>
      </button>

      <button class="nav-link" data-view="customization" id="sidebarCustomizationBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>Settings</span>
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
    </nav>

    `;

const sIdx = html.indexOf(sidebarStartMarker);
const bIdx = html.indexOf(sidebarBottomMarker, sIdx);
if (sIdx !== -1 && bIdx !== -1) {
  html = html.substring(0, sIdx) + newSidebarTopAndNav.replace(/\n/g, '\r\n') + html.substring(bIdx);
  console.log('✔ Replaced sidebar top, heading, hamburger button and 7 navigation groups');
} else {
  console.error('❌ Could not locate sidebar markers:', sIdx, bIdx);
}

// D. Mobile top bar brand with Dashboard text and aria on #mobileMenuBtn
const mobileMenuBtnOld = `<button aria-label="Open navigation" class="mobile-menu icon-button" id="mobileMenuBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>
          </svg>
        </button>`;

const mobileMenuBtnNew = `<button type="button" aria-label="Toggle dashboard menu" aria-controls="sidebar" aria-expanded="false" class="mobile-menu icon-button" id="mobileMenuBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>`;

if (html.includes(mobileMenuBtnOld)) {
  html = html.replace(mobileMenuBtnOld, mobileMenuBtnNew);
} else {
  html = html.replace(mobileMenuBtnOld.replace(/\n/g, '\r\n'), mobileMenuBtnNew.replace(/\n/g, '\r\n'));
}

const mobileBrandOld = `<div class="topbar-mobile-brand" id="topbarMobileBrand">
          <span class="mobile-brand-mark">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
            </svg>
          </span>
          <span class="mobile-brand-text">Fit<span class="mint" style="color:#16C79A;">Fuel</span></span>
        </div>`;

const mobileBrandNew = `<div class="topbar-mobile-brand" id="topbarMobileBrand">
          <span class="mobile-brand-mark">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
            </svg>
          </span>
          <span class="mobile-brand-text">Fit<span class="mint" style="color:#16C79A;">Fuel</span></span>
          <span class="mobile-dashboard-heading">Dashboard</span>
        </div>`;

if (html.includes(mobileBrandOld)) {
  html = html.replace(mobileBrandOld, mobileBrandNew);
} else {
  html = html.replace(mobileBrandOld.replace(/\n/g, '\r\n'), mobileBrandNew.replace(/\n/g, '\r\n'));
}

// E. Rename Smart Start to Starting Weight on view-starting-load and hub nav buttons
const startingViewOldIntro = `<span class="section-kicker">SMART START &bull; AUTONOMOUS CALIBRATION</span>
            <h2>Your Precision Starting Working Weight</h2>
            <p>Scientific, 1RM-free baseline calibration based on your bodyweight, sex, and experience level.</p>`;

const startingViewNewIntro = `<span class="section-kicker">STARTING WEIGHT &bull; AUTONOMOUS CALIBRATION</span>
            <h2>Starting Weight</h2>
            <p>Your recommended starting weight for each lift, based on your body weight.</p>`;

if (html.includes(startingViewOldIntro)) {
  html = html.replace(startingViewOldIntro, startingViewNewIntro);
} else {
  html = html.replace(startingViewOldIntro.replace(/\n/g, '\r\n'), startingViewNewIntro.replace(/\n/g, '\r\n'));
}

// Replace hub-subnav-btn "Smart Start" spans
html = html.replace(/(<button[^>]+data-hubview="starting-load"[^>]*>[\s\S]*?<span>)Smart Start(<\/span>)/g, '$1Starting Weight$2');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✔ Successfully saved public/index.html');
