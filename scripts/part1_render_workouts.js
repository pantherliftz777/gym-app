const fs = require('fs');

let code = fs.readFileSync('public/fitfuel.js', 'utf8');

const startTag = 'function renderWorkouts() {';
const endTag = '/* ---------- Starting Load Calculator (1RM-free, from claude-gym-coach) ---------- */';

const startIdx = code.indexOf(startTag);
const endIdx = code.indexOf(endTag);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newRenderWorkoutsCode = `function renderWorkouts() {
  const wo = WORKOUT_PLANS[activeWorkoutIdx % WORKOUT_PLANS.length];
  const isCustomAi = plan && plan.workout && (wo.name === plan.workout.name);
  if ($('#planWorkoutTitle')) {
    if (isCustomAi) {
      $('#planWorkoutTitle').innerHTML = \` \${wo.name} <span style="font-size:.72rem;background:#2563eb;color:#38bdf8;padding:3px 9px;border-radius:999px;vertical-align:middle;margin-left:6px;">AI GENERATED</span>\`;
    } else {
      $('#planWorkoutTitle').textContent = wo.name;
    }
  }
  if ($('#planFocusBadge')) $('#planFocusBadge').textContent = wo.focus.toUpperCase();
  if ($('#planBenefitText')) $('#planBenefitText').textContent = wo.benefit;

  const list = $('#planMoveList');
  if (list) {
    list.innerHTML = wo.moves.map((m, i) => {
      const ex = findExerciseInfo(m.name) || {};
      const safeName = (m.name || '').replace(/'/g, "\\\\'");
      const cleanName = escapeHtml(m.name || '');
      const gifSrc = ex.gif || '';
      const thumbHtml = gifSrc ? \`
        <div class="move-item-thumb" onclick="openExerciseDetailModal('\${safeName}')" title="Click to view live movement demo">
          <img src="\${gifSrc}" alt="\${cleanName}" loading="lazy" onerror="this.parentElement.style.display='none';" />
        </div>
      \` : \`
        <div class="move-item-thumb" onclick="openExerciseDetailModal('\${safeName}')" style="background:#2563eb;color:#ffffff;font-size:1rem;font-weight:800;display:flex;align-items:center;justify-content:center;">
          \${i + 1}
        </div>
      \`;

      return \`
        <div class="workout-move-item" style="display:flex;align-items:center;gap:14px;cursor:pointer;">
          <span class="move-index-badge">\${i + 1}</span>
          \${thumbHtml}
          <div style="flex:1;min-width:0;" onclick="openExerciseDetailModal('\${safeName}')">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:8px;">
                <b class="move-name-title">\${cleanName}</b>
                <span class="move-sub-badge">\${escapeHtml(ex.sub || ex.category || 'COMPOUND')}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="move-sets-text">\${escapeHtml(m.sets || '3 sets × 10 reps')}</span>
                <span class="move-hover-cta">View Guide</span>
              </div>
            </div>
            <p class="move-tip-text">\${escapeHtml(m.tip || ex.rxWhy || 'Maintain tight core, proud posture, and smooth cadence.')}</p>
          </div>
        </div>
      \`;
    }).join('');
  }
  renderCustomWorkoutExplorer();
}

`;

  code = code.slice(0, startIdx) + newRenderWorkoutsCode + code.slice(endIdx);
  fs.writeFileSync('public/fitfuel.js', code, 'utf8');
  console.log('Successfully spliced new renderWorkouts with animated GIF thumbnails!');
} else {
  console.error('Could not find boundaries for renderWorkouts');
}
