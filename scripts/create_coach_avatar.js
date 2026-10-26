const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const srcImagePath = path.resolve('C:/Users/pandi/.gemini/antigravity/brain/4f104965-6f34-4192-9c87-052f341fd08a/.user_uploaded/media_1792963862696_0c5058af.png');
const outAvatarPath = path.resolve('public/images/fitfuel-coach-avatar.png');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:transparent;">
        <canvas id="cropCanvas" width="512" height="512"></canvas>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);

  const base64Data = fs.readFileSync(srcImagePath).toString('base64');
  const dataUri = `data:image/png;base64,${base64Data}`;

  await page.evaluate(async (uri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById('cropCanvas');
        const ctx = canvas.getContext('2d');
        
        // Closer portrait face crop: width=380, height=380
        const cropSize = 380;
        const sx = (img.naturalWidth - cropSize) / 2;
        const sy = 45; // Centers head, eyes, smile and collar
        
        ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, 512, 512);
        resolve();
      };
      img.src = uri;
    });
  }, dataUri);

  const avatarBase64 = await page.evaluate(() => {
    return document.getElementById('cropCanvas').toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
  });

  fs.writeFileSync(outAvatarPath, Buffer.from(avatarBase64, 'base64'));
  console.log('Saved optimized fitfuel-coach-avatar.png (512x512)');

  await browser.close();
})();
