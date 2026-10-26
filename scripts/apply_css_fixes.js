const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

const additionalCss = `

/* ==========================================================================
   FITFUEL YOUR SPACE SIDEBAR, PARTITION, 3-LINES TOGGLE & SCROLLING ENHANCEMENT
   ========================================================================== */
.sidebar {
  position: fixed !important;
  inset: 0 auto 0 0 !important;
  width: 260px !important;
  height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 0 !important;
  margin: 0 !important;
  z-index: 10001 !important;
  background: var(--ff-glass-bg) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border-right: 1px solid var(--ff-glass-border) !important;
  box-shadow: 4px 0 32px rgba(15, 23, 42, 0.04) !important;
  transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease !important;
  overflow: visible !important;
}

html.dark .sidebar, [data-theme="dark"] .sidebar {
  box-shadow: 4px 0 32px rgba(0, 0, 0, 0.45) !important;
}

/* 1. Brand / Logo Partition (Slid higher) */
.sidebar-brand-wrapper {
  padding: 16px 18px 12px 18px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  flex-shrink: 0 !important;
  transition: all 0.2s ease !important;
}
.sidebar-brand-wrapper .brand {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Horizontal Partition Line */
.sidebar-partition-line {
  height: 1px !important;
  width: calc(100% - 32px) !important;
  margin: 0 auto 8px auto !important;
  background: linear-gradient(90deg, transparent, var(--ff-glass-border, rgba(226, 232, 240, 0.85)), transparent) !important;
  flex-shrink: 0 !important;
}

/* 2. Control Bar with Three Lines Toggle Button */
.sidebar-control-bar {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 2px 16px 8px 16px !important;
  flex-shrink: 0 !important;
  transition: all 0.2s ease !important;
}

.sidebar-collapse-toggle-btn {
  width: 34px !important;
  height: 34px !important;
  border-radius: 9px !important;
  border: 1.5px solid var(--ff-glass-border, #e2e8f0) !important;
  background: var(--ff-glass-bg, #ffffff) !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: var(--ff-text-secondary, #475569) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  flex-shrink: 0 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04) !important;
}
.sidebar-collapse-toggle-btn:hover {
  background: var(--ff-glass-bg-hover, #f1f5f9) !important;
  color: #16c79a !important;
  border-color: rgba(22, 199, 154, 0.45) !important;
  transform: scale(1.05) !important;
  box-shadow: 0 2px 8px rgba(22, 199, 154, 0.2) !important;
}
.sidebar-collapse-toggle-btn svg {
  stroke: currentColor !important;
}

.sidebar-space-title {
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.08em !important;
  color: var(--ff-text-muted, #94a3b8) !important;
  text-transform: uppercase !important;
  white-space: nowrap !important;
  user-select: none !important;
}

/* 3. Smooth Scrolling for Primary Navigation */
.primary-nav {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  height: auto !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 4px 12px 14px 12px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
  scrollbar-width: thin !important;
  scrollbar-color: rgba(148, 163, 184, 0.35) transparent !important;
  overscroll-behavior: contain !important;
}

.primary-nav::-webkit-scrollbar {
  width: 5px !important;
}
.primary-nav::-webkit-scrollbar-track {
  background: transparent !important;
}
.primary-nav::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35) !important;
  border-radius: 99px !important;
}
.primary-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.55) !important;
}

/* Nav Section Group Headers */
.nav-group-header {
  font-size: 0.67rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.08em !important;
  color: var(--ff-text-muted, #94a3b8) !important;
  padding: 12px 12px 4px 12px !important;
  text-transform: uppercase !important;
  white-space: nowrap !important;
  user-select: none !important;
}
.nav-group-header:first-of-type {
  padding-top: 4px !important;
}

/* Nav Links & Badges */
.primary-nav .nav-link {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  border-radius: 12px !important;
  padding: 9px 12px !important;
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  color: var(--ff-text-secondary, #475569) !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  cursor: pointer !important;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
  text-align: left !important;
}

.primary-nav .nav-link:hover {
  background: var(--ff-glass-bg-hover, rgba(241, 245, 249, 0.7)) !important;
  color: var(--ff-text-primary, #0f172a) !important;
  transform: translateX(2px) !important;
}

.primary-nav .nav-link.selected {
  background: #ffffff !important;
  color: #0f172a !important;
  font-weight: 700 !important;
  border: 1px solid rgba(226, 232, 240, 0.9) !important;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06) !important;
}

html.dark .primary-nav .nav-link.selected,
[data-theme="dark"] .primary-nav .nav-link.selected {
  background: rgba(30, 58, 138, 0.45) !important;
  border: 1px solid rgba(56, 189, 248, 0.4) !important;
  color: #38bdf8 !important;
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.2) !important;
}

.nav-badge-pill {
  font-size: 0.62rem !important;
  font-weight: 800 !important;
  padding: 2px 7px !important;
  border-radius: 99px !important;
  margin-left: auto !important;
  letter-spacing: 0.04em !important;
}
.nav-badge-pill.live {
  background: rgba(22, 199, 154, 0.16) !important;
  color: #10b981 !important;
  border: 1px solid rgba(22, 199, 154, 0.35) !important;
}
.nav-badge-pill.scan {
  background: rgba(2, 132, 199, 0.16) !important;
  color: #0284c7 !important;
  border: 1px solid rgba(2, 132, 199, 0.35) !important;
}
.nav-badge-pill.admin {
  background: #1e3a8a !important;
  color: #38bdf8 !important;
  border: 1px solid #38bdf8 !important;
}

/* 4. DESKTOP COLLAPSED / RAIL & HOVER PREVIEW STATES */
@media (min-width: 901px) {
  .app-shell.sidebar-collapsed #sidebar,
  #sidebar.collapsed {
    width: 68px !important;
    min-width: 68px !important;
    max-width: 68px !important;
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    overflow: visible !important;
    box-shadow: 2px 0 16px rgba(15, 23, 42, 0.04) !important;
  }

  .app-shell.sidebar-collapsed #sidebar .brand-title,
  #sidebar.collapsed .brand-title,
  .app-shell.sidebar-collapsed #sidebar .sidebar-space-title,
  #sidebar.collapsed .sidebar-space-title,
  .app-shell.sidebar-collapsed #sidebar .nav-group-header,
  #sidebar.collapsed .nav-group-header,
  .app-shell.sidebar-collapsed #sidebar .nav-link span:not(.nav-active-dot),
  #sidebar.collapsed .nav-link span:not(.nav-active-dot),
  .app-shell.sidebar-collapsed #sidebar .nav-badge-pill,
  #sidebar.collapsed .nav-badge-pill,
  .app-shell.sidebar-collapsed #sidebar .weekly-mini,
  #sidebar.collapsed .weekly-mini,
  .app-shell.sidebar-collapsed #sidebar .profile-shortcut span,
  #sidebar.collapsed .profile-shortcut span,
  .app-shell.sidebar-collapsed #sidebar .profile-shortcut svg,
  #sidebar.collapsed .profile-shortcut svg {
    display: none !important;
  }

  .app-shell.sidebar-collapsed #sidebar .sidebar-brand-wrapper,
  #sidebar.collapsed .sidebar-brand-wrapper {
    justify-content: center !important;
    padding: 14px 0 10px 0 !important;
  }
  .app-shell.sidebar-collapsed #sidebar .brand,
  #sidebar.collapsed .brand {
    justify-content: center !important;
  }

  .app-shell.sidebar-collapsed #sidebar .sidebar-partition-line,
  #sidebar.collapsed .sidebar-partition-line {
    width: 40px !important;
    margin: 0 auto 8px auto !important;
  }

  .app-shell.sidebar-collapsed #sidebar .sidebar-control-bar,
  #sidebar.collapsed .sidebar-control-bar {
    justify-content: center !important;
    padding: 0 0 8px 0 !important;
  }

  .app-shell.sidebar-collapsed #sidebar .primary-nav,
  #sidebar.collapsed .primary-nav {
    padding: 4px 6px 12px 6px !important;
    align-items: center !important;
  }

  .app-shell.sidebar-collapsed #sidebar .nav-link,
  #sidebar.collapsed .nav-link {
    width: 44px !important;
    height: 44px !important;
    padding: 0 !important;
    justify-content: center !important;
    border-radius: 12px !important;
  }

  .app-shell.sidebar-collapsed #sidebar .profile-shortcut,
  #sidebar.collapsed .profile-shortcut {
    width: 44px !important;
    height: 44px !important;
    padding: 0 !important;
    justify-content: center !important;
    margin: 0 auto !important;
  }

  .app-shell.sidebar-collapsed .main-area {
    margin-left: 68px !important;
    width: calc(100% - 68px) !important;
    max-width: calc(100% - 68px) !important;
  }

  /* Hover Preview on Collapsed Sidebar */
  #sidebar.collapsed:hover,
  #sidebar.is-hover-expanded {
    width: 260px !important;
    min-width: 260px !important;
    max-width: 260px !important;
    box-shadow: 8px 0 40px rgba(0, 0, 0, 0.18) !important;
    z-index: 10005 !important;
    background: var(--ff-glass-bg, #ffffff) !important;
  }

  #sidebar.collapsed:hover .brand-title,
  #sidebar.is-hover-expanded .brand-title,
  #sidebar.collapsed:hover .sidebar-space-title,
  #sidebar.is-hover-expanded .sidebar-space-title,
  #sidebar.collapsed:hover .nav-group-header,
  #sidebar.is-hover-expanded .nav-group-header,
  #sidebar.collapsed:hover .nav-link span,
  #sidebar.is-hover-expanded .nav-link span,
  #sidebar.collapsed:hover .nav-badge-pill,
  #sidebar.is-hover-expanded .nav-badge-pill,
  #sidebar.collapsed:hover .weekly-mini,
  #sidebar.is-hover-expanded .weekly-mini,
  #sidebar.collapsed:hover .profile-shortcut span,
  #sidebar.is-hover-expanded .profile-shortcut span,
  #sidebar.collapsed:hover .profile-shortcut svg,
  #sidebar.is-hover-expanded .profile-shortcut svg {
    display: inline-flex !important;
  }
  #sidebar.collapsed:hover .nav-group-header,
  #sidebar.is-hover-expanded .nav-group-header {
    display: block !important;
  }
  #sidebar.collapsed:hover .weekly-mini,
  #sidebar.is-hover-expanded .weekly-mini {
    display: block !important;
  }
  #sidebar.collapsed:hover .sidebar-brand-wrapper,
  #sidebar.is-hover-expanded .sidebar-brand-wrapper {
    justify-content: flex-start !important;
    padding: 16px 18px 12px 18px !important;
  }
  #sidebar.collapsed:hover .brand,
  #sidebar.is-hover-expanded .brand {
    justify-content: flex-start !important;
  }
  #sidebar.collapsed:hover .sidebar-partition-line,
  #sidebar.is-hover-expanded .sidebar-partition-line {
    width: calc(100% - 32px) !important;
    margin: 0 auto 8px auto !important;
  }
  #sidebar.collapsed:hover .sidebar-control-bar,
  #sidebar.is-hover-expanded .sidebar-control-bar {
    justify-content: flex-start !important;
    padding: 2px 16px 8px 16px !important;
  }
  #sidebar.collapsed:hover .primary-nav,
  #sidebar.is-hover-expanded .primary-nav {
    padding: 4px 12px 14px 12px !important;
    align-items: stretch !important;
  }
  #sidebar.collapsed:hover .nav-link,
  #sidebar.is-hover-expanded .nav-link {
    width: 100% !important;
    height: auto !important;
    padding: 9px 12px !important;
    justify-content: flex-start !important;
  }
  #sidebar.collapsed:hover .profile-shortcut,
  #sidebar.is-hover-expanded .profile-shortcut {
    width: 100% !important;
    height: auto !important;
    padding: 10px 12px !important;
    justify-content: flex-start !important;
  }
}

/* 5. TODAY VIEW DASHBOARD GRID ADJUSTMENTS */
.dashboard-grid {
  grid-template-columns: 1fr 1fr !important;
  gap: 18px !important;
  margin-top: 18px !important;
  display: grid !important;
  align-items: stretch !important;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }
}

.panel.water-panel {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  min-height: 380px !important;
}

.panel.workout-panel {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  min-height: 380px !important;
}
`;

css += additionalCss;
fs.writeFileSync('public/styles.css', css, 'utf8');
console.log('Appended sidebar, collapse, scroll, and today grid CSS to public/styles.css');
