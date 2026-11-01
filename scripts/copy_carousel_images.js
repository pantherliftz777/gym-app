const fs = require('fs');
const path = require('path');

const targetDir = 'public/assets/hero-carousel';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const sourceFiles = [
  { src: 'media_1793507088029_0317c478.jpg', dest: 'hero-01.png' },
  { src: 'media_1793507091527_16d5c7a6.jpg', dest: 'hero-02.png' },
  { src: 'media_1793507118422_1a2b955a.png', dest: 'hero-03.png' },
  { src: 'media_1793507094675_7a4994d9.jpg', dest: 'hero-04.png' }
];

const uploadDir = 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/.user_uploaded';

sourceFiles.forEach(item => {
  const srcPath = path.join(uploadDir, item.src);
  const destPath = path.join(targetDir, item.dest);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${item.src} -> ${destPath} (${fs.statSync(destPath).size} bytes)`);
});
