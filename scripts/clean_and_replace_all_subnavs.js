const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const trainingSubnav = `        <nav class="hub-subnav-bar" aria-label="Training Navigation">
          <button type="button" class="hub-subnav-btn" data-hubview="workouts" onclick="switchView('workouts')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/></svg>
            <span>Workouts</span>
          </button>
          <button type="button" class="hub-subnav-btn" data-hubview="challenge" onclick="switchView('challenge')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            <span>Challenges</span>
          </button>
          <button type="button" class="hub-subnav-btn" data-hubview="exercise-library" onclick="switchView('exercise-library')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
            <span>Exercise Library</span>
          </button>
          <button type="button" class="hub-subnav-btn" data-hubview="starting-load" onclick="switchView('starting-load')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span>Starting Weight</span>
          </button>
        </nav>`;

const aiCoachSubnav = `        <nav class="hub-subnav-bar" aria-label="AI Coach Navigation">
          <button type="button" class="hub-subnav-btn" data-hubview="ai-coach" onclick="switchView('ai-coach')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.08 6.25 5 7.42V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.58c2.92-1.17 5-4.05 5-7.42a8 8 0 0 0-8-8z"/><path d="M9 10h.01"/><path d="M15 10h.01"/></svg>
            <span>AI Coach</span>
          </button>
        </nav>`;

const progressSubnav = `        <nav class="hub-subnav-bar" aria-label="Progress Navigation">
          <button type="button" class="hub-subnav-btn" data-hubview="tracking" onclick="switchView('tracking')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>Tracking</span>
          </button>
          <button type="button" class="hub-subnav-btn" data-hubview="activity" onclick="switchView('activity')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            <span>Activity &amp; GPS</span>
          </button>
        </nav>`;

const labsSubnav = `        <nav class="hub-subnav-bar" aria-label="Labs Navigation">
          <button type="button" class="hub-subnav-btn" data-hubview="posture" onclick="switchView('posture')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span>Posture AI</span>
          </button>
          <button type="button" class="hub-subnav-btn" data-hubview="body-analysis" onclick="switchView('body-analysis')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="m8 12 4 1 4-1"/><path d="m9 21 3-5 3 5"/></svg>
            <span>Body Scan</span>
          </button>
        </nav>`;

// Clean up any views: replace entire top content before the view content
function replaceViewSubnav(viewId, newSubnav) {
  const startTag = '<section class="view" id="' + viewId + '">';
  const sIdx = html.indexOf(startTag);
  if (sIdx === -1) {
    console.error('View not found:', viewId);
    return;
  }
  const endSecIdx = html.indexOf('</section>', sIdx);
  const sectionContent = html.substring(sIdx + startTag.length, endSecIdx);

  // Remove ALL occurrences of <nav class="hub-subnav-bar"[\s\S]*?<\/nav> and any preceding comments
  let cleaned = sectionContent.replace(/(\r?\n\s*<!--[^\n]*-->)?\s*<nav class="hub-subnav-bar"[\s\S]*?<\/nav>/g, '');
  cleaned = cleaned.trimStart();

  const newSectionContent = '\r\n' + newSubnav.replace(/\n/g, '\r\n') + '\r\n' + cleaned;
  html = html.substring(0, sIdx + startTag.length) + newSectionContent + html.substring(endSecIdx);
  console.log('✔ Cleaned and set subnav for ' + viewId);
}

replaceViewSubnav('view-workouts', trainingSubnav);
replaceViewSubnav('view-challenge', trainingSubnav);
replaceViewSubnav('view-exercise-library', trainingSubnav);
replaceViewSubnav('view-starting-load', trainingSubnav);

replaceViewSubnav('view-ai-coach', aiCoachSubnav);

replaceViewSubnav('view-tracking', progressSubnav);
replaceViewSubnav('view-activity', progressSubnav);

replaceViewSubnav('view-posture', labsSubnav);
replaceViewSubnav('view-body-analysis', labsSubnav);

// Ensure all "Body Analysis" instances in visible text are changed to "Body Scan"
html = html.replace(/<span>Body Analysis<\/span>/g, '<span>Body Scan</span>');
html = html.replace(/AI Body Analysis &amp; Physique Transformation Planner/g, 'AI Body Scan &amp; Physique Transformation Planner');
html = html.replace(/AI Body Analysis &amp; Scan/g, 'AI Body Scan');
html = html.replace(/AI Body Analysis & Transformation Planner/g, 'AI Body Scan & Transformation Planner');
html = html.replace(/(<button[^>]+id="syQuickBodyBtn"[^>]*>[\s\S]*?<span>)Body Analysis(<\/span>)/g, '$1Body Scan$2');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✔ Finished updating all subnavs in public/index.html');
