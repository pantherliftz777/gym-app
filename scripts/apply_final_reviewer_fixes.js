const fs = require('fs');

let js = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. Fix modal close listener
const oldCloseListener = `// Global click close listener
document.addEventListener('click', e => {
  const closeBtn = e.target.closest('[data-close]');
  if (closeBtn) {
    closeModal(closeBtn.closest('.modal-backdrop'));
  }
  const backdrop = e.target.classList.contains('modal-backdrop') ? e.target : null;
  if (backdrop) {
    closeModal(backdrop);
  }
});`;

const newCloseListener = `// Global click close listener
document.addEventListener('click', e => {
  const closeBtn = e.target.closest('[data-close], .close-btn, .modal-close');
  if (closeBtn) {
    const modalEl = closeBtn.closest('.modal, .modal-backdrop');
    if (modalEl) closeModal(modalEl);
  }
  const backdrop = (e.target.classList.contains('modal-backdrop') || (e.target.classList.contains('modal') && !e.target.closest('.modal-card, .modal-content, .modal-dialog'))) ? e.target : null;
  if (backdrop && e.target === backdrop) {
    closeModal(backdrop);
  }
});`;

if (js.includes(oldCloseListener)) {
  js = js.replace(oldCloseListener, newCloseListener);
  console.log('1. Replaced oldCloseListener successfully');
} else {
  console.log('1. Warning: oldCloseListener not matched exactly, checking with regex');
  const reg = /\/\/ Global click close listener[\s\S]*?document\.addEventListener\('click'[\s\S]*?closeModal\(backdrop\);\s*\}\s*\}\);/;
  if (reg.test(js)) {
    js = js.replace(reg, newCloseListener);
    console.log('1. Replaced with regex successfully');
  } else {
    console.log('1. FAILED to match close listener');
  }
}

// 2. Fix sidebar hover & collapse
const oldSbCollapse = `// Navigation menu toggle (Desktop Sidebar Collapse & Mobile Drawer)
let sidebarHoverTimer = null;

function toggleDashboardSidebarCollapse(forceState) {
  if (window.innerWidth <= 768) {
    const sb = $('#sidebar');
    const bdrop = $('#sidebarBackdrop');
    if (sb) sb.classList.toggle('mobile-open');
    if (bdrop) bdrop.classList.toggle('active');
    return;
  }

  const appShell = document.querySelector('.app-shell');
  const sb = $('#sidebar');
  if (!sb) return;

  const currentlyCollapsed = sb.classList.contains('collapsed');
  const nextCollapsed = typeof forceState === 'boolean' ? forceState : !currentlyCollapsed;

  sb.classList.remove('is-hover-expanded');
  if (nextCollapsed) {
    sb.classList.add('collapsed');
    if (appShell) appShell.classList.add('sidebar-collapsed');
    localStorage.setItem('fitfuel_sidebar_collapsed', '1');
    if (typeof toast === 'function') toast('Your Space collapsed to rail. Hover to preview, click ☰ to open.');
  } else {
    sb.classList.remove('collapsed');
    if (appShell) appShell.classList.remove('sidebar-collapsed');
    localStorage.setItem('fitfuel_sidebar_collapsed', '0');
    if (typeof toast === 'function') toast('Your Space stabilized.');
  }
}

// Hover preview on collapsed sidebar
(function initSidebarHoverPreview() {
  const sb = $('#sidebar');
  if (!sb) return;

  sb.addEventListener('mouseenter', () => {
    if (window.innerWidth > 900 && sb.classList.contains('collapsed')) {
      clearTimeout(sidebarHoverTimer);
      sb.classList.add('is-hover-expanded');
    }
  });

  sb.addEventListener('mouseleave', () => {
    if (window.innerWidth > 900 && sb.classList.contains('collapsed')) {
      sidebarHoverTimer = setTimeout(() => {
        sb.classList.remove('is-hover-expanded');
      }, 160);
    }
  });

  sb.addEventListener('click', (e) => {
    if (window.innerWidth > 900 && sb.classList.contains('collapsed') && sb.classList.contains('is-hover-expanded')) {
      if (!e.target.closest('#sidebarCollapseToggleBtn')) {
        toggleDashboardSidebarCollapse(false);
      }
    }
  });
})();`;

