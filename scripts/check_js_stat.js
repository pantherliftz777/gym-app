const { execSync } = require('child_process');

const stat = execSync('git diff 7f516b9 HEAD public/fitfuel.js --stat').toString('utf8');
console.log('Diff stat in fitfuel.js:');
console.log(stat);
