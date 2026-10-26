const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/exercises.json'));

const curated = [
  'Incline Dumbbell Bench Press',
  'Incline Barbell Bench Press',
  'Flat Barbell Bench Press',
  'Flat Dumbbell Bench Press',
  'Chest Dips',
  'Standing Barbell Overhead Press',
  'Barbell Back Squat',
  'Romanian Deadlift',
  'Barbell Deadlift',
  'Bulgarian Split Squat',
  'Pull-ups'
];

curated.forEach(name => {
  const words = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2);
  const match = data.find(d => {
    const dWords = d.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
    return words.every(w => dWords.includes(w));
  });
  console.log(name, '->', match ? match.name + ' (' + match.gif + ')' : 'NO MATCH');
});
