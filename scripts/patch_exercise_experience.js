const fs = require('fs');

let code = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. Update openExerciseDetailModal visualContainer logic
const oldVisualRegex = /\/\/ Render Human-Body Exercise Animation[\s\S]*?const visualContainer = \$\('#exModalVisualContainer'\);[\s\S]*?document\.getElementById\('exAnimContainer'\)\.innerHTML = '<div style="padding:20px;color:#64748b;text-align:center;">Animation loading\.\.\.<\/div>';\s*\}\s*\}/;

const newVisual = `// Render High-Res Demonstration Media (animated GIF if available, else SVG fallback)
  const visualContainer = $('#exModalVisualContainer');
  if (visualContainer) {
    if (ex.gif) {
      visualContainer.innerHTML = \`
        <div style="width:100%;height:320px;display:flex;align-items:center;justify-content:center;background:var(--ff-bg-panel, #0f172a);border-radius:12px;overflow:hidden;border:1px solid var(--glass-border-subtle, rgba(255,255,255,0.08));box-shadow:inset 0 0 20px rgba(0,0,0,0.25);position:relative;">
          <img src="\${ex.gif}" alt="\${escapeHtml(ex.name)}" style="max-height:100%;max-width:100%;object-fit:contain;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
          <div style="display:none;padding:24px;color:var(--glass-text-secondary);text-align:center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px;opacity:0.6;"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/></svg>
            <div>\${escapeHtml(ex.name)}</div>
          </div>
        </div>
      \`;
    } else {
      visualContainer.innerHTML = '<div id="exAnimContainer" style="width:100%;height:300px;"></div>';
      const slug = window.FF_EX_ANIM ? window.FF_EX_ANIM.slugForExercise(ex) : null;
      if (window.FF_EX_ANIM) {
        window.FF_EX_ANIM.init('exAnimContainer', slug, ex.name);
      } else {
        document.getElementById('exAnimContainer').innerHTML = '<div style="padding:20px;color:#64748b;text-align:center;">Animation loading...</div>';
      }
    }
  }`;

if (oldVisualRegex.test(code)) {
  code = code.replace(oldVisualRegex, newVisual);
  console.log('Successfully updated openExerciseDetailModal visualContainer');
} else {
  console.error('Could not find old openExerciseDetailModal visualContainer');
}

// 2. Update renderExerciseLibrary and helper functions
const oldLibRegex = /\/\* ---------- Exercise Library View Rendering ---------- \*\/[\s\S]*?if \(\$\('#exerciseSearchInput'\)\) \{\s*\$\('#exerciseSearchInput'\)\.oninput = \(\) => renderExerciseLibrary\(\);\s*\}/;

