const { execSync } = require('child_process');

const diff = execSync('git diff HEAD 7f516b9 public/index.html', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
console.log('Diff length:', diff.length);

// Let's see hero section diff
const lines = diff.split('\n');
console.log('--- FIRST 150 LINES OF DIFF ---');
console.log(lines.slice(0, 150).join('\n'));
