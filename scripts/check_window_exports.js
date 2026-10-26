const fs = require('fs');
const js = fs.readFileSync('public/fitfuel.js', 'utf8');

console.log('window.openModal:', js.includes('window.openModal = openModal;'));
console.log('window.closeModal:', js.includes('window.closeModal = closeModal;'));
console.log('window.generateAIChallengePlan:', js.includes('window.generateAIChallengePlan = generateAIChallengePlan;'));
