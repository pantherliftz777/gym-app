// FitFuel Feature Engine & Interactive Sandbox Controller
(function () {
  'use strict';

  // Feature definition fallback if not loaded from window.GYM_SHOWCASE_FEATURES or window.GYM_FEATURES
  const FEATURES = window.GYM_SHOWCASE_FEATURES || window.GYM_FEATURES || {
    workoutTracking: {
      id: "workoutTracking",
      name: "Live Workout Tracker",
      tagline: "Log sets, reps, and RPE with automated rest timers",
      category: "workout",
      description: "Real-time exercise logging with progressive overload metrics, PR tracking, and custom workout routines.",
      status: "available",
      badgeVariant: "available",
      actionRoute: "/app/workout",
      icon: "🏋️‍♂️"
    },
    classBooking: {
      id: "classBooking",
      name: "Class Schedule & Booking",
      tagline: "Reserve spots in Spin, HIIT, Yoga, and CrossFit sessions",
      category: "membership",
      description: "Browse calendar schedules, view instructor bios, and reserve your spot with instant calendar sync.",
      status: "available",
      badgeVariant: "available",
      actionRoute: "/app/classes",
      icon: "📅"
    },
    qrEntry: {
      id: "qrEntry",
      name: "Contactless QR Turnstile Entry",
      tagline: "Touchless gate access via your phone screen",
      category: "membership",
      description: "Dynamic cryptographic time-based QR code for instant, badge-free gym check-in at front desk turnstiles.",
      status: "available",
      badgeVariant: "available",
      actionRoute: "/app/pass",
      icon: "📱"
    },
    macroCalculator: {
      id: "macroCalculator",
      name: "Macro & Calorie Engine",
      tagline: "Tailored TDEE and macro splits for bulking or cutting",
      category: "nutrition",
      description: "Scientifically calibrated macronutrient and caloric target generator based on Mifflin-St Jeor equations.",
      status: "available",
      badgeVariant: "available",
      actionRoute: "/app/nutrition",
      icon: "🥗"
    },
    formCorrectionAi: {
      id: "formCorrectionAi",
      name: "AI Camera Form Checker",
      tagline: "Computer vision feedback on Squats, Deadlifts & Bench",
      category: "workout",
      description: "Pose estimation engine running locally on device to track bar path, hip depth, and back rounding.",
      status: "beta",
      badgeVariant: "beta",
      actionRoute: "/app/form-checker",
      technicalReason: "Currently calibrated for Squats and Deadlifts. Bench press angle calibration is in public beta.",
      icon: "👁️"
    },
    trainerChat: {
      id: "trainerChat",
      name: "Coach 1-on-1 Messaging",
      tagline: "Direct encrypted chat with your assigned personal trainer",
      category: "community",
      description: "Direct messaging, video form check submissions, and weekly check-in feedback from certified trainers.",
      status: "beta",
      badgeVariant: "beta",
      actionRoute: "/app/messages",
      icon: "💬"
    },
    wearableSync: {
      id: "wearableSync",
      name: "Apple Watch & Whoop Sync",
      tagline: "Real-time heart rate zone broadcast on gym cardio screens",
      category: "hardware",
      description: "Direct Bluetooth Low Energy (BLE) and HealthKit integration to stream live heart rate and recovery metrics.",
      status: "coming-soon",
      badgeVariant: "coming-soon",
      technicalReason: "Apple HealthKit & Whoop API developer verification is currently in staging review.",
      estimatedArrival: "Q2 2026",
      icon: "⌚"
    },
    mealPlanAi: {
      id: "mealPlanAi",
      name: "AI Grocery & Meal Prep Generator",
      tagline: "Instant high-protein grocery lists matched to your macros",
      category: "nutrition",
      description: "Generates weekly meal prep recipes matching exact gram targets with 1-click Instacart grocery export.",
      status: "coming-soon",
      badgeVariant: "coming-soon",
      technicalReason: "Local dietary constraint recommendation model undergoing accuracy verification.",
      estimatedArrival: "Q3 2026",
      icon: "🍲"
    },
    bodyScan3D: {
      id: "bodyScan3D",
      name: "3D Body Composition Mesh",
      tagline: "Mobile LiDAR scan for visceral fat & muscle circumference",
      category: "workout",
      description: "Transforms a 10-second turntable video into a millimeter-accurate 3D body avatar with tape measurement comparisons.",
      status: "coming-soon",
      badgeVariant: "coming-soon",
      technicalReason: "Requires WebGPU NeRF avatar reconstruction engine currently in development.",
      estimatedArrival: "Q3 2026",
      icon: "🧬"
    },
    gymCrowdMeter: {
      id: "gymCrowdMeter",
      name: "Live Gym Occupancy & Wait Meter",
      tagline: "See how busy free weights and squat racks are in real time",
      category: "membership",
      description: "Privacy-preserving BLE beacon heatmaps showing current gym floor traffic and equipment availability.",
      status: "coming-soon",
      badgeVariant: "coming-soon",
      technicalReason: "Hardware optical turnstile sensors are being deployed at gym locations.",
      estimatedArrival: "Q2 2026",
      icon: "📊"
    }
  };

  const featureIcons = {
    workoutTracking: "🏋️‍♂️",
    classBooking: "📅",
    qrEntry: "📱",
    macroCalculator: "🥗",
    formCorrectionAi: "👁️",
    trainerChat: "💬",
    wearableSync: "⌚",
    mealPlanAi: "🍲",
    bodyScan3D: "🧬",
    gymCrowdMeter: "📊"
  };

  let currentTab = 'all';
  let activeFeatureId = null;
  let activeAnimId = null;
  let activeIntervalId = null;
  let previousFocusedElement = null;

  // DOM Elements
  const featuresGridEl = document.getElementById('featuresGrid');
  const tabsContainerEl = document.getElementById('tabsList');
  const modalOverlay = document.getElementById('featureModalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Initialize
  function init() {
    renderFeaturesGrid();
    setupEventListeners();
    setupTheme();
  }

  // Theme Management
  function setupTheme() {
    const savedTheme = localStorage.getItem('fitfuel_theme') || 'dark';
    if (savedTheme === 'gym') {
      document.body.classList.add('theme-gym');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '🌙 Dark Mode';
    } else {
      document.body.classList.remove('theme-gym');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '⚡ High-Energy Theme';
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('theme-gym');
        const isGym = document.body.classList.contains('theme-gym');
        localStorage.setItem('fitfuel_theme', isGym ? 'gym' : 'dark');
        themeToggleBtn.innerHTML = isGym ? '🌙 Dark Mode' : '⚡ High-Energy Theme';
      });
    }
  }

  // Tab Filtering
  function filterFeatures() {
    const list = Object.values(FEATURES);
    return list.filter(f => {
      if (currentTab === 'all') return true;
      if (currentTab === 'workouts-ai') {
        return f.id === 'workoutTracking' || f.id === 'formCorrectionAi' || f.id === 'bodyScan3D' || f.id === 'trainerChat';
      }
      if (currentTab === 'nutrition') {
        return f.id === 'macroCalculator' || f.id === 'mealPlanAi';
      }
      if (currentTab === 'gym-turnstile') {
        return f.id === 'classBooking' || f.id === 'qrEntry' || f.id === 'gymCrowdMeter';
      }
      if (currentTab === 'wearables') {
        return f.id === 'wearableSync';
      }
      return true;
    });
  }

  function renderFeaturesGrid() {
    if (!featuresGridEl) return;
    const items = filterFeatures();

    featuresGridEl.innerHTML = items.map(f => {
      const icon = featureIcons[f.id] || "⚡";
      let statusBadgeHtml = '';
      let actionBtnHtml = '';

      if (f.status === 'available') {
        statusBadgeHtml = `<span class="status-badge available"><span class="pulse-dot"></span> Available</span>`;
        actionBtnHtml = `
          <a href="${f.actionRoute || '/'}" class="btn-action-primary" data-route="${f.actionRoute || '/'}">
            Open in App →
          </a>
        `;
      } else if (f.status === 'beta') {
        statusBadgeHtml = `<span class="status-badge beta">● Beta</span>`;
        actionBtnHtml = `
          <div style="display:flex;gap:0.5rem;width:100%;">
            <button type="button" class="btn-secondary inspect-btn" data-feature="${f.id}" style="flex:1;">
              Inspect
            </button>
            <a href="${f.actionRoute || '/'}" class="btn-action-beta" data-route="${f.actionRoute || '/'}" style="flex:1;">
              Try Beta →
            </a>
          </div>
        `;
      } else {
        statusBadgeHtml = `<span class="status-badge coming-soon">⏳ Coming Soon</span>`;
        actionBtnHtml = `
          <button type="button" class="btn-action-sandbox open-sandbox-btn" data-feature="${f.id}">
            Try Interactive Sandbox ⚡
          </button>
        `;
      }

      return `
        <article class="feature-card" data-feature-id="${f.id}">
          <div class="card-top">
            <div class="card-icon" aria-hidden="true">${icon}</div>
            <div class="status-pills-wrap">
              ${statusBadgeHtml}
              <span class="category-chip">${f.category}</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${f.name}</h3>
            <p class="card-tagline">${f.tagline}</p>
            <p class="card-desc">${f.description}</p>
            ${f.technicalReason ? `
              <div class="card-notice">
                <span>ℹ</span>
                <span><strong>Notice:</strong> ${f.technicalReason}</span>
              </div>
            ` : ''}
          </div>
          <div class="card-footer">
            ${actionBtnHtml}
          </div>
        </article>
      `;
    }).join('');

    // Attach listeners
    featuresGridEl.querySelectorAll('.open-sandbox-btn, .inspect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const featId = btn.getAttribute('data-feature');
        openModal(featId);
      });
    });

    featuresGridEl.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent click if clicking an interactive anchor or button
        if (e.target.closest('a') || e.target.closest('button')) return;
        const featId = card.getAttribute('data-feature-id');
        openModal(featId);
      });
    });
  }

  function navigateBackToApp() {
    if (window.parent && window.parent !== window && typeof window.parent.switchView === 'function') {
      window.parent.switchView('today');
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'FITFUEL_NAVIGATE', view: 'today' }, '*');
    } else {
      window.location.href = '/';
    }
  }

  function handleRouteNavigation(route) {
    if (!route) return;
    if (window.parent && window.parent !== window && typeof window.parent.handleAppActionRoutes === 'function') {
      window.parent.handleAppActionRoutes(route);
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'FITFUEL_NAVIGATE_ROUTE', route: route }, '*');
    } else {
      window.location.href = route;
    }
  }

  function setupEventListeners() {
    // Back to FitFuel App buttons
    const headerBackBtn = document.getElementById('headerBackToAppBtn');
    if (headerBackBtn) {
      headerBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateBackToApp();
      });
    }
    const heroBackBtn = document.getElementById('heroBackToAppBtn');
    if (heroBackBtn) {
      heroBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateBackToApp();
      });
    }

    // Intercept app navigation clicks if inside iframe
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-route], a.btn-action-primary, a.btn-action-beta');
      if (link && window.parent && window.parent !== window) {
        const href = link.getAttribute('data-route') || link.getAttribute('href');
        if (href && (href.startsWith('/app') || href.startsWith('/'))) {
          e.preventDefault();
          handleRouteNavigation(href);
        }
      }
    });

    // Tabs
    if (tabsContainerEl) {
      tabsContainerEl.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          tabsContainerEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentTab = btn.getAttribute('data-tab');
          renderFeaturesGrid();
        });
      });
    }

    // Modal close
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (modalOverlay && modalOverlay.classList.contains('open')) {
        if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === 'Tab') {
          const focusables = modalOverlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])');
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }
    });
  }

  // Open Modal with Unified Sandbox Rendering
  function openModal(featureId) {
    const f = FEATURES[featureId];
    if (!f) return;
    activeFeatureId = featureId;
    previousFocusedElement = document.activeElement;

    // Reset previous loops
    if (activeAnimId) cancelAnimationFrame(activeAnimId);
    if (activeIntervalId) clearInterval(activeIntervalId);

    // Meta & Header
    const icon = featureIcons[f.id] || "⚡";
    document.getElementById('modalTitle').textContent = f.name;
    document.getElementById('modalTagline').textContent = f.tagline;

    let badgeHtml = '';
    if (f.status === 'available') {
      badgeHtml = `<span class="status-badge available"><span class="pulse-dot"></span> Live in Production</span>`;
    } else if (f.status === 'beta') {
      badgeHtml = `<span class="status-badge beta">● Public Beta</span>`;
    } else {
      badgeHtml = `<span class="status-badge coming-soon">⏳ In Active Development</span>`;
    }

    document.getElementById('modalMetaPills').innerHTML = `
      <span class="category-chip" style="color:#ffffff;background:#27272a;padding:0.2rem 0.5rem;border-radius:6px;border:1px solid #3f3f46;">
        ${f.category}
      </span>
      ${badgeHtml}
      ${f.estimatedArrival ? `
        <span style="font-size:0.72rem;background:#27272a;padding:0.2rem 0.5rem;border-radius:6px;color:#a1a1aa;">
          ETA: ${f.estimatedArrival}
        </span>
      ` : ''}
    `;

    // Explanation
    document.getElementById('modalExplanationText').textContent = f.description;
    const noticeEl = document.getElementById('modalEngineeringNotice');
    if (f.technicalReason) {
      noticeEl.style.display = 'flex';
      noticeEl.innerHTML = `<span>⚡</span><div><strong style="color:#fde68a;">Engineering Notice:</strong> ${f.technicalReason}</div>`;
    } else {
      noticeEl.style.display = 'none';
    }

    // Render Sandbox Content
    const sandboxContainer = document.getElementById('modalSandboxContainer');
    renderSandbox(featureId, sandboxContainer, f);

    // Render Action Footer
    const footerEl = document.getElementById('modalFooterContainer');
    renderFooter(f, footerEl);

    // Show modal
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    setTimeout(() => {
      if (modalCloseBtn) modalCloseBtn.focus();
    }, 50);
  }

  function closeModal() {
    if (activeAnimId) cancelAnimationFrame(activeAnimId);
    if (activeIntervalId) clearInterval(activeIntervalId);
    if (modalOverlay) modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    activeFeatureId = null;

    if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
      previousFocusedElement.focus();
    }
  }

  // Sandbox Renderers
  function renderSandbox(featureId, container, f) {
    if (featureId === 'formCorrectionAi') {
      container.innerHTML = `
        <div class="sandbox-box">
          <div class="sandbox-header">
            <span class="sandbox-title">⚡ 120 FPS Pose Biomechanics Engine</span>
            <span class="sandbox-subtitle">Edge Computer Vision</span>
          </div>
          <div class="canvas-container">
            <canvas id="formPoseCanvas" width="560" height="270"></canvas>
            <div class="canvas-badge-top-left" id="squatDepthBadge">
              Squat Depth: <strong style="color:#34d399;" id="depthValText">Parallel Achieved (89°)</strong>
            </div>
            <div class="canvas-badge-top-right">
              Bar Path: 94% Centered
            </div>
          </div>
          <div class="sandbox-controls-row">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <button type="button" class="btn-secondary" id="toggleFormPlayBtn">Pause Simulation</button>
              <span>Current Depth Angle: <strong id="currentDepthDeg" style="color:#ffffff;">89°</strong></span>
            </div>
            <span style="color:#34d399;font-weight:700;">Squat &amp; Deadlift Model Verified</span>
          </div>
        </div>
      `;
      initFormPoseCanvas();
    } else if (featureId === 'wearableSync') {
      container.innerHTML = `
        <div class="sandbox-box">
          <div class="sandbox-header">
            <span class="sandbox-title">⌚ Live BLE Broadcast Telemetry</span>
            <span class="sandbox-subtitle">Apple Watch &amp; Whoop 4.0</span>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;background:#18181b;padding:0.85rem 1rem;border-radius:12px;border:1px solid #27272a;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div style="width:42px;height:42px;border-radius:50%;background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.4);display:flex;align-items:center;justify-content:center;color:#f87171;font-weight:900;font-size:1.1rem;">
                ❤️
              </div>
              <div>
                <div style="font-size:0.72rem;color:#a1a1aa;">Heart Rate Live Broadcast</div>
                <div style="font-size:1.6rem;font-weight:900;font-family:monospace;color:#ffffff;line-height:1;">
                  <span id="wearableBpm">148</span> <span style="font-size:0.75rem;color:#a1a1aa;font-weight:normal;">BPM</span>
                </div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.72rem;color:#a1a1aa;">Training Zone</div>
              <div id="wearableZoneLabel" style="font-size:0.82rem;font-weight:800;color:#fbbf24;">Zone 4 - Anaerobic</div>
            </div>
          </div>

          <!-- Pulsing Waveform -->
          <div style="height:70px;background:#121214;border-radius:10px;border:1px solid #27272a;display:flex;align-items:center;justify-content:space-around;padding:0 0.5rem;" id="ecgBarsWrap">
            ${[35, 55, 95, 25, 70, 100, 40, 30, 85, 45, 95, 35, 60, 90, 40, 75, 30, 85].map((h, i) => `
              <div class="ecg-bar" style="width:4px;height:${h}%;background:#f87171;border-radius:99px;transition:height 0.25s ease;"></div>
            `).join('')}
          </div>

          <div class="sandbox-controls-row">
            <button type="button" class="btn-secondary" id="toggleBleBtn" style="border-color:#10b981;color:#34d399;">
              ✓ BLE Device Connected (Apple Watch Ultra)
            </button>
            <span style="font-size:0.72rem;">2.4 GHz Low Energy Broadcast</span>
          </div>
        </div>
      `;
      initWearableSync();
    } else if (featureId === 'gymCrowdMeter') {
      container.innerHTML = `
        <div class="sandbox-box">
          <div class="sandbox-header">
            <span class="sandbox-title">📊 Optical Turnstile &amp; BLE Beacon Heatmap</span>
            <span class="sandbox-subtitle">Floor Traffic Telemetry</span>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;background:#18181b;padding:0.85rem 1rem;border-radius:12px;border:1px solid #27272a;">
            <div>
              <div style="font-size:0.72rem;color:#a1a1aa;">Current Occupancy</div>
              <div style="font-size:1.5rem;font-weight:900;color:#fbbf24;" id="occupancyVal">68% Capacity</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.72rem;color:#a1a1aa;">Peak Hours Forecast</div>
              <div style="font-size:0.88rem;font-weight:800;color:#f4f4f5;">6:00 PM (88% Peak)</div>
            </div>
          </div>

          <!-- Equipment Bars -->
          <div style="display:flex;flex-direction:column;gap:0.75rem;font-size:0.78rem;">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
                <span style="color:#e4e4e7;">Squat Racks &amp; Platforms</span>
                <strong style="color:#fbbf24;" id="rackStatusText">3 of 4 in use (75%)</strong>
              </div>
              <div style="width:100%;background:#27272a;height:8px;border-radius:999px;overflow:hidden;">
                <div id="rackProgressBar" style="width:75%;height:100%;background:#fbbf24;border-radius:999px;"></div>
              </div>
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
                <span style="color:#e4e4e7;">Flat Bench Press Stations</span>
                <strong style="color:#f87171;" id="benchStatusText">5 of 6 in use (83%)</strong>
              </div>
              <div style="width:100%;background:#27272a;height:8px;border-radius:999px;overflow:hidden;">
                <div id="benchProgressBar" style="width:83%;height:100%;background:#f87171;border-radius:999px;"></div>
              </div>
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
                <span style="color:#e4e4e7;">Cardio Deck (Treadmills / Stairmasters)</span>
                <strong style="color:#34d399;" id="cardioStatusText">12 of 20 in use (60%)</strong>
              </div>
              <div style="width:100%;background:#27272a;height:8px;border-radius:999px;overflow:hidden;">
                <div id="cardioProgressBar" style="width:60%;height:100%;background:#34d399;border-radius:999px;"></div>
              </div>
            </div>
          </div>

          <div class="sandbox-controls-row">
            <span style="font-size:0.72rem;">Sensors: Privacy-Preserving Optical Gate</span>
            <button type="button" class="btn-secondary" id="refreshHeatmapBtn" style="color:#38bdf8;">
              🔄 Refresh Sensor Heatmap
            </button>
          </div>
        </div>
      `;
      initGymCrowdMeter();
    } else if (featureId === 'mealPlanAi') {
      container.innerHTML = `
        <div class="sandbox-box">
          <div class="sandbox-header">
            <span class="sandbox-title">🍲 AI Grocery &amp; Macro Split Synthesizer</span>
            <span class="sandbox-subtitle">Mifflin-St Jeor + Gram Calibration</span>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:0.4rem;">
              <span style="color:#a1a1aa;">Interactive Daily Protein Target:</span>
              <strong style="color:#38bdf8;font-family:monospace;font-size:0.95rem;" id="proteinTargetLabel">165g Protein</strong>
            </div>
            <input type="range" id="proteinRangeInput" min="120" max="220" step="5" value="165" style="width:100%;accent-color:#38bdf8;cursor:pointer;" />
            <div style="display:flex;justify-content:space-between;font-size:0.68rem;color:#71717a;margin-top:0.2rem;">
              <span>120g (Maintenance)</span>
              <span>170g (Hypertrophy)</span>
              <span>220g (Max Anabolism)</span>
            </div>
          </div>

          <!-- Recipe Card Breakdown -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.78rem;" id="macroMealsGrid">
            <!-- Populated via JS -->
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;border-radius:10px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);font-size:0.78rem;color:#34d399;">
            <span id="macroTotalsSummary">Target Calibrated: 165g P • 2280 kcal</span>
            <button type="button" class="btn-secondary" id="exportInstacartBtn" style="border-color:#10b981;color:#ffffff;background:#10b981;font-weight:700;">
              Export Grocery List
            </button>
          </div>
        </div>
      `;
      initMealPlanAi();
    } else if (featureId === 'bodyScan3D') {
      container.innerHTML = `
        <div class="sandbox-box">
          <div class="sandbox-header">
            <span class="sandbox-title">🧬 WebGPU 3D NeRF Avatar Reconstruction</span>
            <span class="sandbox-subtitle">Millimeter Tape Caliper Simulation</span>
          </div>

          <div class="canvas-container">
            <canvas id="bodyMeshCanvas" width="560" height="270"></canvas>
            <div class="canvas-badge-top-left">
              ISO 8559-1 Anatomical Planes
            </div>
            <div class="canvas-badge-top-right">
              360° Rotational Mesh
            </div>
          </div>

          <div class="sandbox-controls-row">
            <div style="display:flex;gap:0.5rem;">
              <button type="button" class="btn-secondary" id="toggleRotate3dBtn">Pause 360° Spin</button>
              <button type="button" class="btn-secondary" id="reset3dAngleBtn">Reset Front View</button>
            </div>
            <span style="font-size:0.72rem;color:#a1a1aa;">Drag or swipe canvas to rotate</span>
          </div>
        </div>
      `;
      initBodyScan3D();
    } else {
      // Default fallback
      container.innerHTML = `
        <div class="sandbox-box" style="text-align:center;padding:2rem 1rem;">
          <h4 style="font-size:1.1rem;font-weight:800;color:#ffffff;margin-bottom:0.5rem;">${f.name} Ready in Production</h4>
          <p style="font-size:0.82rem;color:#a1a1aa;max-width:480px;margin:0 auto 1rem;">
            This feature is operational in the FitFuel application. You can launch it directly from this modal or your dashboard.
          </p>
          <div style="display:inline-block;padding:0.4rem 0.8rem;background:#18181b;border-radius:8px;font-family:monospace;font-size:0.78rem;color:#34d399;border:1px solid #27272a;">
            Route: ${f.actionRoute || '/app'}
          </div>
        </div>
      `;
    }
  }

  // Footer: Action or Waitlist Form
  function renderFooter(f, footerEl) {
    if (f.status === 'available' || f.status === 'beta') {
      footerEl.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:1rem;">
          <span style="font-size:0.78rem;color:#a1a1aa;">
            ${f.status === 'available' ? 'Fully operational in current build.' : 'Available in public beta for all athletes.'}
          </span>
          <a href="${f.actionRoute || '/'}" class="btn-action-primary" style="width:auto;padding:0.65rem 1.75rem;">
            Launch Feature in App →
          </a>
        </div>
      `;
    } else {
      footerEl.innerHTML = `
        <form class="waitlist-form" id="featureWaitlistForm">
          <label class="waitlist-label" for="waitlistEmailInput">
            Get Early Access: Enter your email to be notified when this launches
          </label>
          <div class="waitlist-input-group">
            <input 
              type="email" 
              id="waitlistEmailInput" 
              class="waitlist-input" 
              placeholder="athlete@fitfuel.app" 
              required 
            />
            <button type="submit" class="waitlist-submit-btn" id="waitlistSubmitBtn">
              Join Priority Waitlist
            </button>
          </div>
          <div id="waitlistToastMsg" style="display:none;"></div>
        </form>
      `;

      const form = document.getElementById('featureWaitlistForm');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const emailInput = document.getElementById('waitlistEmailInput');
          const submitBtn = document.getElementById('waitlistSubmitBtn');
          const toastEl = document.getElementById('waitlistToastMsg');
          const email = emailInput.value.trim();

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toastEl.className = 'toast-msg error';
            toastEl.textContent = 'Please enter a valid email address.';
            toastEl.style.display = 'block';
            return;
          }

          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';

          try {
            const resp = await fetch('/api/features/waitlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, featureId: f.id })
            });
            const data = await resp.json();
            submitBtn.disabled = false;
            if (resp.ok && data.ok) {
              toastEl.className = 'toast-msg success';
              toastEl.textContent = data.message || `You're on the early-access waitlist for ${f.name}!`;
              toastEl.style.display = 'block';
              emailInput.value = '';
              submitBtn.textContent = data.alreadyRegistered ? 'Position Confirmed ✓' : 'Registered ✓';
            } else {
              toastEl.className = 'toast-msg error';
              toastEl.textContent = data.error || 'Failed to submit. Please try again.';
              toastEl.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Join Priority Waitlist';
            }
          } catch (err) {
            toastEl.className = 'toast-msg error';
            toastEl.textContent = 'Network error submitting waitlist. Please check connection.';
            toastEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Join Priority Waitlist';
          }
        });
      }
    }
  }

  // Live Canvas 1: Form Pose
  function initFormPoseCanvas() {
    const canvas = document.getElementById('formPoseCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isPlaying = true;
    let tick = 0;

    const toggleBtn = document.getElementById('toggleFormPlayBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        toggleBtn.textContent = isPlaying ? 'Pause Simulation' : 'Resume Simulation';
      });
    }

    function draw() {
      if (isPlaying) {
        tick += 0.035;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const barIdealX = canvas.width / 2;
      // Ideal bar path vertical line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barIdealX, 30);
      ctx.lineTo(barIdealX, 240);
      ctx.stroke();
      ctx.setLineDash([]);

      // Oscillate depth angle 75 - 110 deg
      const depthAngle = Math.round(92 + 18 * Math.sin(tick));
      const depthValText = document.getElementById('depthValText');
      const currentDepthDeg = document.getElementById('currentDepthDeg');
      if (depthValText) {
        depthValText.textContent = depthAngle <= 90 ? `Parallel Achieved (${depthAngle}°)` : `Above Parallel (${depthAngle}°)`;
        depthValText.style.color = depthAngle <= 90 ? '#34d399' : '#fbbf24';
      }
      if (currentDepthDeg) currentDepthDeg.textContent = depthAngle + '°';

      // Actual bar path curve
      const wobble = Math.sin(tick) * 10;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(barIdealX, 40);
      ctx.quadraticCurveTo(barIdealX + wobble, 130, barIdealX + (wobble * 0.4), 230);
      ctx.stroke();

      // Stick athlete
      const hipY = 140 + Math.sin(tick) * 35;
      const hipX = barIdealX + 15 + Math.sin(tick) * 10;
      const kneeX = barIdealX - 35;
      const kneeY = 210;
      const ankleX = barIdealX - 30;
      const ankleY = 250;
      const headY = hipY - 65;

      // Skeleton limbs
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Torso
      ctx.beginPath();
      ctx.moveTo(hipX - 12, headY + 14);
      ctx.lineTo(hipX, hipY);
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(hipX - 12, headY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Thigh
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(kneeX, kneeY);
      ctx.stroke();

      // Shin
      ctx.beginPath();
      ctx.moveTo(kneeX, kneeY);
      ctx.lineTo(ankleX, ankleY);
      ctx.stroke();

      // Foot
      ctx.beginPath();
      ctx.moveTo(ankleX, ankleY);
      ctx.lineTo(ankleX + 25, ankleY);
      ctx.stroke();

      // Barbell on shoulders
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(hipX - 6, headY + 20, 10, 0, Math.PI * 2);
      ctx.fill();

      // Keypoints markers
      [
        { x: hipX, y: hipY },
        { x: kneeX, y: kneeY },
        { x: ankleX, y: ankleY }
      ].forEach(pt => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      activeAnimId = requestAnimationFrame(draw);
    }

    draw();
  }

  // Live Sandbox 2: Wearable Sync
  function initWearableSync() {
    let hr = 148;
    let isConnected = true;
    const bpmEl = document.getElementById('wearableBpm');
    const zoneEl = document.getElementById('wearableZoneLabel');
    const toggleBtn = document.getElementById('toggleBleBtn');
    const ecgBars = document.querySelectorAll('.ecg-bar');

    activeIntervalId = setInterval(() => {
      if (!isConnected) return;
      const delta = (Math.random() - 0.48) * 4;
      hr = Math.min(182, Math.max(122, Math.round(hr + delta)));
      if (bpmEl) bpmEl.textContent = hr;

      if (zoneEl) {
        if (hr < 130) {
          zoneEl.textContent = 'Zone 2 - Aerobic Base';
          zoneEl.style.color = '#34d399';
        } else if (hr < 145) {
          zoneEl.textContent = 'Zone 3 - Aerobic Threshold';
          zoneEl.style.color = '#38bdf8';
        } else if (hr < 165) {
          zoneEl.textContent = 'Zone 4 - Anaerobic';
          zoneEl.style.color = '#fbbf24';
        } else {
          zoneEl.textContent = 'Zone 5 - Redline Peak';
          zoneEl.style.color = '#f87171';
        }
      }

      // Animate ecg bars
      ecgBars.forEach(b => {
        const randH = Math.round(20 + Math.random() * 80);
        b.style.height = randH + '%';
      });
    }, 1100);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isConnected = !isConnected;
        if (isConnected) {
          toggleBtn.textContent = '✓ BLE Device Connected (Apple Watch Ultra)';
          toggleBtn.style.color = '#34d399';
          toggleBtn.style.borderColor = '#10b981';
        } else {
          toggleBtn.textContent = 'Simulate BLE Connect';
          toggleBtn.style.color = '#a1a1aa';
          toggleBtn.style.borderColor = '#3f3f46';
          if (bpmEl) bpmEl.textContent = '--';
          if (zoneEl) zoneEl.textContent = 'Signal Disconnected';
        }
      });
    }
  }

  // Live Sandbox 3: Gym Crowd Meter
  function initGymCrowdMeter() {
    const refreshBtn = document.getElementById('refreshHeatmapBtn');
    const occEl = document.getElementById('occupancyVal');
    const rackText = document.getElementById('rackStatusText');
    const rackBar = document.getElementById('rackProgressBar');
    const benchText = document.getElementById('benchStatusText');
    const benchBar = document.getElementById('benchProgressBar');
    const cardioText = document.getElementById('cardioStatusText');
    const cardioBar = document.getElementById('cardioProgressBar');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const occ = Math.round(52 + Math.random() * 36);
        if (occEl) occEl.textContent = occ + '% Capacity';

        const rackUsed = Math.floor(Math.random() * 2) + 3; // 3 or 4
        const rackPct = Math.round((rackUsed / 4) * 100);
        if (rackText) rackText.textContent = `${rackUsed} of 4 in use (${rackPct}%)`;
        if (rackBar) rackBar.style.width = rackPct + '%';

        const benchUsed = Math.floor(Math.random() * 2) + 4; // 4 or 5
        const benchPct = Math.round((benchUsed / 6) * 100);
        if (benchText) benchText.textContent = `${benchUsed} of 6 in use (${benchPct}%)`;
        if (benchBar) benchBar.style.width = benchPct + '%';

        const cardioUsed = Math.floor(Math.random() * 6) + 10;
        const cardioPct = Math.round((cardioUsed / 20) * 100);
        if (cardioText) cardioText.textContent = `${cardioUsed} of 20 in use (${cardioPct}%)`;
        if (cardioBar) cardioBar.style.width = cardioPct + '%';
      });
    }
  }

  // Live Sandbox 4: Meal Plan AI
  function initMealPlanAi() {
    const rangeInput = document.getElementById('proteinRangeInput');
    const targetLabel = document.getElementById('proteinTargetLabel');
    const mealsGrid = document.getElementById('macroMealsGrid');
    const totalsSummary = document.getElementById('macroTotalsSummary');
    const exportBtn = document.getElementById('exportInstacartBtn');

    function updateMeals(val) {
      if (targetLabel) targetLabel.textContent = `${val}g Protein`;
      const p = Number(val);

      const m1 = Math.round(p * 0.22);
      const m2 = Math.round(p * 0.35);
      const m3 = Math.round(p * 0.18);
      const m4 = Math.round(p * 0.25);
      const totalKcal = Math.round(p * 13.8);

      if (mealsGrid) {
        mealsGrid.innerHTML = `
          <div style="background:#18181b;padding:0.65rem 0.75rem;border-radius:10px;border:1px solid #27272a;">
            <div style="font-weight:700;color:#ffffff;">Meal 1: Protein Oats &amp; Berries</div>
            <div style="color:#a1a1aa;font-size:0.72rem;margin-top:0.15rem;">${m1}g Protein • 420 kcal</div>
          </div>
          <div style="background:#18181b;padding:0.65rem 0.75rem;border-radius:10px;border:1px solid #27272a;">
            <div style="font-weight:700;color:#ffffff;">Meal 2: Chicken Breast &amp; Quinoa</div>
            <div style="color:#a1a1aa;font-size:0.72rem;margin-top:0.15rem;">${m2}g Protein • 580 kcal</div>
          </div>
          <div style="background:#18181b;padding:0.65rem 0.75rem;border-radius:10px;border:1px solid #27272a;">
            <div style="font-weight:700;color:#ffffff;">Meal 3: Whey Isolate Shake</div>
            <div style="color:#a1a1aa;font-size:0.72rem;margin-top:0.15rem;">${m3}g Protein • 170 kcal</div>
          </div>
          <div style="background:#18181b;padding:0.65rem 0.75rem;border-radius:10px;border:1px solid #27272a;">
            <div style="font-weight:700;color:#ffffff;">Meal 4: Wild Salmon &amp; Sweet Potato</div>
            <div style="color:#a1a1aa;font-size:0.72rem;margin-top:0.15rem;">${m4}g Protein • 620 kcal</div>
          </div>
        `;
      }

      if (totalsSummary) {
        totalsSummary.textContent = `Target Calibrated: ${p}g Protein • ${totalKcal} kcal`;
      }
    }

    if (rangeInput) {
      rangeInput.addEventListener('input', (e) => {
        updateMeals(e.target.value);
      });
      updateMeals(rangeInput.value);
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportBtn.textContent = 'Exported to Cart ✓';
        exportBtn.style.background = '#059669';
        setTimeout(() => {
          exportBtn.textContent = 'Export Grocery List';
          exportBtn.style.background = '#10b981';
        }, 2500);
      });
    }
  }

  // Live Canvas 5: 3D Body Mesh
  function initBodyScan3D() {
    const canvas = document.getElementById('bodyMeshCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let isAutoRotating = true;

    const toggleBtn = document.getElementById('toggleRotate3dBtn');
    const resetBtn = document.getElementById('reset3dAngleBtn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;
        toggleBtn.textContent = isAutoRotating ? 'Pause 360° Spin' : 'Resume 360° Spin';
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        angle = 0;
      });
    }

    // Touch and drag support
    let isDragging = false;
    let startX = 0;
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        startX = e.clientX;
        angle += dx * 0.015;
      }
    });

    function draw() {
      if (isAutoRotating && !isDragging) {
        angle += 0.018;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw wireframe silhouette
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;

      // 3D Elliptical slices with Chest, Biceps, Waist calipers
      const slices = [
        { y: -105, rx: 20, ry: 15, label: 'Head' },
        { y: -65, rx: 32, ry: 20, label: 'Neck/Traps' },
        { y: -30, rx: 50, ry: 30, label: 'Chest: 41.5"', caliper: true },
        { y: -5, rx: 26, ry: 18, label: 'Biceps: 15.4"', caliper: true },
        { y: 20, rx: 38, ry: 25, label: 'Waist: 32.2"', caliper: true },
        { y: 55, rx: 46, ry: 28, label: 'Hips: 39.8"' },
        { y: 100, rx: 24, ry: 18, label: 'Thigh: 24.1"' },
        { y: 140, rx: 18, ry: 12, label: 'Calf: 15.6"' }
      ];

      slices.forEach(s => {
        const py = cy + s.y;
        const currentRx = s.rx * Math.abs(Math.cos(angle)) + s.ry * Math.abs(Math.sin(angle));
        ctx.beginPath();
        ctx.ellipse(cx, py, currentRx, 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Caliper callouts
        if (s.caliper) {
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(cx + currentRx, py, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f8fafc';
          ctx.font = '11px sans-serif';
          ctx.fillText(s.label, cx + currentRx + 12, py + 4);

          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = '#0891b2';
          ctx.beginPath();
          ctx.moveTo(cx + currentRx, py);
          ctx.lineTo(cx + currentRx + 10, py);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Spine
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 115);
      ctx.lineTo(cx, cy + 145);
      ctx.stroke();

      activeAnimId = requestAnimationFrame(draw);
    }

    draw();
  }

  // DOM ready check
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
