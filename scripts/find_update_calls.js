const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const check = (id) => {
  const matches = [...js.matchAll(new RegExp(id, 'g'))];
  console.log(`${id}: ${matches.length} matches`);
};

check('metricV2CalVal');
check('metricV2ProteinVal');
check('donutCenterKcal');
check('donutProteinVal');
check('dashCalculatedWaterL');
check('frontCalculatedWaterL');
check('waterDisplay');
check('waterGoalDisplay');
