const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const tIdx = html.indexOf('id="view-today"');
const endTodayIdx = html.indexOf('</section>', tIdx);
const todayHtml = html.slice(tIdx, endTodayIdx);

console.log('Today section length:', todayHtml.length);
console.log('Contains Today\'s Fuel heading/text?', todayHtml.toLowerCase().includes("today's fuel"));
console.log('Contains Water Intake Card?', todayHtml.includes('waterIntakeCard') || todayHtml.includes('Water Intake'));
console.log('Contains Adjust button?', todayHtml.includes('adjustWaterBtn') || todayHtml.includes('Adjust'));