const newLib = `/* ---------- Exercise Library View Rendering ---------- */
// Enhanced for 1,318+ exercises with live count badges, equipment filters & animated demos

function renderExerciseLibrary() {
  const totalLibraryCount = Array.isArray(EXERCISES_LIBRARY) ? EXERCISES_LIBRARY.length : 0;

  // 1. Calculate live counts for all categories
  const catCounts = { All: totalLibraryCount };
  if (Array.isArray(EXERCISES_LIBRARY)) {
    for (const ex of EXERCISES_LIBRARY) {
      if (ex.category) catCounts[ex.category] = (catCounts[ex.category] || 0) + 1;
    }
  }

  // 2. Render Primary Category Tabs (with counts)
  const tabs = $('#muscleTabs');
  if (tabs) {
    const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];
    tabs.innerHTML = categories.map(cat => {
      const count = catCounts[cat] || 0;
      const label = cat === 'All' ? 'All Moves' : cat;
      const isActive = (cat === selectedExerciseCategory);
      return \`<button type="button" class="\${isActive ? 'active' : ''}" onclick="selectExerciseCategory('\${cat}')">\${label} <span class="tab-count">\${count.toLocaleString()}</span></button>\`;
    }).join('');
  }

  // 3. Render Equipment Filter Bar
  const equipContainer = $('#libEquipmentFilters');
  if (equipContainer) {
    const equipList = [
      { id: 'All', label: 'All Equipment' },
      { id: 'Bodyweight', label: 'Bodyweight' },
      { id: 'Dumbbell', label: 'Dumbbell' },
      { id: 'Barbell', label: 'Barbell' },
      { id: 'Cable', label: 'Cable' },
      { id: 'Machine', label: 'Machine' },
      { id: 'Kettlebell', label: 'Kettlebell' },
      { id: 'Bands', label: 'Bands' },
      { id: 'Balls & Mobility', label: 'Balls & Mobility' }
    ];
    const currentEq = window.selectedEquipmentFilter || 'All';
    equipContainer.innerHTML = equipList.map(eq => \`
      <button type="button" class="equip-btn \${eq.id === currentEq ? 'active' : ''}" onclick="selectEquipmentFilter('\${eq.id}')">
        \${eq.label}
      </button>
    \`).join('');
  }

  // 4. Render Sub-Muscle Tabs
  const subTags = $('#muscleSubTags');
  if (subTags) {
    let subOptions = [];
    if (selectedExerciseCategory === 'All') {
      subOptions = [
        'All Movements', 'Full Body', 'Upper Body', 'Lower Body', 'Core & Cardio'
      ];
    } else {
      const definedSubs = MUSCLE_GROUPS[selectedExerciseCategory] || ['All ' + selectedExerciseCategory];
      subOptions = [...definedSubs];
    }

    subTags.innerHTML = subOptions.map(sub => {
      const isSubActive = (sub === selectedSubMuscle || (!selectedSubMuscle && sub.startsWith('All ')));
      return \`<button type="button" class="chosen \${isSubActive ? 'active' : ''}" onclick="selectSubMuscle('\${sub.replace(/'/g, "\\\\'")}')">\${sub}</button>\`;
    }).join('');
  }

  // 5. Filter Exercises across Category, Sub-muscle, Equipment, and Search Input
  const q = ($('#exerciseSearchInput') ? $('#exerciseSearchInput').value.toLowerCase().trim() : '');
  const selectedEq = window.selectedEquipmentFilter || 'All';

  const filtered = (Array.isArray(EXERCISES_LIBRARY) ? EXERCISES_LIBRARY : []).filter(e => {
    // Search query matching (all words match)
    if (q) {
      const idx = e._searchIdx || \`\${e.name} \${e.sub || ''} \${e.type || ''} \${e.category || ''} \${e.equipment || ''}\`.toLowerCase();
      const tokens = q.split(/\\s+/);
      const matchesAll = tokens.every(tok => idx.includes(tok) || e.name.toLowerCase().includes(tok));
      if (!matchesAll) return false;
    }

    // Category Filter
    if (selectedExerciseCategory !== 'All') {
      if (e.category !== selectedExerciseCategory) return false;

      // Sub-muscle Filter within category
      if (selectedSubMuscle && !selectedSubMuscle.startsWith('All ')) {
        const subClean = selectedSubMuscle.toLowerCase().trim();
        const eSub = (e.sub || '').toLowerCase();
        const eMuscle = (e.muscle || '').toLowerCase();
        if (!eSub.includes(subClean) && !eMuscle.includes(subClean)) {
          // Specific mappings for curated sub-tags
          if (subClean.includes('upper chest') && !e.name.toLowerCase().includes('incline')) return false;
          if (subClean.includes('lower chest') && !e.name.toLowerCase().includes('decline') && !e.name.toLowerCase().includes('dip')) return false;
          if (subClean.includes('lats') && !eSub.includes('lats') && !e.name.toLowerCase().includes('pull') && !e.name.toLowerCase().includes('lat')) return false;
        }
      }
    } else {
      // Sub-muscle filter in 'All' view
      if (selectedSubMuscle === 'Upper Body') {
        if (!['Chest', 'Back', 'Shoulders', 'Arms'].includes(e.category)) return false;
      } else if (selectedSubMuscle === 'Lower Body') {
        if (e.category !== 'Legs') return false;
      } else if (selectedSubMuscle === 'Core & Cardio') {
        if (!['Core', 'Cardio'].includes(e.category)) return false;
      }
    }

    // Equipment Filter
    if (selectedEq !== 'All') {
      const eq = (e.rawEquipment || e.equipment || e.type || '').toLowerCase();
      if (selectedEq === 'Bodyweight') {
        if (!eq.includes('body weight') && !eq.includes('bodyweight')) return false;
      } else if (selectedEq === 'Dumbbell') {
        if (!eq.includes('dumbbell')) return false;
      } else if (selectedEq === 'Barbell') {
        if (!eq.includes('barbell') && !eq.includes('trap bar') && !eq.includes('ez bar')) return false;
      } else if (selectedEq === 'Cable') {
        if (!eq.includes('cable') && !eq.includes('rope')) return false;
      } else if (selectedEq === 'Machine') {
        if (!eq.includes('machine') && !eq.includes('assisted') && !eq.includes('leverage')) return false;
      } else if (selectedEq === 'Kettlebell') {
        if (!eq.includes('kettlebell')) return false;
      } else if (selectedEq === 'Bands') {
        if (!eq.includes('band')) return false;
      } else if (selectedEq === 'Balls & Mobility') {
        if (!eq.includes('ball') && !eq.includes('roller') && !eq.includes('mobility')) return false;
      }
    }

    return true;
  });

  // 6. Update Result Counters & Header
  if ($('#libFilterHeader')) {
    const catLabel = selectedExerciseCategory === 'All' ? 'FULL BODY' : selectedExerciseCategory.toUpperCase();
    const subLabel = selectedSubMuscle ? selectedSubMuscle.toUpperCase() : 'ALL MOVEMENTS';
    const eqLabel = selectedEq !== 'All' ? \` · \${selectedEq.toUpperCase()}\` : '';
    $('#libFilterHeader').textContent = \`\${catLabel} · \${subLabel}\${eqLabel}\`;
  }
  if ($('#libResultCount')) {
    const eqSuffix = selectedEq !== 'All' ? \` with \${selectedEq}\` : '';
    $('#libResultCount').textContent = q 
      ? \`\${filtered.length.toLocaleString()} matching moves\${eqSuffix}\`
      : \`\${filtered.length.toLocaleString()} exercises available\${eqSuffix}\`;
  }

  // 7. Render Paginated Exercise Cards (30 per page)
  const cardsContainer = $('#exerciseCardsContainer');
  if (cardsContainer) {
    const LIBRARY_PAGE_SIZE = 30;
    if (!window._libPage) window._libPage = 0;
    if (q) window._libPage = 0; // reset on search

    const pageEnd = (window._libPage + 1) * LIBRARY_PAGE_SIZE;
    const paginated = filtered.slice(0, pageEnd);
    const hasMore = filtered.length > pageEnd;

    if (!filtered.length) {
      cardsContainer.innerHTML = \`
        <div style="grid-column:1/-1;text-align:center;padding:48px 24px;background:var(--glass-surface-subtle);border-radius:16px;border:1.5px dashed var(--glass-border);">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:12px;opacity:0.4;"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <h3 style="margin:0 0 8px;font-size:1.15rem;color:var(--glass-text-primary);">No exercises found</h3>
          <p style="margin:0;font-size:.88rem;color:var(--glass-text-secondary);">Try adjusting your search query, muscle category, or equipment filter.</p>
        </div>
      \`;
    } else {
      cardsContainer.innerHTML = paginated.map(ex => {
        const safeName = (ex.name || '').replace(/'/g, "\\\\'");
        const cleanName = escapeHtml(ex.name || '');
        const safeSub = (ex.sub || ex.category || '').replace(/'/g, "\\\\'");
        const mediaTag = ex.gif ? \`
          <div class="exercise-card-media" onclick="openExerciseDetailModal('\${safeName}')" title="Click to view live movement demo">
            <img src="\${ex.gif}" alt="\${cleanName}" loading="lazy" onerror="this.parentElement.style.display='none';" />
            <span class="media-badge">\${escapeHtml(ex.level || 'Intermediate')}</span>
          </div>
        \` : '';

        return \`
          <article class="panel exercise-card" style="display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              \${mediaTag}
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:6px;">
                <span class="exercise-type">\${escapeHtml(ex.type || 'EXERCISE')}</span>
                <span class="exercise-sub-tag">\${escapeHtml(ex.sub || ex.category || 'General')}</span>
              </div>
              <h4 class="exercise-card-heading" onclick="openExerciseDetailModal('\${safeName}')" title="Click to view visual guide and form cues">
                \${cleanName}
              </h4>
              
              <!-- Scientific Prescription Box -->
              <div class="exercise-prescription-box" style="cursor:pointer;" onclick="openExerciseDetailModal('\${safeName}')" title="Click for visual breakdown">
                <div class="rx-header">
                  <span class="rx-sets-reps">\${escapeHtml(ex.rxSetsReps || '3 sets × 8–12 reps · 60s rest')}</span>
                  <span class="rx-tempo">\${escapeHtml(ex.rxTempo || 'Tempo: 2-0-1')}</span>
                </div>
                <p class="rx-why"><b>Why this works:</b> \${escapeHtml(ex.rxWhy || ex.benefit || 'Develops targeted hypertrophy and biomechanical strength.')}</p>
              </div>

              <p class="exercise-benefit" style="margin-top:8px;font-size:.84rem;color:var(--glass-text-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                \${escapeHtml(ex.steps || ex.benefit || '')}
              </p>
            </div>

            <div style="margin-top:14px;display:flex;gap:8px;">
              <button type="button" class="outline-button small" style="flex:1;font-size:.8rem;padding:7px;border-color:#38bdf8;" onclick="openExerciseDetailModal('\${safeName}')">
                Visual Guide
              </button>
              <button type="button" class="solid-button small" style="flex:1;font-size:.8rem;padding:7px;background:#2563eb;" onclick="askAiAboutExercise('\${safeName}', '\${safeSub}')">
                AI Coach
              </button>
              <button type="button" class="outline-button small" style="font-size:.8rem;padding:7px 10px;border-color:#10b981;color:#10b981;" onclick="logExerciseCompleted('\${safeName}')" title="Mark exercise completed today">
                + Done
              </button>
            </div>
          </article>
        \`;
      }).join('');
    }

    // 8. Show More Pagination Button
    const existingShowMore = cardsContainer.parentElement ? cardsContainer.parentElement.querySelector('#libShowMoreBtn') : null;
    if (existingShowMore) existingShowMore.remove();
    if (hasMore) {
      const btn = document.createElement('button');
      btn.id = 'libShowMoreBtn';
      btn.type = 'button';
      btn.className = 'outline-button';
      btn.style.cssText = 'width:100%;margin-top:18px;padding:14px;font-size:.95rem;font-weight:700;border-color:#38bdf8;color:#2563eb;background:var(--glass-surface-subtle);box-shadow:0 2px 10px rgba(0,0,0,0.04);';
      btn.textContent = \`Show more exercises (\${(filtered.length - pageEnd).toLocaleString()} remaining)\`;
      btn.onclick = () => { 
        window._libPage = (window._libPage || 0) + 1; 
        renderExerciseLibrary(); 
      };
      if (cardsContainer.parentElement) cardsContainer.parentElement.appendChild(btn);
    }
  }
}

window.selectExerciseCategory = function(cat) {
  selectedExerciseCategory = cat;
  selectedSubMuscle = cat === 'All' ? 'All Movements' : 'All ' + cat;
  window._libPage = 0;
  if ($('#exerciseSearchInput')) $('#exerciseSearchInput').value = '';
  renderExerciseLibrary();
};

window.selectEquipmentFilter = function(eq) {
  window.selectedEquipmentFilter = eq;
  window._libPage = 0;
  renderExerciseLibrary();
};

window.selectSubMuscle = function(sub) {
  selectedSubMuscle = sub;
  window._libPage = 0;
  renderExerciseLibrary();
};

window.logExerciseCompleted = function(name) {
  workoutsDone.push({ name, date: today(), at: Date.now() });
  store.set('workoutsDone', workoutsDone);
  recordDailyActivity('workout');
  renderDashboard();
  toast(\`Great job! Completed "\${name}"\`);
};

window.askAiAboutExercise = function(name, sub) {
  openAiChat(\`What is the optimal biomechanical execution, sets, reps, and progression strategy for "\${name}" targeting \${sub}?\`);
};

if ($('#exerciseSearchInput')) {
  $('#exerciseSearchInput').oninput = () => renderExerciseLibrary();
}`;

if (oldLibRegex.test(code)) {
  code = code.replace(oldLibRegex, newLib);
  console.log('Successfully updated renderExerciseLibrary');
} else {
  console.error('Could not find old renderExerciseLibrary');
}

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
