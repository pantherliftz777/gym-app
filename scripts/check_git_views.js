const { execSync } = require('child_process');
const out = execSync('git grep -n "view-" 7f516b9 -- public/index.html').toString();
console.log(out);
