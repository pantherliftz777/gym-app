const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const check = (id) => {
  const count = (js.match(new RegExp(id, 'g')) || []).length;
  console.log(`${id}: found ${count} times in fitfuel.js`);
};

check('dashUpdateMetricsBtn');
check('dashViewBodyAnalysisBtn');
check('viewBodyDetailsBtn');
check('dashQuickCheckInBtn');
check('triggerAiVerifyBtn');
check('restartStreakBtn');
check('dashViewAllActivityBtn');
check('dashRefreshWorkoutBtn');
check('dashStartWorkoutBtn');
check('bodyCompScanBadge');
