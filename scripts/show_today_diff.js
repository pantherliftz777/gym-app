const { execSync } = require('child_process');

const diff = execSync('git diff HEAD 7f516b9 public/index.html', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
const lines = diff.split('\n');
console.log('--- LINES 150-350 OF DIFF ---');
console.log(lines.slice(150, 350).join('\n'));
