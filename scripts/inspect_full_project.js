const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== FITFUEL FULL PROJECT COMPREHENSIVE ANALYSIS ===\n');

// 1. Git Contributions Breakdown
console.log('--- 1. GIT CONTRIBUTORS & RECENT COMMITS ---');
try {
  const shortlog = execSync('git shortlog -sn --all', { encoding: 'utf8' });
  console.log('Contributors:\n' + shortlog);
  
  const recentCommits = execSync('git log -n 10 --format="%h | %an | %ad | %s" --date=short', { encoding: 'utf8' });
  console.log('Recent 10 Commits:\n' + recentCommits);
} catch (e) {
  console.error('Git log error:', e.message);
}

// 2. Server Architecture & API Endpoints
console.log('\n--- 2. SERVER ARCHITECTURE (server.js) ---');
try {
  const serverCode = fs.readFileSync('server.js', 'utf8');
  const rIdx = serverCode.indexOf('const routes = {');
  if (rIdx !== -1) {
    const endIdx = serverCode.indexOf('};\n', rIdx);
    const snippet = serverCode.substring(rIdx, endIdx !== -1 ? endIdx : rIdx + 4000);
    const routeKeys = [];
    const rx = /'([A-Z]+ \/[^']+)'|"([A-Z]+ \/[^"]+)"/g;
    let m;
    while ((m = rx.exec(snippet)) !== null) {
      routeKeys.push(m[1] || m[2]);
    }
    console.log(`Discovered ${routeKeys.length} API Routes in server.js:`);
    routeKeys.forEach(k => console.log('  • ' + k));
  }
} catch (e) {
  console.error('Server scan error:', e.message);
}

// 3. Frontend Views & Navigation Structure
console.log('\n--- 3. FRONTEND ARCHITECTURE (public/index.html & public/fitfuel.js) ---');
try {
  const html = fs.readFileSync('public/index.html', 'utf8');
  const viewRegex = /id="(view-[a-z0-9\-]+)"/g;
  const views = [];
  let vm;
  while ((vm = viewRegex.exec(html)) !== null) {
    views.push(vm[1]);
  }
  console.log(`Discovered ${views.length} Screen Views in index.html:`);
  views.forEach(v => console.log('  • ' + v));

  // Check navigation tabs in sidebar
  console.log('\nNavigation Sections in Sidebar:');
  const navMatches = html.match(/class="[^"]*nav-item[^"]*"[^>]*data-view="([^"]+)"/g) || [];
  const navViews = navMatches.map(m => {
    const val = m.match(/data-view="([^"]+)"/);
    return val ? val[1] : '';
  });
  console.log('  Sidebar Nav Targets:', navViews);

  // Check Modals
  const modalMatches = html.match(/id="([a-zA-Z0-9]+Modal)"/g) || [];
  console.log(`\nDiscovered ${modalMatches.length} Dialog Modals in index.html:`);
  modalMatches.forEach(m => console.log('  • ' + m.replace('id="', '').replace('"', '')));

} catch (e) {
  console.error('Frontend scan error:', e.message);
}

// 4. Exercise Dataset & Media Assets
console.log('\n--- 4. DATASETS & MEDIA ASSETS ---');
try {
  const exercises = JSON.parse(fs.readFileSync('public/data/exercises.json', 'utf8'));
  console.log(`Exercise Database: ${exercises.length} total exercises`);
  const equipCount = new Set(exercises.map(e => e.equipment)).size;
  const muscles = Array.from(new Set(exercises.map(e => e.muscle)));
  console.log(`  - Unique equipment types: ${equipCount}`);
  console.log(`  - Muscle groups tracked: ${muscles.length} (${muscles.slice(0, 8).join(', ')}...)`);
  
  const publicFiles = fs.readdirSync('public');
  console.log(`\nPublic root assets (${publicFiles.length} files/dirs):`);
  console.log('  ' + publicFiles.join(', '));
  
  if (fs.existsSync('public/modules')) {
    const modules = fs.readdirSync('public/modules');
    console.log(`PWA / Web Modules (${modules.length}):`, modules.join(', '));
  }
} catch (e) {
  console.error('Dataset scan error:', e.message);
}
