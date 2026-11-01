const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const modals = ['challengeMotiveModal', 'challengePrefsModal', 'challengeDurationModal'];
modals.forEach(m => {
  const idx = html.indexOf(`id="${m}"`);
  console.log(`${m} found at index: ${idx}`);
  if (idx !== -1) {
    const chunk = html.substring(idx, idx + 2000);
    console.log(`--- ${m} preview ---`);
    console.log(chunk.substring(0, 500));
  }
});
