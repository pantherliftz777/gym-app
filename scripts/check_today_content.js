const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const todayStart = html.indexOf('id="view-today"');
const todayEnd = html.indexOf('id="view-body-analysis"');
const todayContent = html.substring(todayStart, todayEnd);

const lines = todayContent.split('\n');
console.log('Actual Today view lines:', lines.length);

const hits = [];
lines.forEach((line, i) => {
  if (/fuel|nutrition|calorie|today's fuel/i.test(line)) {
    hits.push({ line: i, text: line.trim() });
  }
});
console.log('Hits for fuel/nutrition/calorie in actual today view:', hits);
