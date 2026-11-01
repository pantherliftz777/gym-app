const { execSync } = require('child_process');

const diff = execSync('git diff public/index.html').toString('utf8');
console.log('Diff on index.html:');
console.log(diff.substring(0, 800));
console.log('...');
console.log(diff.substring(diff.length - 800));
