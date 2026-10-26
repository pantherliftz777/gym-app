const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

function findSnippet(phrase) {
  const idx = js.indexOf(phrase);
  if (idx === -1) {
    console.log(`Phrase "${phrase}" NOT found`);
  } else {
    console.log(`Found "${phrase}" at ${idx}:\n` + js.slice(idx, idx + 300) + '\n---');
  }
}

findSnippet('function toggleDashboardSidebarCollapse()');
findSnippet('goToFoodLogFromDash');
findSnippet('tabDash.onclick');
findSnippet('runBtn.onclick');
findSnippet('executeBodyTransformationAnalysis()');
