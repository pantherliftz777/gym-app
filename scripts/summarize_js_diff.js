const { execSync } = require('child_process');

const diff = execSync('git diff 7f516b9 HEAD -- public/fitfuel.js', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
const chunks = diff.split('\n@@');
console.log('Total chunks:', chunks.length);
for (let i = 1; i <= Math.min(10, chunks.length - 1); i++) {
  const firstLines = chunks[i].split('\n').slice(0, 10).join('\n');
  console.log(`--- CHUNK ${i} ---`);
  console.log('@@' + firstLines);
}
