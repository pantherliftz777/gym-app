const fs = require('fs');

let testScript = fs.readFileSync('scripts/verify_reorganized_system.js', 'utf8');
testScript = testScript.replace(/\.page-content \.view\.active/g, '.view.active');
fs.writeFileSync('scripts/verify_reorganized_system.js', testScript, 'utf8');
console.log('Updated verify_reorganized_system.js to use .view.active');
