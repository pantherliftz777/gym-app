const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

const updatedControlsSection = `  .floating-panel-header {
    min-height: 58px !important;
    padding: 8px 12px !important;
  }

  .floating-panel-bot-identity {
    gap: 8px !important;
    min-width: 0 !important;
    flex: 1 1 auto !important;
  }

  .floating-panel-bot-title {
    font-size: 0.88rem !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .floating-panel-bot-status {
    font-size: 0.72rem !important;
    white-space: nowrap !important;
  }

  .floating-panel-controls {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    flex-shrink: 0 !important;
  }

  .ai-chat-input-bar {
    min-height: 52px !important;
    display: flex !important;
    align-items: center !important;
    padding: 4px 6px !important;
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
    flex-shrink: 0 !important;
    min-width: 44px !important;
    min-height: 44px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
  }`;

// Find start of floating-panel-header in mobile query
const startMarker = '.floating-panel-header {\n    min-height: 60px !important;';
const endMarker = '/* 4. Responsive Breakpoint: Narrow Smartphones';

const startIdx = css.indexOf(startMarker);
const endIdx = css.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  css = css.slice(0, startIdx) + updatedControlsSection + '\n}\n\n' + css.slice(endIdx);
  console.log('Replaced controls section cleanly');
} else {
  console.warn('Markers not found, searching alternative');
}

fs.writeFileSync('public/styles.css', css, 'utf8');
