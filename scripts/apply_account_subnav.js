const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const accountSubnav = `        <nav class="hub-subnav-bar" aria-label="Account Navigation">
          <button type="button" class="hub-subnav-btn" data-hubview="profile" onclick="switchView('profile')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 17H5"/><path d="M19 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
            <span>Profile</span>
          </button>
          <button type="button" class="hub-subnav-btn" data-hubview="customization" onclick="switchView('customization')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Settings</span>
          </button>
        </nav>`;

function replaceViewSubnav(viewId, newSubnav) {
  const startTag = '<section class="view" id="' + viewId + '">';
  const sIdx = html.indexOf(startTag);
  if (sIdx === -1) {
    console.error('View not found:', viewId);
    return;
  }
  const endSecIdx = html.indexOf('</section>', sIdx);
  const sectionContent = html.substring(sIdx + startTag.length, endSecIdx);

  let cleaned = sectionContent.replace(/(\r?\n\s*<!--[^\n]*-->)?\s*<nav class="hub-subnav-bar"[\s\S]*?<\/nav>/g, '');
  cleaned = cleaned.trimStart();

  const newSectionContent = '\r\n' + newSubnav.replace(/\n/g, '\r\n') + '\r\n' + cleaned;
  html = html.substring(0, sIdx + startTag.length) + newSectionContent + html.substring(endSecIdx);
  console.log('✔ Cleaned and set subnav for ' + viewId);
}

replaceViewSubnav('view-profile', accountSubnav);
replaceViewSubnav('view-customization', accountSubnav);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✔ Done updating account subnavs.');
