const fs = require('fs');
let code = fs.readFileSync('public/fitfuel.js', 'utf8');

code = code.replace(
  /activeChallengePlan\s*=\s*newChallenge;/,
  'activeChallengePlan = newChallenge;\n  window.activeChallengePlan = newChallenge;'
);

code = code.replace(
  /async function generateAIChallengePlan\s*\(/,
  'window.generateAIChallengePlan = generateAIChallengePlan;\nasync function generateAIChallengePlan('
);

// Also at the end of generateAIChallengePlan
const endMarker = 'updateLiveWaterEstimate();\n  toast(`${durationDays}-Day Challenge Created! Your customized Day 1 is ready.`);';
const endMarkerCRLF = 'updateLiveWaterEstimate();\r\n  toast(`${durationDays}-Day Challenge Created! Your customized Day 1 is ready.`);';

if (code.includes(endMarker)) {
  code = code.replace(endMarker, endMarker + '\n  window.activeChallengePlan = activeChallengePlan;\n  window.generateAIChallengePlan = generateAIChallengePlan;');
} else if (code.includes(endMarkerCRLF)) {
  code = code.replace(endMarkerCRLF, endMarkerCRLF + '\r\n  window.activeChallengePlan = activeChallengePlan;\r\n  window.generateAIChallengePlan = generateAIChallengePlan;');
}

fs.writeFileSync('public/fitfuel.js', code, 'utf8');
console.log('Successfully bound window.activeChallengePlan and generateAIChallengePlan');
