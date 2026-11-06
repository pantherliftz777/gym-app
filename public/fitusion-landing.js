/**
 * FitFuel Dribbble Landing Controller
 * Reference: Dribbble Shot 25337726 (Fitness Website Design)
 * - Volumetric White Light Cone Cursor Physics
 * - Dark & Light Mode Switcher
 * - Auth Portal Modal -> /dashboard.html Navigation
 */

(function () {
  'use strict';

  // 1. HERO VOLUMETRIC LIGHT CONE CURSOR TRACKING
  function initHeroCursorTracking() {
    const hero = document.getElementById('heroContainer');
    const lightCone = document.getElementById('heroLightCone');
    if (!hero || !lightCone) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rAFId = null;

    function render() {
      // Fluid physics lerp
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      lightCone.style.setProperty('--cone-x', `${currentX.toFixed(2)}px`);
      lightCone.style.setProperty('--cone-y', `${currentY.toFixed(2)}px`);

      // Dynamic 3D perspective tilt
      const tiltX = (currentX * 0.08).toFixed(2);
      const tiltY = (-currentY * 0.08).toFixed(2);
      lightCone.style.setProperty('--tilt-x', `${tiltX}deg`);
      lightCone.style.setProperty('--tilt-y', `${tiltY}deg`);

      if (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4) {
        rAFId = requestAnimationFrame(render);
      } else {
        rAFId = null;
      }
    }

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.45;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Bound natural stage range (-180px to +180px)
      targetX = Math.max(-180, Math.min(180, deltaX * 0.45));
      targetY = Math.max(-120, Math.min(120, deltaY * 0.35));

      if (!rAFId) {
        rAFId = requestAnimationFrame(render);
      }
    });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!rAFId) {
        rAFId = requestAnimationFrame(render);
      }
    });
  }

  // 2. THEME SWITCHER (DARK & LIGHT)
  function initTheme() {
    const btn = document.getElementById('themeToggleBtn');
    const label = document.getElementById('themeLabel');
    if (!btn) return;

    function sync(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      if (label) label.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
      localStorage.setItem('fitfuel_theme', theme);
    }

    const saved = localStorage.getItem('fitfuel_theme') || 'dark';
    sync(saved);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      sync(current === 'dark' ? 'light' : 'dark');
    });
  }

  // 3. AUTH MODAL PIPELINE
  function initAuth() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('authCloseBtn');
    const backdrop = document.getElementById('authBackdrop');
    const submitBtn = document.getElementById('authSubmitBtn');
    const demoBtn = document.getElementById('authDemoBtn');

    if (!modal) return;

    function open() {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('userEmail');
      if (input) setTimeout(() => input.focus(), 100);
    }

    function close() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    function launchDashboard() {
      localStorage.setItem('fitfuel_auth', 'true');
      close();
      // Redirect to the full functioning dashboard
      window.location.href = '/dashboard.html';
    }

    // Attach to all triggers
    document.querySelectorAll('.auth-trigger').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        open();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') close();
    });

    if (submitBtn) submitBtn.addEventListener('click', launchDashboard);
    if (demoBtn) demoBtn.addEventListener('click', launchDashboard);

    window.openFitFuelAuth = open;
    window.closeFitFuelAuth = close;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeroCursorTracking();
    initTheme();
    initAuth();
  });
})();
