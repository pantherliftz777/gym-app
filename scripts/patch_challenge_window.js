const fs = require('fs');

let code = fs.readFileSync('public/fitfuel.js', 'utf8');

const target = "toast(`${durationDays}-Day Challenge Created! Your customized Day 1 is ready.`);\r\n}";
const targetUnix = "toast(`${durationDays}-Day Challenge Created! Your customized Day 1 is ready.`);\n}";

const replacement = `toast(\`\${durationDays}-Day Challenge Created! Your customized Day 1 is ready.\`);
}
window.generateAIChallengePlan = generateAIChallengePlan;
window.renderChallengeView = renderChallengeView;
Object.defineProperty(window, 'activeChallengePlan', {
  get: () => activeChallengePlan,
  set: (v) => { activeChallengePlan = v; },
  configurable: true
});`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('public/fitfuel.js', code, 'utf8');
  console.log('Successfully attached challenge functions to window (CRLF)');
} else if (code.includes(targetUnix)) {
  code = code.replace(targetUnix, replacement);
  fs.writeFileSync('public/fitfuel.js', code, 'utf8');
  console.log('Successfully attached challenge functions to window (Unix)');
} else {
  console.error('Target not found for challenge window attachment');
}
