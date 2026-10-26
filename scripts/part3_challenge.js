const fs = require('fs');

let code = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. Update today's routine items in renderChallengeView
const routineStart = '<!-- Exercise List with Swap Buttons -->';
const routineEnd = '<!-- FULL CHALLENGE ROADMAP TIMELINE -->';

const rStartIdx = code.indexOf(routineStart);
const rEndIdx = code.indexOf(routineEnd);

console.log('routine boundaries:', rStartIdx, rEndIdx);

if (rStartIdx !== -1 && rEndIdx !== -1) {
  const newRoutineHtml = `<!-- Exercise List with Swap Buttons -->
      <div style="display:flex;flex-direction:column;gap:12px;">
        \${currentDay.exercises.map((ex, idx) => {
          const info = findExerciseInfo(ex.name) || {};
          const gifSrc = ex.gif || info.gif || '';
          const safeName = (ex.name || '').replace(/'/g, "\\\\'");
          const cleanName = escapeHtml(ex.name || '');
          const thumbHtml = gifSrc ? \`
            <div class="challenge-routine-thumb" onclick="openExerciseDetailModal('\${safeName}')" title="Click to view live movement demo">
              <img src="\${gifSrc}" alt="\${cleanName}" loading="lazy" onerror="this.parentElement.style.display='none';" />
            </div>
          \` : \`
            <div class="challenge-routine-thumb" onclick="openExerciseDetailModal('\${safeName}')" style="background:#2563eb;color:#ffffff;font-size:1.1rem;font-weight:800;display:flex;align-items:center;justify-content:center;">
              \${idx + 1}
            </div>
          \`;

          return \`
            <div class="challenge-routine-item" style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 16px;">
              <div style="display:flex;align-items:center;gap:14px;min-width:0;flex:1;">
                \${thumbHtml}
                <div style="min-width:0;cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px;">
                    <b class="challenge-routine-name" style="font-size:1rem;color:var(--glass-text-primary);">\${cleanName}</b>
                    <span style="font-size:.72rem;background:#eff6ff;color:#2563eb;padding:1px 8px;border-radius:99px;font-weight:800;text-transform:uppercase;">
                      \${escapeHtml(ex.subMuscle || info.sub || 'Targeted')}
                    </span>
                  </div>
                  <span class="challenge-routine-meta" style="font-size:.82rem;color:var(--glass-text-secondary);">
                    \${ex.sets} sets × \${escapeHtml(ex.reps)} · Rest \${ex.restSec || 60}s
                  </span>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <button type="button" class="outline-button small" style="font-size:.78rem;padding:6px 12px;border-color:#38bdf8;" onclick="openExerciseDetailModal('\${safeName}')">
                  Visual Guide
                </button>
                <button type="button" class="solid-button small swap-ex-trigger" data-ex-idx="\${idx}" style="font-size:.78rem;padding:6px 12px;background:#2563eb;">
                  Swap Workout
                </button>
              </div>
            </div>
          \`;
        }).join('')}
      </div>
    </div>

    `;

  code = code.slice(0, rStartIdx) + newRoutineHtml + code.slice(rEndIdx);
  console.log('Successfully updated today routine items in renderChallengeView');
}

// 2. Update openSwapExerciseModal alternatives list
const swapStart = 'const paginated = matches.slice(0, swapLimit);';
const swapEnd = 'const moreBtn = $(\'#swapShowMoreBtn\');';

const sStartIdx = code.indexOf(swapStart);
const sEndIdx = code.indexOf(swapEnd);

console.log('swap boundaries:', sStartIdx, sEndIdx);

if (sStartIdx !== -1 && sEndIdx !== -1) {
  const newSwapHtml = `const paginated = matches.slice(0, swapLimit);
    const hasMore = matches.length > paginated.length;

    list.innerHTML = paginated.map(ex => {
      const safeName = (ex.name || '').replace(/'/g, "\\\\'");
      const cleanName = escapeHtml(ex.name || '');
      const thumb = ex.gif ? \`
        <div style="width:48px;height:48px;border-radius:8px;background:#0f172a;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid rgba(255,255,255,0.06);" onclick="openExerciseDetailModal('\${safeName}')">
          <img src="\${ex.gif}" alt="\${cleanName}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.parentElement.style.display='none';" />
        </div>
      \` : '';

      return \`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid var(--ff-glass-border-subtle);border-radius:12px;background:var(--ff-surface);gap:12px;">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
            \${thumb}
            <div style="min-width:0;">
              <b style="color:#2563eb;font-size:.92rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')">\${cleanName}</b>
              <small style="color:var(--glass-text-secondary);font-size:.78rem;">\${escapeHtml(ex.sub || ex.category)} · \${escapeHtml(ex.type || 'Gym / Home')}</small>
            </div>
          </div>
          <button type="button" class="solid-button small replace-ex-btn" data-ex-name="\${cleanName}" style="background:#2563eb;font-size:.78rem;white-space:nowrap;flex-shrink:0;padding:6px 12px;">
            Select &amp; Replace
          </button>
        </div>
      \`;
    }).join('') + (hasMore ? \`
      <button type="button" id="swapShowMoreBtn" class="outline-button" style="width:100%;margin-top:10px;padding:9px;font-size:.85rem;border-color:#38bdf8;color:#2563eb;font-weight:700;">
        Show more (\${(matches.length - paginated.length).toLocaleString()} remaining)
      </button>
    \` : '');

    `;

  code = code.slice(0, sStartIdx) + newSwapHtml + code.slice(sEndIdx);
  console.log('Successfully updated openSwapExerciseModal alternatives list');
}

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
