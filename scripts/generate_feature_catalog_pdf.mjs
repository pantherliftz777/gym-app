import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function generatePdf() {
  console.log('Generating FitFuel Feature Catalog PDF...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const catalogUrl = `http://localhost:3000/fitfuel-feature-catalog.html`;
    console.log(`Loading ${catalogUrl}...`);
    await page.goto(catalogUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const outputPath = path.join(ROOT, 'public', 'FitFuel-Complete-Feature-Catalog.pdf');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    });

    console.log(`✅ PDF successfully generated at: ${outputPath}`);
  } catch (err) {
    console.error('PDF generation error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generatePdf();
