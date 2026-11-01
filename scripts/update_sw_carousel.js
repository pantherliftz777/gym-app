const fs = require('fs');

let sw = fs.readFileSync('public/sw.js', 'utf8');

sw = sw.replace(/CACHE_NAME\s*=\s*'[^']+'/, "CACHE_NAME = 'fitfuel-cache-v7.8.0'");

const targetAssets = `  '/modules/barcode-scanner.js',
  '/modules/social-card.js',
  '/modules/mediapipe-posture.js'
];`;

const replacementAssets = `  '/modules/barcode-scanner.js',
  '/modules/social-card.js',
  '/modules/mediapipe-posture.js',
  '/modules/hero-carousel.js',
  '/assets/hero-carousel/hero-01.png',
  '/assets/hero-carousel/hero-02.png',
  '/assets/hero-carousel/hero-03.png',
  '/assets/hero-carousel/hero-04.png'
];`.replace(/\n/g, '\r\n');

if (sw.includes(targetAssets.replace(/\n/g, '\r\n'))) {
  sw = sw.replace(targetAssets.replace(/\n/g, '\r\n'), replacementAssets);
} else if (sw.includes(targetAssets)) {
  sw = sw.replace(targetAssets, replacementAssets);
}

fs.writeFileSync('public/sw.js', sw, 'utf8');
console.log('✔ Updated public/sw.js with carousel assets and bumped cache to v7.8.0');
