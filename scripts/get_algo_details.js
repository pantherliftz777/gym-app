const fs = require('fs');

const algoJs = fs.readFileSync('gym-app/public/algo.js', 'utf8');
const lines = algoJs.split('\n');

const exportsMatch = algoJs.match(/module\.exports\s*=\s*\{([\s\S]*?)\};/);
if (exportsMatch) {
  console.log('Algo.js exports:');
  console.log(exportsMatch[1]);
} else {
  // check window.FF_ALGO or function names
  const fns = [...algoJs.matchAll(/function\s+([a-zA-Z0-9_]+)/g)].map(m => m[1]);
  console.log('Algo.js functions:', fns);
}
