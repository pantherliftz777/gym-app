const fs = require('fs');
const html = fs.readFileSync('gym-app/public/dashboard.html', 'utf8');

const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('view-today')) {
    console.log('Line', idx + 1, ':', l.trim().slice(0, 150));
  }
});
