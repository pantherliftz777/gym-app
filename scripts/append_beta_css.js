const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'public', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const betaStyles = `
/* ==========================================================================
   FITFUEL BETA FEATURE MANAGEMENT & ACCESS CONTROL STYLES
   ========================================================================== */

/* Universal Beta Badge */
.beta-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 99px;
  background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%);
  color: #ffffff;
  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.3);
  line-height: 1.2;
}

.beta-badge.pulse {
  animation: betaPulse 2.5s infinite;
}

@keyframes betaPulse {
  0% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0.45); }
  70% { box-shadow: 0 0 0 6px rgba(2, 132, 199, 0); }
  100% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0); }
}

/* Nav Link Beta Tag */
.beta-nav-tag {
  font-size: 0.62rem;
  font-weight: 800;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.12);
  border: 1px solid rgba(2, 132, 199, 0.3);
  padding: 1px 6px;
  border-radius: 99px;
  margin-left: auto;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Beta Tester View Banner */
.beta-tester-banner {
  background: linear-gradient(90deg, rgba(2, 132, 199, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
  border: 1px solid rgba(2, 132, 199, 0.25);
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--ff-text-primary, #0f172a);
}

.beta-report-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.beta-report-btn:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

/* Beta Locked View Container (Guarantees no empty pages) */
.beta-locked-card {
  max-width: 620px;
  margin: 48px auto;
  padding: 40px 32px;
  text-align: center;
  border-radius: 20px;
  background: var(--card, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.06);
}

.beta-locked-icon-wrap {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: rgba(2, 132, 199, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0284c7;
}

.beta-locked-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--ff-text-primary, #0f172a);
  margin: 0 0 10px;
}

.beta-locked-desc {
  font-size: 0.92rem;
  color: var(--ff-text-secondary, #64748b);
  line-height: 1.6;
  margin: 0 0 24px;
}

.beta-locked-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Admin Feature Flag Card */
.beta-admin-flag-card {
  background: var(--card, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.beta-admin-flag-card:hover {
  border-color: #0284c7;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.08);
}

.beta-flag-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.beta-flag-name {
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--ff-text-primary, #0f172a);
  margin: 0 0 4px;
}

.beta-flag-category {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.04em;
}

.beta-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 99px;
  text-transform: uppercase;
}

.beta-status-badge.disabled {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.beta-status-badge.admin_only {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.beta-status-badge.beta_testers {
  background: rgba(2, 132, 199, 0.12);
  color: #0284c7;
  border: 1px solid rgba(2, 132, 199, 0.25);
}

.beta-status-badge.all_users {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.beta-flag-desc {
  font-size: 0.83rem;
  color: var(--ff-text-secondary, #64748b);
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.beta-flag-control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border, #f1f5f9);
  flex-wrap: wrap;
}

.beta-access-select {
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--background, #ffffff);
  color: var(--ff-text-primary, #0f172a);
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
}

.beta-test-action-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #0284c7;
  background: rgba(2, 132, 199, 0.08);
  color: #0284c7;
  cursor: pointer;
  transition: all 0.15s ease;
}

.beta-test-action-btn:hover {
  background: #0284c7;
  color: #ffffff;
}

/* Beta Tester User Card */
.beta-tester-user-row {
  background: var(--card, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.beta-tester-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.beta-tester-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0284c7;
  font-weight: 800;
  font-size: 0.84rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.beta-tester-toggle-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.beta-tester-toggle-btn.enrolled {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.beta-tester-toggle-btn.not-enrolled {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.25);
}

.beta-tester-toggle-btn:hover {
  filter: brightness(0.95);
}

/* Dark mode overrides */
html[data-theme="dark"] .beta-admin-flag-card,
html.dark .beta-admin-flag-card,
html[data-theme="dark"] .beta-tester-user-row,
html.dark .beta-tester-user-row,
html[data-theme="dark"] .beta-locked-card,
html.dark .beta-locked-card {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.09);
}

html[data-theme="dark"] .beta-flag-name,
html.dark .beta-flag-name,
html[data-theme="dark"] .beta-locked-title,
html.dark .beta-locked-title {
  color: #f8fafc;
}

html[data-theme="dark"] .beta-flag-desc,
html.dark .beta-flag-desc,
html[data-theme="dark"] .beta-locked-desc,
html.dark .beta-locked-desc {
  color: #94a3b8;
}

html[data-theme="dark"] .beta-access-select,
html.dark .beta-access-select {
  background: #0f172a;
  border-color: #334155;
  color: #f8fafc;
}
`;

if (!css.includes('FITFUEL BETA FEATURE MANAGEMENT')) {
  css += '\n' + betaStyles;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Appended Beta Styles successfully to public/styles.css');
} else {
  console.log('Beta Styles already present in public/styles.css');
}
