const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Ensure authOverlay id
html = html.replace('id="authModalOverlay"', 'id="authOverlay"');

// 2. Ensure calc1RMVal id
html = html.replace('id="epleyResult"', 'id="calc1RMVal"');

// 3. Ensure demoHydroVal and btn-hydro
html = html.replace(
  '<span id="waterCurrent">1,250 ml</span>',
  '<span id="demoHydroVal">1,250 ml</span>'
);
html = html.replace(
  '<button class="btn-primary" id="btnLogWater" style="width: 100%;">\n            <span>+ Log 250ml Water</span>\n          </button>',
  '<button class="btn-primary btn-hydro" data-ml="500" id="btnLogWater" style="width: 100%;">\n            <span>+ Log 500ml Water</span>\n          </button>'
);

// 4. Add role tabs section before pricing
if (!html.includes('role-tab-btn')) {
  const roleSection = `
    <!-- ================= ROLE TABS: ATHLETES & COACHES ================= -->
    <section class="section-wrap" id="rolesSection">
      <div class="section-header">
        <div class="section-eyebrow">PORTALS</div>
        <h2 class="section-title">Built for Both Athletes &amp; Coaches</h2>
        <p class="section-desc">Tailored interfaces whether you are lifting on the platform or managing 50 athletes.</p>
      </div>

      <div class="role-tabs-wrap" style="display:flex;justify-content:center;gap:1rem;margin-bottom:2rem;">
        <button class="role-tab-btn active btn-ghost" data-tab="roleLifters" style="padding:0.6rem 1.6rem;border-radius:9999px;">Athletes &amp; Lifters</button>
        <button class="role-tab-btn btn-ghost" data-tab="roleCoaches" style="padding:0.6rem 1.6rem;border-radius:9999px;">Coaches &amp; Trainers</button>
      </div>

      <div class="role-content-wrap">
        <div class="role-panel active spotlight-card" id="roleLifters" style="background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:2.5rem;">
          <h3 style="font-family:var(--font-display);font-size:1.6rem;margin-bottom:0.8rem;">Personal Athlete Command Center</h3>
          <p style="color:var(--text-muted);margin-bottom:1.5rem;">Automatic progressive overload calculations, MediaPipe computer vision squat form alerts, and seamless turnstile access.</p>
          <button class="btn-primary auth-trigger">Launch Athlete Mode</button>
        </div>

        <div class="role-panel spotlight-card" id="roleCoaches" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:2.5rem;">
          <h3 style="font-family:var(--font-display);font-size:1.6rem;margin-bottom:0.8rem;">Multi-Client Coaching &amp; Telemetry Portal</h3>
          <p style="color:var(--text-muted);margin-bottom:1.5rem;">Monitor RPE compliance across your entire team roster in real-time. Assign personalized splits and push instant deload directives.</p>
          <button class="btn-primary auth-trigger">Launch Coach Mode</button>
        </div>
      </div>
    </section>
  `;

  html = html.replace('<!-- ================= 7. MEMBERSHIP PLANS ================= -->', roleSection + '\n    <!-- ================= 7. MEMBERSHIP PLANS ================= -->');
}

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('index.html hooks aligned.');

// Update app.js to bind role tabs and mobile-nav toggling
const appJsPath = path.join(__dirname, '..', 'public', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// Ensure role tabs handler
if (!appJs.includes('initRoleTabs')) {
  const roleTabFn = `
  // 7. ROLE TABS CONTROLLER
  function initRoleTabs() {
    const tabBtns = document.querySelectorAll('.role-tab-btn');
    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.role-panel').forEach(p => {
          if (p.id === targetId) {
            p.classList.add('active');
            p.style.display = 'block';
          } else {
            p.classList.remove('active');
            p.style.display = 'none';
          }
        });
      });
    });
  }
`;
  appJs = appJs.replace('// INIT EVERYTHING ON DOM READY', roleTabFn + '\n  // INIT EVERYTHING ON DOM READY');
  appJs = appJs.replace('initHydration();', 'initHydration();\n    initRoleTabs();');
}

// Ensure mobile drawer toggles .site-nav.open
appJs = appJs.replace(
  "toggleBtn.addEventListener('click', () => drawer.classList.add('open'));",
  "toggleBtn.addEventListener('click', () => {\n      drawer.classList.toggle('open');\n      const siteNav = document.querySelector('.site-nav');\n      if (siteNav) siteNav.classList.toggle('open');\n    });"
);

// Ensure hydration tracker updates #demoHydroVal
appJs = appJs.replace(
  "const cur = document.getElementById('waterCurrent');",
  "const cur = document.getElementById('demoHydroVal') || document.getElementById('waterCurrent');"
);

// Ensure authOverlay variable
appJs = appJs.replace(
  "const overlay = document.getElementById('authModalOverlay');",
  "const overlay = document.getElementById('authOverlay') || document.getElementById('authModalOverlay');"
);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('app.js hooks aligned.');
