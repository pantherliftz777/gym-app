const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

// 1. Fix Base Posture video container & placeholder
const oldPostureBase = `.posture-video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  max-height: 480px;
  background: #050811;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

#postureVideo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* mirror selfie view */
}

#postureCanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}`;

const newPostureBase = `.posture-video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  max-height: 480px;
  background: #050811;
  overflow: hidden;
  border-radius: 14px;
}

#postureVideo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* mirror selfie view */
  z-index: 1;
}

#postureCanvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}`;

// Normalize CRLF to LF for reliable replace
css = css.replace(/\r\n/g, '\n');

if (css.includes(oldPostureBase)) {
  css = css.replace(oldPostureBase, newPostureBase);
  console.log('Fixed posture base video container');
} else {
  console.warn('Could not find oldPostureBase directly, searching loosely');
  const reg = /\.posture-video-container\s*\{[\s\S]*?pointer-events:\s*none;\s*\}/;
  css = css.replace(reg, newPostureBase);
  console.log('Replaced posture base via regex');
}

// Fix base placeholder
const oldPlaceholderBase = `.posture-camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  gap: 14px;
}`;

const newPlaceholderBase = `.posture-camera-placeholder {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  box-sizing: border-box;
  color: #94a3b8;
  gap: 14px;
  z-index: 2;
  background: rgba(5, 8, 17, 0.95);
}`;

if (css.includes(oldPlaceholderBase)) {
  css = css.replace(oldPlaceholderBase, newPlaceholderBase);
  console.log('Fixed posture base placeholder');
} else {
  const regP = /\.posture-camera-placeholder\s*\{[\s\S]*?gap:\s*14px;\s*\}/;
  css = css.replace(regP, newPlaceholderBase);
  console.log('Replaced placeholder base via regex');
}

// Replace the responsive mobile section starting at "/* FITFUEL ULTRA-RESPONSIVE MOBILE & APP SYSTEM"
const mobileSectionHeader = '/* ==========================================================================\n   FITFUEL ULTRA-RESPONSIVE MOBILE & APP SYSTEM';
const mobileSectionIdx = css.indexOf(mobileSectionHeader);

