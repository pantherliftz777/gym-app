const fs = require('fs');
let s = fs.readFileSync('scripts/verify_all_four_sections.js', 'utf8');
s = s.replace('if (!activeChallengePlan)', 'if (!window.activeChallengePlan)');
fs.writeFileSync('scripts/verify_all_four_sections.js', s, 'utf8');
console.log('Fixed activeChallengePlan check in verify script!');
