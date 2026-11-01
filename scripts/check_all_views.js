const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const views = [
  'view-today',
  'view-workouts',
  'view-challenge',
  'view-exercise-library',
  'view-starting-load',
  'view-food-log',
  'view-my-foods',
  'view-ai-coach',
  'view-tracking',
  'view-activity',
  'view-posture',
  'view-body-analysis',
  'view-profile',
  'view-customization',
  'view-admin'
];

views.forEach(v => {
  const idx = html.indexOf('id="' + v + '"');
  if (idx === -1) {
    console.log(v + ': NOT FOUND');
  } else {
    // Check if it already has hub-subnav-bar
    const endIdx = html.indexOf('</section>', idx);
    const sec = html.substring(idx, endIdx);
    const hasSubnav = sec.includes('hub-subnav-bar');
    console.log(v + ': found (has hub-subnav-bar: ' + hasSubnav + ')');
  }
});
