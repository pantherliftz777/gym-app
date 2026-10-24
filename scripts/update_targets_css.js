const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

const targetRule = `  /* Comprehensive Minimum 44x44px Touch Targets (WCAG 2.5.5 Compliant) */
  select,
  #pfGoalSelect,
  #pfDaysSelect,
  #pfCreatineSelect,
  #postureExerciseSelect,
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
    min-height: 46px !important;
    box-sizing: border-box !important;
  }

  .floating-panel-header {
    min-height: 60px !important;
  }

  .floating-panel-controls {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }

  .ai-chat-input-bar {
    min-height: 52px !important;
    display: flex !important;
    align-items: center !important;
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
  }`;

// Replace the previous touch targets section in mobile rules
const touchTargetHeader = '/* Comprehensive Minimum 44x44px Touch Targets (WCAG 2.5.5 Compliant) */';
const touchTargetIdx = css.indexOf(touchTargetHeader);

if (touchTargetIdx !== -1) {
  // Find closing of media query
  const endIdx = css.indexOf('/* 4. Responsive Breakpoint: Narrow Smartphones', touchTargetIdx);
  if (endIdx !== -1) {
    css = css.slice(0, touchTargetIdx) + targetRule + '\n}\n\n' + css.slice(endIdx);
    console.log('Successfully updated touch targets section');
  }
}

fs.writeFileSync('public/styles.css', css, 'utf8');
