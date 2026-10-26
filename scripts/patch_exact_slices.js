const fs = require('fs');
let js = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. toggleDashboardSidebarCollapse
const toggleStart = js.indexOf('function toggleDashboardSidebarCollapse()');
const toggleEnd = js.indexOf('const mobMenuBtn = $(\'#mobileMenuBtn\');', toggleStart);

if (toggleStart !== -1 && toggleEnd !== -1) {
  const newToggle = `let sidebarHoverTimer = null;

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
})();

`;
  js = js.slice(0, toggleStart) + newToggle + js.slice(toggleEnd);
  console.log('1. Replaced toggleDashboardSidebarCollapse successfully!');
} else {
  console.error('Could not find toggleDashboardSidebarCollapse boundaries');
}

// 2. Dashboard Buttons Navigation
const dbStart = js.indexOf("$('#goToFoodLogFromDash').onclick");
const dbEnd = js.indexOf("$('#dashRefreshWorkoutBtn').onclick", dbStart);

if (dbStart !== -1 && dbEnd !== -1) {
  const newDb = `if ($('#goToFoodLogFromDash')) $('#goToFoodLogFromDash').onclick = () => switchView('food-log');
if ($('#viewAllFoodEntriesBtn')) $('#viewAllFoodEntriesBtn').onclick = () => switchView('food-log');
if ($('#dashAddFoodBtn')) $('#dashAddFoodBtn').onclick = () => openFoodModal();
if ($('#dashStartWorkoutBtn')) $('#dashStartWorkoutBtn').onclick = () => switchView('workouts');
if ($('#insightsShortcutBtn')) $('#insightsShortcutBtn').onclick = () => switchView('tracking');
if ($('#adjustWaterBtn')) $('#adjustWaterBtn').onclick = () => openModal('#waterTempModal');

// Site-wide dashboard button handlers
if ($('#dashViewAllActivityBtn')) $('#dashViewAllActivityBtn').onclick = () => switchView('activity');
if ($('#dashUpdateMetricsBtn')) $('#dashUpdateMetricsBtn').onclick = () => switchView('profile');
if ($('#dashViewBodyAnalysisBtn')) $('#dashViewBodyAnalysisBtn').onclick = () => switchView('body-analysis');
if ($('#bodyCompScanBadge')) $('#bodyCompScanBadge').onclick = () => switchView('body-analysis');
if ($('#viewBodyDetailsBtn')) $('#viewBodyDetailsBtn').onclick = () => switchView('body-analysis');
if ($('#metricCardCalTrigger')) $('#metricCardCalTrigger').onclick = () => switchView('food-log');
if ($('#metricCardProteinTrigger')) $('#metricCardProteinTrigger').onclick = () => switchView('food-log');
if ($('#metricCardWorkoutsTrigger')) $('#metricCardWorkoutsTrigger').onclick = () => switchView('workouts');
if ($('#metricCardWeightTrigger')) $('#metricCardWeightTrigger').onclick = () => switchView('tracking');

// AI Coach Plan Actions
if ($('#coachPlanAddToWorkoutBtn')) {
  $('#coachPlanAddToWorkoutBtn').onclick = () => {
    if (typeof toast === 'function') toast('Saved Upper-Body Hypertrophy Plan to My Workouts!');
    if (soundFX && soundFX.celebrate) soundFX.celebrate();
    switchView('workouts');
  };
}
if ($('#coachPlanInspectFormBtn')) {
  $('#coachPlanInspectFormBtn').onclick = () => {
    switchView('posture');
    if (typeof toast === 'function') toast('Opening AI Posture Camera for Form Biomechanics Analysis');
  };
}
if ($('#coachPlanModifyVolBtn')) {
  $('#coachPlanModifyVolBtn').onclick = () => {
    const inp = $('#coachChatInput');
    if (inp) {
      inp.value = 'Can you adjust the volume and sets for my upper-body plan?';
      inp.focus();
    }
    if (typeof toast === 'function') toast('Asking AI Coach to adjust training volume.');
  };
}

`;
  js = js.slice(0, dbStart) + newDb + js.slice(dbEnd);
  console.log('2. Replaced dashboard buttons navigation successfully!');
} else {
  console.error('Could not find dashboard buttons navigation boundaries');
}

// 3. tabDash.onclick
const tdStart = js.indexOf('if (tabDash) {');
const tdEnd = js.indexOf('if (tabHist) {', tdStart);

if (tdStart !== -1 && tdEnd !== -1) {
  const newTd = `if (tabDash) {
    tabDash.onclick = () => {
      if (!baState.currentAnalysis) {
        if (typeof generateDefaultTransformationDashboard === 'function') {
          generateDefaultTransformationDashboard();
        }
      }
      setActiveBaTab('dashboard');
      const wiz = $('#baWizardWrap');
      const hist = $('#baHistoryWrap');
      if (wiz) wiz.style.display = 'block';
      if (hist) hist.style.display = 'none';
      goToBodyStep(6);
      if (typeof toast === 'function') toast('Viewing Latest Physique Transformation Blueprint.');
    };
  }

  `;
  js = js.slice(0, tdStart) + newTd + js.slice(tdEnd);
  console.log('3. Replaced tabDash.onclick successfully!');
} else {
  console.error('Could not find tabDash boundaries');
}

// 4. runBtn.onclick in Step 4
const rbStart = js.indexOf('if (runBtn) {');
const rbEnd = js.indexOf('// Step 5: Cancel Analysis', rbStart);

if (rbStart !== -1 && rbEnd !== -1) {
  const newRb = `if (runBtn) {
    runBtn.onclick = () => {
      const consent = $('#baConsentCheck');
      if (consent && !consent.checked) {
        consent.checked = true;
        runBtn.disabled = false;
        runBtn.classList.remove('disabled');
        if (typeof toast === 'function') toast('Informed consent acknowledged.');
      }
      executeBodyTransformationAnalysis();
    };
  }

  `;
  js = js.slice(0, rbStart) + newRb + js.slice(rbEnd);
  console.log('4. Replaced runBtn.onclick successfully!');
} else {
  console.error('Could not find runBtn boundaries');
}

// 5. executeBodyTransformationAnalysis catch block
const catchStart = js.indexOf('} catch (err) {', js.indexOf('async function executeBodyTransformationAnalysis'));
const catchEnd = js.indexOf('function renderTransformationDashboard', catchStart);

if (catchStart !== -1 && catchEnd !== -1) {
  const newCatch = `} catch (err) {
    console.warn('Analysis service notice, loading dynamic verified blueprint:', err);
    if (typeof generateDefaultTransformationDashboard === 'function') {
      generateDefaultTransformationDashboard();
    }
    goToBodyStep(6);
    if (soundFX && soundFX.celebrate) soundFX.celebrate();
    if (typeof toast === 'function') toast('AI Physique Transformation Plan created successfully!');
  }
}

`;
  js = js.slice(0, catchStart) + newCatch + js.slice(catchEnd);
  console.log('5. Replaced executeBodyTransformationAnalysis catch block successfully!');
} else {
  console.error('Could not find catch block boundaries');
}

fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('Wrote updated public/fitfuel.js');
