const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'public', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const masterTopbarCSS = `
/* ==========================================================================
   MASTER RESPONSIVE TOPBAR (LAPTOP & MOBILE PERFECTION)
   ========================================================================== */
.topbar {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 12px 28px 10px !important;
  gap: 6px !important;
  position: relative !important;
  z-index: 50 !important;
  min-height: auto !important;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid rgba(226, 232, 240, 0.85) !important;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03) !important;
  transition: all 0.25s ease !important;
}

html.dark .topbar, [data-theme="dark"] .topbar {
  background: rgba(8, 12, 20, 0.82) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
}

/* Controls Row (Desktop / Laptop Single-Line Flow) */
.topbar-controls-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  gap: 12px !important;
  flex-wrap: nowrap !important;
  min-height: 40px !important;
}

/* Hide desktop hamburger */
#mobileMenuBtn.mobile-menu {
  display: none !important;
}

/* Search Wrap Pill */
.topbar-search-wrap {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  height: 40px !important;
  flex: 0 1 240px !important;
  min-width: 150px !important;
  max-width: 260px !important;
  padding: 0 14px !important;
  border-radius: 9999px !important;
  background: rgba(255, 255, 255, 0.90) !important;
  border: 1px solid rgba(203, 213, 225, 0.8) !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03) !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
  transition: all 0.2s ease !important;
}
html.dark .topbar-search-wrap, [data-theme="dark"] .topbar-search-wrap {
  background: rgba(15, 23, 42, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}
.topbar-search-wrap:focus-within {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18) !important;
  background: #ffffff !important;
}
html.dark .topbar-search-wrap:focus-within, [data-theme="dark"] .topbar-search-wrap:focus-within {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25) !important;
  background: rgba(24, 36, 64, 0.85) !important;
}
.topbar-search-icon {
  flex-shrink: 0 !important;
  width: 16px !important;
  height: 16px !important;
  color: #64748b !important;
  stroke: #64748b !important;
}
html.dark .topbar-search-icon, [data-theme="dark"] .topbar-search-icon {
  color: #94a3b8 !important;
  stroke: #94a3b8 !important;
}
.topbar-search-input {
  flex: 1 !important;
  min-width: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  color: #0f172a !important;
  padding: 0 !important;
  margin: 0 !important;
}
html.dark .topbar-search-input, [data-theme="dark"] .topbar-search-input {
  color: #f8fafc !important;
}
.topbar-search-input::placeholder {
  color: #94a3b8 !important;
  font-weight: 400 !important;
}

/* Header Live Weather Badge (Time, Date, Weather) */
.header-weather-badge {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  height: 40px !important;
  padding: 0 14px !important;
  border-radius: 9999px !important;
  background: rgba(255, 255, 255, 0.90) !important;
  border: 1px solid rgba(203, 213, 225, 0.8) !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03) !important;
  box-sizing: border-box !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  color: #1e293b !important;
  white-space: nowrap !important;
  flex-shrink: 1 !important;
  min-width: 0 !important;
  transition: all 0.2s ease !important;
}
html.dark .header-weather-badge, [data-theme="dark"] .header-weather-badge {
  background: rgba(15, 23, 42, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #f8fafc !important;
}
#eyebrowDate {
  white-space: nowrap !important;
  user-select: none !important;
  color: #475569 !important;
  font-size: 0.76rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em !important;
}
html.dark #eyebrowDate, [data-theme="dark"] #eyebrowDate {
  color: #94a3b8 !important;
}
#liveClockTime {
  font-variant-numeric: tabular-nums !important;
  font-weight: 700 !important;
  color: #0f172a !important;
  user-select: none !important;
  letter-spacing: 0.5px !important;
}
html.dark #liveClockTime, [data-theme="dark"] #liveClockTime {
  color: #f8fafc !important;
}
.header-weather-temp {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  height: 28px !important;
  background: #eff6ff !important;
  color: #1d4ed8 !important;
  font-weight: 700 !important;
  padding: 0 10px !important;
  border-radius: 9999px !important;
  border: 1px solid #bfdbfe !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  font-size: 0.76rem !important;
  white-space: nowrap !important;
}
.header-weather-temp:hover {
  background: #dbeafe !important;
  border-color: #93c5fd !important;
}
html.dark .header-weather-temp, [data-theme="dark"] .header-weather-temp {
  background: rgba(30, 58, 138, 0.35) !important;
  border-color: rgba(56, 189, 248, 0.4) !important;
  color: #38bdf8 !important;
}

/* Right Actions (Theme, Audio, Auth, Bell, Settings, Avatar) */
.topbar-right-actions {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-left: auto !important;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}

.theme-select-wrap {
  flex-shrink: 0 !important;
}
.theme-select-pill {
  display: inline-flex !important;
  align-items: center !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.90) !important;
  border: 1px solid rgba(203, 213, 225, 0.8) !important;
  border-radius: 9999px !important;
  padding: 0 12px !important;
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  color: #1d4ed8 !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03) !important;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}
html.dark .theme-select-pill, [data-theme="dark"] .theme-select-pill {
  background: rgba(15, 23, 42, 0.65) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: #38bdf8 !important;
}

.sound-toggle-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.90) !important;
  border: 1px solid rgba(203, 213, 225, 0.8) !important;
  border-radius: 9999px !important;
  padding: 0 12px !important;
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  color: #1d4ed8 !important;
  cursor: pointer !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03) !important;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}
html.dark .sound-toggle-btn, [data-theme="dark"] .sound-toggle-btn {
  background: rgba(15, 23, 42, 0.65) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: #38bdf8 !important;
}

/* Sign In / Sign Out Button - PREVENTS TEXT WRAPPING */
.topbar .text-button,
#topAuthBtn {
  height: 40px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 14px !important;
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  border-radius: 9999px !important;
  background: rgba(37, 99, 235, 0.08) !important;
  border: 1px solid rgba(37, 99, 235, 0.25) !important;
  color: #2563eb !important;
  cursor: pointer !important;
  white-space: nowrap !important; /* CRITICAL: NEVER wrap Sign out! */
  flex-shrink: 0 !important;
  transition: all 0.15s ease !important;
}
.topbar .text-button:hover,
#topAuthBtn:hover {
  background: #2563eb !important;
  color: #ffffff !important;
  border-color: #2563eb !important;
}
html.dark .topbar .text-button,
html.dark #topAuthBtn,
[data-theme="dark"] #topAuthBtn {
  background: rgba(56, 189, 248, 0.12) !important;
  border-color: rgba(56, 189, 248, 0.3) !important;
  color: #38bdf8 !important;
}
html.dark #topAuthBtn:hover,
[data-theme="dark"] #topAuthBtn:hover {
  background: #0284c7 !important;
  color: #ffffff !important;
}

/* Icon Buttons (Notification & Settings) */
.topbar .icon-button,
#topNotificationBtn,
#topSettingsBtn {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.90) !important;
  border: 1px solid rgba(203, 213, 225, 0.8) !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #475569 !important;
  flex-shrink: 0 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
}
.topbar .icon-button:hover,
#topNotificationBtn:hover,
#topSettingsBtn:hover {
  background: #ffffff !important;
  color: #2563eb !important;
  border-color: #93c5fd !important;
}
html.dark .topbar .icon-button,
html.dark #topNotificationBtn,
html.dark #topSettingsBtn,
[data-theme="dark"] #topNotificationBtn,
[data-theme="dark"] #topSettingsBtn {
  background: rgba(15, 23, 42, 0.65) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: #cbd5e1 !important;
}

/* Top Avatar */
.top-avatar,
#topAvatar {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #2563eb, #16c79a) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  font-size: 0.85rem !important;
  display: grid !important;
  place-items: center !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.25) !important;
  flex-shrink: 0 !important;
  cursor: pointer !important;
  overflow: hidden !important;
}
html.dark .top-avatar,
html.dark #topAvatar,
[data-theme="dark"] #topAvatar {
  border-color: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45) !important;
}

/* Greeting Row */
.topbar-greeting-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  margin-top: 4px !important;
  gap: 12px !important;
  padding: 0 !important;
}

#userGreeting {
  font-size: 1.45rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.025em !important;
  color: #0f172a !important;
  margin: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
html.dark #userGreeting, [data-theme="dark"] #userGreeting {
  color: #f8fafc !important;
}

.topbar-sync-wrapper {
  margin-left: auto !important;
  flex-shrink: 0 !important;
}
.topbar-sync-wrapper .sync-note {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 4px 12px !important;
  border-radius: 9999px !important;
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(203, 213, 225, 0.7) !important;
  font-size: 0.74rem !important;
  font-weight: 600 !important;
  color: #475569 !important;
  white-space: nowrap !important;
}
html.dark .topbar-sync-wrapper .sync-note, [data-theme="dark"] .topbar-sync-wrapper .sync-note {
  background: rgba(15, 23, 42, 0.65) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
}

/* ==========================================================================
   LAPTOP SCREEN RESPONSIVE TUNING (769px to 1350px)
   ========================================================================== */
@media (max-width: 1350px) and (min-width: 769px) {
  .topbar {
    padding: 10px 20px 8px !important;
  }
  /* On compact laptops, hide long date string from weather badge, keeping live time & temp */
  #eyebrowDate {
    display: none !important;
  }
  .header-weather-badge .badge-dot:first-of-type {
    display: none !important;
  }
  .topbar-search-wrap {
    flex: 0 1 200px !important;
    min-width: 130px !important;
  }
}

@media (max-width: 1100px) and (min-width: 769px) {
  .topbar {
    padding: 8px 16px 8px !important;
    gap: 4px !important;
  }
  .topbar-search-wrap {
    flex: 0 1 160px !important;
    min-width: 110px !important;
  }
  #soundToggleText {
    display: none !important;
  }
  .sound-toggle-btn {
    padding: 0 10px !important;
  }
  #userGreeting {
    font-size: 1.25rem !important;
  }
}

/* ==========================================================================
   MOBILE SCREEN RESPONSIVE PERFECTION (<= 768px)
   ========================================================================== */
@media (max-width: 768px) {
  .topbar {
    padding: 8px 12px 8px !important;
    gap: 6px !important;
    min-height: auto !important;
    width: 100% !important;
    max-width: 100vw !important;
    box-sizing: border-box !important;
  }

  .topbar-controls-row {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 6px !important;
    width: 100% !important;
    min-height: auto !important;
  }

  /* Row 1: Hamburger (left) + Search Input (fills row) */
  #mobileMenuBtn.mobile-menu {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 38px !important;
    height: 38px !important;
    min-width: 38px !important;
    min-height: 38px !important;
    border-radius: 12px !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    order: 1 !important;
    background: rgba(255, 255, 255, 0.90) !important;
    border: 1px solid rgba(203, 213, 225, 0.8) !important;
    color: #0f172a !important;
  }
  html.dark #mobileMenuBtn.mobile-menu, [data-theme="dark"] #mobileMenuBtn.mobile-menu {
    background: rgba(15, 23, 42, 0.65) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    color: #f8fafc !important;
  }

  .topbar-search-wrap {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    width: auto !important;
    max-width: none !important;
    height: 38px !important;
    margin: 0 !important;
    order: 2 !important;
  }

  /* Force clean break before Row 2 */
  .header-weather-badge {
    order: 3 !important;
    height: 34px !important;
    padding: 0 10px !important;
    font-size: 0.72rem !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
  }
  #eyebrowDate {
    display: none !important;
  }
  .header-weather-badge .badge-dot:first-of-type {
    display: none !important;
  }

  /* Row 2: Right Actions Swipeable Strip */
  .topbar-right-actions {
    order: 4 !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    padding: 1px 0 !important;
    margin: 0 !important;
  }
  .topbar-right-actions::-webkit-scrollbar {
    display: none !important;
  }
  .topbar-right-actions > * {
    flex-shrink: 0 !important;
  }
  .theme-select-pill,
  .sound-toggle-btn,
  .topbar .text-button,
  #topAuthBtn {
    height: 34px !important;
    font-size: 0.74rem !important;
    padding: 0 10px !important;
  }
  .topbar .icon-button,
  #topNotificationBtn,
  #topSettingsBtn,
  .top-avatar,
  #topAvatar {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    min-height: 34px !important;
  }

  /* Row 3: Greeting Row */
  .topbar-greeting-row {
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    margin-top: 2px !important;
    width: 100% !important;
  }
  #userGreeting {
    font-size: 1.15rem !important;
    line-height: 1.25 !important;
    margin: 0 !important;
  }
  .topbar-sync-wrapper .sync-note {
    font-size: 0.68rem !important;
    padding: 3px 8px !important;
  }
}
`;

if (css.includes('/* ==========================================================================\n   MASTER RESPONSIVE TOPBAR')) {
  const startIdx = css.indexOf('/* ==========================================================================\n   MASTER RESPONSIVE TOPBAR');
  css = css.slice(0, startIdx) + masterTopbarCSS.trim();
} else {
  css += '\n' + masterTopbarCSS.trim();
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Master topbar CSS updated successfully.');

// Bump cache buster in index.html
const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=5.5.1');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Bumped index.html stylesheet version to v=5.5.1');
