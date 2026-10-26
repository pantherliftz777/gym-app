const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const ids = [
  'syFloatCaloriesTrigger',
  'syBottomCardNutrition',
  'metricCardCalTrigger',
  'metricCardProteinTrigger',
  'syQuickFoodBtn'
];

ids.forEach(id => {
  const count = (js.match(new RegExp(id, 'g')) || []).length;
  console.log(`${id}: ${count} matches in fitfuel.js`);
});
