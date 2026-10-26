const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push({ type: 'pageerror', text: err.toString() }));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ type: 'console.error', text: msg.text() });
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Click 4D Body Scan
  console.log('Clicking dashViewBodyAnalysisBtn...');
  await page.click('#dashViewBodyAnalysisBtn');
  await new Promise(r => setTimeout(r, 400));

  // Check if modal opened
  const isModalOpen = await page.evaluate(() => {
    const m = document.getElementById('bodyAnalysisModal');
    return m && (m.classList.contains('active') || window.getComputedStyle(m).display !== 'none');
  });
  console.log('bodyAnalysisModal isOpen:', isModalOpen);

  // Click load sample 4D photos
  console.log('Clicking loadSample4DPhotosBtn...');
  await page.click('#loadSample4DPhotosBtn');
  await new Promise(r => setTimeout(r, 400));

  // Check if preview images loaded
  const previews = await page.evaluate(() => {
    return ['front', 'back', 'left', 'right'].map(dim => {
      const img = document.getElementById('preview-' + dim);
      return { dim, visible: img && img.style.display !== 'none' };
    });
  });
  console.log('Previews status:', previews);

  // Click btnRun4DAnalysis
  console.log('Clicking btnRun4DAnalysis...');
  await page.click('#btnRun4DAnalysis');
  await new Promise(r => setTimeout(r, 2000));

  const reportStatus = await page.evaluate(() => {
    const rep = document.getElementById('bodyCompReportContainer');
    return {
      repVisible: rep && rep.style.display !== 'none',
      timelineVal: document.getElementById('reportTimelineVal')?.textContent,
      fatVal: document.getElementById('reportFatVal')?.textContent
    };
  });
  console.log('Report generated in modal:', reportStatus);

  console.log('Errors:', errors);
  await browser.close();
})();
