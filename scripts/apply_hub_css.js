const fs = require('fs');

const cssPath = 'public/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

const hubCss = `
/* ================= UNIFIED HUBS NAVIGATION & SEGMENTED TABS ================= */
.hub-tabs-container {
  position: sticky;
  top: 0;
  z-index: 25;
  margin: -10px 0 20px;
  padding: 8px 0;
  background: var(--ff-surface-blur, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--ff-glass-border-subtle, rgba(0, 0, 0, 0.06));
}

.hub-segmented-control {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 5px;
  background: var(--ff-surface-muted, #f1f5f9);
  border-radius: 14px;
  border: 1px solid var(--ff-glass-border-subtle, rgba(0, 0, 0, 0.06));
}

.hub-segmented-control::-webkit-scrollbar {
  display: none;
}

.hub-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--glass-text-secondary, #64748b);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.hub-tab-btn svg {
  flex-shrink: 0;
  opacity: 0.82;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.hub-tab-btn:hover {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.hub-tab-btn:hover svg {
  opacity: 1;
  transform: translateY(-1px);
}

.hub-tab-btn.active {
  color: #ffffff !important;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.28);
}

.hub-tab-btn.active svg {
  opacity: 1;
  stroke: #ffffff;
}

.hub-tab-badge {
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 99px;
  font-weight: 800;
  background: rgba(56, 189, 248, 0.18);
  color: #0284c7;
  letter-spacing: 0.02em;
}

.hub-tab-btn.active .hub-tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Dark Mode Overrides for Hubs */
.dark .hub-tabs-container,
[data-theme="dark"] .hub-tabs-container,
body.dark-mode .hub-tabs-container {
  background: rgba(15, 23, 42, 0.88);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.dark .hub-segmented-control,
[data-theme="dark"] .hub-segmented-control,
body.dark-mode .hub-segmented-control {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .hub-tab-btn,
[data-theme="dark"] .hub-tab-btn,
body.dark-mode .hub-tab-btn {
  color: #94a3b8;
}

.dark .hub-tab-btn:hover,
[data-theme="dark"] .hub-tab-btn:hover,
body.dark-mode .hub-tab-btn:hover {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}

.dark .hub-tab-btn.active,
[data-theme="dark"] .hub-tab-btn.active,
body.dark-mode .hub-tab-btn.active {
  color: #ffffff !important;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
}
`;

if (!css.includes('hub-segmented-control')) {
  css += '\n' + hubCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Appended hub CSS to styles.css successfully.');
} else {
  console.log('Hub CSS already present in styles.css.');
}
