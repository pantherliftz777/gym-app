const fs = require('fs');
const testScript = fs.readFileSync('scripts/verify_reorganized_system.js', 'utf8');
console.log(testScript.slice(0, 1500));
