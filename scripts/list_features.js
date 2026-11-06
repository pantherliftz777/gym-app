const fs = require('fs');
const content = fs.readFileSync('gym-app/public/features.js', 'utf8');

const regex = /id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["'],\s*tagline:\s*["']([^"']+)["'],\s*category:\s*["']([^"']+)["'],\s*description:\s*["']([^"']+)["'],\s*status:\s*["']([^"']+)["']/g;

let m;
const list = [];
while ((m = regex.exec(content)) !== null) {
  list.push({
    id: m[1],
    name: m[2],
    tagline: m[3],
    category: m[4],
    status: m[6]
  });
}
console.log('Total features:', list.length);
console.table(list);
