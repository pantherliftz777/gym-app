const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'fitfuel.js');
let js = fs.readFileSync(file, 'utf8');

// 1. Update switchView to guard beta views
const targetSwitch = `function switchView(viewName) {
  if (viewName === 'workouts') {
    viewName = 'exercise-library';
  }
  activeView = viewName;`;

const replacementSwitch = `function switchView(viewName) {
  if (viewName === 'workouts') {
    viewName = 'exercise-library';
  }
  activeView = viewName;

  // Beta access guard: prevent broken or empty views for locked beta features
  if (window.FitFuelBeta && ['posture', 'body-analysis', 'activity'].includes(viewName)) {
    if (!window.FitFuelBeta.isFeatureEnabled(viewName)) {
      $$('.primary-nav .nav-link').forEach(btn => {
        const sec = btn.dataset.section;
        const isTarget = btn.dataset.view === viewName || (sec && SECTION_VIEW_MAP[sec] && SECTION_VIEW_MAP[sec].includes(viewName));
        btn.classList.toggle('selected', isTarget);
      });
      $$('.page-content .view').forEach(v => v.classList.remove('active'));
      const targetView = $('#view-' + viewName);
      if (targetView) {
        if (!window._viewOriginalMarkup) window._viewOriginalMarkup = {};
        if (!window._viewOriginalMarkup[viewName]) {
          window._viewOriginalMarkup[viewName] = targetView.innerHTML;
        }
        targetView.classList.add('active');
        targetView.innerHTML = window.FitFuelBeta.renderLockedState(viewName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    } else {
      const targetView = $('#view-' + viewName);
      if (targetView && window._viewOriginalMarkup && window._viewOriginalMarkup[viewName]) {
        targetView.innerHTML = window._viewOriginalMarkup[viewName];
      }
    }
  }`;

if (!js.includes('// Beta access guard: prevent broken or empty views')) {
  if (js.includes(targetSwitch)) {
    js = js.replace(targetSwitch, replacementSwitch);
  } else {
    // CRLF fallback
    const targetSwitchCRLF = targetSwitch.replace(/\n/g, '\r\n');
    const replacementSwitchCRLF = replacementSwitch.replace(/\n/g, '\r\n');
    js = js.replace(targetSwitchCRLF, replacementSwitchCRLF);
  }
}

// 2. Update initAdminPortalListeners
const targetAdminListeners = `function initAdminPortalListeners() {
  const tabComp = $('#adminTabComplaints');
  const tabUsers = $('#adminTabUsers');
  const compPane = $('#adminComplaintsViewPane');
  const usersPane = $('#adminUsersViewPane');

  if (tabComp && tabUsers && compPane && usersPane) {
    tabComp.onclick = () => {
      tabComp.className = 'solid-button small';
      tabUsers.className = 'outline-button small';
      compPane.style.display = 'block';
      usersPane.style.display = 'none';
      renderFilteredComplaints();
    };

    tabUsers.onclick = () => {
      tabUsers.className = 'solid-button small';
      tabComp.className = 'outline-button small';
      compPane.style.display = 'none';
      usersPane.style.display = 'block';
      loadAndRenderAdminUsers();
    };
  }`;

const replacementAdminListeners = `function initAdminPortalListeners() {
  const tabComp = $('#adminTabComplaints');
  const tabUsers = $('#adminTabUsers');
  const tabBeta = $('#adminTabBetaFeatures');
  const compPane = $('#adminComplaintsViewPane');
  const usersPane = $('#adminUsersViewPane');
  const betaPane = $('#adminBetaFeaturesViewPane');

  if (tabComp && tabUsers && compPane && usersPane) {
    tabComp.onclick = () => {
      tabComp.className = 'solid-button small';
      tabUsers.className = 'outline-button small';
      if (tabBeta) tabBeta.className = 'outline-button small';
      compPane.style.display = 'block';
      usersPane.style.display = 'none';
      if (betaPane) betaPane.style.display = 'none';
      renderFilteredComplaints();
    };

    tabUsers.onclick = () => {
      tabUsers.className = 'solid-button small';
      tabComp.className = 'outline-button small';
      if (tabBeta) tabBeta.className = 'outline-button small';
      compPane.style.display = 'none';
      usersPane.style.display = 'block';
      if (betaPane) betaPane.style.display = 'none';
      loadAndRenderAdminUsers();
    };

    if (tabBeta && betaPane) {
      tabBeta.onclick = () => {
        tabBeta.className = 'solid-button small';
        tabComp.className = 'outline-button small';
        tabUsers.className = 'outline-button small';
        compPane.style.display = 'none';
        usersPane.style.display = 'none';
        betaPane.style.display = 'block';
        if (window.FitFuelBeta) window.FitFuelBeta.loadAdminDashboard();
      };
    }
  }`;

if (!js.includes('const tabBeta = $(\'#adminTabBetaFeatures\');')) {
  if (js.includes(targetAdminListeners)) {
    js = js.replace(targetAdminListeners, replacementAdminListeners);
  } else {
    const targetAdminCRLF = targetAdminListeners.replace(/\n/g, '\r\n');
    const replacementAdminCRLF = replacementAdminListeners.replace(/\n/g, '\r\n');
    js = js.replace(targetAdminCRLF, replacementAdminCRLF);
  }
}

fs.writeFileSync(file, js, 'utf8');
console.log('Successfully updated fitfuel.js with beta guards and admin tabs!');
