const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Add Beta Features subtab to adminSubTabs
const targetSubtabs = '<button type="button" class="outline-button small" id="adminTabUsers" style="border-radius:999px;padding:7px 18px;font-weight:700;">\r\n            Registered Users Database\r\n          </button>';
const targetSubtabsLF = '<button type="button" class="outline-button small" id="adminTabUsers" style="border-radius:999px;padding:7px 18px;font-weight:700;">\n            Registered Users Database\n          </button>';

const replacementSubtab = `          <button type="button" class="outline-button small" id="adminTabBetaFeatures" style="border-radius:999px;padding:7px 18px;font-weight:700;">
            🧪 Beta Features &amp; Flags
          </button>`;

if (!html.includes('id="adminTabBetaFeatures"')) {
  if (html.includes(targetSubtabs)) {
    html = html.replace(targetSubtabs, targetSubtabs + '\r\n' + replacementSubtab);
  } else if (html.includes(targetSubtabsLF)) {
    html = html.replace(targetSubtabsLF, targetSubtabsLF + '\n' + replacementSubtab);
  } else {
    // Regex fallback
    html = html.replace(/(id="adminTabUsers"[^>]*>[\s\S]*?<\/button>)/, '$1\r\n' + replacementSubtab);
  }
}

// 2. Add adminBetaFeaturesViewPane right after adminUsersViewPane
const adminPaneHTML = `
        <!-- SECTION 3: BETA FEATURES & ACCESS CONTROL FLAGS -->
        <div id="adminBetaFeaturesViewPane" style="display:none;">
          <div class="panel" style="padding:18px 22px;margin-bottom:18px;background:linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.08) 100%);border:1px solid rgba(14,165,233,0.25);border-radius:12px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
              <div>
                <span class="section-kicker" style="color:#0284c7;font-size:0.76rem;margin-bottom:4px;">CENTRALIZED FEATURE ACCESS CONTROL</span>
                <h3 style="margin:0 0 6px;font-size:1.15rem;font-weight:800;color:var(--ff-text-primary);">Beta Features &amp; Live Deployment Flags</h3>
                <p style="margin:0;font-size:0.86rem;color:var(--ff-text-secondary);max-width:700px;">
                  Configure access levels for each experimental module independently. Safe defaults ensure unapproved features remain locked for production users until approved.
                </p>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <span class="beta-status-summary-pill" id="betaFlagSummaryPill" style="padding:6px 14px;border-radius:99px;background:#0284c7;color:#fff;font-weight:700;font-size:0.82rem;">6 Features Configured</span>
              </div>
            </div>
          </div>

          <!-- Feature Flags Grid -->
          <div style="margin-bottom:28px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
              <h4 style="font-size:1rem;font-weight:700;color:var(--ff-text-primary);margin:0;display:flex;align-items:center;gap:8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                Active Feature Flags &amp; Access Controls
              </h4>
              <button type="button" class="outline-button small" id="adminRefreshBetaFlagsBtn" style="font-size:0.82rem;padding:5px 12px;">
                Refresh Flags
              </button>
            </div>
            <div id="adminBetaFeaturesCardsGrid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:14px;">
              <!-- Rendered dynamically by FitFuelBeta.renderAdminFlags() -->
            </div>
          </div>

          <!-- Beta Testers Management Section -->
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
              <div>
                <h4 style="font-size:1rem;font-weight:700;color:var(--ff-text-primary);margin:0 0 4px;display:flex;align-items:center;gap:8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Beta Testers Roster &amp; User Enrollment
                </h4>
                <p style="margin:0;font-size:0.82rem;color:var(--ff-text-secondary);">Manage which registered members receive access to features marked as "Beta Testers".</p>
              </div>
              <input type="text" id="adminBetaTesterSearchInput" class="form-input" placeholder="Filter by email or name..." style="max-width:280px;padding:6px 12px;font-size:0.84rem;border-radius:8px;" />
            </div>
            <div id="adminBetaTestersList" style="display:flex;flex-direction:column;gap:10px;">
              <!-- Rendered dynamically by FitFuelBeta.renderAdminTesters() -->
            </div>
          </div>
        </div>`;

if (!html.includes('id="adminBetaFeaturesViewPane"')) {
  const usersPaneTarget = '<div id="adminUsersCardsGrid" style="display:flex;flex-direction:column;gap:10px;">\r\n            <!-- Rendered by renderAdminUsers() -->\r\n          </div>\r\n        </div>';
  const usersPaneTargetLF = '<div id="adminUsersCardsGrid" style="display:flex;flex-direction:column;gap:10px;">\n            <!-- Rendered by renderAdminUsers() -->\n          </div>\n        </div>';
  
  if (html.includes(usersPaneTarget)) {
    html = html.replace(usersPaneTarget, usersPaneTarget + '\r\n' + adminPaneHTML);
  } else if (html.includes(usersPaneTargetLF)) {
    html = html.replace(usersPaneTargetLF, usersPaneTargetLF + '\n' + adminPaneHTML);
  } else {
    html = html.replace(/(id="adminUsersViewPane"[\s\S]*?<\/div>\s*<\/div>)/, '$1\r\n' + adminPaneHTML);
  }
}

