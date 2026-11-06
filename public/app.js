/**
 * FitFuel Frontend Controller v9.1.0
 * Handles Volumetric Light Cone physics, theme toggles, modal lifecycle, and demo login.
 */
(function() {
  'use strict';

  // 1. THEME CONTROLLER
  function initTheme() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('fitfuel_theme', next);
    });
  }

  // 2. VOLUMETRIC LIGHT CONE CURSOR TRACKING
  function initHeroLightCone() {
    const hero = document.getElementById('heroStage');
    const cone = document.getElementById('heroLightCone');
    if (!hero || !cone) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    function renderLoop() {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      hero.style.setProperty('--cone-x', currentX.toFixed(2) + 'px');
      cone.style.setProperty('--cone-x', currentX.toFixed(2) + 'px');
      hero.style.setProperty('--cone-y', currentY.toFixed(2) + 'px');
      cone.style.setProperty('--cone-y', currentY.toFixed(2) + 'px');
      hero.style.setProperty('--tilt-x', (currentY * -0.06).toFixed(2) + 'deg');
      hero.style.setProperty('--tilt-y', (currentX * 0.06).toFixed(2) + 'deg');

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(renderLoop);
      } else {
        rafId = null;
      }
    }

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height * 0.45;

      targetX = Math.max(-180, Math.min(180, (e.clientX - midX) * 0.4));
      targetY = Math.max(-120, Math.min(120, (e.clientY - midY) * 0.3));

      if (!rafId) rafId = requestAnimationFrame(renderLoop);
    });
  }

  // 3. VIP AUTH GATE MODAL & DEMO LIFTER
  function initAuthModal() {
    const overlay = document.getElementById('authOverlay') || document.getElementById('authModalOverlay');
    const closeBtn = document.getElementById('authCloseBtn');
    const triggers = document.querySelectorAll('.auth-trigger');
    const demoBtns = document.querySelectorAll('.demo-lifter-trigger, .btn-demo-instant');
    const authForm = document.getElementById('authForm');

    if (!overlay) return;

    function openModal() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    triggers.forEach(b => b.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    }));

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    // 1-Click Instant Demo Lifter
    demoBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('fitfuel_auth', 'true');
        localStorage.setItem('fitfuel_demo_user', 'Jordan Davis');
        closeModal();
        window.location.href = '/dashboard.html';
      });
    });

    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('fitfuel_auth', 'true');
        localStorage.setItem('fitfuel_demo_user', 'Jordan Davis');
        closeModal();
        window.location.href = '/dashboard.html';
      });
    }
  }

  // 4. MOBILE DRAWER
  function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobileNavBtn');
    const drawer = document.getElementById('mobileDrawer');
    const closeBtn = document.getElementById('drawerCloseBtn');
    const links = document.querySelectorAll('.drawer-link');

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
      const siteNav = document.querySelector('.site-nav');
      if (siteNav) siteNav.classList.toggle('open');
    });
    if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
    links.forEach(l => l.addEventListener('click', () => drawer.classList.remove('open')));
  }

  // 5. 1RM EPLEY CALCULATOR
  function initCalculator() {
    const w = document.getElementById('calcWeight');
    const r = document.getElementById('calcReps');
    const res = document.getElementById('epleyResult');
    if (!w || !r || !res) return;

    function calc() {
      const weight = parseFloat(w.value) || 0;
      const reps = parseInt(r.value, 10) || 1;
      const oneRm = reps === 1 ? weight : Math.round(weight * (1 + reps / 30));
      res.textContent = oneRm + ' kg';
    }

    w.addEventListener('input', calc);
    r.addEventListener('input', calc);
    calc();
  }

  // 6. HYDRATION TRACKER
  function initHydration() {
    const btn = document.getElementById('btnLogWater');
    const fill = document.getElementById('waterFill');
    const cur = document.getElementById('demoHydroVal') || document.getElementById('waterCurrent');
    if (!btn || !fill || !cur) return;

    let total = 1250;
    const goal = 3500;

    btn.addEventListener('click', () => {
      total = Math.min(goal, total + 500);
      const pct = Math.round((total / goal) * 100);
      fill.style.width = pct + '%';
      cur.textContent = total.toLocaleString() + ' ml';
    });
  }

  
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

  // INIT EVERYTHING ON DOM READY
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHeroLightCone();
    initAuthModal();
    initMobileDrawer();
    initCalculator();
    initHydration();
    initRoleTabs();
  });
})();
