const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

const terms = [
  'chTimeOptionsList',
  'chIntensityOptionsList',
  'durationOptionsList',
  'chTypesOptionsList',
  'proceedToDurationBtn',
  'generateChallengePlanBtn',
  'selectedChallengeDuration',
  'selectedChallengeTime',
  'selectedChallengeIntensity',
  'challengePrefsModal'
];

terms.forEach(t => {
  const matches = [...js.matchAll(new RegExp(t, 'g'))];
  console.log(`${t}: ${matches.length} matches in fitfuel.js`);
});
