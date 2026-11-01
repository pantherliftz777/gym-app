const { execSync } = require('child_process');

const log = execSync('git log -n 8 --format="%h | %an | %ad | %s" --date=iso').toString('utf8');
console.log(log);
