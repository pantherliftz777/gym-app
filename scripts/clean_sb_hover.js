const fs = require('fs');

let js = fs.readFileSync('public/fitfuel.js', 'utf8');

// Update sidebar collapse & hover preview logic to be completely clean
const oldBlock = `// Navigation menu toggle (Desktop Sidebar Collapse & Mobile Drawer)
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

const newBlock = `// Navigation menu toggle (Desktop Sidebar Collapse & Mobile Drawer)
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

const normJs = js.replace(/\r\n/g, '\n');
const normOld = oldBlock.replace(/\r\n/g, '\n');

if (normJs.includes(normOld)) {
  js = normJs.replace(normOld, newBlock);
  fs.writeFileSync('public/fitfuel.js', js, 'utf8');
  console.log('Cleaned up sidebar hover preview in fitfuel.js');
} else {
  console.error('Failed to match oldBlock');
}
