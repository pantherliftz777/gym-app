const fs = require('fs');

// 1. Update public/index.html primary navigation
let html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('<nav class="primary-nav"');
const eIdx = html.indexOf('</nav>', sIdx);
if (sIdx === -1 || eIdx === -1) {
  console.error('Could not find primary-nav in public/index.html');
  process.exit(1);
}

const newPrimaryNav = `<nav class="primary-nav" aria-label="Main navigation">
      <!-- 1. OVERVIEW -->
      <button class="nav-link selected" data-view="today" data-section="overview" title="Overview">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>
        </svg>
        <span>Overview</span>
        <span class="nav-active-dot"></span>
      </button>

      <!-- 2. TRAINING -->
      <button class="nav-link" data-view="workouts" data-section="training" title="Training">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path>
          <path d="m2.5 21.5 1.4-1.4"></path><path d="m20.1 3.9 1.4-1.4"></path>
          <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path>
          <path d="m9.6 14.4 4.8-4.8"></path>
        </svg>
        <span>Training</span>
      </button>

      <!-- 3. NUTRITION -->
      <button class="nav-link" data-view="food-log" data-section="nutrition" title="Nutrition">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
        <span>Nutrition</span>
      </button>

      <!-- 4. AI COACH -->
      <button class="nav-link" data-view="ai-coach" data-section="ai-coach" id="sidebarAiCoachBtn" title="AI Coach">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.08 6.25 5 7.42V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.58c2.92-1.17 5-4.05 5-7.42a8 8 0 0 0-8-8z"></path>
          <path d="M9 10h.01"></path><path d="M15 10h.01"></path>
        </svg>
        <span>AI Coach</span>
        <span class="sidebar-badge-live">LIVE</span>
      </button>

      <!-- 5. PROGRESS -->
      <button class="nav-link" data-view="tracking" data-section="progress" title="Progress">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
        <span>Progress</span>
      </button>

      <!-- 6. LABS (BETA) -->
      <button class="nav-link" data-view="posture" data-section="labs" id="sidebarPostureBtn" title="Labs (Beta)">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <span>Labs (Beta)</span>
      </button>

      <!-- 7. ACCOUNTS -->
      <button class="nav-link" data-view="profile" data-section="accounts" title="Accounts">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 17H5"></path><path d="M19 7h-9"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>
        </svg>
        <span>Accounts</span>
      </button>

      <!-- Dedicated Admin Portal Navigation Link (Shown for Admins) -->
      <button class="nav-link admin-only-link" data-view="admin" data-section="admin" id="sidebarAdminNavBtn" style="display:none;color:#38bdf8;" title="Admin">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <span>Admin Portal</span>
        <span style="font-size:0.65rem;background:#1e3a8a;color:#38bdf8;padding:2px 7px;border-radius:99px;margin-left:auto;font-weight:800;border:1px solid #38bdf8;">ADMIN</span>
      </button>
    </nav>`;

html = html.substring(0, sIdx) + newPrimaryNav + html.substring(eIdx + 6);

// Bump bundle version
html = html.replace(/fitfuel\.js\?v=[\d\.]+/g, 'fitfuel.js?v=7.7.0');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✔ Updated public/index.html with 7 clean main navigation headings');

// 2. Update public/fitfuel.js switchView logic to support section mapping
let js = fs.readFileSync('public/fitfuel.js', 'utf8');

const targetSnippet = `function switchView(viewName) {
  activeView = viewName;
  $$('.primary-nav .nav-link').forEach(btn => {
    const isTarget = btn.dataset.view === viewName;
    btn.classList.toggle('selected', isTarget);
    let dot = btn.querySelector('.nav-active-dot');
    if (isTarget && !dot) {
      const d = document.createElement('span');
      d.className = 'nav-active-dot';
      btn.appendChild(d);
    } else if (!isTarget && dot) {
      dot.remove();
    }
  });`;

const replacementSnippet = `const SECTION_VIEW_MAP = {
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
  });`;

if (js.includes(targetSnippet)) {
  js = js.replace(targetSnippet, replacementSnippet);
  fs.writeFileSync('public/fitfuel.js', js, 'utf8');
  console.log('✔ Updated public/fitfuel.js switchView with SECTION_VIEW_MAP');
} else {
  console.error('Target snippet in fitfuel.js not found!');
}

// 3. Update public/sw.js cache name
let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/CACHE_NAME\s*=\s*'[^']+'/g, "CACHE_NAME = 'fitfuel-cache-v7.7.0'");
fs.writeFileSync('public/sw.js', sw, 'utf8');
console.log('✔ Updated public/sw.js cache name to fitfuel-cache-v7.7.0');
