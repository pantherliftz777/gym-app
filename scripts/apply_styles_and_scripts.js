const fs = require('fs');

// 1. UPDATE public/fitfuel.js
let js = fs.readFileSync('public/fitfuel.js', 'utf8');

const targetJsSnippet = `// Mobile menu and drawer toggles
if ($('#mobileMenuBtn')) {
  $('#mobileMenuBtn').onclick = () => {
    const isOpen = $('#sidebar').classList.toggle('mobile-open');
    $('#mobileSidebarBackdrop')?.classList.toggle('active', isOpen);
  };
}

if ($('#mobileSidebarBackdrop')) {
  $('#mobileSidebarBackdrop').onclick = () => {
    $('#sidebar')?.classList.remove('mobile-open');
    $('#mobileSidebarBackdrop')?.classList.remove('active');
  };
}`;

const replacementJsSnippet = `// ==========================================================================
// UNIFIED SIDEBAR & HAMBURGER CONTROLLER (DESKTOP RAIL & MOBILE DRAWER)
// ==========================================================================
function toggleSidebarMenu(forceState) {
  const sidebar = $('#sidebar');
  const backdrop = $('#mobileSidebarBackdrop');
  const toggleBtn = $('#sidebarToggle');
  const mobBtn = $('#mobileMenuBtn');
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    if (!sidebar) return;
    const shouldOpen = forceState !== undefined ? forceState : !sidebar.classList.contains('mobile-open');
    sidebar.classList.toggle('mobile-open', shouldOpen);
    backdrop?.classList.toggle('active', shouldOpen);
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(shouldOpen));
    if (mobBtn) mobBtn.setAttribute('aria-expanded', String(shouldOpen));
  } else {
    const html = document.documentElement;
    const willCollapse = forceState !== undefined ? forceState : !html.classList.contains('sidebar-collapsed');
    html.classList.toggle('sidebar-collapsed', willCollapse);
    const isExpanded = !willCollapse;
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(isExpanded));
    if (mobBtn) mobBtn.setAttribute('aria-expanded', String(isExpanded));
    try {
      localStorage.setItem('ff_sidebar_collapsed', String(willCollapse));
    } catch (e) {}
    // Animate smoothly (200-250ms) then re-fit charts & canvases
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 240);
  }
}
window.toggleSidebarMenu = toggleSidebarMenu;

const sidebarToggleBtn = $('#sidebarToggle');
if (sidebarToggleBtn) {
  sidebarToggleBtn.onclick = (e) => {
    e.preventDefault();
    toggleSidebarMenu();
  };
  sidebarToggleBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSidebarMenu();
    }
  });
}

const mobileMenuBtn = $('#mobileMenuBtn');
if (mobileMenuBtn) {
  mobileMenuBtn.onclick = (e) => {
    e.preventDefault();
    toggleSidebarMenu();
  };
}

if ($('#mobileSidebarBackdrop')) {
  $('#mobileSidebarBackdrop').onclick = () => {
    toggleSidebarMenu(false);
  };
}

// Global keyboard accessibility: Escape closes mobile drawer
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sidebar = $('#sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      toggleSidebarMenu(false);
    }
  }
});

// Sync initial aria-expanded on load
(function syncAriaState() {
  const isMobile = window.innerWidth <= 768;
  const toggleBtn = $('#sidebarToggle');
  const mobBtn = $('#mobileMenuBtn');
  if (!isMobile) {
    const isCollapsed = document.documentElement.classList.contains('sidebar-collapsed');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
    if (mobBtn) mobBtn.setAttribute('aria-expanded', String(!isCollapsed));
  } else {
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    if (mobBtn) mobBtn.setAttribute('aria-expanded', 'false');
  }
})();`;

if (js.includes(targetJsSnippet)) {
  js = js.replace(targetJsSnippet, replacementJsSnippet);
} else {
  js = js.replace(targetJsSnippet.replace(/\n/g, '\r\n'), replacementJsSnippet.replace(/\n/g, '\r\n'));
}

// Inside switchView: ensure mobile drawer closes and resets aria-expanded
const targetSwitchViewClose = `  // Close mobile drawer if open
  $('#sidebar')?.classList.remove('mobile-open');
  $('#mobileSidebarBackdrop')?.classList.remove('active');`;

const replacementSwitchViewClose = `  // Close mobile drawer if open
  $('#sidebar')?.classList.remove('mobile-open');
  $('#mobileSidebarBackdrop')?.classList.remove('active');
  if (window.innerWidth <= 768) {
    $('#sidebarToggle')?.setAttribute('aria-expanded', 'false');
    $('#mobileMenuBtn')?.setAttribute('aria-expanded', 'false');
  }`;

