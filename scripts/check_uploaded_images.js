const fs = require('fs');
const path = require('path');

const uploadDir = 'C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/.user_uploaded';
fs.readdirSync(uploadDir).forEach(f => {
  const stat = fs.statSync(path.join(uploadDir, f));
  console.log(f, stat.size, 'bytes');
});
