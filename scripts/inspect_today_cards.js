const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const todayLines = lines.slice(277, 1445);
todayLines.forEach((line, idx) => {
  if (line.includes('class="card') || line.includes('class="dash') || line.includes('Today\'s Fuel') || line.includes('Water Intake') || line.includes('Nutrition') || line.includes('calorie') || line.includes('macro') || line.includes('hero')) {
    console.log(`${idx + 278}: ${line.trim().slice(0, 100)}`);
  }
});
