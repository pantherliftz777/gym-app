const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const targetViews = [
  'view-workouts',
  'view-challenge',
  'view-exercise-library',
  'view-starting-load',
  'view-ai-coach',
  'view-tracking',
  'view-activity',
  'view-posture',
  'view-body-analysis'
];

targetViews.forEach(v => {
  const tag = '<section class="view" id="' + v + '">';
  const idx = html.indexOf(tag);
  if (idx === -1) {
    console.log('NOT FOUND:', v);
  } else {
    // Find next view section or main closing
    const nextViewIdx = html.indexOf('<section class="view"', idx + 1);
    const endSecIdx = html.indexOf('</section>', idx);
    console.log(v + ': start=' + idx + ', nextView=' + nextViewIdx + ', nextEndSec=' + endSecIdx);
  }
});
