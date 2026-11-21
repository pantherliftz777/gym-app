/**
 * FitFuel Dribbble Cinematic Landing Page & Auth Controller
 * Reference: Dribbble Shot 25337726 (Fitness Website Design)
 * - Volumetric White Light Cone Cursor Physics & Spring Tilt
 * - Instant Light / Dark Mode Toggle with Persisted Storage
 * - VIP Auth Gate Portal Modal & Smooth Dashboard Transition
 * - Fullscreen Landing Showcase Isolation
 */

(function () {
  'use strict';

  // 1. FULLSCREEN LANDING ISOLATION
  function syncLandingViewIsolation() {
    const landingView = document.getElementById('view-landing');
    if (!landingView) return;

    function checkActive() {
      const isActive = landingView.classList.contains('active');
      if (isActive) {
        document.documentElement.classList.add('landing-active');
        if (document.body) document.body.classList.add('landing-active');
      } else {
        document.documentElement.classList.remove('landing-active');
        if (document.body) document.body.classList.remove('landing-active');
      }
    }

    checkActive();

    // Observe class mutations on #view-landing
    const observer = new MutationObserver(() => checkActive());
    observer.observe(landingView, { attributes: true, attributeFilter: ['class', 'style'] });

    // Hook window.switchView if present
    if (typeof window.switchView === 'function') {
      const originalSwitch = window.switchView;
      window.switchView = function (targetView) {
        originalSwitch.apply(this, arguments);
        setTimeout(checkActive, 10);
      };
    }
  }

  // 2. HERO VOLUMETRIC LIGHT CONE CURSOR TRACKING
  function initHeroCursorTracking() {
    const hero = document.getElementById('fitusionHero') || document.getElementById('landingHero');
    const lightCone = document.getElementById('heroLightCone');
    if (!hero || !lightCone) return;

    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let currentOffsetX = 0;
    let currentOffsetY = 0;
    let animationFrameId = null;

    function updateCone() {
      // Smooth lerp for liquid, volumetric beam motion
      currentOffsetX += (targetOffsetX - currentOffsetX) * 0.12;
      currentOffsetY += (targetOffsetY - currentOffsetY) * 0.12;

      lightCone.style.setProperty('--cone-offset-x', `${currentOffsetX.toFixed(2)}px`);
      lightCone.style.setProperty('--cone-offset-y', `${currentOffsetY.toFixed(2)}px`);

      // Gentle 3D perspective tilt
      const tiltX = (currentOffsetX * 0.08).toFixed(2);
      const tiltY = (-currentOffsetY * 0.08).toFixed(2);
      lightCone.style.setProperty('--tilt-x', `${tiltX}deg`);
      lightCone.style.setProperty('--tilt-y', `${tiltY}deg`);

      // Coordinate tracking for radial-gradient
      const normX = ((currentOffsetX / 250) * 25 + 50).toFixed(2);
      const normY = ((currentOffsetY / 200) * 25 + 40).toFixed(2);
      lightCone.style.setProperty('--cursor-x', `${normX}%`);
      lightCone.style.setProperty('--cursor-y', `${normY}%`);

      if (Math.abs(targetOffsetX - currentOffsetX) > 0.5 || Math.abs(targetOffsetY - currentOffsetY) > 0.5) {
        animationFrameId = requestAnimationFrame(updateCone);
      } else {
        animationFrameId = null;
      }
    }

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.45;

      const rawDistX = e.clientX - centerX;
      const rawDistY = e.clientY - centerY;

      // Bound motion within natural stage bounds (-180px to +180px)
      targetOffsetX = Math.max(-180, Math.min(180, rawDistX * 0.45));
      targetOffsetY = Math.max(-120, Math.min(120, rawDistY * 0.35));

      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updateCone);
      }
    });

    hero.addEventListener('mouseleave', () => {
      targetOffsetX = 0;
      targetOffsetY = 0;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updateCone);
      }
    });
  }

  // 3. THEME TOGGLE (DARK / LIGHT)
  function initThemeToggle() {
    const btn = document.getElementById('landingThemeToggleBtn');
    const label = document.getElementById('landingThemeLabel');
    if (!btn) return;

    function syncLabel(theme) {
      if (label) {
        label.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
      }
    }

    const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('fitfuel_theme') || 'dark';
    syncLabel(currentTheme);

    btn.onclick = function (e) {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        if (document.body) document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        if (document.body) document.body.classList.remove('dark');
      }

      localStorage.setItem('fitfuel_theme', nextTheme);
      syncLabel(nextTheme);

      if (typeof window.applyTheme === 'function') {
        window.applyTheme(nextTheme);
      }
    };
  }

  // 4. AUTH GATE MODAL PIPELINE
  function initAuthPortal() {
    const modal = document.getElementById('fitusionAuthModal');
    const closeBtn = document.getElementById('authModalCloseBtn');
    const backdrop = document.getElementById('authModalBackdrop');
    const submitBtn = document.getElementById('authSubmitBtn');
    const demoBtn = document.getElementById('authDemoBtn');

    if (!modal) return;

    function openModal() {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const emailInput = document.getElementById('authEmail');
      if (emailInput) setTimeout(() => emailInput.focus(), 100);
    }

    function closeModal() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function unlockDashboard() {
      localStorage.setItem('fitfuel_auth', 'true');
      closeModal();

      // Switch to #view-today
      if (typeof window.switchView === 'function') {
        window.switchView('today');
      } else if (typeof window.showSection === 'function') {
        window.showSection('today');
      } else {
        document.querySelectorAll('.view').forEach(v => {
          v.classList.remove('active');
          v.style.display = 'none';
        });
        const today = document.getElementById('view-today');
        if (today) {
          today.classList.add('active');
          today.style.display = 'block';
        }
      }

      // Display luxury welcome toast
      if (typeof window.showToast === 'function') {
        window.showToast('Welcome to FitFuel! Full Dashboard & Live Systems Unlocked.');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Attach open triggers to all auth triggers across landing
    document.querySelectorAll('.fitusion-auth-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        unlockDashboard();
      });
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        unlockDashboard();
      });
    }

    window.openFitFuelAuth = openModal;
    window.closeFitFuelAuth = closeModal;
    window.unlockFitFuelDashboard = unlockDashboard;
  }

  function checkInit() {
    syncLandingViewIsolation();
    initHeroCursorTracking();
    initThemeToggle();
    initAuthPortal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkInit);
  } else {
    checkInit();
  }

  window.initHeroCursorTracking = initHeroCursorTracking;
  window.initThemeToggle = initThemeToggle;
  window.initAuthPortal = initAuthPortal;
})();