const newMobileSection = `/* ==========================================================================
   FITFUEL ULTRA-RESPONSIVE MOBILE & APP SYSTEM (PHONES & TABLETS: 320px - 768px)
   ========================================================================== */

/* 1. Root & Shell Containment (Guaranteed Zero Horizontal Overflow on All Mobile Screens) */
html, body {
  width: 100% !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
  position: relative !important;
  -webkit-text-size-adjust: 100% !important;
}

.app-shell {
  width: 100% !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
  min-height: 100vh !important;
  position: relative !important;
}

/* Sidebar Backdrop on Mobile */
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.sidebar-backdrop.active {
  display: block;
  opacity: 1;
  pointer-events: auto;
}

/* All Panels, Cards & Hero Containers Must Contain Overflow */
.panel,
.content-card,
.welcome-strip,
.stronger-you-hero-card,
.posture-viewport-card,
.ai-coach-header-card,
.dash-metrics-grid-v2,
.dash-analytics-row-v2,
.activity-layout-grid,
.posture-layout-grid,
.food-log-layout,
.workout-detail-grid,
.profile-layout {
  box-sizing: border-box !important;
  max-width: 100% !important;
}

/* Contain background decorative orbits */
.welcome-strip,
.stronger-you-hero-card,
.daily-motivation-panel {
  position: relative !important;
  overflow: hidden !important;
}

/* Floating AI Panel Internal Structure (Pin header & footer, scroll body) */
.floating-ai-panel {
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.floating-panel-header {
  flex-shrink: 0 !important;
  min-height: 56px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  z-index: 2 !important;
}

.floating-panel-scrollable {
  flex: 1 1 auto !important;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch !important;
  overscroll-behavior: contain !important;
  min-height: 0 !important;
}

.floating-panel-footer {
  flex-shrink: 0 !important;
  z-index: 2 !important;
}

/* 2. Responsive Breakpoint: Tablets & Small Desktops (<= 980px) */
@media (max-width: 980px) {
  .ai-coach-page-layout {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 16px !important;
  }
  .ai-coach-page-layout > div {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .activity-layout-grid {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 16px !important;
  }
  .activity-layout-grid > div {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .posture-layout-grid {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 16px !important;
  }
  .posture-layout-grid > div {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .workout-detail-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  .workout-detail-grid > div {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .food-log-layout {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  .food-log-layout > div {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .profile-layout {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  .profile-layout > div {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .sidebar-backdrop {
    z-index: 10000 !important;
  }
  .sidebar {
    z-index: 10001 !important;
  }
}

/* 3. Responsive Breakpoint: Mobile Devices (<= 768px) */
@media (max-width: 768px) {
  .main-area {
    margin-left: 0 !important;
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    padding: 0 !important;
  }

  .page-content {
    padding: 12px 12px 96px 12px !important;
    width: 100% !important;
    max-width: 100vw !important;
    box-sizing: border-box !important;
  }

  /* Sidebar Drawer on Mobile */
  .sidebar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    width: 270px !important;
    max-width: 82vw !important;
    z-index: 10001 !important;
    transform: translateX(-105%) !important;
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.3) !important;
  }

  .sidebar.mobile-open {
    transform: translateX(0) !important;
  }

  .primary-nav .nav-link {
    min-height: 44px !important;
    padding: 10px 16px !important;
    font-size: 0.92rem !important;
    display: flex !important;
    align-items: center !important;
  }

  /* Mobile Topbar Header */
  .topbar {
    padding: 10px 12px 8px !important;
    min-height: auto !important;
    width: 100% !important;
    max-width: 100vw !important;
    box-sizing: border-box !important;
    gap: 8px !important;
  }

  .topbar-controls-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    align-items: center !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  #mobileMenuBtn.mobile-menu {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 44px !important;
    min-height: 44px !important;
    width: 44px !important;
    height: 44px !important;
    padding: 0 !important;
    border-radius: 12px !important;
    flex-shrink: 0 !important;
    order: 1 !important;
  }

  .topbar-search-wrap {
    flex: 1 1 calc(100% - 56px) !important;
    min-width: 140px !important;
    max-width: calc(100% - 56px) !important;
    order: 2 !important;
  }

  .topbar-search-input {
    min-height: 44px !important;
    font-size: 0.88rem !important;
  }

  .header-weather-badge {
    order: 3 !important;
    width: auto !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 38px !important;
    padding: 4px 12px !important;
    font-size: 0.78rem !important;
    gap: 6px !important;
    flex-wrap: nowrap !important;
    display: inline-flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
  }

  .topbar-right-actions {
    order: 4 !important;
    width: 100% !important;
    max-width: 100% !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    padding-bottom: 2px !important;
    margin-left: 0 !important;
  }

  .topbar-right-actions::-webkit-scrollbar {
    display: none !important;
  }

  .topbar-right-actions > * {
    flex-shrink: 0 !important;
  }

  /* Topbar Greeting Row */
  .topbar-greeting-row {
    flex-wrap: wrap !important;
    gap: 8px !important;
    margin-top: 2px !important;
    padding: 0 !important;
  }

  #greetingHeading {
    font-size: 1.25rem !important;
    line-height: 1.25 !important;
    word-break: break-word !important;
  }

  .topbar-sync-wrapper {
    margin-left: 0 !important;
  }

  /* Floating Assistant Bot Mobile Positioning */
  #floatingAiWidget {
    bottom: 20px !important;
    right: 16px !important;
    z-index: 1000 !important;
  }

  .floating-ai-launcher {
    width: 54px !important;
    height: 54px !important;
  }

  .floating-ai-robot-img {
    width: 42px !important;
    height: 42px !important;
  }

  .floating-ai-tooltip {
    bottom: 64px !important;
    right: 0 !important;
    left: auto !important;
    max-width: 250px !important;
    white-space: normal !important;
    font-size: 0.76rem !important;
    line-height: 1.35 !important;
    padding: 8px 12px !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
  }

  .floating-ai-panel {
    position: fixed !important;
    top: auto !important;
    bottom: 84px !important;
    right: 12px !important;
    left: 12px !important;
    width: auto !important;
    max-width: 420px !important;
    margin: 0 auto !important;
    height: 70vh !important;
    max-height: 520px !important;
    border-radius: 20px !important;
    z-index: 10005 !important;
  }

  /* Toast Notification: Native Mobile Top Banner (Guaranteed never obscuring bottom CTAs) */
  .toast-notice {
    top: 16px !important;
    bottom: auto !important;
    left: 16px !important;
    right: 16px !important;
    margin: 0 auto !important;
    max-width: min(400px, calc(100vw - 32px)) !important;
    z-index: 10006 !important;
    transform: translateY(-20px);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.28) !important;
  }
  .toast-notice.show {
    transform: translateY(0) !important;
  }

  /* Modals: Phone Fit, Safe Center & Accessible Close Buttons */
  .modal-backdrop {
    display: none;
    padding: 10px !important;
    z-index: 10002 !important;
  }

  .modal-backdrop.open,
  .modal-backdrop.active {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .modal-card {
    width: 100% !important;
    max-width: min(440px, calc(100vw - 20px)) !important;
    margin: 0 auto !important;
    padding: 20px 16px !important;
    max-height: 88vh !important;
    border-radius: 18px !important;
    box-sizing: border-box !important;
  }

  .modal-fields {
    grid-template-columns: 1fr !important;
  }

  /* Comprehensive Minimum 44x44px Touch Targets (WCAG 2.5.5 Compliant) */
  .sound-toggle-btn,
  .theme-select-pill,
  .topbar .text-button,
  .admin-only-btn,
  .ai-subtab-btn,
  .ai-chat-btn-mini,
  .activity-mode-pill,
  .muscle-tab,
  .muscle-tabs button,
  .solid-button,
  .outline-button,
  .filter-pill,
  .ba-step-item,
  .ba-step-actions button,
  button:not(.floating-ai-tooltip-close) {
    min-height: 44px;
    box-sizing: border-box;
  }

  .topbar .icon-button,
  .header-profile-avatar,
  .header-profile-wrap,
  #topAvatar,
  #mobileMenuBtn,
  #postureAudioToggleBtn,
  #postureFlipCamBtn,
  .modal-close,
  [data-close],
  .close-btn,
  .modal-head button,
  .sy-scard-menu-dots,
  .sy-bcard-menu-dots,
  .sy-card-arrow-btn,
  .sy-bcard-action-btn,
  .sy-hero-icon-btn,
  #syHeroBellBtn,
  #dashBellBtn,
  #resetWaterBtn,
  #dashRefreshWorkoutBtn,
  #dashStartWorkoutBtn,
  .water-cup,
  .ai-chat-icon-btn,
  .ai-chat-send-btn,
  .floating-panel-ctrl-btn,
  .floating-ai-tooltip-close,
  .color-circle-btn,
  .unit-switch button,
  .meal-item-card .action-icon-btn,
  .meal-item-card .close-btn {
    min-width: 44px !important;
    min-height: 44px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
  }
}

/* 4. Responsive Breakpoint: Narrow Smartphones (<= 520px) */
@media (max-width: 520px) {
  /* Prevent header date from forcing 415px width */
  #eyebrowDate,
  #eyebrowDate + .badge-dot {
    display: none !important;
  }

  .header-weather-badge {
    padding: 4px 10px !important;
    font-size: 0.74rem !important;
  }

  /* Hero & Banner Cards */
  .stronger-you-hero-card {
    padding: 18px 16px !important;
    border-radius: 20px !important;
  }

  .welcome-strip {
    padding: 16px 14px !important;
    border-radius: 16px !important;
    overflow: hidden !important;
  }

  /* Camera AI Posture View Mobile Polish */
  .posture-viewport-card {
    border-radius: 16px !important;
  }

  .posture-video-container {
    max-height: 320px !important;
    aspect-ratio: 4/3 !important;
    position: relative !important;
    overflow: hidden !important;
  }

  #postureVideo {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    z-index: 1 !important;
  }

  #postureCanvas {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 3 !important;
    pointer-events: none !important;
  }

  .posture-camera-placeholder {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    padding: 16px !important;
    box-sizing: border-box !important;
    z-index: 2 !important;
  }

  #posturePlaceholderDefault {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    max-width: 90% !important;
    margin: 0 auto !important;
  }

  /* Toolbar below camera - stacked for easy tap, with safe FAB clearance */
  .posture-viewport-card > div:last-child {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
    padding: 14px 14px 74px 14px !important;
  }

  .posture-viewport-card label {
    width: 100% !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 6px !important;
  }

  #postureExerciseSelect {
    width: 100% !important;
    min-height: 44px !important;
    font-size: 0.9rem !important;
  }

  .posture-viewport-card > div:last-child > div:last-child {
    display: flex !important;
    gap: 8px !important;
    width: 100% !important;
    align-items: center !important;
  }

  #postureStartBtn,
  #postureStopBtn,
  #postureSaveBtn {
    flex: 1 1 auto !important;
    min-height: 46px !important;
    font-size: 0.95rem !important;
    font-weight: 800 !important;
    justify-content: center !important;
  }

  #postureAudioToggleBtn,
  #postureFlipCamBtn {
    min-width: 46px !important;
    min-height: 46px !important;
    width: 46px !important;
    height: 46px !important;
    flex-shrink: 0 !important;
  }

  /* Activity View Mobile Polish */
  .activity-hud-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }

  .activity-mode-pills {
    display: flex !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    flex-wrap: nowrap !important;
    padding-bottom: 6px !important;
    gap: 8px !important;
    scrollbar-width: none !important;
  }

  .activity-mode-pill {
    flex-shrink: 0 !important;
    min-height: 44px !important;
    padding: 0 16px !important;
  }

  .activity-ctrl-row {
    flex-direction: column !important;
  }

  .activity-ctrl-row button {
    width: 100% !important;
    min-height: 44px !important;
  }

  /* AI Coach View Mobile Polish */
  .ai-coach-header-card {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 12px !important;
    padding: 16px 14px !important;
  }

  .ai-coach-subtabs {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    flex-wrap: nowrap !important;
    padding-bottom: 6px !important;
    gap: 8px !important;
    scrollbar-width: none !important;
  }

  .ai-subtab-btn {
    flex-shrink: 0 !important;
    min-height: 44px !important;
    padding: 0 16px !important;
  }

  .ai-card-grid-2x2 {
    grid-template-columns: 1fr !important;
    gap: 6px !important;
  }

  .ai-chat-action-btns-row {
    flex-direction: column !important;
    width: 100% !important;
  }

  .ai-chat-btn-mini {
    width: 100% !important;
    text-align: center !important;
    justify-content: center !important;
    min-height: 44px !important;
  }

  .ai-chat-input-bar {
    padding: 6px 10px !important;
    gap: 6px !important;
  }

  .ai-chat-input-field {
    min-width: 110px !important;
    font-size: 0.88rem !important;
  }

  /* Body Analysis Stepper Bar Mobile Polish */
  .ba-stepper-bar {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    flex-wrap: nowrap !important;
    padding: 10px 12px !important;
    gap: 6px !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    scrollbar-width: none !important;
  }

  .ba-step-item {
    flex-shrink: 0 !important;
    min-height: 44px !important;
    min-width: 44px !important;
  }

  .ba-step-label {
    font-size: 0.74rem !important;
  }

  .ba-step-divider {
    min-width: 10px !important;
    flex: 0 0 10px !important;
  }

  .ba-goals-grid {
    grid-template-columns: 1fr !important;
  }

  .ba-macro-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .ba-step-actions {
    flex-direction: column-reverse !important;
    gap: 10px !important;
  }

  .ba-step-actions button {
    width: 100% !important;
    min-height: 46px !important;
    justify-content: center !important;
  }

  /* Food Log & Workouts Cards */
  .exercise-cards {
    grid-template-columns: 1fr !important;
  }

  .dash-metrics-grid-v2 {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  .dash-metrics-grid-v2 > div {
    min-width: 0 !important;
    max-width: 100% !important;
  }

  .metric-card-v2 {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .strip-orbit {
    display: none !important;
  }

  .ai-coach-header-info {
    max-width: 100% !important;
    width: 100% !important;
    min-width: 0 !important;
  }

  .ai-coach-header-info h2 {
    font-size: 1.15rem !important;
    flex-wrap: wrap !important;
    display: flex !important;
    gap: 6px !important;
  }
}

/* 5. Responsive Breakpoint: Small Screen Phones (<= 380px) */
@media (max-width: 380px) {
  .dash-metrics-grid-v2 {
    grid-template-columns: 1fr !important;
  }

  .page-content {
    padding: 10px 10px 96px 10px !important;
  }

  .topbar {
    padding: 8px 10px 8px !important;
  }

  #greetingHeading {
    font-size: 1.15rem !important;
  }

  .ba-macro-grid {
    grid-template-columns: 1fr !important;
  }
}

/* Sidebar bottom and weekly mini styling */
.sidebar-bottom {
  margin-top: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}
.weekly-mini {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px 14px;
  box-sizing: border-box;
}
[data-theme="light"] .weekly-mini {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.week-mini-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--ff-text-muted);
}
.streak-bars {
  display: flex;
  gap: 4px;
  margin: 8px 0 6px 0;
}
.streak-bars i {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #10b981;
  display: block;
}
.streak-bars i.muted {
  background: rgba(255, 255, 255, 0.15);
}
[data-theme="light"] .streak-bars i.muted {
  background: rgba(0, 0, 0, 0.1);
}
#streakText {
  font-size: 0.76rem;
  color: var(--ff-text-secondary);
  margin: 0;
}
.profile-shortcut {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
}
`;

if (mobileSectionIdx !== -1) {
  css = css.slice(0, mobileSectionIdx) + newMobileSection;
  console.log('Replaced mobile responsive section');
} else {
  css += '\n' + newMobileSection;
  console.log('Appended mobile responsive section');
}

fs.writeFileSync('public/styles.css', css, 'utf8');
console.log('Updated public/styles.css successfully');