if (js.includes(targetSwitchViewClose)) {
  js = js.replace(targetSwitchViewClose, replacementSwitchViewClose);
} else {
  js = js.replace(targetSwitchViewClose.replace(/\n/g, '\r\n'), replacementSwitchViewClose.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('✔ Successfully updated public/fitfuel.js with unified hamburger & drawer controller');

// 2. UPDATE public/styles.css
let css = fs.readFileSync('public/styles.css', 'utf8');

// Replace width: 250px !important; on .sidebar
const sidebarWidthOld = `.sidebar {
  position: fixed !important;
  inset: 0 auto 0 0 !important;
  width: 250px !important;`;

const sidebarWidthNew = `:root {
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 76px;
}

html.sidebar-collapsed {
  --sidebar-width: var(--sidebar-collapsed-width);
}

.sidebar {
  position: fixed !important;
  inset: 0 auto 0 0 !important;
  width: var(--sidebar-width) !important;`;

if (css.includes(sidebarWidthOld)) {
  css = css.replace(sidebarWidthOld, sidebarWidthNew);
} else {
  css = css.replace(sidebarWidthOld.replace(/\n/g, '\r\n'), sidebarWidthNew.replace(/\n/g, '\r\n'));
}

// Add the complete new sidebar styles block at the end of styles.css
const sidebarStylesBlock = `

/* ==========================================================================
   FITFUEL V7.6 SIDEBAR, HEADING, HAMBURGER & COLLAPSED RAIL SYSTEM
   ========================================================================== */
.sidebar {
  transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1), scrollbar-color 0.25s ease !important;
  padding: 18px 14px 24px !important;
  box-sizing: border-box !important;
}

.sidebar .brand {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 4px 6px 10px !important;
  flex-shrink: 0 !important;
  transition: all 0.2s ease !important;
}

.sidebar-heading-row {
  height: 32px;
  min-height: 32px;
  max-height: 32px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  margin-bottom: 6px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.sidebar-main-heading {
  font-size: 1.12rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ff-text-primary, #0f172a);
  margin: 0;
  white-space: nowrap;
  transition: opacity 0.18s ease;
}

html.dark .sidebar-main-heading,
[data-theme="dark"] .sidebar-main-heading {
  color: var(--glass-text-primary, #f8fafc);
}

.sidebar-toggle-row {
  display: flex;
  align-items: center;
  padding: 0 6px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.sidebar-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid var(--ff-glass-border, rgba(226, 232, 240, 0.8));
  background: var(--ff-surface, rgba(255, 255, 255, 0.85));
  color: var(--ff-text-secondary, #64748b);
  cursor: pointer;
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease;
  padding: 0;
  box-sizing: border-box;
}

.sidebar-toggle-btn:hover {
  background: var(--ff-surface-hover, rgba(255, 255, 255, 0.95));
  color: var(--ff-text-primary, #0f172a);
  border-color: #38bdf8;
}

.sidebar-toggle-btn:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

html.dark .sidebar-toggle-btn,
[data-theme="dark"] .sidebar-toggle-btn {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

html.dark .sidebar-toggle-btn:hover,
[data-theme="dark"] .sidebar-toggle-btn:hover {
  background: rgba(30, 41, 59, 0.9);
  color: #f8fafc;
  border-color: #38bdf8;
}

/* Collapsed Rail (Desktop, ~76px) */
html.sidebar-collapsed .sidebar {
  padding: 18px 8px 24px !important;
}

html.sidebar-collapsed .sidebar .brand {
  justify-content: center !important;
  padding: 4px 0 10px !important;
}

html.sidebar-collapsed .sidebar .brand-title {
  display: none !important;
}

/* Heading row preserves exact 32px height so the hamburger button below never jumps */
html.sidebar-collapsed .sidebar-heading-row {
  justify-content: center;
}

html.sidebar-collapsed .sidebar-main-heading {
  opacity: 0;
  visibility: hidden;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

html.sidebar-collapsed .sidebar-toggle-row {
  justify-content: center;
  padding: 0;
}

html.sidebar-collapsed .sidebar .primary-nav,
html.sidebar-collapsed .sidebar .sidebar-label,
html.sidebar-collapsed .sidebar .sidebar-bottom {
  display: none !important;
}

/* Desktop Main Area dynamic expansion & contraction */
@media (min-width: 769px) {
  .main-area {
    margin-left: var(--sidebar-width) !important;
    transition: margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
    width: auto !important;
    min-height: 100vh !important;
    box-sizing: border-box !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .main-area,
  .sidebar-toggle-btn,
  .sidebar-main-heading {
    transition: none !important;
  }
}

/* Mobile top bar and drawer refinements */
@media (max-width: 768px) {
  .mobile-menu {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    cursor: pointer !important;
  }

  .mobile-menu:focus-visible {
    outline: 2px solid #38bdf8 !important;
    outline-offset: 2px !important;
  }

  .topbar {
    position: sticky !important;
    top: 0 !important;
    z-index: 9999 !important;
    padding-top: max(8px, env(safe-area-inset-top, 0px)) !important;
  }

  .mobile-dashboard-heading {
    font-size: 0.88rem !important;
    font-weight: 700 !important;
    color: var(--glass-text-secondary, #94a3b8) !important;
    margin-left: 6px !important;
    padding-left: 8px !important;
    border-left: 1.5px solid var(--glass-border, rgba(255, 255, 255, 0.15)) !important;
    letter-spacing: -0.01em !important;
    display: inline-block !important;
  }
}
`;

css += sidebarStylesBlock.replace(/\n/g, '\r\n');
fs.writeFileSync('public/styles.css', css, 'utf8');
console.log('✔ Successfully updated public/styles.css with complete sidebar, collapsed rail and mobile drawer styles');
