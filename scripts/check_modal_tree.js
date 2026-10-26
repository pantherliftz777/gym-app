const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');

// Find all elements with class modal-backdrop
const lines = html.split('\n');
const modalStarts = [];

lines.forEach((l, i) => {
  if (l.includes('class="modal-backdrop"') || l.includes("class='modal-backdrop'")) {
    const idMatch = l.match(/id=["']([^"']+)["']/);
    modalStarts.push({ line: i + 1, id: idMatch ? idMatch[1] : 'NO_ID' });
  }
});

console.log('Found modals:', modalStarts);

// Check DOM tree in Puppeteer to see parent-child relationships of all modals
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  const modalTree = await page.evaluate(() => {
    const modals = Array.from(document.querySelectorAll('.modal-backdrop'));
    return modals.map(m => ({
      id: m.id,
      parent: m.parentElement.tagName + (m.parentElement.id ? '#' + m.parentElement.id : '') + (m.parentElement.className ? '.' + m.parentElement.className.split(' ').join('.') : '')
    }));
  });

  console.log('\nActual DOM parents of all .modal-backdrop:');
  modalTree.forEach(m => console.log(`  [${m.id}] -> parent: ${m.parent}`));

  await browser.close();
})();
