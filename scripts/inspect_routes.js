const fs = require('fs');
const content = fs.readFileSync('gym-app/server.js', 'utf8');

const lines = content.split('\n');
console.log('Total lines:', lines.length);

const endpointLines = [];
lines.forEach((line, idx) => {
  if (line.match(/pathname\s*===|\/api\//) || line.match(/method\s*===/)) {
    endpointLines.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Matching lines count:', endpointLines.length);
console.log(endpointLines.slice(0, 50).join('\n'));
