const fs = require('fs');

const sidebarCSS = `

/* ==========================================================================
   FITFUEL V7.6 SIDEBAR, HEADING, HAMBURGER & COLLAPSED RAIL SYSTEM
   ========================================================================== */
:root {
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 76px;
}

html.sidebar-collapsed {
  --sidebar-width: var(--sidebar-collapsed-width);
}

.sidebar {
  width: var(--sidebar-width) !important;
  transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1), scrollbar-color 0.25s ease !important;
  padding: 24px 14px 24px !important;
  padding-top: 24px !important;
  box-sizing: border-box !important;
}

.sidebar .brand {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 4px 6px 10px !important;
  flex-shrink: 0 !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  box-sizing: border-box !important;
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
  padding: 24px 8px 24px !important;
  padding-top: 24px !important;
}

html.sidebar-collapsed .sidebar .brand {
  justify-content: center !important;
  padding: 4px 0 10px !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  box-sizing: border-box !important;
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

fs.appendFileSync('public/styles.css', sidebarCSS.replace(/\n/g, '\r\n'), 'utf8');
console.log('✔ Successfully appended sidebar styles cleanly to public/styles.css');
