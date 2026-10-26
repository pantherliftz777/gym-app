const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/exercises.json'));
const sample = data.filter(d => d.name.includes('incline dumbbell') || d.name.includes('bench press'));
console.log(sample.map(s => ({ id: s.id, name: s.name, gif: s.gif })));
