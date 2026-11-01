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
  const sIdx = html.indexOf(tag);
  const eIdx = html.indexOf('</section>', sIdx);
  const sec = html.substring(sIdx, eIdx);
  const count = (sec.match(/<nav class="hub-subnav-bar"/g) || []).length;
  const buttons = [];
  const btnRegex = /<button[^>]+data-hubview="([^"]+)"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/g;
  let m;
  while ((m = btnRegex.exec(sec)) !== null) {
    buttons.push(`${m[2].trim()} (${m[1]})`);
  }
  console.log(`${v}: ${count} subnav bar(s) -> [ ${buttons.join(', ')} ]`);
});
