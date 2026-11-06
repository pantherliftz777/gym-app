const fs = require('fs');
const content = fs.readFileSync('gym-app/server.js', 'utf8');

const regex = /(?:FROM|INTO|UPDATE|JOIN|TABLE)\s+([a-zA-Z0-9_]+)/gi;
const set = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
  const tbl = match[1].toLowerCase();
  if (!['if', 'not', 'exists', 'select', 'where', 'set', 'table'].includes(tbl)) {
    set.add(tbl);
  }
}
console.log('Detected DB tables:', Array.from(set));
