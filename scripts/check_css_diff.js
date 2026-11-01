const { execSync } = require('child_process');

const diff = execSync('git diff 7f516b9 HEAD public/styles.css').toString('utf8');
console.log('Diff in styles.css:');
console.log(diff);
