const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// Subnav templates
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

// Helper to replace or insert subnav inside a <section class="view" id="...">
function setSectionSubnav(htmlStr, sectionId, subnavHtml) {
  const targetIdStr = 'id="' + sectionId + '"';
  const secStart = htmlStr.indexOf(targetIdStr);
  if (secStart === -1) {
    console.error('Section ' + sectionId + ' not found');
    return htmlStr;
  }
  const tagEnd = htmlStr.indexOf('>', secStart);
  if (tagEnd === -1) return htmlStr;

  // Check if section already has a <nav class="hub-subnav-bar" ...> directly inside
  const nextChunk = htmlStr.substring(tagEnd + 1, tagEnd + 1200);
  const existingNavMatch = nextChunk.match(/(\r?\n\s*<!--[^\n]*-->)?\s*<nav class="hub-subnav-bar"[\s\S]*?<\/nav>/);

  if (existingNavMatch) {
    const fullMatch = existingNavMatch[0];
    const matchIdx = htmlStr.indexOf(fullMatch, tagEnd);
    return htmlStr.substring(0, matchIdx) + '\r\n' + subnavHtml.replace(/\n/g, '\r\n') + htmlStr.substring(matchIdx + fullMatch.length);
  } else {
    // Insert subnav right after opening tag
    return htmlStr.substring(0, tagEnd + 1) + '\r\n' + subnavHtml.replace(/\n/g, '\r\n') + htmlStr.substring(tagEnd + 1);
  }
}

// 1. Update Training views subnav (Image 1: add Challenges)
html = setSectionSubnav(html, 'view-workouts', trainingSubnav);
html = setSectionSubnav(html, 'view-challenge', trainingSubnav);
html = setSectionSubnav(html, 'view-exercise-library', trainingSubnav);
html = setSectionSubnav(html, 'view-starting-load', trainingSubnav);
console.log('✔ Updated Training Navigation on view-workouts, view-challenge, view-exercise-library, view-starting-load');

// 2. Update AI Coach view subnav (Image 2: only AI Coach)
html = setSectionSubnav(html, 'view-ai-coach', aiCoachSubnav);
console.log('✔ Updated AI Coach Navigation on view-ai-coach');

// 3. Update Progress views subnav (Image 3: Tracking, Activity & GPS)
html = setSectionSubnav(html, 'view-activity', progressSubnav);
html = setSectionSubnav(html, 'view-tracking', progressSubnav);
console.log('✔ Updated Progress Navigation on view-activity and view-tracking');

// 4. Update Labs (Beta) views subnav (Image 4: Posture AI, Body Scan)
html = setSectionSubnav(html, 'view-posture', labsSubnav);
html = setSectionSubnav(html, 'view-body-analysis', labsSubnav);
console.log('✔ Updated Labs Navigation on view-posture and view-body-analysis');

// 5. Replace "Body Analysis" with "Body Scan" in user visible texts throughout index.html
html = html.replace(/<span>Body Analysis<\/span>/g, '<span>Body Scan</span>');
html = html.replace(/AI Body Analysis &amp; Physique Transformation Planner/g, 'AI Body Scan &amp; Physique Transformation Planner');
html = html.replace(/AI Body Analysis &amp; Scan/g, 'AI Body Scan');
html = html.replace(/AI Body Analysis & Transformation Planner/g, 'AI Body Scan & Transformation Planner');

// Also check in syQuickBodyBtn
html = html.replace(/(<button[^>]+id="syQuickBodyBtn"[^>]*>[\s\S]*?<span>)Body Analysis(<\/span>)/g, '$1Body Scan$2');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✔ Successfully updated public/index.html with all requested subnav changes and Body Scan text');

// Also update fitfuel.js toast message
let js = fs.readFileSync('public/fitfuel.js', 'utf8');
js = js.replace(/toast\('Opening AI Body Analysis & Transformation Planner'\)/g, "toast('Opening AI Body Scan & Transformation Planner')");
fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('✔ Successfully updated public/fitfuel.js toast text');
