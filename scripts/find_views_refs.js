const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

function findOccurrences(str, content, name) {
  content.split('\n').forEach((l, i) => {
    if (l.includes(str)) console.log(`[${name}:${i+1}] ${l.trim().slice(0, 120)}`);
  });
}

console.log('=== ACTIVITY REFERENCES ===');
findOccurrences('activity', html, 'index.html');
findOccurrences("'activity'", js, 'fitfuel.js');

console.log('=== BODY ANALYSIS REFERENCES ===');
findOccurrences('body-analysis', html, 'index.html');
findOccurrences("'body-analysis'", js, 'fitfuel.js');

console.log('=== POSTURE REFERENCES ===');
findOccurrences('posture', html, 'index.html');
findOccurrences("'posture'", js, 'fitfuel.js');
