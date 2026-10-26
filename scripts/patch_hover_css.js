const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

const oldChunk = `  /* Hover Preview on Collapsed Sidebar */
  #sidebar.is-hover-expanded {
    width: 260px !important;
    min-width: 260px !important;
    max-width: 260px !important;
    box-shadow: 8px 0 40px rgba(0, 0, 0, 0.18) !important;
    z-index: 10005 !important;
    background: var(--ff-glass-bg, #ffffff) !important;
  }

  #sidebar.is-hover-expanded .brand-title,
  #sidebar.is-hover-expanded .sidebar-space-title,
  #sidebar.is-hover-expanded .nav-group-header,
  #sidebar.is-hover-expanded .nav-link span,
  #sidebar.is-hover-expanded .nav-badge-pill,
  #sidebar.is-hover-expanded .weekly-mini,
  #sidebar.is-hover-expanded .profile-shortcut span,
  #sidebar.is-hover-expanded .profile-shortcut svg {
    display: inline-flex !important;
  }
  #sidebar.is-hover-expanded .nav-group-header {
    display: block !important;
  }
  #sidebar.is-hover-expanded .weekly-mini {
    display: block !important;
  }
  #sidebar.is-hover-expanded .sidebar-brand-wrapper {
    justify-content: flex-start !important;
    padding: 16px 18px 12px 18px !important;
  }
  #sidebar.is-hover-expanded .brand {
    justify-content: flex-start !important;
  }
  #sidebar.is-hover-expanded .sidebar-partition-line {
    width: calc(100% - 32px) !important;
    margin: 0 auto 8px auto !important;
  }
  #sidebar.is-hover-expanded .sidebar-control-bar {
    justify-content: flex-start !important;
    padding: 2px 16px 8px 16px !important;
  }
  #sidebar.is-hover-expanded .primary-nav {
    padding: 4px 12px 14px 12px !important;
    align-items: stretch !important;
  }
  #sidebar.is-hover-expanded .nav-link {
    width: 100% !important;
    height: auto !important;
    padding: 9px 12px !important;
    justify-content: flex-start !important;
  }
  #sidebar.is-hover-expanded .profile-shortcut {
    width: 100% !important;
    height: auto !important;
    padding: 10px 12px !important;
    justify-content: flex-start !important;
  }`;

const newChunk = `  /* Hover Preview on Collapsed Sidebar */
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded,
  #sidebar.collapsed.is-hover-expanded,
  #sidebar.is-hover-expanded {
    width: 260px !important;
    min-width: 260px !important;
    max-width: 260px !important;
    box-shadow: 8px 0 40px rgba(0, 0, 0, 0.18) !important;
    z-index: 10005 !important;
    background: var(--ff-glass-bg, #ffffff) !important;
  }

  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .brand-title,
  #sidebar.is-hover-expanded .brand-title,
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .sidebar-space-title,
  #sidebar.is-hover-expanded .sidebar-space-title,
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .nav-group-header,
  #sidebar.is-hover-expanded .nav-group-header,
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .nav-link span,
  #sidebar.is-hover-expanded .nav-link span,
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .nav-badge-pill,
  #sidebar.is-hover-expanded .nav-badge-pill,
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .weekly-mini,
  #sidebar.is-hover-expanded .weekly-mini,
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .profile-shortcut span,
  #sidebar.is-hover-expanded .profile-shortcut span,
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .profile-shortcut svg,
  #sidebar.is-hover-expanded .profile-shortcut svg {
    display: inline-flex !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .nav-group-header,
  #sidebar.is-hover-expanded .nav-group-header {
    display: block !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .weekly-mini,
  #sidebar.is-hover-expanded .weekly-mini {
    display: block !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .sidebar-brand-wrapper,
  #sidebar.is-hover-expanded .sidebar-brand-wrapper {
    justify-content: flex-start !important;
    padding: 16px 18px 12px 18px !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .brand,
  #sidebar.is-hover-expanded .brand {
    justify-content: flex-start !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .sidebar-partition-line,
  #sidebar.is-hover-expanded .sidebar-partition-line {
    width: calc(100% - 32px) !important;
    margin: 0 auto 8px auto !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .sidebar-control-bar,
  #sidebar.is-hover-expanded .sidebar-control-bar {
    justify-content: flex-start !important;
    padding: 2px 16px 8px 16px !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .primary-nav,
  #sidebar.is-hover-expanded .primary-nav {
    padding: 4px 12px 14px 12px !important;
    align-items: stretch !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .nav-link,
  #sidebar.is-hover-expanded .nav-link {
    width: 100% !important;
    height: auto !important;
    padding: 9px 12px !important;
    justify-content: flex-start !important;
  }
  .app-shell.sidebar-collapsed #sidebar.is-hover-expanded .profile-shortcut,
  #sidebar.is-hover-expanded .profile-shortcut {
    width: 100% !important;
    height: auto !important;
    padding: 10px 12px !important;
    justify-content: flex-start !important;
  }`;

// Normalize newlines for matching
const normCss = css.replace(/\r\n/g, '\n');
const normOld = oldChunk.replace(/\r\n/g, '\n');

if (normCss.includes(normOld)) {
  css = normCss.replace(normOld, newChunk);
  fs.writeFileSync('public/styles.css', css, 'utf8');
  console.log('Successfully patched styles.css with high-specificity hover selectors');
} else {
  console.error('Failed to match oldChunk in styles.css');
}
