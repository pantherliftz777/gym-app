const fs = require('fs');

let js = fs.readFileSync('public/fitfuel.js', 'utf8');

// 1. Add updates for metricV2WaterVal and syHeroWaterCurrent in renderDashboard
const target = `  if ($('#metricV2ProteinPct')) $('#metricV2ProteinPct').textContent = displayPPct + '%';`;
const addition = `  if ($('#metricV2ProteinPct')) $('#metricV2ProteinPct').textContent = displayPPct + '%';

  // Image 3 Metric 1 & 2: Hydration & Active Burn
  const curWaterL = (waterMl / 1000).toFixed(1);
  const curWaterGoal = Number(waterGoalL) || 2.8;
  const curWaterPct = Math.min(100, Math.round((waterMl / (curWaterGoal * 1000)) * 100));
  const curWaterRemL = Math.max(0, (curWaterGoal - Number(curWaterL))).toFixed(1);
  if ($('#metricV2WaterVal')) $('#metricV2WaterVal').textContent = curWaterL;
  if ($('#metricV2WaterGoalVal')) $('#metricV2WaterGoalVal').textContent = curWaterGoal.toFixed(1);
  if ($('#metricV2WaterPct')) $('#metricV2WaterPct').textContent = curWaterPct + '%';
  if ($('#metricV2WaterSub')) $('#metricV2WaterSub').textContent = \`\${curWaterRemL} L remaining · \${curWaterPct >= 80 ? 'Optimal' : 'Active tracking'}\`;
  if ($('#metricV2WaterCircle')) $('#metricV2WaterCircle').setAttribute('stroke-dasharray', \`\${curWaterPct}, 100\`);

  // Active Energy Burn (calculated from completed workouts and activity)
  const energyBurned = (workoutsDone && workoutsDone.length) ? (workoutsDone.length * 280 + 140) : 420;
  if ($('#metricV2EnergyVal')) $('#metricV2EnergyVal').textContent = energyBurned;

  // Sy-Athlete Hero Hydration sync
  if ($('#syHeroWaterCurrent')) $('#syHeroWaterCurrent').textContent = curWaterL;
  if ($('#syHeroWaterTarget')) $('#syHeroWaterTarget').textContent = curWaterGoal.toFixed(1);
  if ($('#syHeroWaterPct')) $('#syHeroWaterPct').textContent = curWaterPct + '%';`;

if (js.includes(target)) {
  js = js.replace(target, addition);
  console.log('1. Added water metric updates in renderDashboard');
} else {
  console.log('Error finding target for metric updates');
}

// 2. Wire up quickAddWater250Btn and quickAddWater500Btn and scrollToWater handlers
const targetListeners = `if ($('#adjustWaterBtn')) $('#adjustWaterBtn').onclick = () => openModal('#weatherTempModal');`;
const additionalListeners = `if ($('#adjustWaterBtn')) $('#adjustWaterBtn').onclick = () => openModal('#weatherTempModal');

// Quick Add Water Buttons in Middle Hydration Panel
if ($('#quickAddWater250Btn')) {
  $('#quickAddWater250Btn').onclick = () => {
    water.ml = (water.date === today() ? (water.ml || 0) : 0) + 250;
    water.date = today();
    store.set('water', water);
    recordDailyActivity('water');
    renderDashboard();
    if (soundFX && soundFX.pop) soundFX.pop();
    if (typeof toast === 'function') toast(\`Added 250 ml water (\${(water.ml / 1000).toFixed(1)} L total)\`);
  };
}
if ($('#quickAddWater500Btn')) {
  $('#quickAddWater500Btn').onclick = () => {
    water.ml = (water.date === today() ? (water.ml || 0) : 0) + 500;
    water.date = today();
    store.set('water', water);
    recordDailyActivity('water');
    renderDashboard();
    if (soundFX && soundFX.celebrate) soundFX.celebrate();
    if (typeof toast === 'function') toast(\`Added 500 ml shaker (\${(water.ml / 1000).toFixed(1)} L total)\`);
  };
}

const scrollToTodayWater = () => {
  const panel = $('#todayWaterIntakePanel') || $('#frontWaterAdvisoryCard');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
if ($('#metricCardWaterTrigger')) $('#metricCardWaterTrigger').onclick = scrollToTodayWater;
if ($('#metricCardEnergyTrigger')) $('#metricCardEnergyTrigger').onclick = () => switchView('activity');
if ($('#syFloatWaterTrigger')) $('#syFloatWaterTrigger').onclick = scrollToTodayWater;
if ($('#syFloatStreakTrigger')) $('#syFloatStreakTrigger').onclick = () => switchView('tracking');
if ($('#syQuickWaterBtn')) $('#syQuickWaterBtn').onclick = scrollToTodayWater;
if ($('#syBottomCardWater')) $('#syBottomCardWater').onclick = scrollToTodayWater;`;

if (js.includes(targetListeners)) {
  js = js.replace(targetListeners, additionalListeners);
  console.log('2. Added quick add water and scrollToWater listeners');
} else {
  console.log('Error finding targetListeners');
}

// 3. Update event delegations
js = js.replace(
  `if (e.target.closest('#syFloatCaloriesTrigger, .sy-card-calories')) {`,
  `if (e.target.closest('#syFloatWaterTrigger, .sy-card-water')) {\n        e.preventDefault();\n        if (soundFX && soundFX.pop) soundFX.pop();\n        const p = $('#todayWaterIntakePanel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' });\n        return;\n      }\n      if (e.target.closest('#syFloatStreakTrigger, .sy-card-streak')) {\n        e.preventDefault();\n        if (soundFX && soundFX.pop) soundFX.pop();\n        switchView('tracking');\n        return;\n      }\n      if (e.target.closest('#syFloatCaloriesTrigger, .sy-card-calories')) {`
);

js = js.replace(
  `if (e.target.closest('#syQuickFoodBtn')) {`,
  `if (e.target.closest('#syQuickWaterBtn')) {\n        e.preventDefault();\n        if (soundFX && soundFX.pop) soundFX.pop();\n        const p = $('#todayWaterIntakePanel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' });\n        return;\n      }\n      if (e.target.closest('#syQuickFoodBtn')) {`
);

js = js.replace(
  `if (e.target.closest('#syBottomCardNutrition, .sy-bcard-action-btn.mint')) {`,
  `if (e.target.closest('#syBottomCardWater, .sy-bcard-action-btn.cyan')) {\n        e.preventDefault();\n        if (soundFX && soundFX.pop) soundFX.pop();\n        const p = $('#todayWaterIntakePanel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' });\n        return;\n      }\n      if (e.target.closest('#syBottomCardNutrition, .sy-bcard-action-btn.mint')) {`
);

js = js.replace(
  `if (e.target.closest('#metricCardCalTrigger')) {`,
  `if (e.target.closest('#metricCardWaterTrigger')) {\n        e.preventDefault();\n        if (soundFX && soundFX.pop) soundFX.pop();\n        const p = $('#todayWaterIntakePanel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' });\n        return;\n      }\n      if (e.target.closest('#metricCardEnergyTrigger')) {\n        e.preventDefault();\n        if (soundFX && soundFX.pop) soundFX.pop();\n        switchView('activity');\n        return;\n      }\n      if (e.target.closest('#metricCardCalTrigger')) {`
);

fs.writeFileSync('public/fitfuel.js', js, 'utf8');
console.log('Saved fitfuel.js successfully!');
