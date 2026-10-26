const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
console.log('Does bodyAnalysisModal exist?', html.includes('id="bodyAnalysisModal"'));
console.log('Does bodyStatsModal exist?', html.includes('id="bodyStatsModal"'));
