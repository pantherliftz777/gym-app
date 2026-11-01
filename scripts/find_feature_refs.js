const fs = require('fs');

const files = ['public/index.html', 'public/fitfuel.js', 'server.js'];

function searchTerms(terms) {
  files.forEach(file => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    terms.forEach(term => {
      lines.forEach((l, i) => {
        if (l.toLowerCase().includes(term.toLowerCase())) {
          console.log(`[${file}:${i+1}] ${l.trim().slice(0, 140)}`);
        }
      });
    });
  });
}

console.log('=== SEARCHING FOR FOOD PHOTO SCAN / VISION ===');
searchTerms(['food photo', 'photo scan', 'meal photo', 'scan food', 'camerameal', 'foodcam']);

console.log('\n=== SEARCHING FOR VOICE COACH / MODE ===');
searchTerms(['voicecoach', 'voice-coach', 'voice mode']);

console.log('\n=== SEARCHING FOR BARCODE SCANNER ===');
searchTerms(['barcode']);
