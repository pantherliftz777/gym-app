const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const challengeStyles = `
/* ================= CHALLENGE SETUP WIZARD CARDS & SELECTION ================= */
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
}

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

if (!css.includes('/* ================= CHALLENGE SETUP WIZARD CARDS & SELECTION ================= */')) {
  css += '\n' + challengeStyles;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully appended challenge choice styles to styles.css');
} else {
  console.log('Styles already present in styles.css');
}
