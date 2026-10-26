const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const target = `          <p style="margin-top:14px;font-size:.78rem;color:var(--ff-text-muted);display:flex;align-items:center;gap:6px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Ramp protocol: empty Olympic bar (20 kg) &rarr; 50–60% ceiling warmup &rarr; calibrated work sets at RPE 6–7.
          </p>
        </div>
      </section>`;

const targetNormalized = html.includes(target) ? target :
  (html.includes(target.replace(/\n/g, '\r\n')) ? target.replace(/\n/g, '\r\n') : null);

console.log('Found target?', !!targetNormalized);

const additions = `          <p style="margin-top:14px;font-size:.78rem;color:var(--ff-text-muted);display:flex;align-items:center;gap:6px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Ramp protocol: empty Olympic bar (20 kg) &rarr; 50–60% ceiling warmup &rarr; calibrated work sets at RPE 6–7.
          </p>
        </div>

        <!-- 1,318+ EXERCISE PRECISION CALCULATOR -->
        <div class="panel smart-start-section-card" id="slAnyExercisePanel" style="margin-bottom:28px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
            <div>
              <span class="section-kicker">INTERACTIVE STARTING WEIGHT CALCULATOR</span>
              <h3 style="font-size:1.25rem;color:var(--glass-text-primary);margin:4px 0 0;">Calculate Starting Load for Any Movement</h3>
              <p style="color:var(--glass-text-secondary);font-size:.86rem;margin:4px 0 0;">Search through all 1,318+ exercises to get your personalized working weight and warmup sequence.</p>
            </div>
            <div style="min-width:260px;flex:1;max-width:380px;">
              <input type="text" id="slExerciseSearchInput" placeholder="Search any exercise (e.g. Incline Bench, Leg Press)..." style="width:100%;padding:10px 16px;border:1.5px solid var(--ff-glass-border-subtle);border-radius:12px;outline:none;font-size:.9rem;background:var(--ff-surface);" />
            </div>
          </div>
          <div id="slExerciseCalcResult">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- SMART START FOUNDATION ROUTINES FROM 1,318 CATALOG -->
        <div class="panel smart-start-section-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
            <div>
              <span class="section-kicker">CURATED LAUNCHPAD ROUTINES</span>
              <h3 style="font-size:1.25rem;color:var(--glass-text-primary);margin:4px 0 0;">Smart Start Baseline Programs</h3>
              <p style="color:var(--glass-text-secondary);font-size:.86rem;margin:4px 0 0;">Ready-to-train foundational routines calibrated with your precision working weights.</p>
            </div>
          </div>
          <div class="smart-start-routines-grid" id="slStarterRoutinesGrid">
            <!-- Populated dynamically with routines from EXERCISES_LIBRARY -->
          </div>
        </div>
      </section>`;

if (targetNormalized) {
  html = html.replace(targetNormalized, additions);
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('Successfully updated #view-starting-load in index.html!');
} else {
  console.error('Target not found in public/index.html');
}
