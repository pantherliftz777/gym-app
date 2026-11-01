// Test the mathematical indexing logic of the carousel
const N = 4;
const CLONE_COUNT = 2;
const startIndex = CLONE_COUNT; // 2
const endIndex = startIndex + N - 1; // 5

// Simulate 12 steps forward
let currentIndex = startIndex;
console.log('--- Forward simulation ---');
for (let step = 1; step <= 12; step++) {
  currentIndex++;
  let activeDot = ((currentIndex - startIndex) % N + N) % N;
  console.log(`Step ${step}: Moving to track index ${currentIndex}, Active Dot: ${activeDot}`);
  if (currentIndex > endIndex) {
    currentIndex = startIndex;
    console.log(`  -> Seamless snap to track index ${currentIndex}`);
  }
}

// Simulate 8 steps backward
console.log('\n--- Backward simulation ---');
for (let step = 1; step <= 8; step++) {
  currentIndex--;
  let activeDot = ((currentIndex - startIndex) % N + N) % N;
  console.log(`Step ${step}: Moving to track index ${currentIndex}, Active Dot: ${activeDot}`);
  if (currentIndex < startIndex) {
    currentIndex = endIndex;
    console.log(`  -> Seamless snap to track index ${currentIndex}`);
  }
}
