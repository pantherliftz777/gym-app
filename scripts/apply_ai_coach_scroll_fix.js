const fs = require('fs');
const path = require('path');

// 1. UPDATE public/index.html
const htmlPath = path.join(__dirname, '../public/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Find the boundaries of the left and right columns
const startIdx = html.indexOf('ai-coach-page-layout');
const leftColStart = html.indexOf('<!-- LEFT: COACH HEADER, SUBTABS, CHAT STREAM & INPUT -->', startIdx);
const rightColMarker = '<!-- RIGHT: COACH VISUAL CARD, QUICK ACTIONS, SUGGESTED PROMPTS -->';
const rightColIdx = html.indexOf(rightColMarker, leftColStart);
const rightColDivIdx = html.indexOf('<div>', rightColIdx);

if (startIdx === -1 || leftColStart === -1 || rightColIdx === -1 || rightColDivIdx === -1) {
  console.error('Could not locate all markers in index.html!', { startIdx, leftColStart, rightColIdx, rightColDivIdx });
  process.exit(1);
}

// Build the upgraded left column HTML
const upgradedLeftHtml = `<!-- LEFT: COACH HEADER, SUBTABS, CHAT STREAM & INPUT -->
          <div class="ai-coach-main-col">
            <!-- FIXED TOP SECTION -->
            <div class="ai-coach-top-section">
              <div class="panel ai-coach-header-card">
                <img src="images/fitfuel-coach-avatar.png" alt="FitFuel Coach" class="ai-coach-avatar-lg">
                <div class="ai-coach-header-info">
                  <h2>
                    FitFuel AI Coach
                    <span class="ai-badge-pill">Live Reasoning &bull; Multi-Model</span>
                  </h2>
                  <p style="margin:4px 0 0;font-size:0.84rem;color:var(--ff-text-secondary);">
                    Hypertrophy, biomechanics, diet optimization &amp; recovery strategist
                  </p>
                </div>
              </div>

              <!-- Subtabs Filter (Image 2) -->
              <div class="ai-coach-subtabs" id="coachSubTabs">
                <button type="button" class="ai-subtab-btn active" data-cfilter="all">All Guidance</button>
                <button type="button" class="ai-subtab-btn" data-cfilter="workouts">Workouts &amp; Splits</button>
                <button type="button" class="ai-subtab-btn" data-cfilter="nutrition">Nutrition &amp; Macros</button>
                <button type="button" class="ai-subtab-btn" data-cfilter="recovery">Recovery &amp; Sleep</button>
                <button type="button" class="ai-subtab-btn" data-cfilter="form-check">Form Cues</button>
              </div>
            </div>

            <!-- Scrollable Conversation Area -->
            <div class="panel ai-coach-chat-stream" id="coachChatStream" role="log" aria-label="AI Coach conversation" aria-live="polite" tabindex="0">
              <!-- Bot Welcome Message -->
              <div class="ai-msg bot" style="background:var(--glass-surface-subtle);border:1px solid var(--glass-border-subtle);border-radius:18px;padding:14px 18px;box-shadow:0 4px 16px rgba(47,73,117,0.05);">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <img src="images/fitfuel-coach-avatar.png" alt="Coach" style="width:24px;height:24px;border-radius:50%;">
                  <b style="font-size:0.86rem;color:var(--ff-text-primary);">FitFuel AI Coach</b>
                  <span style="font-size:0.7rem;color:var(--ff-emerald);font-weight:700;">ACTIVE</span>
                </div>
                <p style="margin:0 0 10px;font-size:0.88rem;line-height:1.55;color:var(--ff-text-primary);">
                  Welcome to your dedicated coaching room! I have your daily targets loaded (2,200 kcal, 140g protein, Upper-Body strength day). How can I optimize your training or nutrition right now?
                </p>

                <!-- Plan Preview Card (Image 2) -->
                <div class="ai-plan-preview-card">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <b style="font-size:0.9rem;color:var(--ff-text-primary);">Recommended Upper-Body Hypertrophy Plan</b>
                    <span style="font-size:0.72rem;background:rgba(22,199,154,0.2);color:#0d9488;padding:2px 8px;border-radius:99px;font-weight:700;">RPE 8</span>
                  </div>
                  <div class="ai-card-grid-2x2">
                    <div class="ai-card-pill-item"><b>Bench Press:</b> 4 sets &times; 8-10 reps</div>
                    <div class="ai-card-pill-item"><b>Incline Dumbbell:</b> 3 sets &times; 10 reps</div>
                    <div class="ai-card-pill-item"><b>Cable Lateral Raise:</b> 4 sets &times; 15 reps</div>
                    <div class="ai-card-pill-item"><b>Overhead Extension:</b> 3 sets &times; 12 reps</div>
                  </div>
                  <div class="ai-chat-action-btns-row">
                    <button type="button" class="ai-chat-btn-mini primary" id="coachPlanAddToWorkoutBtn">Save to My Workouts</button>
                    <button type="button" class="ai-chat-btn-mini" id="coachPlanInspectFormBtn">View Form Biomechanics</button>
                    <button type="button" class="ai-chat-btn-mini" id="coachPlanModifyVolBtn">Adjust Volume</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Scroll To Latest Floating Pill Button -->
            <button type="button" class="coach-scroll-bottom-btn" id="coachScrollBottomBtn" style="display:none;" aria-label="Scroll to latest response">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              <span>Scroll to latest</span>
            </button>

            <!-- FIXED BOTTOM MESSAGE COMPOSER -->
            <div class="ai-coach-composer-area">
              <!-- In-Chat Attached Image Preview Pill -->
              <div class="coach-selected-image-bar" id="coachSelectedImagePreviewBar" style="display:none;margin-top:4px;">
                <img id="coachSelectedImageThumb" class="coach-attached-thumb" src="" alt="Photo preview">
                <div style="flex:1;">
                  <b style="font-size:0.82rem;color:var(--ff-text-primary);display:block;">Photo Attached for AI Analysis</b>
                  <span style="font-size:0.74rem;color:var(--ff-text-secondary);">Coach will visually analyze meals, exercise form, or physique</span>
                </div>
                <button type="button" class="ai-chat-icon-btn" id="coachClearImageBtn" title="Remove photo" style="width:28px;height:28px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <!-- Quick Command Shortcuts (/goal, /boost) -->
              <div class="coach-quick-commands-bar" style="display:flex;align-items:center;gap:8px;margin-top:6px;margin-bottom:2px;flex-wrap:wrap;">
                <span style="font-size:0.72rem;font-weight:800;color:var(--ff-text-muted);text-transform:uppercase;letter-spacing:0.04em;">Commands:</span>
                <button type="button" class="coach-cmd-chip-btn" id="coachCmdGoalBtn" title="Launch 4D Body Composition &amp; Goal Studio">
                  <span class="cmd-tag">/goal</span>
                  <span>4D Body &amp; Goal Studio</span>
                </button>
                <button type="button" class="coach-cmd-chip-btn" id="coachCmdBoostBtn" title="Pre-Workout Adrenaline &amp; Form Checker">
                  <span class="cmd-tag">/boost</span>
                  <span>Pre-Workout Form Booster</span>
                </button>
              </div>

              <!-- Input Bar -->
              <div class="ai-chat-input-bar" style="margin-top:6px;">
                <button type="button" class="ai-chat-icon-btn" id="coachChatCameraBtn" title="Click Photo with Camera"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg></button><button type="button" class="ai-chat-icon-btn" id="coachChatUploadBtn" title="Upload Photo from Device"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></button><input type="file" id="coachChatFileInput" accept="image/*" style="display:none;"><button type="button" class="ai-chat-icon-btn" id="coachChatAttachBtn" title="Upload meal photo or form video">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <input type="text" id="coachChatInput" class="ai-chat-input-field" placeholder="Ask coach about form, macros, workouts, or recovery..." autocomplete="off">
                <button type="button" class="ai-chat-icon-btn" id="coachChatMicBtn" title="Speak to coach (Voice Input)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </button>
                <button type="button" class="ai-chat-send-btn" id="coachChatSendBtn" title="Send message">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT: COACH VISUAL CARD, QUICK ACTIONS, SUGGESTED PROMPTS -->
          <div class="ai-coach-sidebar-col">`;

const oldPart = html.substring(leftColStart, rightColDivIdx + 5);
html = html.substring(0, leftColStart) + upgradedLeftHtml + html.substring(rightColDivIdx + 5);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully updated public/index.html');

// 2. UPDATE public/styles.css
const cssPath = path.join(__dirname, '../public/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace .ai-coach-chat-stream { height: 520px; ... }
const oldStreamCss = `.ai-coach-chat-stream {
  height: 520px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}`;

const newStreamCss = `/* ==========================================================================
   AI COACH THREE-REGION CHAT ARCHITECTURE & SCROLLING ENGINE
   ========================================================================== */

.ai-coach-page-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 980px) {
  .ai-coach-page-layout {
    grid-template-columns: 1fr;
  }
}

/* Region 1 & Container: Main Left Column */
.ai-coach-main-col {
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - 240px);
  height: calc(100dvh - 240px);
  min-height: 480px;
  max-height: 960px;
}
@media (max-width: 980px) {
  .ai-coach-main-col {
    height: calc(100dvh - 160px);
    height: calc(100vh - 160px);
    min-height: 440px;
    margin-bottom: 24px;
  }
}

/* Region A: Fixed Top Section (Profile, Header, Categories) */
.ai-coach-top-section {
  flex: 0 0 auto;
  z-index: 2;
}

.ai-coach-header-card {
  margin-bottom: 10px;
  padding: 14px 20px;
}
@media (max-width: 768px) {
  .ai-coach-header-card {
    padding: 12px 16px;
    margin-bottom: 8px;
    gap: 12px;
  }
  .ai-coach-avatar-lg {
    width: 46px;
    height: 46px;
  }
  .ai-coach-header-info h2 {
    font-size: 1.18rem;
  }
}

.ai-coach-subtabs {
  margin-bottom: 10px;
  padding-bottom: 4px;
}

/* Region B: Scrollable Conversation Area */
#coachChatStream.ai-coach-chat-stream,
.ai-coach-chat-stream {
  flex: 1 1 auto;
  min-height: 0;
  height: auto !important;
  max-height: none !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  overscroll-behavior-y: contain;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
  padding: 16px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Custom Glassmorphic Vertical Scrollbar for AI Coach */
.ai-coach-chat-stream::-webkit-scrollbar {
  width: 8px;
}
.ai-coach-chat-stream::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
}
.ai-coach-chat-stream::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 20px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.ai-coach-chat-stream::-webkit-scrollbar-thumb:hover {
  background: rgba(22, 199, 154, 0.8);
  border-radius: 20px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.ai-coach-chat-stream {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.55) transparent;
}
html.dark .ai-coach-chat-stream::-webkit-scrollbar-thumb,
[data-theme="dark"] .ai-coach-chat-stream::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.45);
  border: 2px solid transparent;
  background-clip: content-box;
}
html.dark .ai-coach-chat-stream::-webkit-scrollbar-thumb:hover,
[data-theme="dark"] .ai-coach-chat-stream::-webkit-scrollbar-thumb:hover {
  background: rgba(72, 229, 177, 0.85);
  border: 2px solid transparent;
  background-clip: content-box;
}
html.dark .ai-coach-chat-stream,
[data-theme="dark"] .ai-coach-chat-stream {
  scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
}

/* Scroll To Latest Floating Button */
.coach-scroll-bottom-btn {
  position: absolute;
  bottom: 84px;
  right: 24px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 15px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0A0F1D;
  background: var(--ff-emerald);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 18px rgba(22, 199, 154, 0.45);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.coach-scroll-bottom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(22, 199, 154, 0.65);
}
.coach-scroll-bottom-btn svg {
  animation: bounceDown 1.5s infinite ease-in-out;
}
@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

/* Region C: Fixed Bottom Message Composer */
.ai-coach-composer-area {
  flex: 0 0 auto;
  z-index: 2;
  margin-top: 6px;
}

/* Right Sidebar Column */
.ai-coach-sidebar-col {
  display: flex;
  flex-direction: column;
}

/* Markdown Tables & Content Formatting in Coach Response */
.ai-msg.bot div[style*="overflow-x:auto"],
.ai-msg.bot .table-wrapper {
  max-width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  margin: 10px 0;
  -webkit-overflow-scrolling: touch;
}
.ai-msg.bot table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
  border-radius: 8px;
  overflow: hidden;
  margin: 4px 0;
}
.ai-msg.bot th {
  background: rgba(30, 41, 59, 0.85);
  color: #38bdf8;
  font-weight: 700;
  padding: 8px 12px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}
.ai-msg.bot td {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--ff-text-primary);
  background: rgba(255, 255, 255, 0.02);
}
html:not(.dark) .ai-msg.bot th {
  background: #f1f5f9;
  color: #0284c7;
  border-color: #cbd5e1;
}
html:not(.dark) .ai-msg.bot td {
  border-color: #e2e8f0;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.5);
}`;

if (css.includes(oldStreamCss)) {
  css = css.replace(oldStreamCss, newStreamCss);
} else {
  // Try regex replacement
  css = css.replace(/\.ai-coach-chat-stream\s*\{[\s\S]*?height:\s*520px;[\s\S]*?\}/, newStreamCss);
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated public/styles.css');

// 3. UPDATE public/fitfuel.js
const jsPath = path.join(__dirname, '../public/fitfuel.js');
let js = fs.readFileSync(jsPath, 'utf8');

// Replace oldRenderCall
const renderCallRegex = /coachStream\.innerHTML\s*=\s*welcomeHtml\s*\+\s*chatItemsHtml;[\s\r\n]*coachStream\.scrollTop\s*=\s*coachStream\.scrollHeight;[\s\r\n]*if\s*\(typeof initCoachListeners === 'function'\)\s*initCoachListeners\(\);/;

const newRenderCall = `    const threshold = 140;
    const isNearBottom = (coachStream.scrollHeight - coachStream.scrollTop - coachStream.clientHeight) <= threshold;
    const prevScrollTop = coachStream.scrollTop;

    coachStream.innerHTML = welcomeHtml + chatItemsHtml;

    if (window._forceScrollToBottom || isNearBottom || chatHistory.length <= 1) {
      coachStream.scrollTop = coachStream.scrollHeight;
      window._forceScrollToBottom = false;
    } else {
      coachStream.scrollTop = prevScrollTop;
    }

    if (typeof updateCoachScrollBottomBtn === 'function') {
      updateCoachScrollBottomBtn();
    }
    if (typeof initCoachListeners === 'function') initCoachListeners();`;

if (renderCallRegex.test(js)) {
  js = js.replace(renderCallRegex, newRenderCall);
  console.log('Replaced renderChatMessages scroll logic in fitfuel.js');
} else {
  console.error('Could not find oldRenderCall via regex in fitfuel.js!');
  process.exit(1);
}

// Add updateCoachScrollBottomBtn function and hook up listeners
const oldInitCoachRegex = /function\s+initCoachListeners\s*\(\)\s*\{/;
const newInitCoach = `function updateCoachScrollBottomBtn() {
  const s = $('#coachChatStream');
  const btn = $('#coachScrollBottomBtn');
  if (!s || !btn) return;
  const distFromBottom = s.scrollHeight - s.scrollTop - s.clientHeight;
  if (distFromBottom > 140) {
    btn.style.display = 'flex';
  } else {
    btn.style.display = 'none';
  }
}
window.updateCoachScrollBottomBtn = updateCoachScrollBottomBtn;

function initCoachListeners() {
  const stream = $('#coachChatStream');
  if (stream && !stream._hasScrollListener) {
    stream._hasScrollListener = true;
    stream.addEventListener('scroll', () => {
      updateCoachScrollBottomBtn();
    }, { passive: true });
  }

  const scrollBtn = $('#coachScrollBottomBtn');
  if (scrollBtn && !scrollBtn._hasClickListener) {
    scrollBtn._hasClickListener = true;
    scrollBtn.onclick = () => {
      if (stream) {
        stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
        setTimeout(() => updateCoachScrollBottomBtn(), 350);
      }
    };
  }`;

if (oldInitCoachRegex.test(js)) {
  js = js.replace(oldInitCoachRegex, newInitCoach);
  console.log('Hooked scroll-to-latest button and listeners in fitfuel.js');
}

// Ensure sendCoachChatMessage sets force scroll
const oldSendCoachRegex = /function\s+sendCoachChatMessage\s*\(customPrompt\)\s*\{/;
const newSendCoach = `function sendCoachChatMessage(customPrompt) {
  window._forceScrollToBottom = true;`;

if (oldSendCoachRegex.test(js)) {
  js = js.replace(oldSendCoachRegex, newSendCoach);
  console.log('Updated sendCoachChatMessage to force scroll on user send in fitfuel.js');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Successfully updated public/fitfuel.js');

