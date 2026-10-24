const fs = require('fs');
const css = fs.readFileSync('public/styles.css', 'utf8');

function findRules(names) {
  for (const name of names) {
    let idx = 0;
    console.log(`\n=== RULES FOR: ${name} ===`);
    while ((idx = css.indexOf(name, idx)) !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(css.length, idx + 250);
      console.log(css.substring(start, end));
      idx += name.length + 30;
    }
  }
}

findRules(['.modal {', '.modal-card', '.modal-dialog', '.modal-content', '.modal-inner', '.modal-panel']);
