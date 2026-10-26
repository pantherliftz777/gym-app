const fs = require('fs');

let code = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. Update renderWorkouts to show animated GIFs in move items
const oldRenderWorkoutsRegex = /function renderWorkouts\(\) \{[\s\S]*?renderCustomWorkoutExplorer\(\);\s*\}/;

const newRenderWorkouts = `function renderWorkouts() {
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
}`;

if (oldRenderWorkoutsRegex.test(code)) {
  code = code.replace(oldRenderWorkoutsRegex, newRenderWorkouts);
  console.log('Successfully updated renderWorkouts with animated GIF thumbnails!');
} else {
  console.error('Could not find old renderWorkouts');
}

// 2. Update renderStartingLoad with smart starter routines and precision calculator for any exercise
const oldStartingLoadRegex = /function renderStartingLoad\(\) \{[\s\S]*?if \(\$\('#slSex'\)\) \$\('#slSex'\)\.onchange = renderStartingLoad;/;

const newStartingLoad = `function calculateExerciseStartingLoad(exName, bw = 70, sex = 'male', level = 'beginner') {
  const ex = findExerciseInfo(exName) || {};
  const eq = (ex.rawEquipment || ex.equipment || ex.type || '').toLowerCase();
  const cat = (ex.category || '').toLowerCase();
  const mult = level === 'hard' ? 1.45 : (level === 'intermediate' ? 1.25 : (level === 'medium' ? 1.1 : 1.0));
  const isFemale = sex === 'female';
  const sexMult = isFemale ? 0.65 : 1.0;

  if (eq.includes('body weight') || eq.includes('bodyweight')) {
    return { type: 'Bodyweight', weight: 'Bodyweight', detail: \`Calibrated to your \${bw} kg bodyweight\` };
  } else if (eq.includes('dumbbell')) {
    let basePct = 0.18;
    if (cat.includes('chest') || cat.includes('back')) basePct = 0.22;
    else if (cat.includes('shoulder') || cat.includes('arms')) basePct = 0.14;
    else if (cat.includes('legs')) basePct = 0.25;
    const perDb = Math.max(4, Math.round(bw * basePct * mult * sexMult));
    return { type: 'Dumbbell', weight: \`\${perDb} kg\`, detail: \`per dumbbell (Pair: \${perDb * 2} kg total)\` };
  } else if (eq.includes('barbell')) {
    let basePct = 0.50;
    if (cat.includes('legs')) basePct = 0.70;
    else if (cat.includes('chest')) basePct = 0.55;
    else if (cat.includes('back')) basePct = 0.60;
    else if (cat.includes('shoulder')) basePct = 0.40;
    const total = Math.max(20, Math.round((bw * basePct * mult * sexMult) / 2.5) * 2.5);
    return { type: 'Barbell', weight: \`\${total} kg\`, detail: \`Olympic Bar (20 kg) + \${Math.max(0, total - 20)} kg plates\` };
  } else {
    // Machine / Cable
    let basePct = 0.45;
    if (cat.includes('legs')) basePct = 0.65;
    else if (cat.includes('back') || cat.includes('chest')) basePct = 0.50;
    const total = Math.max(10, Math.round((bw * basePct * mult * sexMult) / 5) * 5);
    return { type: 'Machine/Cable', weight: \`\${total} kg\`, detail: \`Pin-select stack setting at RPE 6–7\` };
  }
}

function renderStartingLoad() {
  const grid = $('#slLoadsGrid');
  const note = $('#slCeilingNote');
  const descEl = $('#slLevelDesc');
  if (!grid) return;
  const bw = Number($('#slBodyweight') ? $('#slBodyweight').value : 70) || 70;
  const sex = $('#slSex') ? $('#slSex').value : 'male';
  if (descEl) descEl.textContent = SL_LEVEL_DESCS[slCurrentLevel] || SL_LEVEL_DESCS.beginner;

  const levelBtns = document.querySelectorAll('#slLevelPills [data-sl-level]');
  levelBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sl-level') === slCurrentLevel);
  });

  // 1. Compound Lifts Baseline Cards
  const parts = [];
  for (const lift of SL_LIFTS) {
    const ceil = FF_ALGO.startingLoadCeiling(bw, sex, lift.key, slCurrentLevel);
    const start = FF_ALGO.startingLoadPropose(bw, sex, lift.key, slCurrentLevel !== 'beginner', slCurrentLevel);
    parts.push(\`<div class="sl-load-card" style="background:var(--ff-surface);border:1.5px solid var(--ff-glass-border-subtle);border-radius:14px;padding:14px 10px;text-align:center;box-shadow:0 4px 12px rgba(15,23,42,0.03);transition:transform .15s ease;">
      <div style="font-size:.76rem;color:var(--ff-text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;">\${lift.name}</div>
      <div style="font-size:1.6rem;font-weight:900;color:var(--ff-text-primary);letter-spacing:-.02em;">\${start} <span style="font-size:.85rem;font-weight:600;color:var(--ff-text-muted);">kg</span></div>
      <div style="font-size:.74rem;color:var(--ff-text-muted);margin-top:4px;">ceiling: <b style="color:var(--ff-text-secondary);">\${ceil.min}–\${ceil.max} kg</b></div>
    </div>\`);
  }
  grid.innerHTML = parts.join('');
  if (note) {
    const levelLabel = slCurrentLevel.charAt(0).toUpperCase() + slCurrentLevel.slice(1);
    note.innerHTML = \`<b>\${levelLabel} Standard Calibrated:</b> Based on strength standards (~40–60% of benchmark %BW) for <b>\${sex}</b> at <b>\${bw} kg</b> bodyweight. Warmup: empty bar &rarr; ~50–60% of ceiling &rarr; calibrated work sets at RPE 6–7.\`;
  }

  // 2. Interactive Precision Starting Weight Calculator for Any Exercise in 1,318 Library
  const calcContainer = $('#slExerciseCalcResult');
  if (calcContainer) {
    const searchVal = ($('#slExerciseSearchInput') ? $('#slExerciseSearchInput').value.trim() : '') || 'Incline Dumbbell Bench Press';
    const matchedEx = findExerciseInfo(searchVal) || (EXERCISES_LIBRARY && EXERCISES_LIBRARY[0]) || { name: 'Incline Dumbbell Bench Press', category: 'Chest', equipment: 'dumbbell' };
    const loadInfo = calculateExerciseStartingLoad(matchedEx.name, bw, sex, slCurrentLevel);
    const safeName = (matchedEx.name || '').replace(/'/g, "\\\\'");
    const cleanName = escapeHtml(matchedEx.name || '');

    calcContainer.innerHTML = \`
      <div class="smart-calc-exercise-result">
        \${matchedEx.gif ? \`
          <div style="width:110px;height:110px;border-radius:12px;background:#0f172a;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')">
            <img src="\${matchedEx.gif}" alt="\${cleanName}" style="max-height:100%;max-width:100%;object-fit:contain;" />
          </div>
        \` : ''}
        <div style="flex:1;min-width:220px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
            <span style="font-size:.72rem;background:#eff6ff;color:#2563eb;padding:2px 8px;border-radius:99px;font-weight:800;text-transform:uppercase;">
              \${escapeHtml(matchedEx.category || 'Compound')} · \${escapeHtml(matchedEx.rawEquipment || matchedEx.equipment || 'Gym')}
            </span>
            <span style="font-size:.75rem;color:var(--glass-text-secondary);font-weight:600;">\${escapeHtml(matchedEx.level || 'Intermediate')}</span>
          </div>
          <b style="font-size:1.15rem;color:var(--glass-text-primary);display:block;cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')">\${cleanName}</b>
          <p style="font-size:.82rem;color:var(--glass-text-secondary);margin:4px 0 8px;">\${escapeHtml(matchedEx.rxWhy || matchedEx.benefit || 'Targeted biomechanical movement pattern.')}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            <button type="button" class="solid-button small" style="background:#2563eb;font-size:.8rem;padding:7px 14px;" onclick="openExerciseDetailModal('\${safeName}')">
              View Visual &amp; Form Guide
            </button>
            <button type="button" class="outline-button small" style="font-size:.8rem;padding:7px 14px;border-color:#38bdf8;" onclick="startCustomExerciseTimer('\${safeName}', '3 sets × 8–10 reps', '60s rest')">
              Start With \${loadInfo.weight}
            </button>
          </div>
        </div>
        <div style="text-align:right;background:rgba(37,99,235,0.06);border:1.5px solid rgba(37,99,235,0.18);border-radius:14px;padding:14px 20px;min-width:170px;">
          <span style="font-size:.74rem;color:#2563eb;display:block;font-weight:800;text-transform:uppercase;">RECOMMENDED LOAD</span>
          <div style="font-size:1.75rem;font-weight:900;color:var(--glass-text-primary);line-height:1.2;">\${loadInfo.weight}</div>
          <small style="font-size:.74rem;color:var(--glass-text-secondary);display:block;margin-top:2px;">\${loadInfo.detail}</small>
        </div>
      </div>
    \`;
  }

  // 3. Smart Start Foundational Programs from 1,318 Catalog
  const routinesGrid = $('#slStarterRoutinesGrid');
  if (routinesGrid) {
    const starterPrograms = [
      {
        title: 'Full Body Primer (Foundation)',
        focus: 'Squat · Bench · Row · Core',
        time: '35 min',
        exercises: ['Barbell Back Squat', 'Flat Barbell Bench Press', 'Single-Arm Dumbbell Row', 'Romanian Deadlift']
      },
      {
        title: 'Upper Body Launchpad',
        focus: 'Chest · Lats · Shoulders · Arms',
        time: '32 min',
        exercises: ['Incline Dumbbell Bench Press', 'Lat Pulldown', 'Overhead Dumbbell Shoulder Press', 'Dumbbell Hammer Curl']
      },
      {
        title: 'Lower Body & Core Drive',
        focus: 'Quads · Glutes · Hamstrings',
        time: '30 min',
        exercises: ['Goblet Squat', 'Bulgarian Split Squat', 'Barbell Hip Thrust', 'Dead bug']
      },
      {
        title: 'Home & Calisthenics Starter',
        focus: 'Bodyweight · Mobility · Posture',
        time: '25 min',
        exercises: ['Push-up', 'Bodyweight Squat', 'Glute Bridge', 'Bird Dog']
      }
    ];

    routinesGrid.innerHTML = starterPrograms.map((prog, pIdx) => {
      const exItems = prog.exercises.map(name => {
        const info = findExerciseInfo(name) || {};
        const safe = (name || '').replace(/'/g, "\\\\'");
        const load = calculateExerciseStartingLoad(name, bw, sex, slCurrentLevel);
        return \`
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--ff-glass-border-subtle);font-size:.82rem;">
            <div style="display:flex;align-items:center;gap:8px;min-width:0;">
              \${info.gif ? \`
                <div style="width:34px;height:34px;border-radius:6px;background:#0f172a;overflow:hidden;flex-shrink:0;">
                  <img src="\${info.gif}" alt="\${escapeHtml(name)}" style="width:100%;height:100%;object-fit:contain;" />
                </div>
              \` : ''}
              <span style="font-weight:700;color:var(--glass-text-primary);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" onclick="openExerciseDetailModal('\${safe}')">\${escapeHtml(name)}</span>
            </div>
            <span style="font-weight:800;color:#2563eb;font-size:.78rem;white-space:nowrap;">\${load.weight}</span>
          </div>
        \`;
      }).join('');

      return \`
        <div class="smart-start-routine-card">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:.72rem;background:#eff6ff;color:#2563eb;padding:2px 8px;border-radius:99px;font-weight:800;text-transform:uppercase;">STARTER PROGRAM \${pIdx + 1}</span>
              <span style="font-size:.75rem;color:var(--glass-text-secondary);font-weight:600;">\${prog.time}</span>
            </div>
            <h4 style="margin:0 0 4px;font-size:1.05rem;color:var(--glass-text-primary);font-weight:800;">\${escapeHtml(prog.title)}</h4>
            <p style="margin:0 0 12px;font-size:.78rem;color:var(--glass-text-secondary);">\${escapeHtml(prog.focus)}</p>
            <div style="margin-bottom:14px;">
              \${exItems}
            </div>
          </div>
          <button type="button" class="solid-button small" style="background:#2563eb;width:100%;justify-content:center;padding:9px;font-size:.84rem;font-weight:700;" onclick="startSmartProgramSession(\${pIdx})">
            Start Calibrated Routine
          </button>
        </div>
      \`;
    }).join('');
  }
}

window.startSmartProgramSession = function(pIdx) {
  const starterPrograms = [
    {
      title: 'Smart Start: Full Body Foundation',
      focus: 'Squat · Bench · Row · Core',
      exercises: [
        { name: 'Barbell Back Squat', sets: 3, reps: '8 reps', restSec: 60, tip: 'Calibrated baseline load. Focus on depth and control.' },
        { name: 'Flat Barbell Bench Press', sets: 3, reps: '8 reps', restSec: 60, tip: 'Keep shoulder blades locked together.' },
        { name: 'Single-Arm Dumbbell Row', sets: 3, reps: '10 reps each', restSec: 60, tip: 'Drive elbow back into hip.' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10 reps', restSec: 60, tip: 'Feel maximum hamstring stretch.' }
      ]
    },
    {
      title: 'Smart Start: Upper Body Launchpad',
      focus: 'Chest · Lats · Shoulders · Arms',
      exercises: [
        { name: 'Incline Dumbbell Bench Press', sets: 3, reps: '10 reps', restSec: 60, tip: 'Converge dumbbells slightly at top.' },
        { name: 'Lat Pulldown', sets: 3, reps: '10 reps', restSec: 60, tip: 'Pull down to upper chest without swinging.' },
        { name: 'Overhead Dumbbell Shoulder Press', sets: 3, reps: '8 reps', restSec: 60, tip: 'Lock ribs, press straight upward.' },
        { name: 'Dumbbell Hammer Curl', sets: 3, reps: '10 reps', restSec: 45, tip: 'Neutral grip, control eccentric.' }
      ]
    },
    {
      title: 'Smart Start: Lower Body & Core Drive',
      focus: 'Quads · Glutes · Hamstrings',
      exercises: [
        { name: 'Goblet Squat', sets: 3, reps: '12 reps', restSec: 60, tip: 'Keep dumbbell high on sternum.' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: '8 reps each', restSec: 60, tip: 'Drive through front midfoot.' },
        { name: 'Barbell Hip Thrust', sets: 3, reps: '10 reps', restSec: 60, tip: 'Hard posterior tilt at top.' },
        { name: 'Dead bug', sets: 3, reps: '12 reps each', restSec: 45, tip: 'Flatten spine against floor.' }
      ]
    },
    {
      title: 'Smart Start: Home & Calisthenics Starter',
      focus: 'Bodyweight · Mobility · Posture',
      exercises: [
        { name: 'Push-up', sets: 3, reps: '12 reps', restSec: 45, tip: 'Tight plank, smooth rhythmic tempo.' },
        { name: 'Bodyweight Squat', sets: 3, reps: '15 reps', restSec: 45, tip: 'Full range of motion, heels down.' },
        { name: 'Glute Bridge', sets: 3, reps: '15 reps', restSec: 45, tip: '1-second squeeze at apex.' },
        { name: 'Bird Dog', sets: 3, reps: '12 reps each', restSec: 30, tip: 'Reach long through fingers and heels.' }
      ]
    }
  ];

  const prog = starterPrograms[pIdx] || starterPrograms[0];
  soundFX.pop();
  startWorkoutSession({
    title: prog.title,
    focus: prog.focus,
    estDuration: '30 min',
    exercises: prog.exercises
  });
};

if ($('#slBodyweight')) $('#slBodyweight').oninput = renderStartingLoad;
if ($('#slSex')) $('#slSex').onchange = renderStartingLoad;
if ($('#slExerciseSearchInput')) $('#slExerciseSearchInput').oninput = renderStartingLoad;`;

if (oldStartingLoadRegex.test(code)) {
  code = code.replace(oldStartingLoadRegex, newStartingLoad);
  console.log('Successfully updated renderStartingLoad with smart starter routines and precision calculator!');
} else {
  console.error('Could not find old renderStartingLoad');
}

// 3. Update Challenge Today's routine to show animated GIFs and click-to-guide
const oldChallRoutineRegex = /\$\(currentDay\.exercises\.map\(\(ex, idx\) => `[\s\S]*?<div class="challenge-routine-item">[\s\S]*?<\/div>\s*`\)\.join\(''\)\}/;

const newChallRoutine = \`\${currentDay.exercises.map((ex, idx) => {
          const info = findExerciseInfo(ex.name) || {};
          const gifSrc = ex.gif || info.gif || '';
          const safeName = (ex.name || '').replace(/'/g, "\\\\\\\\'");
          const cleanName = escapeHtml(ex.name || '');
          const thumbHtml = gifSrc ? \\\`
            <div class="challenge-routine-thumb" onclick="openExerciseDetailModal('\${safeName}')" title="Click to view live movement demo">
              <img src="\${gifSrc}" alt="\${cleanName}" loading="lazy" onerror="this.parentElement.style.display='none';" />
            </div>
          \\\` : \\\`
            <span class="challenge-routine-idx">\${idx + 1}</span>
          \\\`;

          return \\\`
            <div class="challenge-routine-item" style="display:flex;align-items:center;justify-content:space-between;gap:14px;">
              <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
                \${thumbHtml}
                <div style="min-width:0;cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <b class="challenge-routine-name">\${cleanName}</b>
                    <span style="font-size:.72rem;background:#eff6ff;color:#2563eb;padding:1px 8px;border-radius:99px;font-weight:700;">\${escapeHtml(ex.subMuscle || info.sub || 'Targeted')}</span>
                  </div>
                  <span class="challenge-routine-meta">\${ex.sets} sets × \${escapeHtml(ex.reps)} · Rest \${ex.restSec || 60}s</span>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <button type="button" class="outline-button small" style="font-size:.78rem;padding:6px 12px;border-color:#38bdf8;" onclick="openExerciseDetailModal('\${safeName}')">
                  Guide
                </button>
                <button type="button" class="solid-button small swap-ex-trigger" data-ex-idx="\${idx}" style="font-size:.78rem;padding:6px 12px;background:#2563eb;">
                  Swap
                </button>
              </div>
            </div>
          \\\`;
        }).join('')}\`;

// 4. Update openSwapExerciseModal to include animated GIF thumbnails
const oldSwapModalRegex = /list\.innerHTML = paginated\.map\(ex => `[\s\S]*?<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid #edf2e8;[\s\S]*?Select &amp; Replace[\s\S]*?<\/div>\s*`\)\.join\(''\) \+ \(hasMore \? `[\s\S]*?Show more \(\$\{matches\.length - paginated\.length\} remaining\)[\s\S]*?` : ''\);/;

const newSwapModal = \`list.innerHTML = paginated.map(ex => {
      const safeName = (ex.name || '').replace(/'/g, "\\\\\\\\'");
      const cleanName = escapeHtml(ex.name || '');
      const thumb = ex.gif ? \\\`
        <div style="width:46px;height:46px;border-radius:8px;background:#0f172a;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')">
          <img src="\${ex.gif}" alt="\${cleanName}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.parentElement.style.display='none';" />
        </div>
      \\\` : '';

      return \\\`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid var(--ff-glass-border-subtle);border-radius:12px;background:var(--ff-surface);gap:12px;">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
            \${thumb}
            <div style="min-width:0;">
              <b style="color:#2563eb;font-size:.9rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')">\${cleanName}</b>
              <small style="color:var(--glass-text-secondary);font-size:.78rem;">\${escapeHtml(ex.sub || ex.category)} · \${escapeHtml(ex.type || 'Gym/Home')}</small>
            </div>
          </div>
          <button type="button" class="solid-button small replace-ex-btn" data-ex-name="\${cleanName}" style="background:#2563eb;font-size:.78rem;white-space:nowrap;flex-shrink:0;">
            Select &amp; Replace
          </button>
        </div>
      \\\`;
    }).join('') + (hasMore ? \\\`
      <button type="button" id="swapShowMoreBtn" class="outline-button" style="width:100%;margin-top:10px;padding:9px;font-size:.85rem;border-color:#38bdf8;color:#2563eb;font-weight:700;">
        Show more (\${(matches.length - paginated.length).toLocaleString()} remaining)
      </button>
    \\\` : '');\`;

if (oldSwapModalRegex.test(code)) {
  code = code.replace(oldSwapModalRegex, newSwapModal);
  console.log('Successfully updated openSwapExerciseModal with animated thumbnails!');
} else {
  console.error('Could not find old openSwapExerciseModal');
}

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
