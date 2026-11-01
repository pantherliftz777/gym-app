const { execSync } = require('child_process');

const diffStat = execSync('git diff 7f516b9 HEAD --stat').toString('utf8');
console.log('--- DIFF STAT BETWEEN 7f516b9 (User commit) and HEAD ---');
console.log(diffStat);
