const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

console.log('loadSample4DPhotosBtn:', (js.match(/loadSample4DPhotosBtn/g) || []).length);
console.log('btnRun4DAnalysis:', (js.match(/btnRun4DAnalysis/g) || []).length);
console.log('btnApply4DMetrics:', (js.match(/btnApply4DMetrics/g) || []).length);
