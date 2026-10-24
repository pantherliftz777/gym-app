const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

css = css.replace(
  /\.floating-panel-ctrl-btn,\s*\.floating-ai-tooltip-close,\s*\.color-circle-btn,\s*\.unit-switch button,\s*\.meal-item-card \.action-icon-btn,\s*\.meal-item-card \.close-btn\s*\{/g,
  `.floating-panel-ctrl-btn,
  .floating-ai-tooltip-close,
  .color-circle-btn,
  .unit-switch button,
  .meal-item-card .action-icon-btn,
  .meal-item-card .close-btn {
    flex-shrink: 0 !important;`
);

css = css.replace(
  /\.ai-chat-icon-btn,\s*\.ai-chat-send-btn,\s*\.floating-panel-ctrl-btn,/g,
  `.ai-chat-icon-btn,
  .ai-chat-send-btn,
  .floating-panel-ctrl-btn {
    flex-shrink: 0 !important;
    width: 44px !important;
    min-width: 44px !important;
  }`
);

fs.writeFileSync('public/styles.css', css, 'utf8');
console.log('Added flex-shrink: 0 and fixed width');
