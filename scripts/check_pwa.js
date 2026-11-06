const fs = require('fs');

function checkFile(path) {
  if (!fs.existsSync(path)) return;
  const content = fs.readFileSync(path, 'utf8');
  console.log(`=== ${path} ===`);
  const idb = content.match(/indexedDB\.open\([^)]+\)/g);
  console.log('IndexedDB:', idb);
  const caches = content.match(/caches\.open\([^)]+\)/g);
  console.log('Caches:', caches);
}

checkFile('gym-app/public/pwa-sync.js');
checkFile('gym-app/public/sw.js');