// 3. Add Beta Feedback Modal before toast notice
const betaModalHTML = `
<!-- BETA FEEDBACK & BUG REPORT MODAL -->
<div class="modal-backdrop" id="betaFeedbackModal">
  <div class="modal-card" style="max-width:540px;padding:24px;border-radius:24px;">
    <div class="modal-head">
      <div>
        <span class="section-kicker" style="color:#0284c7;">🧪 BETA TESTER PROGRAM</span>
        <h2 id="betaFeedbackModalTitle">Beta Feature Feedback</h2>
        <p style="margin:2px 0 0;font-size:0.84rem;color:var(--glass-text-secondary);">Submit bug reports, usability notes, and feedback to the engineering team.</p>
      </div>
      <button class="close-btn" id="closeBetaFeedbackModalBtn" type="button">&times;</button>
    </div>

    <form id="betaFeedbackForm" style="margin-top:16px;display:flex;flex-direction:column;gap:14px;">
      <input type="hidden" id="betaFeedbackFeatureKey" value="posture">

      <div>
        <label style="font-size:0.82rem;font-weight:700;color:var(--glass-text-primary);display:block;margin-bottom:6px;">
          Feature under test:
        </label>
        <div id="betaFeedbackFeatureName" style="padding:10px 14px;border-radius:10px;background:rgba(2,132,199,0.08);border:1px solid rgba(2,132,199,0.2);font-weight:700;color:#0284c7;font-size:0.9rem;">
          Posture AI / Posture Camera
        </div>
      </div>

      <div>
        <label style="font-size:0.82rem;font-weight:700;color:var(--glass-text-primary);display:block;margin-bottom:6px;">
          Feedback Type:
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;" id="betaFeedbackTypeGroup">
          <label style="cursor:pointer;padding:6px 12px;border:1px solid var(--border-color);border-radius:8px;font-size:0.82rem;display:inline-flex;align-items:center;gap:6px;">
            <input type="radio" name="betaFeedbackType" value="bug" checked> 🐞 Bug / Error
          </label>
          <label style="cursor:pointer;padding:6px 12px;border:1px solid var(--border-color);border-radius:8px;font-size:0.82rem;display:inline-flex;align-items:center;gap:6px;">
            <input type="radio" name="betaFeedbackType" value="ux"> 💡 UX / Usability
          </label>
          <label style="cursor:pointer;padding:6px 12px;border:1px solid var(--border-color);border-radius:8px;font-size:0.82rem;display:inline-flex;align-items:center;gap:6px;">
            <input type="radio" name="betaFeedbackType" value="praise"> ⭐ Positive Feedback
          </label>
        </div>
      </div>

      <div>
        <label style="font-size:0.82rem;font-weight:700;color:var(--glass-text-primary);display:block;margin-bottom:6px;">
          Experience Rating:
        </label>
        <div style="display:flex;gap:8px;">
          <select id="betaFeedbackRating" class="form-input" style="padding:8px 12px;border-radius:8px;font-size:0.88rem;max-width:200px;">
            <option value="5">⭐⭐⭐⭐⭐ (5/5 Great)</option>
            <option value="4" selected>⭐⭐⭐⭐ (4/5 Good)</option>
            <option value="3">⭐⭐⭐ (3/5 Average)</option>
            <option value="2">⭐⭐ (2/5 Subpar)</option>
            <option value="1">⭐ (1/5 Broken)</option>
          </select>
        </div>
      </div>

      <div>
        <label style="font-size:0.82rem;font-weight:700;color:var(--glass-text-primary);display:block;margin-bottom:6px;">
          Comments / Observations:
        </label>
        <textarea id="betaFeedbackComment" rows="4" class="form-input" placeholder="Describe any bug you hit, unexpected behavior, or usability suggestions..." style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;font-size:0.88rem;resize:vertical;" required></textarea>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
        <button type="button" class="outline-button" id="cancelBetaFeedbackBtn" style="padding:9px 18px;">
          Cancel
        </button>
        <button type="submit" class="solid-button" id="submitBetaFeedbackBtn" style="background:#0284c7;padding:9px 20px;font-weight:700;">
          Submit Feedback
        </button>
      </div>
    </form>
  </div>
</div>`;

if (!html.includes('id="betaFeedbackModal"')) {
  const exportTarget = '<!-- TOAST -->';
  html = html.replace(exportTarget, betaModalHTML + '\r\n\r\n' + exportTarget);
}

fs.writeFileSync(file, html, 'utf8');
console.log('Successfully updated index.html with Beta Features UI elements!');
