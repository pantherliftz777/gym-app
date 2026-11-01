const fs = require('fs');
const path = require('path');
const engine = require('../public/modules/exercise-equipment-engine');

const exercises = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'exercises.json'), 'utf8'));

console.log('--- RUNNING 15-SCENARIO WORKOUT FILTER TEST SUITE ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// Scenario 1: Home + Bodyweight Only + Strength Training + Chest
console.log('\nScenario 1: Home + Bodyweight Only + Strength Training + Chest');
const s1 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['strength']),
  selectedEquipment: new Set(['Bodyweight']),
  muscleGroup: 'Chest'
}));
assert(s1.length > 0, `Found ${s1.length} bodyweight chest exercises`);
assert(s1.every(e => {
  const meta = engine.resolveExerciseMetadata(e);
  return meta.canonicalEquipment.length === 1 && meta.canonicalEquipment[0] === 'Bodyweight';
}), 'Zero machine, barbell, or dumbbell exercises returned');
assert(!s1.some(e => e.name.toLowerCase().includes('barbell') || e.name.toLowerCase().includes('dumbbell') || e.name.toLowerCase().includes('machine')), 'No barbell/dumbbell/machine in names');

// Scenario 2: Home + Dumbbells + Strength Training + Shoulders
console.log('\nScenario 2: Home + Dumbbells + Strength Training + Shoulders');
const s2 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['strength']),
  selectedEquipment: new Set(['Dumbbells']),
  muscleGroup: 'Shoulders'
}));
assert(s2.length > 0, `Found ${s2.length} shoulder dumbbell exercises`);
assert(s2.every(e => {
  const meta = engine.resolveExerciseMetadata(e);
  return meta.canonicalEquipment.every(eq => eq === 'Dumbbells');
}), 'All require only Dumbbells');

// Scenario 3: Home + Resistance Bands + Back
console.log('\nScenario 3: Home + Resistance Bands + Back');
const s3 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['strength']),
  selectedEquipment: new Set(['Resistance Bands']),
  muscleGroup: 'Back'
}));
assert(s3.length > 0, `Found ${s3.length} band back exercises`);

// Scenario 4: Gym + Weight Machines + Legs
console.log('\nScenario 4: Gym + Weight Machines + Legs');
const s4 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'gym',
  workoutTypes: new Set(['strength']),
  selectedEquipment: new Set(['Weight Machines']),
  muscleGroup: 'Legs'
}));
assert(s4.length > 0, `Found ${s4.length} machine leg exercises`);

// Scenario 5: Gym + Dumbbells + Arms
console.log('\nScenario 5: Gym + Dumbbells + Arms (Biceps)');
const s5 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'gym',
  workoutTypes: new Set(['strength']),
  selectedEquipment: new Set(['Dumbbells']),
  muscleGroup: 'Arms',
  subMuscle: 'Biceps'
}));
assert(s5.length > 0, `Found ${s5.length} dumbbell bicep exercises`);

// Scenario 6: Home + Bodyweight Only + Cardio
console.log('\nScenario 6: Home + Bodyweight Only + Cardio');
const s6 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['cardio']),
  selectedEquipment: new Set(['Bodyweight'])
}));
assert(s6.length > 0, `Found ${s6.length} bodyweight cardio exercises`);
assert(!s6.some(e => e.name.toLowerCase().includes('treadmill') || e.name.toLowerCase().includes('stationary bike') || e.name.toLowerCase().includes('elliptical')), 'No treadmill/bike/elliptical in bodyweight cardio');

// Scenario 7: Home + Skipping Rope + Cardio
console.log('\nScenario 7: Home + Skipping Rope + Cardio');
const s7 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['cardio']),
  selectedEquipment: new Set(['Skipping Rope'])
}));
assert(s7.length > 0, `Found ${s7.length} skipping rope cardio exercises`);

// Scenario 8: Gym + Treadmill + Cardio
console.log('\nScenario 8: Gym + Treadmill + Cardio');
const s8 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'gym',
  workoutTypes: new Set(['cardio']),
  selectedEquipment: new Set(['Treadmill'])
}));
assert(s8.length > 0, `Found ${s8.length} treadmill cardio exercises`);

// Scenario 9: Home + Bodyweight Only + Stretching & Mobility
console.log('\nScenario 9: Home + Bodyweight Only + Stretching & Mobility');
const s9 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['stretching']),
  selectedEquipment: new Set(['Bodyweight'])
}));
assert(s9.length > 0, `Found ${s9.length} bodyweight stretching exercises`);

// Scenario 10: Gym + Full Gym Access + Chest
console.log('\nScenario 10: Gym + Full Gym Access + Chest');
const s10 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'gym',
  workoutTypes: new Set(['all']),
  selectedEquipment: new Set(engine.GYM_EQUIPMENT),
  muscleGroup: 'Chest'
}));
assert(s10.length > 10, `Found ${s10.length} full gym chest exercises`);

// Scenario 11: Home + Dumbbells + Bench + Chest
console.log('\nScenario 11: Home + Dumbbells + Bench + Chest');
const s11 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['strength']),
  selectedEquipment: new Set(['Dumbbells', 'Bench']),
  muscleGroup: 'Chest'
}));
const s11WithoutBench = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['strength']),
  selectedEquipment: new Set(['Dumbbells']),
  muscleGroup: 'Chest'
}));
assert(s11.length > s11WithoutBench.length, `Bench unlocks exercises (${s11.length} with bench vs ${s11WithoutBench.length} without bench)`);

// Scenario 12: All Locations + Stretching & Mobility
console.log('\nScenario 12: All Locations + Stretching & Mobility');
const s12 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'all',
  workoutTypes: new Set(['stretching'])
}));
assert(s12.length > 0, `Found ${s12.length} stretching exercises across all locations`);

// Scenario 13: Home + Bodyweight Only + Full Body
console.log('\nScenario 13: Home + Bodyweight Only + Full Body');
const s13 = exercises.filter(ex => engine.matchesFilter(ex, {
  location: 'home',
  workoutTypes: new Set(['all']),
  selectedEquipment: new Set(['Bodyweight']),
  muscleGroup: 'Full Body'
}));
assert(s13.length > 0, `Found ${s13.length} bodyweight full body exercises`);
assert(s13.every(e => {
  const meta = engine.resolveExerciseMetadata(e);
  return meta.canonicalEquipment.every(eq => eq === 'Bodyweight');
}), 'Zero gear required for bodyweight full body');

// Scenario 14: Switching Home <-> Gym Equipment Transition
console.log('\nScenario 14: Switching Home <-> Gym Equipment Transition');
const gymSet = new Set(engine.GYM_EQUIPMENT);
// Switching to Home strips gym-only items
const homeCompatibleFromGym = new Set(Array.from(gymSet).filter(eq => engine.HOME_EQUIPMENT.includes(eq)));
assert(homeCompatibleFromGym.size === engine.HOME_EQUIPMENT.filter(eq => engine.GYM_EQUIPMENT.includes(eq)).length, 'Correctly stripped gym-only equipment on transition to Home');

// Scenario 15: Reset Filters
console.log('\nScenario 15: Reset Filters');
const defaultCriteria = {
  location: 'all',
  workoutTypes: new Set(['all']),
  selectedEquipment: new Set(engine.ALL_EQUIPMENT),
  muscleGroup: 'Legs',
  subMuscle: 'All Legs',
  query: ''
};
const s15 = exercises.filter(ex => engine.matchesFilter(ex, defaultCriteria));
assert(s15.length > 0, `Found ${s15.length} exercises under default reset state`);

console.log(`\n========================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log(`========================================`);
