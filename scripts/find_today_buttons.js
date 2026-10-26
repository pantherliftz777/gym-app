const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const todayStart = html.indexOf('id="view-today"');
const todayEnd = html.indexOf('id="view-body-analysis"');
const todayContent = html.substring(todayStart, todayEnd);

const lines = todayContent.split('\n');
lines.forEach((l, i) => {
  if (/body scan|update details|view full analysis|4d body scan/i.test(l)) {
    console.log(i + ': ' + l.trim());
  }
});