const newSbCollapse = `// Navigation menu toggle (Desktop Sidebar Collapse & Mobile Drawer)
let sidebarHoverTimer = null;
let suppressSidebarHoverUntilLeave = false;

function toggleDashboardSidebarCollapse(forceState) {
  if (window.innerWidth <= 768) {
    const sb = $('#sidebar');
    const bdrop = $('#sidebarBackdrop');
    if (sb) sb.classList.toggle('mobile-open');
    if (bdrop) bdrop.classList.toggle('active');
    return;
  }

  const appShell = document.querySelector('.app-shell');
  const sb = $('#sidebar');
  if (!sb) return;

  const currentlyCollapsed = sb.classList.contains('collapsed');
  const nextCollapsed = typeof forceState === 'boolean' ? forceState : !currentlyCollapsed;

  sb.classList.remove('is-hover-expanded');
  if (nextCollapsed) {
    suppressSidebarHoverUntilLeave = true;
    sb.classList.add('collapsed');
    if (appShell) appShell.classList.add('sidebar-collapsed');
    localStorage.setItem('fitfuel_sidebar_collapsed', '1');
    if (typeof toast === 'function') toast('Your Space collapsed to rail. Hover to preview, click ☰ to open.');
  } else {
    suppressSidebarHoverUntilLeave = false;
    sb.classList.remove('collapsed');
    if (appShell) appShell.classList.remove('sidebar-collapsed');
    localStorage.setItem('fitfuel_sidebar_collapsed', '0');
    if (typeof toast === 'function') toast('Your Space stabilized.');
  }
}

// Hover preview on collapsed sidebar
(function initSidebarHoverPreview() {
  const sb = $('#sidebar');
  if (!sb) return;

  sb.addEventListener('mouseenter', () => {
    if (window.innerWidth > 900 && sb.classList.contains('collapsed')) {
      if (suppressSidebarHoverUntilLeave) return;
      clearTimeout(sidebarHoverTimer);
      sb.classList.add('is-hover-expanded');
    }
  });

  sb.addEventListener('mousemove', () => {
    if (window.innerWidth > 900 && sb.classList.contains('collapsed') && !sb.classList.contains('is-hover-expanded')) {
      if (!suppressSidebarHoverUntilLeave) {
        clearTimeout(sidebarHoverTimer);
        sb.classList.add('is-hover-expanded');
      }
    }
  });

  sb.addEventListener('mouseleave', () => {
    suppressSidebarHoverUntilLeave = false;
    if (window.innerWidth > 900 && sb.classList.contains('collapsed')) {
      sidebarHoverTimer = setTimeout(() => {
        sb.classList.remove('is-hover-expanded');
      }, 160);
    }
  });

  sb.addEventListener('click', (e) => {
    if (window.innerWidth > 900 && sb.classList.contains('collapsed') && sb.classList.contains('is-hover-expanded')) {
      if (!e.target.closest('#sidebarCollapseToggleBtn')) {
        toggleDashboardSidebarCollapse(false);
      }
    }
  });
})();`;

if (js.includes(oldSbCollapse)) {
  js = js.replace(oldSbCollapse, newSbCollapse);
  console.log('2. Replaced oldSbCollapse successfully');
} else {
  const regSb = /\/\/ Navigation menu toggle[\s\S]*?\}\)\(\);\s*const mobMenuBtn/;
  if (regSb.test(js)) {
    js = js.replace(regSb, newSbCollapse + '\n\nconst mobMenuBtn');
    console.log('2. Replaced oldSbCollapse with regex successfully');
  } else {
    console.log('2. FAILED to match oldSbCollapse');
  }
}

// 3. Fix water adjustment modal typo
if (js.includes(`openModal('#waterTempModal')`)) {
  js = js.replace(`openModal('#waterTempModal')`, `openModal('#weatherTempModal')`);
  console.log('3. Fixed waterTempModal typo successfully');
}

// 4. Floating AI send button wiring
if (!js.includes(`$('#floatingAiSendBtn')`)) {
  const hookTarget = `if ($('#floatingAiForm')) {`;
  const sendWiring = `if ($('#floatingAiSendBtn')) {
  $('#floatingAiSendBtn').onclick = (e) => {
    e.preventDefault();
    if ($('#floatingAiForm')) {
      const form = $('#floatingAiForm');
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };
}

if ($('#floatingAiForm')) {`;
  js = js.replace(hookTarget, sendWiring);
  console.log('4. Added floatingAiSendBtn handler successfully');
}

fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('public/fitfuel.js updated.');
