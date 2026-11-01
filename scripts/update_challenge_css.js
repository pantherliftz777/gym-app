const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetStr = `/* Selection Cards (Motive & Duration) */
.setup-choice-card {
  background: var(--ff-glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--ff-glass-border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--ff-glass-shadow);
  cursor: pointer;
  transition: all .2s ease;
}
.setup-choice-card:hover {
  border-color: #38bdf8;
  background: #f8fbf5;
  transform: translateY(-1px);
}
.setup-choice-card.selected {
  border-color: #2563eb;
  background: #f1f8eb;
  box-shadow: 0 0 0 1px #2563eb;
}
.setup-choice-icon {
  font-size: 26px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f6eb;
  border-radius: 10px;
  flex-shrink: 0;
}
.setup-choice-card.selected .setup-choice-icon {
  background: #2563eb;
  color: #fff;
}`;

const replacementCss = `/* ================= CHALLENGE SETUP WIZARD CARDS & SELECTION ================= */
.setup-choice-card {
  background: var(--glass-surface-bg, rgba(255, 255, 255, 0.9)) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1.5px solid var(--glass-border, rgba(0, 0, 0, 0.1)) !important;
  border-radius: 16px !important;
  cursor: pointer !important;
  user-select: none;
  outline: none;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.2s ease,
              background 0.2s ease !important;
}

.setup-choice-card:hover {
  border-color: #3b82f6 !important;
  background: #f0f7ff !important;
  transform: translateY(-2px) !important;
}

.setup-choice-card.selected {
  border: 2px solid #2563eb !important;
  background: #eff6ff !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25), 0 8px 24px rgba(37, 99, 235, 0.15) !important;
  transform: translateY(-2px) !important;
}

[data-theme="dark"] .setup-choice-card {
  background: rgba(30, 41, 59, 0.75) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

[data-theme="dark"] .setup-choice-card:hover {
  border-color: #60a5fa !important;
  background: rgba(37, 99, 235, 0.12) !important;
}

[data-theme="dark"] .setup-choice-card.selected {
  border: 2px solid #60a5fa !important;
  background: rgba(37, 99, 235, 0.25) !important;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.35), 0 8px 28px rgba(0, 0, 0, 0.5) !important;
}

.choice-radio-indicator {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  color: transparent;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.setup-choice-card.selected .choice-radio-indicator {
  border-color: #2563eb !important;
  background: #2563eb !important;
  color: #ffffff !important;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.45) !important;
}

[data-theme="dark"] .choice-radio-indicator {
  border-color: #64748b;
  background: rgba(15, 23, 42, 0.6);
}

[data-theme="dark"] .setup-choice-card.selected .choice-radio-indicator {
  border-color: #60a5fa !important;
  background: #2563eb !important;
  color: #ffffff !important;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.5) !important;
}

.setup-choice-icon {
  font-size: 1rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0f2fe;
  color: #2563eb;
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.setup-choice-card.selected .setup-choice-icon {
  background: #2563eb !important;
  color: #ffffff !important;
}`;

if (css.includes(targetStr)) {
  css = css.replace(targetStr, replacementCss);
  console.log('Replaced target setup-choice-card styles');
} else {
  console.log('Target string not exact, appending rules to the end of styles.css');
  css += '\n\n' + replacementCss;
}

// Also ensure high-priority bottom override in styles.css
const bottomOverride = `
/* HIGH PRIORITY OVERRIDE FOR CHALLENGE CHOICE CARDS */
#chTimeOptionsList .setup-choice-card.selected,
#chIntensityOptionsList .setup-choice-card.selected,
#durationOptionsList .setup-choice-card.selected,
#motiveOptionsList .setup-choice-card.selected,
#chTypesOptionsList .setup-choice-card.selected {
  border: 2px solid #2563eb !important;
  background: #eff6ff !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25), 0 8px 24px rgba(37, 99, 235, 0.15) !important;
  transform: translateY(-2px) !important;
}

[data-theme="dark"] #chTimeOptionsList .setup-choice-card.selected,
[data-theme="dark"] #chIntensityOptionsList .setup-choice-card.selected,
[data-theme="dark"] #durationOptionsList .setup-choice-card.selected,
[data-theme="dark"] #motiveOptionsList .setup-choice-card.selected,
[data-theme="dark"] #chTypesOptionsList .setup-choice-card.selected {
  border: 2px solid #60a5fa !important;
  background: rgba(37, 99, 235, 0.25) !important;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.35), 0 8px 28px rgba(0, 0, 0, 0.5) !important;
}
`;

css += '\n' + bottomOverride;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated styles.css with high-contrast challenge selection styles');
