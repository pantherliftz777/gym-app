const fs = require('fs');

let code = fs.readFileSync('public/fitfuel.js', 'utf8');

const oldExplorerRegex = /function renderCustomWorkoutExplorer\(\) \{[\s\S]*?const toggleBtn = \$\('#toggleCustomWorkoutExpandBtn'\);[\s\S]*?renderCustomWorkoutExplorer\(\);\s*\}\s*\}\s*\}/;

const newExplorer = `function renderCustomWorkoutExplorer() {
  const grid = $('#customWorkoutResultsGrid');
  if (!grid) return;

  let list = Array.isArray(EXERCISES_LIBRARY) ? [...EXERCISES_LIBRARY] : [];

  // Search Query
  if (customWorkoutSearchQuery && customWorkoutSearchQuery.trim()) {
    const q = customWorkoutSearchQuery.trim().toLowerCase();
    list = list.filter(ex => 
      (ex.name && ex.name.toLowerCase().includes(q)) ||
      (ex.sub && ex.sub.toLowerCase().includes(q)) ||
      (ex.category && ex.category.toLowerCase().includes(q)) ||
      (ex.type && ex.type.toLowerCase().includes(q))
    );
  }

  // Filter by Body Parts
  if (!customWorkoutFilterParts.includes('all') && customWorkoutFilterParts.length > 0) {
    list = list.filter(ex => {
      const cat = (ex.category || '').toLowerCase();
      const sub = (ex.sub || '').toLowerCase();
      return customWorkoutFilterParts.some(p => cat.includes(p.toLowerCase()) || sub.includes(p.toLowerCase()));
    });
  }

  // Filter by Workout Types
  if (!customWorkoutFilterTypes.includes('all') && customWorkoutFilterTypes.length > 0) {
    list = list.filter(ex => {
      const typeStr = (ex.type || '').toLowerCase();
      const name = (ex.name || '').toLowerCase();
      const cat = (ex.category || '').toLowerCase();
      return customWorkoutFilterTypes.some(t => {
        if (t === 'Home') return typeStr.includes('home') || typeStr.includes('dumbbell') || typeStr.includes('bodyweight') || !typeStr.includes('barbell');
        if (t === 'Gym') return typeStr.includes('gym') || typeStr.includes('barbell') || typeStr.includes('cable') || typeStr.includes('machine');
        if (t === 'HIIT') return name.includes('jump') || name.includes('burpee') || name.includes('swing') || name.includes('mountain') || name.includes('lunge') || typeStr.includes('bodyweight');
        if (t === 'Cardio') return name.includes('jump') || name.includes('cardio') || name.includes('run') || name.includes('burpee') || name.includes('skip');
        if (t === 'Stretching') return name.includes('stretch') || name.includes('mobility') || name.includes('cat-cow') || name.includes('hip') || cat.includes('core');
        return true;
      });
    });
  }

  if (!list.length) {
    grid.innerHTML = \`<div style="grid-column:1/-1;text-align:center;padding:36px;color:var(--glass-text-secondary);background:var(--glass-surface-subtle);border-radius:12px;border:1px dashed var(--glass-border);">
      <b>No exercises found matching your selected filters.</b>
      <p style="font-size:.85rem;margin-top:6px;">Try selecting "All Types" or "Full Body" to view the full exercise catalog.</p>
    </div>\`;
    return;
  }

  // Curated vs Full catalog pagination
  const defaultLimit = 6;
  const page = window._customWorkoutPage || 1;
  const displayCount = customWorkoutShowAll ? page * 24 : defaultLimit;
  const displayList = list.slice(0, displayCount);
  const hasMore = customWorkoutShowAll && (list.length > displayCount);

  const cardsHtml = displayList.map(ex => {
    const rxSets = ex.rxSetsReps || '3 sets × 10–12 reps';
    const rxRest = '60s rest';
    const cleanName = escapeHtml(ex.name);
    const safeName = cleanName.replace(/'/g, "\\\\'");
    const mediaThumb = ex.gif ? \`
      <div style="width:100%;height:130px;background:var(--ff-bg-panel, #0f172a);border-radius:10px;margin-bottom:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid var(--glass-border-subtle, rgba(255,255,255,0.06));" onclick="openExerciseDetailModal('\${safeName}')">
        <img src="\${ex.gif}" alt="\${cleanName}" style="max-height:100%;max-width:100%;object-fit:contain;" loading="lazy" onerror="this.parentElement.style.display='none'" />
      </div>
    \` : '';

    return \`
      <div class="exercise-custom-card" style="background:var(--glass-surface-subtle); border:1px solid var(--glass-border);border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(32,59,41,0.03);display:flex;flex-direction:column;justify-content:space-between;transition:transform .15s ease, border-color .15s ease;">
        <div>
          \${mediaThumb}
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <span style="font-size:.72rem;font-weight:800;color:var(--glass-text-primary);background:#eff6ff;padding:2px 8px;border-radius:99px;text-transform:uppercase;">
              \${escapeHtml(ex.category || 'Movement')} · \${escapeHtml(ex.sub || 'General')}
            </span>
            <span style="font-size:.74rem;color:var(--glass-text-secondary);font-weight:600;">\${escapeHtml(ex.type || 'Gym / Home')}</span>
          </div>
          <b style="color:#2563eb;font-size:1.02rem;display:block;line-height:1.3;margin-bottom:6px;cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')">\${cleanName}</b>
          <p style="color:var(--glass-text-secondary);font-size:.82rem;line-height:1.45;margin:0 0 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">\${escapeHtml(ex.rxWhy || ex.steps || 'Maintain proper form, brace your core, and control the eccentric movement.')}</p>
          <div style="background:var(--glass-surface-subtle); border:1px solid var(--glass-border);border-radius:8px;padding:8px 10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:.78rem;font-weight:700;color:var(--glass-text-primary);">\${escapeHtml(rxSets)}</span>
            <span style="font-size:.75rem;color:var(--glass-text-secondary);font-weight:600;">Rest: \${escapeHtml(rxRest)}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:auto;">
          <button type="button" class="solid-button small" style="flex:1;background:#2563eb;justify-content:center;font-size:.8rem;padding:7px 10px;" onclick="startCustomExerciseTimer('\${safeName}', '\${escapeHtml(rxSets)}', '\${escapeHtml(rxRest)}')">
            Start Set
          </button>
          <button type="button" class="outline-button small" style="justify-content:center;font-size:.8rem;padding:7px 10px;" onclick="addExerciseToDailyRoutine('\${safeName}', '\${escapeHtml(rxSets)}')">
            + Add
          </button>
        </div>
      </div>
    \`;
  }).join('');

  const toggleBarHtml = list.length > defaultLimit ? \`
    <div style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;background:var(--glass-surface-subtle);border:1.5px solid var(--glass-border);border-radius:12px;padding:12px 18px;margin-top:6px;flex-wrap:wrap;gap:10px;">
      <span style="font-size:.85rem;color:var(--glass-text-secondary);font-weight:600;">
        Showing <b>\${displayList.length.toLocaleString()}</b> of <b>\${list.length.toLocaleString()}</b> targeted exercises (\${customWorkoutShowAll ? 'Full Exercise Catalog' : 'Curated Session View - 6 Moves'})
      </span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        \${hasMore ? \`
          <button type="button" class="outline-button small" id="customWorkoutLoadMoreBtn" style="padding:7px 14px;font-size:.82rem;border-color:#38bdf8;color:#2563eb;font-weight:700;">
            Show More (\${(list.length - displayCount).toLocaleString()} remaining)
          </button>
        \` : ''}
        <button type="button" class="solid-button small" id="toggleCustomWorkoutExpandBtn" style="background:#2563eb;padding:7px 16px;font-size:.82rem;">
          \${customWorkoutShowAll ? 'Show Curated (6)' : \`Browse All \${list.length.toLocaleString()} Exercises\`}
        </button>
      </div>
    </div>
  \` : '';

  grid.innerHTML = cardsHtml + toggleBarHtml;

  const toggleBtn = $('#toggleCustomWorkoutExpandBtn');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      customWorkoutShowAll = !customWorkoutShowAll;
      window._customWorkoutPage = 1;
      renderCustomWorkoutExplorer();
    };
  }

  const loadMoreBtn = $('#customWorkoutLoadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
      window._customWorkoutPage = (window._customWorkoutPage || 1) + 1;
      renderCustomWorkoutExplorer();
    };
  }
}`;

if (oldExplorerRegex.test(code)) {
  code = code.replace(oldExplorerRegex, newExplorer);
  console.log('Successfully updated renderCustomWorkoutExplorer');
} else {
  console.error('Could not find old renderCustomWorkoutExplorer');
}

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
