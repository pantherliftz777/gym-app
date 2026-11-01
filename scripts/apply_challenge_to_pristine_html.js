const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../public/index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

const startTag = '<!-- CHALLENGE SETUP STEP 1: MOTIVE MODAL -->';
const endTag = '<!-- AVATAR OPTIONS MODAL';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find challenge modal markers in public/index.html');
  process.exit(1);
}

const replacementModals = `<!-- CHALLENGE SETUP STEP 1: MOTIVE MODAL -->
<div class="modal-backdrop" id="challengeMotiveModal">
  <div class="modal-card" style="max-width:540px;">
    <div class="modal-head">
      <div>
        <span class="section-kicker">CHALLENGE WIZARD · STEP 1 OF 3</span>
        <h2>What is your primary motive?</h2>
      </div>
      <button class="close-btn" data-close>&times;</button>
    </div>
    <p style="color:var(--glass-text-secondary);font-size:.86rem;margin:8px 0 16px;line-height:1.45;">
      Select the primary focus of your training plan. Our AI will align your exercise selection, volume, and rest intervals accordingly.
    </p>
    <div style="display:flex;flex-direction:column;gap:10px;" id="motiveOptionsList">
      <div class="setup-choice-card selected" data-motive="Burn Fat &amp; Lean Out" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="setup-choice-icon" style="font-size:1rem;font-weight:800;color:#2563eb;">01</div>
          <div>
            <b style="color:#2563eb;font-size:.95rem;display:block;">Burn Fat &amp; Lean Out</b>
            <small style="color:var(--glass-text-secondary);font-size:.82rem;">High metabolic density, compound supersets, and elevated caloric burn.</small>
          </div>
        </div>
        <div class="choice-radio-indicator">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>

      <div class="setup-choice-card" data-motive="Build Muscle &amp; Hypertrophy" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="setup-choice-icon" style="font-size:1rem;font-weight:800;color:#2563eb;">02</div>
          <div>
            <b style="color:#2563eb;font-size:.95rem;display:block;">Build Muscle &amp; Hypertrophy</b>
            <small style="color:var(--glass-text-secondary);font-size:.82rem;">Hypertrophy rep ranges (8-12 reps), time under tension, and progressive overload.</small>
          </div>
        </div>
        <div class="choice-radio-indicator">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>

      <div class="setup-choice-card" data-motive="Maintain Weight &amp; Tone" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="setup-choice-icon" style="font-size:1rem;font-weight:800;color:#2563eb;">03</div>
          <div>
            <b style="color:#2563eb;font-size:.95rem;display:block;">Maintain Weight &amp; Athletic Tone</b>
            <small style="color:var(--glass-text-secondary);font-size:.82rem;">Balanced functional strength, postural stamina, and core stability.</small>
          </div>
        </div>
        <div class="choice-radio-indicator">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>

      <div class="setup-choice-card" data-motive="Raw Strength &amp; Power" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="setup-choice-icon" style="font-size:1rem;font-weight:800;color:#2563eb;">04</div>
          <div>
            <b style="color:#2563eb;font-size:.95rem;display:block;">Raw Strength &amp; Heavy Power</b>
            <small style="color:var(--glass-text-secondary);font-size:.82rem;">Heavy compound lifts, 4-6 rep strength schemes, and neuromuscular adaptation.</small>
          </div>
        </div>
        <div class="choice-radio-indicator">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
      <button type="button" class="outline-button" data-close>Cancel</button>
      <button type="button" class="solid-button" id="proceedToPrefsBtn" style="background:#2563eb;color:#fff;font-weight:700;">
        Next: Training Preferences →
      </button>
    </div>
  </div>
</div>

<!-- CHALLENGE SETUP STEP 2: PREFERENCES MODAL (TYPE MULTI-SELECT, TIME DURATION & INTENSITY) -->
<div class="modal-backdrop" id="challengePrefsModal">
  <div class="modal-card" style="max-width:540px;">
    <div class="modal-head">
      <div>
        <span class="section-kicker">CHALLENGE WIZARD · STEP 2 OF 3</span>
        <h2>Custom Training Preferences</h2>
      </div>
      <button class="close-btn" data-close>&times;</button>
    </div>
    <p style="color:var(--glass-text-secondary);font-size:.86rem;margin:8px 0 14px;line-height:1.45;">
      Customize your workout styles, time commitment, and training intensity.
    </p>

    <!-- 1. Workout Types Multi-Select -->
    <div style="margin-bottom:18px;">
      <label style="font-size:.8rem;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:8px;">
        1. Select Workout Types (Choose one or multiple):
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;" id="chTypesOptionsList">
        <label class="setup-choice-card selected" style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" value="Gym" checked style="accent-color:#2563eb;width:18px;height:18px;cursor:pointer;" />
            <span style="font-size:.9rem;font-weight:700;color:#2563eb;">Gym Workout</span>
          </div>
        </label>
        <label class="setup-choice-card" style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" value="Home" style="accent-color:#2563eb;width:18px;height:18px;cursor:pointer;" />
            <span style="font-size:.9rem;font-weight:700;color:#2563eb;">Home Workout</span>
          </div>
        </label>
        <label class="setup-choice-card" style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" value="HIIT" style="accent-color:#2563eb;width:18px;height:18px;cursor:pointer;" />
            <span style="font-size:.9rem;font-weight:700;color:#2563eb;">High Intensity (HIIT)</span>
          </div>
        </label>
        <label class="setup-choice-card" style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" value="Cardio" style="accent-color:#2563eb;width:18px;height:18px;cursor:pointer;" />
            <span style="font-size:.9rem;font-weight:700;color:#2563eb;">Cardio</span>
          </div>
        </label>
        <label class="setup-choice-card" style="padding:10px 14px;cursor:pointer;grid-column:span 2;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" value="Stretching" style="accent-color:#2563eb;width:18px;height:18px;cursor:pointer;" />
            <span style="font-size:.9rem;font-weight:700;color:#2563eb;">Stretching &amp; Mobility Cooldown</span>
          </div>
        </label>
      </div>
    </div>

    <!-- 2. Daily Workout Duration in Minutes -->
    <div style="margin-bottom:18px;">
      <label style="font-size:.8rem;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:8px;">
        2. How much time do you want to train per day?
      </label>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;" id="chTimeOptionsList">
        <button type="button" class="setup-choice-card" data-minutes="20" style="display:flex;flex-direction:column;align-items:center;padding:12px 6px;text-align:center;cursor:pointer;position:relative;">
          <b style="font-size:1.02rem;color:#2563eb;">20 min</b>
          <small style="color:var(--glass-text-secondary);font-size:.72rem;margin-top:2px;">Express</small>
          <div class="choice-radio-indicator" style="margin-top:8px;width:18px;height:18px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>

        <button type="button" class="setup-choice-card" data-minutes="35" style="display:flex;flex-direction:column;align-items:center;padding:12px 6px;text-align:center;cursor:pointer;position:relative;">
          <b style="font-size:1.02rem;color:#2563eb;">35 min</b>
          <small style="color:var(--glass-text-secondary);font-size:.72rem;margin-top:2px;">Balanced</small>
          <div class="choice-radio-indicator" style="margin-top:8px;width:18px;height:18px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>

        <button type="button" class="setup-choice-card selected" data-minutes="45" style="display:flex;flex-direction:column;align-items:center;padding:12px 6px;text-align:center;cursor:pointer;position:relative;">
          <b style="font-size:1.02rem;color:#2563eb;">45 min</b>
          <small style="color:var(--glass-text-secondary);font-size:.72rem;margin-top:2px;">Standard</small>
          <div class="choice-radio-indicator" style="margin-top:8px;width:18px;height:18px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>

        <button type="button" class="setup-choice-card" data-minutes="60" style="display:flex;flex-direction:column;align-items:center;padding:12px 6px;text-align:center;cursor:pointer;position:relative;">
          <b style="font-size:1.02rem;color:#2563eb;">60 min</b>
          <small style="color:var(--glass-text-secondary);font-size:.72rem;margin-top:2px;">Intensive</small>
          <div class="choice-radio-indicator" style="margin-top:8px;width:18px;height:18px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>
      </div>
    </div>

    <!-- 3. Workout Intensity -->
    <div style="margin-bottom:18px;">
      <label style="font-size:.8rem;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:8px;">
        3. Workout Intensity Level:
      </label>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;" id="chIntensityOptionsList">
        <button type="button" class="setup-choice-card" data-intensity="Mild" style="display:flex;flex-direction:column;align-items:center;padding:12px 8px;text-align:center;cursor:pointer;position:relative;">
          <span style="font-size:.7rem;font-weight:800;color:#0284c7;letter-spacing:.05em;background:#e0f2fe;padding:2px 8px;border-radius:20px;">EASY</span>
          <b style="font-size:.92rem;color:#2563eb;margin-top:6px;">Mild / Easy</b>
          <small style="color:var(--glass-text-secondary);font-size:.72rem;">60-90s rest</small>
          <div class="choice-radio-indicator" style="margin-top:8px;width:18px;height:18px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>

        <button type="button" class="setup-choice-card selected" data-intensity="Moderate" style="display:flex;flex-direction:column;align-items:center;padding:12px 8px;text-align:center;cursor:pointer;position:relative;">
          <span style="font-size:.7rem;font-weight:800;color:#2563eb;letter-spacing:.05em;background:#dbeafe;padding:2px 8px;border-radius:20px;">MEDIUM</span>
          <b style="font-size:.92rem;color:#2563eb;margin-top:6px;">Moderate</b>
          <small style="color:var(--glass-text-secondary);font-size:.72rem;">45-60s rest</small>
          <div class="choice-radio-indicator" style="margin-top:8px;width:18px;height:18px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>

        <button type="button" class="setup-choice-card" data-intensity="Hard" style="display:flex;flex-direction:column;align-items:center;padding:12px 8px;text-align:center;cursor:pointer;position:relative;">
          <span style="font-size:.7rem;font-weight:800;color:#dc2626;letter-spacing:.05em;background:#fee2e2;padding:2px 8px;border-radius:20px;">HARD</span>
          <b style="font-size:.92rem;color:#2563eb;margin-top:6px;">Hard / High</b>
          <small style="color:var(--glass-text-secondary);font-size:.72rem;">30-45s rest</small>
          <div class="choice-radio-indicator" style="margin-top:8px;width:18px;height:18px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;">
      <button type="button" class="outline-button" id="backToMotiveBtn">← Back</button>
      <button type="button" class="solid-button" id="proceedToDurationBtn" style="background:#2563eb;color:#fff;font-weight:700;">
        Next: Select Duration →
      </button>
    </div>
  </div>
</div>

<!-- CHALLENGE SETUP STEP 3: DURATION MODAL -->
<div class="modal-backdrop" id="challengeDurationModal">
  <div class="modal-card" style="max-width:540px;">
    <div class="modal-head">
      <div>
        <span class="section-kicker">CHALLENGE WIZARD · STEP 3 OF 3</span>
        <h2>Select Challenge Duration</h2>
      </div>
      <button class="close-btn" data-close>&times;</button>
    </div>
    <p style="color:var(--glass-text-secondary);font-size:.86rem;margin:8px 0 16px;line-height:1.45;">
      Choose your commitment window. The AI will generate a tailored schedule matching your duration, intensity, and hydration requirements.
    </p>

    <!-- User Metrics Confirmation Banner -->
    <div style="background:#f8fafc;border:1px solid #dbead2;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <div>
        <span style="font-size:.72rem;font-weight:800;color:#2563eb;text-transform:uppercase;letter-spacing:.05em;">AI CONFIGURATION SUMMARY</span>
        <div style="font-size:.88rem;color:var(--glass-accent-blue);font-weight:700;margin-top:2px;" id="challengeMetricsPreview">
          45 Total Min/Day · Moderate Intensity · Gym Workout
        </div>
      </div>
      <button type="button" class="text-button" id="editPrefsFromDurationBtn" style="font-size:.78rem;color:#2563eb;font-weight:700;cursor:pointer;">Edit Settings ✎</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;" id="durationOptionsList">
      <div class="setup-choice-card" data-days="10" style="display:flex;flex-direction:column;align-items:flex-start;padding:16px;cursor:pointer;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
          <span style="font-size:.75rem;font-weight:800;color:#2563eb;background:#dbeafe;padding:2px 8px;border-radius:12px;">10D</span>
          <div class="choice-radio-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
        <b style="font-size:1.05rem;color:#2563eb;margin:8px 0 4px;">10 Days Blitz</b>
        <small style="color:var(--glass-text-secondary);font-size:.8rem;line-height:1.35;">Rapid habit acceleration &amp; high intensity momentum.</small>
      </div>

      <div class="setup-choice-card selected" data-days="15" style="display:flex;flex-direction:column;align-items:flex-start;padding:16px;cursor:pointer;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
          <span style="font-size:.75rem;font-weight:800;color:#2563eb;background:#dbeafe;padding:2px 8px;border-radius:12px;">15D</span>
          <div class="choice-radio-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
        <b style="font-size:1.05rem;color:#2563eb;margin:8px 0 4px;">15 Days Kickstart</b>
        <small style="color:var(--glass-text-secondary);font-size:.8rem;line-height:1.35;">Visible physical adaptation &amp; core discipline booster.</small>
      </div>

      <div class="setup-choice-card" data-days="25" style="display:flex;flex-direction:column;align-items:flex-start;padding:16px;cursor:pointer;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
          <span style="font-size:.75rem;font-weight:800;color:#2563eb;background:#dbeafe;padding:2px 8px;border-radius:12px;">25D</span>
          <div class="choice-radio-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
        <b style="font-size:1.05rem;color:#2563eb;margin:8px 0 4px;">25 Days Transformation</b>
        <small style="color:var(--glass-text-secondary);font-size:.8rem;line-height:1.35;">Substantial hypertrophy, body composition, &amp; conditioning.</small>
      </div>

      <div class="setup-choice-card" data-days="30" style="display:flex;flex-direction:column;align-items:flex-start;padding:16px;cursor:pointer;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
          <span style="font-size:.75rem;font-weight:800;color:#2563eb;background:#dbeafe;padding:2px 8px;border-radius:12px;">30D</span>
          <div class="choice-radio-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
        <b style="font-size:1.05rem;color:#2563eb;margin:8px 0 4px;">30 Days Mastery</b>
        <small style="color:var(--glass-text-secondary);font-size:.8rem;line-height:1.35;">Full body transformation, endurance, &amp; elite habit lock-in.</small>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;">
      <button type="button" class="outline-button" id="backToPrefsBtn">← Back</button>
      <button type="button" class="solid-button" id="generateChallengePlanBtn" style="background:#2563eb;color:#fff;font-weight:700;">
        Generate AI Plan
      </button>
    </div>
  </div>
</div>
`;

content = content.substring(0, startIndex) + replacementModals + content.substring(endIndex);

// Also bump cache buster on styles and fitfuel script:
content = content.replace(/styles\.css\?v=[^"']+/g, 'styles.css?v=7.3.0');
content = content.replace(/fitfuel\.js\?v=[^"']+/g, 'fitfuel.js?v=7.3.0');

fs.writeFileSync(htmlPath, content, 'utf8');
console.log('Successfully updated challenge modals and asset versions in public/index.html');
