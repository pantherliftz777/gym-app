const fs = require('fs');
const content = fs.readFileSync('gym-app/server.js', 'utf8');

const lines = content.split('\n');
console.log('Lines around line 1-300:');
for (let i = 0; i < 250; i++) {
  if (content.includes('init') || lines[i].includes('CREATE TABLE') || lines[i].includes('db.') || lines[i].includes('client.')) {
    // print some
  }
}

const tableMatches = content.match(/CREATE TABLE[^\n;]+/gi);
console.log('CREATE TABLE matches:', tableMatches);

// search for schema definition function
const schemaMatches = content.match(/function\s+[a-zA-Z0-9_]*init[a-zA-Z0-9_]*|const\s+init/gi);
console.log('Init functions:', schemaMatches);
