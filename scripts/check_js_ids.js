const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');
const lines = js.split('\n');
const ids = ['dashCalRing', 'dashCalLeft', 'dashCalConsumed', 'dashMealList', 'goToFoodLogFromDash', 'dashAddFoodBtn', 'viewAllFoodEntriesBtn'];
ids.forEach(id => {
  lines.forEach((l, i) => {
    if (l.includes(id)) {
      console.log(`${id} at line ${i+1}: ${l.trim().slice(0, 100)}`);
    }
  });
});
