const fs = require('fs');

const css = fs.readFileSync('gym-app/public/dashboard-styles.css', 'utf8');

const matches = [...css.matchAll(/(?:\.dark|\[data-theme=["']?dark["']?\])[^{]*\{[^}]+\}/g)].map(m => m[0]);
console.log('Total dark mode rules in dashboard-styles.css:', matches.length);
console.log('First 5 dark mode rules:');
matches.slice(0, 5).forEach(m => console.log(' -', m));
